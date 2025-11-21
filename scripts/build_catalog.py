import json, os, glob

ROOT = "docs/moduls"
out = {"modules": []}
for pres_dir in sorted(glob.glob(f"{ROOT}/*/presentacions")):
    base = pres_dir.replace("docs/","",1).rstrip("/") + "/"
    data_path = os.path.join(pres_dir, "presentacions.json")
    if not os.path.exists(data_path):
        continue
    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    mod = data.get("module", {})
    out["modules"].append({
        "code": str(mod.get("code","")).strip(),
        "name": mod.get("name","").strip() or os.path.basename(os.path.dirname(pres_dir)),
        "base": base,
        "presentations": data.get("presentations", [])
    })
os.makedirs("docs/presentacions", exist_ok=True)
with open("docs/presentacions/all.json","w",encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
print("Wrote docs/presentacions/all.json with", sum(len(m["presentations"]) for m in out["modules"]), "items")
