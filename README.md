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

## Requisits i entorn local

1. **Python 3** instal·lat.
2. Instal·lar MkDocs i el tema Material:

   ```bash
   pip install mkdocs mkdocs-material
