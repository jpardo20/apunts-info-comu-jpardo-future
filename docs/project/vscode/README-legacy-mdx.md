# Continguts VS Code en format MDX (legacy)

En aquesta carpeta hi ha materials sobre VS Code en dos formats:

- Fitxers `.md` normals, que MkDocs pot publicar.
- Fitxers `.mdx` que fan `import {Aside, Keyboard, Page} from "@xtec/astro"` i
  altres components d'un projecte Astro antic.

Actualment **no hi ha cap projecte Astro configurat** en aquest repositori
(no hi ha `package.json`, `astro.config.*`, etc.), i MkDocs **no interpreta MDX**.

Per tant:

- Els `.mdx` es consideren **fonts històriques / legacy**.
- Els materials que realment es fan servir al site s'han d'escriure i mantenir
  en format Markdown (`.md`).
- Si en el futur es vol recuperar el projecte Astro, aquests `.mdx` es poden
  moure a un repositori separat específic per Astro.

> ℹ️ Per editar i publicar contingut nou en aquest projecte, utilitza els fitxers `.md`,
> no els `.mdx`.
