/**
 * csv-to-excel.mjs
 * Convierte exports/solicitudes_*.csv a un .xlsx formateado con encabezados, anchos y colores.
 *
 * Uso:
 *   node scripts/csv-to-excel.mjs
 *   node scripts/csv-to-excel.mjs --input exports/solicitudes_20260323.csv
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// --- Buscar el CSV más reciente en /exports si no se especifica uno ---
const args = process.argv.slice(2);
const getArg = (name) => { const i = args.indexOf(name); return i !== -1 ? args[i + 1] : null; };

let inputPath = getArg('--input');
if (!inputPath) {
  const exportsDir = resolve(__dirname, '..', 'exports');
  const csvFiles = readdirSync(exportsDir)
    .filter(f => f.endsWith('.csv'))
    .sort()
    .reverse();
  if (!csvFiles.length) { console.error('❌ No se encontró ningún .csv en /exports'); process.exit(1); }
  inputPath = resolve(exportsDir, csvFiles[0]);
  console.log(`📂 Usando archivo más reciente: ${csvFiles[0]}`);
}

const outputPath = inputPath.replace(/\.csv$/, '.xlsx');

// --- Parsear CSV ---
const rawCsv = readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, ''); // quitar BOM
const lines = rawCsv.trim().split('\n');
const headers = lines[0].split(',');

function parseLine(line) {
  const cells = [];
  let inQuote = false, cell = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuote = !inQuote; continue; }
    if (ch === ',' && !inQuote) { cells.push(cell); cell = ''; continue; }
    cell += ch;
  }
  cells.push(cell);
  return cells;
}

const rows = lines.slice(1).map(parseLine);

// --- Definición de columnas: nombre visible, clave posicional, ancho en chars ---
const COLS = [
  { header: 'Estado',          key: 1,  width: 12 },
  { header: 'Fecha Solicitud', key: 2,  width: 22 },
  { header: 'Cédula',          key: 4,  width: 14 },
  { header: 'Nombre Completo', key: 5,  width: 36 },
  { header: 'Estado Civil',    key: 6,  width: 13 },
  { header: 'Cédula Cónyuge',  key: 7,  width: 15 },
  { header: 'Teléfono',        key: 8,  width: 16 },
  { header: 'Email',           key: 9,  width: 32 },
  { header: 'Vehículo ($)',    key: 10, width: 14 },
  { header: 'Entrada (%)',     key: 11, width: 12 },
  { header: 'Plazo (meses)',   key: 12, width: 14 },
  { header: 'Valor Entrada',   key: 13, width: 14 },
  { header: 'A Financiar',     key: 14, width: 14 },
  { header: 'ID Documento',    key: 0,  width: 24 },
];

// --- Construir datos de la hoja ---
const wsData = [
  COLS.map(c => c.header), // fila de encabezados
  ...rows.map(row => COLS.map(c => {
    const val = row[c.key] ?? '';
    // Convertir números
    if ([10, 11, 12, 13, 14].includes(c.key)) {
      const n = Number(val);
      return isNaN(n) ? val : n;
    }
    // Convertir fechas ISO a objetos Date para Excel
    if (c.key === 2 && val) {
      const d = new Date(val);
      return isNaN(d.getTime()) ? val : d;
    }
    return val;
  }))
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(wsData);

// --- Anchos de columna ---
ws['!cols'] = COLS.map(c => ({ wch: c.width }));

// --- Altura fila de encabezado ---
ws['!rows'] = [{ hpt: 22 }];

// --- Estilos de encabezado (fill azul oscuro + texto blanco + negrita) ---
const headerFill = { patternType: 'solid', fgColor: { rgb: '1A0F50' } };
const headerFont = { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 };
const headerAlign = { horizontal: 'center', vertical: 'center' };

const colLetter = (i) => String.fromCharCode(65 + i);

for (let c = 0; c < COLS.length; c++) {
  const cellRef = `${colLetter(c)}1`;
  if (!ws[cellRef]) ws[cellRef] = { t: 's', v: COLS[c].header };
  ws[cellRef].s = { fill: headerFill, font: headerFont, alignment: headerAlign, border: {
    bottom: { style: 'thin', color: { rgb: 'CCCCCC' } }
  }};
}

// --- Estilos por estado (approved=verde, denied=rojo, review=amarillo) ---
const statusColors = {
  approved: { bg: 'D1FAE5', font: '065F46', label: '✓ Aprobado' },
  review:   { bg: 'FEF9C3', font: '713F12', label: '⏳ Revisión' },
  denied:   { bg: 'FEE2E2', font: '991B1B', label: '✗ No aprobado' },
};

for (let r = 0; r < rows.length; r++) {
  const excelRow = r + 2; // fila 1 es encabezado
  const status = rows[r][1]; // columna 'estado'
  const sc = statusColors[status];

  // Fila con banding (rayas alternadas) para legibilidad
  const rowBg = r % 2 === 0 ? 'FFFFFF' : 'F8F8FC';

  for (let c = 0; c < COLS.length; c++) {
    const cellRef = `${colLetter(c)}${excelRow}`;
    if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };

    const isStatusCol = c === 0; // Estado es la primera columna visible
    ws[cellRef].s = {
      fill: {
        patternType: 'solid',
        fgColor: { rgb: isStatusCol && sc ? sc.bg : rowBg }
      },
      font: isStatusCol && sc
        ? { bold: true, color: { rgb: sc.font }, sz: 10 }
        : { sz: 10 },
      alignment: { vertical: 'center', horizontal: c >= 8 ? 'right' : 'left' },
    };

    // Reemplazar valor de estado por etiqueta legible
    if (isStatusCol && sc) {
      ws[cellRef].v = sc.label;
    }
  }
}

// Formato de fecha legible para Excel
const dateFormat = 'dd/mm/yyyy hh:mm';
for (let r = 0; r < rows.length; r++) {
  const cellRef = `B${r + 2}`;
  if (ws[cellRef] && ws[cellRef].v instanceof Date) {
    ws[cellRef].t = 'd';
    ws[cellRef].z = dateFormat;
  }
}

// Formato numérico para columnas de dinero
for (let r = 0; r < rows.length; r++) {
  for (const col of ['I', 'K', 'M', 'N']) { // Vehículo, Valor Entrada, A Financiar
    const cellRef = `${col}${r + 2}`;
    if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
      ws[cellRef].z = '"$"#,##0';
    }
  }
  // Entrada (%): columna J
  const pctCell = `J${r + 2}`;
  if (ws[pctCell] && typeof ws[pctCell].v === 'number') {
    ws[pctCell].z = '0"%"';
  }
}

// --- Autofilter en encabezado ---
ws['!autofilter'] = { ref: `A1:${colLetter(COLS.length - 1)}1` };

XLSX.utils.book_append_sheet(wb, ws, 'Solicitudes');

// --- Guardar ---
XLSX.writeFile(wb, outputPath);
console.log(`\n✅ Excel guardado en: ${outputPath}`);
console.log(`   ${rows.length} filas | ${COLS.length} columnas\n`);
