# apunts-info-comu-jpardo-future

Repositori d’apunts i materials docents per a mòduls de SMX i DAM, pensat per ser **independent de cap centre** i publicat amb **MkDocs (tema Material)** i **presentacions Reveal.js**.

## Estructura bàsica

- `mkdocs.yml`  
  Configuració de MkDocs (tema Material, navegació, extra CSS).

- `docs/`  
  Arrel de tot el contingut publicat.
  - `index.md` – portada principal (llistat manual de mòduls de SMX).
  - `continguts.md` – índex de continguts generat (o futurament generable) per script.
  - `moduls/<codi-nom-mòdul>/` – materials de cada mòdul (apunts, presentacions, activitats…).
  - `assets/` – **carpeta d’assets oficial** (CSS, JS, imatges) que veu MkDocs.
  - `presentacions/` – recursos globals de presentacions:
    - `presentador.html` – presentador Reveal *global*.
    - `all.json` – catàleg global de presentacions generat per `scripts/build_catalog.py`.

- `assets/` (arrel del repo)  
  Carpeta d’assets **legacy** (CSS/JS/imatges i `assets/data/presentations.json`).  
  No és necessària per al funcionament amb MkDocs; es manté per compatibilitat i per fer neteja més endavant.

- `scripts/`
  - `build_catalog.py` – recorre tots els mòduls i genera `docs/presentacions/all.json`.
  - `publish_selected.py` – pipeline DOCX → Markdown + regeneració de `docs/continguts.md`.  
    Ara mateix està **en fase experimental** i no s’utilitza en el flux principal.

- `.github/workflows/pages.yml`  
  Esborrany de workflow per publicar a GitHub Pages.  
  De moment el despliegament es pot fer manualment amb `mkdocs gh-deploy`.

## Model de presentacions per mòdul (`presentacions.json`)

Cada mòdul que té presentacions disposa d'un fitxer JSON amb aquest nom dins de la seva carpeta de presentacions:

```text
docs/moduls/<codi-mòdul>/presentacions/presentacions.json
```

Aquest fitxer és la font de dades tant per al catàleg global (`docs/presentacions/all.json`) com per als índexs locals de presentacions de cada mòdul.

Esquema bàsic d'una entrada de presentació:

```jsonc
{
  "order": 1,
  "title": "01. Títol de la presentació",
  "src": "slides/001-titol.reveal",
  "description": "Text curt opcional",
  "status": "active",
  "type": "theory"
}
```

Camps més comuns:

- `order` *(number, opcional però recomanat)*: ordre de sortida de la targeta dins del mòdul.
- `title` *(string, obligatori)*: títol que es mostra a la targeta i al presentador.
- `src` *(string, obligatori)*: ruta al fitxer `.reveal` relativa a la carpeta `presentacions/`.
- `description` *(string, opcional)*: subtítol o descripció breu.
- `date` *(string, opcional)*: data ISO `YYYY-MM-DD` si es vol poder ordenar per data.
- `theme` *(string, opcional)*: tema Reveal.js a passar al presentador (si no es posa, s'usa el per defecte).

L'estat (`status`) controla la disponibilitat:

- `active` (per defecte) – la presentació està disponible i es pot obrir.
- `inactive` – la targeta surt marcada com a *Properament* i el botó queda deshabilitat.
- `hidden` – la presentació no apareix al llistat (s'ignora en generar les targetes).

El tipus (`type`) serveix per diferenciar teoria i activitats:

- `theory` (per defecte) – sessió de teoria, apunts, etc.
- `activity` – activitat, rúbrica, enunciat d'avaluació…

Si el camp `type` no és present es considera `theory`.

La documentació detallada del model i exemples més complets es troben a `docs/presentacions/README.md`.

## Requisits i entorn local

1. **Python 3** instal·lat.
2. Instal·lar MkDocs i el tema Material:

   ```bash
   pip install mkdocs mkdocs-material
