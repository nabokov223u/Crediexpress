/**
 * export-applications.mjs
 * Descarga la colección "applications" de Firestore y la exporta a CSV.
 *
 * Uso:
 *   node scripts/export-applications.mjs
 *   node scripts/export-applications.mjs --output exports/solicitudes.csv
 *   node scripts/export-applications.mjs --status approved
 *   node scripts/export-applications.mjs --from 2026-01-01 --to 2026-12-31
 */

import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// --- Cargar .env manualmente (sin depender de dotenv/config en ESM) ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');

try {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch {
  console.error('⚠️  No se encontró .env — asegúrate de crearlo a partir de .env.example');
  process.exit(1);
}

// --- Firebase (usando require para compatibilidad CJS del paquete) ---
const require = createRequire(import.meta.url);
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy, Timestamp } = require('firebase/firestore');

// --- Parsear argumentos de línea de comandos ---
const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : null;
};

const outputArg = getArg('--output') || `exports/solicitudes_${formatDate(new Date())}.csv`;
const statusFilter = getArg('--status'); // approved | review | denied
const fromArg = getArg('--from');        // YYYY-MM-DD
const toArg = getArg('--to');            // YYYY-MM-DD

function formatDate(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

// --- Inicializar Firebase ---
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v || v.includes('your_'))
  .map(([k]) => k);

if (missingKeys.length > 0) {
  console.error('❌ Faltan variables Firebase en .env:', missingKeys.join(', '));
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Aplanar documento a fila CSV ---
function flattenDoc(id, docData) {
  const a = docData.applicant || {};
  const l = docData.loan || {};

  const createdAt = docData.createdAt instanceof Timestamp
    ? docData.createdAt.toDate().toISOString()
    : docData.createdAt || '';

  const updatedAt = docData.updatedAt instanceof Timestamp
    ? docData.updatedAt.toDate().toISOString()
    : docData.updatedAt || '';

  return {
    id,
    estado: docData.status || '',
    fechaSolicitud: createdAt,
    fechaActualizacion: updatedAt,
    // Solicitante
    cedula: a.idNumber || '',
    nombreCompleto: a.fullName || '',
    estadoCivil: a.maritalStatus || '',
    cedulaConyuge: a.spouseId || '',
    telefono: a.phone || '',
    email: a.email || '',
    // Crédito
    montoVehiculo: l.vehicleAmount ?? '',
    porcentajeEntrada: l.downPaymentPct != null ? Math.round(l.downPaymentPct * 100) : '',
    plazoMeses: l.termMonths ?? '',
    valorEntrada: l.vehicleAmount != null && l.downPaymentPct != null
      ? Math.round(l.vehicleAmount * l.downPaymentPct)
      : '',
    montoAFinanciar: l.vehicleAmount != null && l.downPaymentPct != null
      ? Math.round(l.vehicleAmount * (1 - l.downPaymentPct))
      : '',
  };
}

// --- Escapar valor para CSV (RFC 4180) ---
function csvCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowToCsv(row, headers) {
  return headers.map(h => csvCell(row[h])).join(',');
}

// --- Main ---
async function main() {
  console.log('\n📦 Conectando con Firestore...');
  console.log(`   Proyecto: ${firebaseConfig.projectId}`);

  // Construir query con filtros opcionales
  const constraints = [orderBy('createdAt', 'desc')];

  if (statusFilter) {
    if (!['approved', 'review', 'denied'].includes(statusFilter)) {
      console.error('❌ --status debe ser: approved | review | denied');
      process.exit(1);
    }
    constraints.unshift(where('status', '==', statusFilter));
    console.log(`   Filtro estado: ${statusFilter}`);
  }

  if (fromArg) {
    const fromDate = new Date(fromArg + 'T00:00:00.000Z');
    constraints.unshift(where('createdAt', '>=', Timestamp.fromDate(fromDate)));
    console.log(`   Filtro desde: ${fromArg}`);
  }

  if (toArg) {
    const toDate = new Date(toArg + 'T23:59:59.999Z');
    constraints.unshift(where('createdAt', '<=', Timestamp.fromDate(toDate)));
    console.log(`   Filtro hasta: ${toArg}`);
  }

  const q = query(collection(db, 'applications'), ...constraints);

  console.log('\n⏳ Descargando colección "applications"...');
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log('⚠️  No se encontraron documentos con los filtros aplicados.');
    process.exit(0);
  }

  console.log(`✅ ${snapshot.size} documento(s) encontrado(s).`);

  // Aplanar todos los documentos
  const rows = snapshot.docs.map(d => flattenDoc(d.id, d.data()));

  // Cabecera CSV
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(','),
    ...rows.map(r => rowToCsv(r, headers)),
  ];

  // Crear directorio y guardar archivo
  const outputPath = resolve(__dirname, '..', outputArg);
  const outputDir = dirname(outputPath);
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputPath, '\uFEFF' + csvLines.join('\n'), 'utf8'); // BOM para Excel en español

  console.log(`\n📄 CSV guardado en: ${outputPath}`);
  console.log(`   ${rows.length} filas | ${headers.length} columnas\n`);

  // Resumen por estado
  const summary = rows.reduce((acc, r) => {
    acc[r.estado] = (acc[r.estado] || 0) + 1;
    return acc;
  }, {});
  console.log('📊 Resumen por estado:');
  for (const [estado, count] of Object.entries(summary)) {
    console.log(`   ${estado.padEnd(10)} ${count}`);
  }
  console.log('');
}

main().catch(err => {
  console.error('\n❌ Error inesperado:', err.message || err);
  process.exit(1);
});
