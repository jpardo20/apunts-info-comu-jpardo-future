# Model de `presentacions.json` per a cada mòdul

Aquest document descriu el format dels fitxers `presentacions.json` que viuen dins de cada mòdul i que s'utilitzen per:

- construir els índexs locals de presentacions (`presentacions/index.html` de cada mòdul),
- generar el catàleg global `docs/presentacions/all.json` mitjançant `scripts/build_catalog.py`,
- i, en general, tenir una sola font de veritat sobre les presentacions de cada mòdul.

## Ubicació dels fitxers

Per a un mòdul determinat, la ruta típica és:

```text
docs/moduls/<codi-mòdul>/presentacions/presentacions.json
```

Per exemple, per al mòdul 0221 *Muntatge i manteniment d'equips*:

```text
docs/moduls/0221-muntatge-i-manteniment-d-equips/presentacions/presentacions.json
```

## Estructura general del fitxer

Cada `presentacions.json` té l'estructura següent:

```jsonc
{
  "module": {
    "code": "0221",
    "name": "Muntatge i manteniment d'equips"
  },
  "presentations": [
    {
      "order": 1,
      "title": "01. Títol de la presentació",
      "src": "slides/001-titol.reveal",
      "description": "Text curt opcional",
      "status": "active",
      "type": "theory"
    }
    // ...
  ]
}
```

> **Nota:** al fitxer real no es poden posar comentaris (`// ...`); aquí s'utilitza JSONC només per documentar.

### Camp `module`

- `code` *(string, obligatori)*: codi del mòdul (per exemple `0221`, `0483`…).
- `name` *(string, obligatori)*: nom complet del mòdul.

Aquest bloc serveix sobretot per tenir les dades del mòdul dins del catàleg global.

### Camp `presentations`

És un array d'objectes, on cada objecte representa una presentació o activitat.

Camps més comuns de cada presentació:

- `order` *(number, opcional però recomanat)*  
  Posició de la targeta dins del mòdul. Si falta, el codi pot fer servir un ordre per defecte.

- `title` *(string, obligatori)*  
  Títol que es mostra a la targeta i que es pot passar al presentador via query string.

- `src` *(string, obligatori)*  
  Ruta al fitxer `.reveal` relativa a la carpeta `presentacions/` del mòdul  
  (per exemple `slides/001-components-d-un-ordinador-digital-ra1.reveal`).

- `description` *(string, opcional)*  
  Subtítol o descripció breu que apareix sota el títol de la targeta.

- `date` *(string, opcional)*  
  Data en format ISO `YYYY-MM-DD` si es vol poder ordenar per data (p. ex. al portal global).

- `theme` *(string, opcional)*  
  Nom del tema Reveal.js a passar al `presentador.html`. Si no es posa, s'aplica el tema per defecte.

### Estat (`status`)

Controla la disponibilitat de la presentació:

- `active`  
  La targeta es mostra normalment i el botó d'“Obrir presentació” és clicable.

- `inactive`  
  La targeta es mostra però amb un estil de *Properament* i el botó deshabilitat.  
  És útil per anunciar activitats o presentacions que encara s'han d'acabar de preparar.

- `hidden`  
  Aquesta entrada s'ignora en generar les targetes; no apareix al llistat.  
  Es pot fer servir per mantenir en el JSON presentacions antigues o en proves.

Si el camp `status` no és present, es considera `active`.

### Tipus (`type`)

Serveix per diferenciar ràpidament **teoria** i **activitats**:

- `theory` (per defecte)  
  Sessió de teoria, presentació d'apunts, explicació de continguts…

- `activity`  
  Activitat, enunciat d'avaluació, rúbrica, guia d'exercicis, etc.

Aquest camp permet:

- donar estils diferents a les targetes (colors, icones, insígnies),
- filtrar o agrupar presentacions segons el tipus.

Si el camp `type` no és present, el codi assumeix `theory`.

## Bones pràctiques

- Mantenir els títols numerats de manera coherent (`01.`, `02.`, `03.`…) ajuda a l'ordenació visual.
- Fer servir descripcions curtes (una o dues línies) per no omplir massa les targetes.
- Marcar com a `inactive` allò que vols anunciar però encara no està llest.
- Marcar com a `activity` totes les targetes que siguin activitats, rúbriques o similars; la resta poden quedar com a teoria (`theory` o sense `type`).

Quan es crea un mòdul nou amb presentacions, només cal:

1. copiar un `presentacions.json` existent com a plantilla,
2. ajustar el bloc `module`,
3. afegir/editar les entrades de `presentations` amb els camps descrits aquí.
