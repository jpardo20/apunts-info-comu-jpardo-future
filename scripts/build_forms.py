import json
from pathlib import Path
from string import Template

# Constants: paths RELATIUS a la carpeta docs/
PORTAL_CSS = "assets/css/portal.css"
FORMS_CSS = "assets/css/forms.css"
FORM_ENGINE_JS = "assets/js/form-engine.js"


def main():
    # Projecte: <root>/scripts/build_forms.py
    script_path = Path(__file__).resolve()
    project_root = script_path.parent.parent
    docs_root = project_root / "docs"

    config_path = docs_root / "forms" / "forms_index.json"
    template_path = docs_root / "forms" / "form_template.html"

    if not config_path.is_file():
        raise SystemExit(f"Config file not found: {config_path}")
    if not template_path.is_file():
        raise SystemExit(f"Template file not found: {template_path}")

    with config_path.open(encoding="utf-8") as f:
        cfg = json.load(f)

    with template_path.open(encoding="utf-8") as f:
        template = Template(f.read())

    students_json_rel_root = cfg.get("students_json", "assets/data/dades_alumnes.json")
    forms = cfg.get("forms", [])
    if not forms:
        print("No forms defined in forms_index.json")
        return

    for form in forms:
        form_id = form["id"]
        title = form.get("title", form_id)
        module = form.get("module", "")
        module_name = form.get("moduleName", "")
        cycle = form.get("cycle", "")
        json_rel_root = form["json"]
        output_rel = form["output_html"]

        json_path = docs_root / json_rel_root
        students_json_path = docs_root / students_json_rel_root
        out_path = docs_root / output_rel
        out_path.parent.mkdir(parents=True, exist_ok=True)

        # Paths relatius des de la carpeta de l'HTML generat
        rel_json = Path.relpath(json_path, out_path.parent)
        rel_students = Path.relpath(students_json_path, out_path.parent)
        rel_portal_css = Path.relpath(docs_root / PORTAL_CSS, out_path.parent)
        rel_forms_css = Path.relpath(docs_root / FORMS_CSS, out_path.parent)
        rel_engine_js = Path.relpath(docs_root / FORM_ENGINE_JS, out_path.parent)

        subtitle_parts = []
        if module:
            subtitle_parts.append(f"Mòdul {module}")
        if module_name:
            subtitle_parts.append(module_name)
        if cycle:
            subtitle_parts.append(f"Cicle {cycle}")
        subtitle = " · ".join(subtitle_parts)

        html = template.substitute(
            title=title,
            subtitle=subtitle,
            form_id=form_id,
            form_json_rel=str(rel_json).replace("\\", "/"),
            students_json_rel=str(rel_students).replace("\\", "/"),
            cycle=cycle,
            portal_css_rel=str(rel_portal_css).replace("\\", "/"),
            forms_css_rel=str(rel_forms_css).replace("\\", "/"),
            form_engine_rel=str(rel_engine_js).replace("\\", "/"),
        )

        out_path.write_text(html, encoding="utf-8")
        print(f"Generated: {out_path.relative_to(project_root)}")


# Helper per a Path.relpath si no existeix
def _relpath(path, start):
    from os.path import relpath
    return Path(relpath(str(path), str(start)))


if not hasattr(Path, "relpath"):
    Path.relpath = _relpath  # type: ignore


if __name__ == "__main__":
    main()
