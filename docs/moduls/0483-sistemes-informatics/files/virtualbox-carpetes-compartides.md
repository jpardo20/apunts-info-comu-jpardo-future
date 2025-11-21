# Compartir una carpeta de Windows amb una màquina virtual Ubuntu a VirtualBox

Aquest document explica com accedir des d’una màquina virtual Ubuntu (guest) a una carpeta del host Windows mitjançant **VirtualBox Shared Folders**.

## 1. Instal·lar les Guest Additions a Ubuntu

> Aquests paquets permeten, entre altres coses, l’ús de carpetes compartides.

```bash
sudo apt update
sudo apt install virtualbox-guest-dkms virtualbox-guest-utils virtualbox-guest-x11
```

Quan acabi la instal·lació, **reinicia la màquina virtual**.

```bash
sudo reboot
```

---

## 2. Crear la carpeta compartida a VirtualBox (host Windows)

1. Crea (si no existeix) la carpeta al Windows, per exemple:  
   `C:\Users\joan\shared`

   > Compte: la ruta correcta és `Users` (en plural), no `user`.

2. Amb la màquina virtual **apagada**, a VirtualBox:
   - Selecciona la MV.
   - Ves a **Configuració** → **Carpetes compartides**.
   - Clica el botó amb el símbol `+` (afegir carpeta compartida).
3. Omple els camps:
   - **Camí de la carpeta**: `C:\Users\joan\shared`
   - **Nom de la carpeta**: `shared`  (aquest nom s’utilitzarà dins d’Ubuntu).
   - Marca:
     - ✅ *Muntatge automàtic* (Auto-mount)  
     - ✅ *Permanent* (Make permanent)
4. Desa i torna a engegar la màquina virtual.

---

## 3. Afegir l’usuari d’Ubuntu al grup `vboxsf`

VirtualBox munta les carpetes compartides amb permisos per al grup especial `vboxsf`. Cal afegir-hi el teu usuari:

```bash
sudo usermod -aG vboxsf $USER
```

Després tanca sessió i torna a entrar, o simplement **reinicia**:

```bash
sudo reboot
```

---

## 4. Accedir a la carpeta compartida des d’Ubuntu

Si has marcat **Muntatge automàtic**, la carpeta compartida acostuma a aparèixer a:

```bash
ls /media
ls /media/sf_shared
```

Si el nom de la carpeta a VirtualBox és `shared`, la ruta típica serà:

```bash
cd /media/sf_shared
ls
```

Allà dins hi hauries de veure els fitxers de `C:\Users\joan\shared`.

---

## 5. Muntar la carpeta manualment (opcional)

Si no fas servir l’auto-muntatge o no funciona, pots muntar la carpeta compartida manualment.

1. Crea un punt de muntatge:

```bash
sudo mkdir -p /mnt/shared
```

2. Munta la carpeta amb el nom definit a VirtualBox (`shared`):

```bash
sudo mount -t vboxsf shared /mnt/shared
```

3. Comprova el contingut:

```bash
cd /mnt/shared
ls
```

---

## 6. Comprovacions ràpides

Per comprovar que tot està correcte:

```bash
# Comprovar grups de l’usuari (ha d’aparèixer vboxsf)
groups

# Veure si existeix la carpeta automuntada
ls /media
ls /media/sf_shared

# Si es fa muntatge manual
ls /mnt/shared
```

Si veus el contingut de la carpeta `shared` (del Windows) des d’Ubuntu, la configuració està feta correctament. ✅
