import json
import os
import glob

ROOT = "docs/moduls"

def load_presentations(pres_dir: str):
    data_path = os.path.join(pres_dir, "presentacions.json")
    if not os.path.exists(data_path):
        return None, []

    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    module_meta = data.get("module", {}) or {}
    raw_presentations = data.get("presentations", []) or []

    presentations = []
    for entry in raw_presentations:
        if not isinstance(entry, dict):
            # Ignore unexpected items
            continue
        item = dict(entry)

        # Normalitza status
        status = str(item.get("status", "active") or "active").lower()
        if status not in ("active", "inactive", "hidden"):
            status = "active"
        item["status"] = status

        # Normalitza type (per defecte: theory)
        type_value = (item.get("type") or "theory").lower()
        if type_value not in ("theory", "activity"):
            type_value = "theory"
        item["type"] = type_value

        presentations.append(item)

    return module_meta, presentations


def main():
    out = {"modules": []}
    total_presentations = 0

    for pres_dir in sorted(glob.glob(f"{ROOT}/*/presentacions")):
        module_meta, presentations = load_presentations(pres_dir)
        if module_meta is None:
            continue
        if not presentations:
            continue

        base = pres_dir.replace("docs/", "", 1).rstrip("/") + "/"
        code = str(module_meta.get("code", "")).strip()
        name = module_meta.get("name", "").strip() or os.path.basename(os.path.dirname(pres_dir))

        out["modules"].append({
            "code": code,
            "name": name,
            "base": base,
            "presentations": presentations,
        })
        total_presentations += len(presentations)

    os.makedirs("docs/presentacions", exist_ok=True)
    out_path = "docs/presentacions/all.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(
        f"Wrote {out_path} with {total_presentations} items "
        f"in {len(out['modules'])} modules"
    )


if __name__ == "__main__":
    main()
