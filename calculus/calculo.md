# Fórmula de cálculo de cuotas y tabla de amortización (sistema francés)

Este documento describe la formulación matemática y las fórmulas de Excel usadas para calcular **cuotas constantes** y generar una **tabla de amortización** (sistema francés) a partir de:

- Valor del préstamo (principal)
- Tasa nominal anual (TNA, base 30/360)
- Años de plazo
- Frecuencia de pago (Mensual, Bimensual, etc.)

---

## 1. Parámetros de entrada

En el archivo:

- **C3**: `Valor del préstamo`  
  - Notación: \( P \)  
  - Ejemplo: 20 000

- **C4**: `TNA (30/360)`  
  - Notación: \( j \) (tasa nominal anual)  
  - Ejemplo: 0.156 (15.6%)

- **C5**: `Años`  
  - Notación: \( A \) (años de plazo)  
  - Ejemplo: 6

- **C6**: `Frecuencia de Pago` (texto)  
  - Posibles valores: `Mensual`, `Bimensual`, `Trimestral`, `Cuatrimestral`, `Semestral`, `Anual`  
  - Este valor determina cuántos pagos hay por año.

---

## 2. Cálculo de la frecuencia de pago (número de pagos por año)

En **C8** se calcula el **número de pagos por año**, que denotamos como \( m \):

```excel
C8 =IF(
        C6="Mensual",12,
        IF(C6="Bimensual",6,
        IF(C6="Trimestral",4,
        IF(C6="Cuatrimestral",3,
        IF(C6="Semestral",2,1)
        )))
Interpretación:

Mensual → 
𝑚
=
12
m=12

Bimensual → 
𝑚
=
6
m=6

Trimestral → 
𝑚
=
4
m=4

Cuatrimestral → 
𝑚
=
3
m=3

Semestral → 
𝑚
=
2
m=2

Anual → 
𝑚
=
1
m=1

3. Número total de cuotas
En C9 se calcula el número total de pagos:

𝑁
=
𝐴
×
𝑚
N=A×m
En Excel:

excel
Copiar código
C9 = C5 * C8
Donde:

𝐴
A = años (C5)

𝑚
m = pagos por año (C8)

𝑁
N = número total de cuotas

4. Cálculo de la tasa periódica de interés
En C7 se calcula la tasa de interés por período 
𝑖
i a partir de la TNA 30/360:

excel
Copiar código
C7 =((1+EFFECT(C4,C8))^VLOOKUP(C6,$M$6:$N$11,2,0))-1
4.1. Lógica conceptual
TNA (nominal anual, base 30/360):
𝑗
=
TNA
j=TNA

Frecuencia de capitalización:
En EFFECT(C4,C8), Excel interpreta:

C4 = 
𝑗
j (tasa nominal anual)

C8 = 
𝑚
m (número de períodos por año)

La función EFFECT(j, m) devuelve la tasa efectiva anual 
𝑖
eff
i 
eff
​
 :

𝑖
eff
=
(
1
+
𝑗
𝑚
)
𝑚
−
1
i 
eff
​
 =(1+ 
m
j
​
 ) 
m
 −1
Fracción de año entre pagos (tabla en M6:N11):

En la hoja existe esta tabla:

M (texto)	N (fórmula)
Anual	=360/360
Semestral	=180/360
Cuatrimestral	=120/360
Trimestral	=90/360
Bimensual	=60/360
Mensual	=30/360

Cada valor de la columna N representa la fracción de año correspondiente a un período, por ejemplo:

Mensual: 
30
/
360
=
1
/
12
30/360=1/12

Bimensual: 
60
/
360
=
1
/
6
60/360=1/6, etc.

Con VLOOKUP(C6,$M$6:$N$11,2,0) se obtiene la fracción de año correspondiente a la frecuencia elegida.

Tasa periódica 
𝑖
i:

Luego se eleva 
1
+
𝑖
eff
1+i 
eff
​
  a esa fracción de año:

𝑖
=
(
1
+
𝑖
eff
)
fracci
o
ˊ
n_a
n
˜
o
−
1
i=(1+i 
eff
​
 ) 
fracci 
o
ˊ
 n_a 
n
˜
 o
 −1
En el caso estándar (p.ej., Mensual, TNA convertible mensualmente), esta construcción es matemáticamente equivalente a:

𝑖
≈
𝑗
𝑚
i≈ 
m
j
​
 
En tu archivo, con:

𝑗
=
0.156
j=0.156

𝑚
=
12
m=12

Se obtiene:

𝑖
≈
0.013
(
1.3
%
 mensual
)
i≈0.013(1.3% mensual)
5. Fórmula de la cuota constante (sistema francés)
La cuota fija 
𝐶
C se calcula con la fórmula de una anualidad:

𝐶
=
𝑃
⋅
𝑖
(
1
+
𝑖
)
𝑁
(
1
+
𝑖
)
𝑁
−
1
C=P⋅ 
(1+i) 
N
 −1
i(1+i) 
N
 
​
 
Donde:

𝑃
P = principal o valor del préstamo (C3)

𝑖
i = tasa de interés por período (C7)

𝑁
N = número total de pagos (C9)

5.1. Implementación en Excel
En la tabla de amortización, en C14 (primera cuota), la fórmula es:

excel
Copiar código
C14 =IF(B14>$C$9,"",PMT($C$7,$C$9,$C$3)*-1)
Desglose:

PMT(rate, nper, pv) en Excel calcula el pago periódico de una anualidad.

rate = 
𝑖
i = C7

nper = 
𝑁
N = C9

pv = 
𝑃
P = C3

PMT devuelve un valor negativo (salida de dinero para el prestatario), por eso se multiplica por -1 para mostrar la cuota como un número positivo.

El IF(B14>$C$9,"", ...) evita calcular cuotas más allá del número total de pagos.

Equivalente conceptual de la fórmula:

pseudo
Copiar código
si número_de_cuota > N:
    cuota = ""
sino:
    cuota = -PMT(i, N, P)
6. Construcción de la tabla de amortización
Las columnas principales de la tabla son:

Número de Cuota (B)

CUOTA A PAGAR (C)

INTERÉS (D)

CAPITAL AMORTIZADO (E)

CAPITAL VIVO (F)

6.1. Inicialización (fila 13)
B13: 0 → antes de la primera cuota.

F13: capital vivo inicial:

excel
Copiar código
F13 = C3
Es decir:

CapitalVivo
0
=
𝑃
CapitalVivo 
0
​
 =P
6.2. Número de cuota (columna B, a partir de B14)
En B14:

excel
Copiar código
B14 =IF(
        OR(B13=$C$9,B13=""),
        "",
        IF(ISNUMBER(B13), B13+1, 1)
      )
Lógica:

Si ya llegamos al número total de cuotas o B13 está vacío → dejar vacío B14.

Si B13 es un número → B14 = B13 + 1 (incrementar la cuota).

Si no, B14 = 1 (para empezar en la primera cuota).

Esta fórmula se arrastra hacia abajo (B15, B16, etc.) y va generando 1, 2, 3, …, N.

6.3. Cuota a pagar (columna C)
En C14:

excel
Copiar código
C14 =IF(B14>$C$9,"",PMT($C$7,$C$9,$C$3)*-1)
La misma fórmula se copia hacia abajo. La cuota 
𝐶
C es constante en todo el horizonte.

Cuota
𝑘
=
𝐶
∀
𝑘
=
1
,
…
,
𝑁
Cuota 
k
​
 =C∀k=1,…,N
6.4. Interés del período (columna D)
En D14:

excel
Copiar código
D14 =IF(B14>$C$9,"",$C$7*F13)
Donde:

F13 es el capital vivo al final del período anterior.

C7 es la tasa periódica 
𝑖
i.

Fórmula matemática:

Inter
e
ˊ
s
𝑘
=
𝑖
⋅
CapitalVivo
𝑘
−
1
Inter 
e
ˊ
 s 
k
​
 =i⋅CapitalVivo 
k−1
​
 
6.5. Capital amortizado (columna E)
En E14:

excel
Copiar código
E14 =IF(B14>$C$9,"",C14-D14)
Interpretación:

Amortizaci
o
ˊ
n
𝑘
=
Cuota
𝑘
−
Inter
e
ˊ
s
𝑘
Amortizaci 
o
ˊ
 n 
k
​
 =Cuota 
k
​
 −Inter 
e
ˊ
 s 
k
​
 
Es la parte de la cuota que efectivamente reduce la deuda.

6.6. Capital vivo (columna F)
En F14:

excel
Copiar código
F14 =IF(B14>$C$9,"",F13-E14)
Es decir:

CapitalVivo
𝑘
=
CapitalVivo
𝑘
−
1
−
Amortizaci
o
ˊ
n
𝑘
CapitalVivo 
k
​
 =CapitalVivo 
k−1
​
 −Amortizaci 
o
ˊ
 n 
k
​
 
La fórmula se arrastra hacia abajo, actualizando el saldo vivo en cada período hasta llegar a cero (o cercano a cero por redondeos) en la última cuota.

7. Resumen de la lógica matemática
Definir parámetros:

𝑃
P = valor del préstamo

𝑗
j = TNA (tasa nominal anual)

𝑚
m = número de pagos por año

𝐴
A = años de plazo

𝑁
=
𝐴
⋅
𝑚
N=A⋅m

𝑖
i = tasa periódica (aprox. 
𝑗
/
𝑚
j/m en este modelo con 30/360)

Calcular la cuota fija:

𝐶
=
𝑃
⋅
𝑖
(
1
+
𝑖
)
𝑁
(
1
+
𝑖
)
𝑁
−
1
C=P⋅ 
(1+i) 
N
 −1
i(1+i) 
N
 
​
 
Recurrencias de la tabla:

Para 
𝑘
=
1
,
…
,
𝑁
k=1,…,N:

Interés:

Inter
e
ˊ
s
𝑘
=
𝑖
⋅
CapitalVivo
𝑘
−
1
Inter 
e
ˊ
 s 
k
​
 =i⋅CapitalVivo 
k−1
​
 
Amortización:

Amortizaci
o
ˊ
n
𝑘
=
𝐶
−
Inter
e
ˊ
s
𝑘
Amortizaci 
o
ˊ
 n 
k
​
 =C−Inter 
e
ˊ
 s 
k
​
 
Capital vivo:

CapitalVivo
𝑘
=
CapitalVivo
𝑘
−
1
−
Amortizaci
o
ˊ
n
𝑘
CapitalVivo 
k
​
 =CapitalVivo 
k−1
​
 −Amortizaci 
o
ˊ
 n 
k
​
 
Con condición inicial:

CapitalVivo
0
=
𝑃
CapitalVivo 
0
​
 =P
8. Fórmulas clave de Excel (resumen breve)
Interés equivalente por período (C7):

excel
Copiar código
=((1+EFFECT(C4,C8))^VLOOKUP(C6,$M$6:$N$11,2,0))-1
Número de pagos por año (C8):

excel
Copiar código
=IF(C6="Mensual",12,IF(C6="Bimensual",6,IF(C6="Trimestral",4,IF(C6="Cuatrimestral",3,IF(C6="Semestral",2,1)))))
Número total de cuotas (C9):

excel
Copiar código
=C5*C8
Capital vivo inicial (F13):

excel
Copiar código
=C3
Número de cuota (B14):

excel
Copiar código
=IF(OR(B13=$C$9,B13=""),"",IF(ISNUMBER(B13),B13+1,1))
Cuota a pagar (C14):

excel
Copiar código
=IF(B14>$C$9,"",PMT($C$7,$C$9,$C$3)*-1)
Interés (D14):

excel
Copiar código
=IF(B14>$C$9,"",$C$7*F13)
Capital amortizado (E14):

excel
Copiar código
=IF(B14>$C$9,"",C14-D14)
Capital vivo (F14):

excel
Copiar código
=IF(B14>$C$9,"",F13-E14)
Estas fórmulas se copian hacia abajo para construir toda la tabla de amortización.