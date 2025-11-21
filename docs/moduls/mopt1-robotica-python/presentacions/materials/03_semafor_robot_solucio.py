# Declaració de constants i variables
DISTANCIA: int = 0
LLINDAR_STOP: int = 20
LLINDAR_LENT: int = 50
accio: str = ""

while True:
    entrada = input("Distància en cm (o q per sortir): ").strip().lower()
    if entrada == "q":
        print("Fi de la simulació.")
        break
    if not entrada.isdigit():
        print("⚠️ Entra un enter vàlid o q.")
        continue

    DISTANCIA = int(entrada)

    if DISTANCIA < LLINDAR_STOP:
        accio = "STOP"
    elif DISTANCIA <= LLINDAR_LENT:
        accio = "LENT"
    else:
        accio = "RÀPID"

    print(f"Distància: {DISTANCIA} cm → Acció: {accio}")
