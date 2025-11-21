# Declaració de variables
nota: float = 0.0

while True:
    try:
        entrada = input("Entra la teva nota (0-10): ").strip()
        # permet formats amb coma
        nota = float(entrada.replace(",", "."))
        if 0.0 <= nota <= 10.0:
            break
        print("⚠️ Ha de ser un número entre 0 i 10.")
    except ValueError:
        print("⚠️ Entra un número vàlid (ex: 7.5).")

if nota >= 9:
    mencio = "Excel·lent"
elif nota >= 7:
    mencio = "Notable"
elif nota >= 5:
    mencio = "Aprovat"
else:
    mencio = "Suspès"

print(f"Nota: {nota:.2f} → {mencio}")
