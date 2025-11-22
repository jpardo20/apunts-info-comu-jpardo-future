# Recursos que depenien de `apunts-jpardo20`

Aquest fitxer recull els recursos del site antic `apunts-jpardo20` que es feien servir des del nou repositori `apunts-info-comu-jpardo-future`, i l’estat de la seva migració.

> Última actualització: *inicial, 4a sessió*.  
> Pots regenerar la llista tècnica amb:
> ```bash
> grep -RIn "apunts-jpardo20" docs
> ```

## Taula resum

| Mòdul / àmbit | Fitxer al repo nou | Recurs o enllaç original | Tipus | Estat al repo nou | Comentaris |
|---------------|--------------------|---------------------------|-------|-------------------|------------|
| 0221 Muntatge i manteniment d’equips | `docs/moduls/0221-muntatge-i-manteniment-d-equips/presentacions/slides/mim-electricitat-intro.reveal` | Formulari `electricitat-intro-quiz.html` al site antic | Formulari / qüestionari | **FET** – ara apunta a `../moduls/0221-muntatge-i-manteniment-d-equips/presentacions/electricitat-intro-quiz.html` | El formulari viu dins el repo nou. |
| 0221 Muntatge i manteniment d’equips | `docs/index.md` | `coavaluacio-presentacions-rubrica.html` al site antic | Rúbrica HTML | **FET** – ara apunta a `moduls/0221-muntatge-i-manteniment-d-equips/presentacions/slides/coavaluacio-presentacions-rubrica.html` | Rúbrica integrada al repo nou. |
| Tutoria | `docs/index.md` | 3 lectures amb enllaços al site antic (Xataka, VilaWeb, 4 notícies) | Lectures + quiz | **FET** – ara apunten a `moduls/tutoria/lectura_*.html` | Tots tres qüestionaris ja viuen al repo nou. |
| 0483 Sistemes informàtics | `docs/moduls/0483-sistemes-informatics/presentacions/slides/0483-activitat-001-docker-web.reveal` | Enllaços a `activitat-per-seguir-la-teoria` al GitHub del repo antic | Activitat guia (`.md`) | **FET** – ara apunten a `../moduls/0483-sistemes-informatics/files/activitat-per-seguir-la-teoria/` | Es fa servir la pàgina generada per MkDocs. |
| 0223 Aplicacions ofimàtiques | `docs/moduls/0223-aplicacions-ofimatiques/presentacions/slides/aof-ud03-actividades-evaluables-01.reveal` | PDF `combined_parental_guides.pdf` al site antic | PDF | **FET** – ara apunta a `../assets/files/combined_parental_guides.pdf` | El PDF s’ha copiat a `docs/assets/files/`. |
| 0223 Aplicacions ofimàtiques | `docs/moduls/0223-aplicacions-ofimatiques/presentacions/slides/aof-ud05-ae05.reveal` | Diversos enllaços “trucos de TikTok” al site antic | Guia de vídeos / tutorials | **PENDENT** – encara apunten a `apunts-jpardo20` | Cal decidir si aquests “trucos de TikTok” es migren (com a pàgina pròpia, llista de vídeos, etc.) o si es deixen com a recurs extern. |

## Com actualitzar aquesta taula

1. Regenera la llista d’enllaços que encara apunten al site antic:

   ```bash
   grep -RIn "apunts-jpardo20" docs > altres/pending-links-apunts-jpardo20.txt
   ```

2. Revisa cada línia del fitxer `altres/pending-links-apunts-jpardo20.txt`:
   - si ja s’ha migrat el recurs → marca’l aquí com a **FET**,
   - si encara depèn del repo antic → deixa’l com a **PENDENT** i, si cal, afegeix-lo a la taula.

3. Quan migris un recurs nou (copiant fitxers del repo antic al nou i canviant enllaços), acorda:
   - **on viu** al `docs/...`,
   - **com s’hi enllaça** (ruta relativa),
   - i actualitza aquesta taula.

Així aquest fitxer es converteix en el “quadern de bitàcola” de la migració des de `apunts-jpardo20` cap al nou site.
