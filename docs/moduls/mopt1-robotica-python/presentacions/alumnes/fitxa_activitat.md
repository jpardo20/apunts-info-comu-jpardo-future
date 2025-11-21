# Python – Sessió de consolidació (90 min)
**Data:** 2025-10-23

## Objectius
- Reforçar entrada/sortida, variables (amb inicialització buida), condicions i bucles.
- Aplicar validació d'errors i f-strings.
- Simular lògica d'un robot (semàfor de distància).

---

## A1. Fitxa persona
1. Declara `nom: str = ""` i `edat: int = 0`.
2. Demana el nom i l'edat.
3. Valida que l'edat sigui un enter > 0 (repeteix fins que sigui correcte).
4. Calcula l'any de naixement i mostra el resultat amb f-strings.
5. Indica si és major d'edat (>=18).

---

## A2. Classificador de notes
1. Declara `nota: float = 0.0`.
2. Demana una nota (0–10), acceptant coma o punt.
3. Valida el rang (0–10) amb `while` + `try/except`.
4. Mostra la menció: Excel·lent (>=9), Notable (>=7), Aprovat (>=5), Suspès (<5).

---

## A3. Semàfor del robot (simulació)
1. Declara constants `LLINDAR_STOP=20`, `LLINDAR_LENT=50` i la variable `DISTANCIA`.
2. En un bucle, demana una distància (o **q** per sortir).
3. Decideix l'acció: STOP / LENT / RÀPID.
4. Mostra l'acció per pantalla.

---

## Checklist
- [ ] He declarat les variables amb tipus i valor inicial buit.
- [ ] He validat les entrades (no accepto valors invàlids).
- [ ] He fet servir f-strings per a la sortida.
- [ ] Les condicions cobreixen tots els casos, inclosos els límits.
- [ ] He provat amb diferents entrades, incloses incorrectes.

---

## Rúbrica (10 punts)
- Declaració disciplinada de variables: **2**
- Validació d'entrada i gestió d'errors: **3**
- Lògica i condicions correctes: **3**
- Presentació (missatges clars, f-strings): **1**
- Neteja del codi (noms, comentaris): **1**

> **Entrega**: Pugeu els 3 fitxers resolts a la carpeta del vostre grup al repositori.
