# # Declaro variables
# nom  = str()  # str -> String -> Cadena de text
# edat = int()  # int -> Integer -> Enter (número sense decimals)
# nota = float()  # float -> Decimals (número amb decimals)

# # Inicialitzo variables
# """
# nom = "Joan"
# edat = 44
# nota = 8.0

# # Mostrar per pantalla els valors
# print("El meu nom és", nom)
# print("Tinc", edat , "anys.")
# print("La meva nota és de", nota)
# """

# print("Entra el teu nom: ", end="")
# nom = input()
# print("El teu nom és", nom)

# edatCorrecte = bool()
# edatCorrecte = False

# while(edatCorrecte == False): ## Mentre sigui False
#     print("Entra la teva edat: ", end="")
#     edat = int(input())
#     if (edat<=0):
#         print("OBS!! l'edat ha de ser més gran que zero!!!!")
#         print("Si us plau, torna a intentar-ho!")
#     else:
#         edatCorrecte = True


# """
# edat = -10  # Negatiu

# while(edat<=0): ## Mentre edat sigui negatiu
#     print("Entra la teva edat: ", end="")
#     edat = int(input())
#     if (edat<=0):
#         print("OBS!! l'edat ha de ser més gran que zero!!!!")
#         print("Si us plau, torna a intentar-ho!")
# """

# """
# if (edat<=0):
#     print("OBS!! l'edat ha de ser més gran que zero!!!!")
#     print("Entra la teva edat: ", end="")
#     edat = int(input())
#     if (edat<=0):
#         print("OBS!! l'edat ha de ser més gran que zero!!!!")
#         print("Entra la teva edat: ", end="")
#         edat = int(input())
# """

# print("Tens", edat , "anys.")

# anyActual = int() # int -> Integer -> Enter (número sense decimals)
# anyActual = 2025  # Inicialitzo la variable a 2025

# print("Vas naixer al ", anyActual - edat)

# if (edat>=18) :
#     print("Ets major d'edat!")
# else:
#     print("No ets major d'edat!")

# print("Adeu",nom,"fins la propera!")

nom = str()
edat= int()

nom = "Laia"
edat = 17

# print("Hola ", nom, "! Tens ", edat, " anys.", sep="")
# print(f"Hola, {nom}! Tens {edat} anys.")


nom1 = "   Laia   Perez    "
nom2 = "##$##Laia###r ####"

print(f"El nom 1 que has entrat sense netejar és |{nom1}|")
print(f"El nom 2 que has entrat sense netejar és |{nom2}|")

print(f"El nom 1 que has entrat net és |{nom1.lstrip()}|")
print(f"El nom 2 que has entrat net és |{nom2.rstrip('#')}|")

txt = "..!.Hola!!.!"
print(f"|{txt.strip('.!')}|")   # "Hola"   (treu punts i exclamacions dels extrems)


# Sortida per consola ->  Hola, Laia! Tens 17 anys.