from datetime import date

# Declaració de variables (disciplina d'inicialització buida)
nom: str = ""
edat: int = 0

# Entrada i validació
nom = input("Entra el teu nom: ").strip()
while True:
    entrada = input("Entra la teva edat (en anys): ").strip()
    if entrada.isdigit():
        edat = int(entrada)
        if edat > 0:
            break
    print("⚠️ Si us plau, entra un enter > 0.")

# Càlcul i sortida
any_actual = date.today().year
any_naixement = any_actual - edat

print(f"Hola, {nom}!")
print(f"Tens {edat} anys i vas néixer l'any {any_naixement}.")
print("Ets major d'edat!" if edat >= 18 else "No ets major d'edat!")
