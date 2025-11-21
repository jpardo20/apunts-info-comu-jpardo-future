#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os, sys, shutil, subprocess, yaml, pathlib, json, hashlib
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
SRC = ROOT / "source"
MANIFEST = ROOT / "publish.yaml"
CONTINGUTS = DOCS / "continguts.md"
CACHE_PATH = ROOT / ".publish-cache.json"


def run(cmd, cwd=None):
    print("+", " ".join(cmd))
    subprocess.run(cmd, check=True, cwd=cwd)


def sha256sum(p: pathlib.Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1024*1024), b""):
            h.update(chunk)
    return h.hexdigest()


def pandoc_convert(src: pathlib.Path, out_md: pathlib.Path):
    out_md.parent.mkdir(parents=True, exist_ok=True)
    cwd = out_md.parent
    base = [
        "pandoc", str(src), "--to", "gfm", "--wrap=none",
        "-o", out_md.name, "--extract-media", "."
    ]
    try:
        run(base + ["--markdown-headings=atx"], cwd=cwd)
    except subprocess.CalledProcessError:
        print("… Pandoc sense --markdown-headings=atx; provem amb --atx-headers")
        run(base + ["--atx-headers"], cwd=cwd)

    # arregla media/media
    mm = cwd / "media" / "media"
    if mm.exists():
        (cwd/"media").mkdir(parents=True, exist_ok=True)
        for f in mm.iterdir():
            if f.is_file():
                (cwd/"media"/f.name).write_bytes(f.read_bytes())
        shutil.rmtree(mm, ignore_errors=True)

    if out_md.exists():
        txt = out_md.read_text(encoding="utf-8")
        if "media/media/" in txt:
            out_md.write_text(txt.replace("media/media/","media/"), encoding="utf-8")


def copy_asset(src, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    print("copy", src, "->", dest)


def main():
    if not MANIFEST.exists():
        print("ERROR: publish.yaml no trobat", file=sys.stderr)
        sys.exit(1)

    # cache
    cache = {}
    if CACHE_PATH.exists():
        try:
            cache = json.loads(CACHE_PATH.read_text(encoding="utf-8"))
        except Exception:
            cache = {}

    data = yaml.safe_load(MANIFEST.read_text(encoding="utf-8")) or {}
    items = [it for it in (data.get("items") or []) if it.get("publish")]
    sections = defaultdict(list)

    for it in items:
        title = it.get("title","(Sense títol)")
        src_rel, out_rel = it.get("source"), it.get("output")
        if not src_rel or not out_rel:
            print(f"WARNING: Element sense 'source' o 'output': {title}")
            continue

        src_file = ROOT / src_rel
        out_md = DOCS / out_rel
        if not src_file.exists():
            print(f"WARNING: No trobo: {src_file}. Salto '{title}'.")
            continue

        # decideix si convertir
        do_convert = True
        if it.get("freeze") and out_md.exists():
            print(f"Freeze actiu per '{title}': mantinc {out_md}.")
            do_convert = False
        elif src_file.suffix.lower()==".docx":
            new_hash = sha256sum(src_file)
            key = pathlib.Path(out_rel).as_posix()
            old = cache.get(key, {})
            if old.get("source")==src_rel and old.get("sha256")==new_hash and out_md.exists():
                print(f"SENSE canvis a source per '{title}': NO regenero {out_md}.")
                do_convert=False
        else:
            do_convert=False
            if not out_md.exists():
                out_md.parent.mkdir(parents=True, exist_ok=True)
                out_md.write_text(f"# {title}\n\n> Contingut original com a descàrrega.\n", encoding="utf-8")

        if do_convert and src_file.suffix.lower()==".docx":
            pandoc_convert(src_file, out_md)
            cache[key] = {"source": src_rel, "sha256": sha256sum(src_file)}

        # downloads opcionals
        dl_links=[]
        for dl in (it.get("downloads") or []):
            dl_src = ROOT / dl
            if not dl_src.exists():
                print(f"WARNING: Descàrrega no trobada: {dl_src}")
                continue
            rel = pathlib.Path(dl).relative_to("source")
            dl_dest = DOCS / "assets" / rel
            copy_asset(dl_src, dl_dest)
            dl_links.append("assets/" + rel.as_posix())

        sections[it.get("section","Altres")].append({
            "title": title,
            "page": pathlib.Path(out_rel).as_posix(),
            "downloads": dl_links
        })

    # desa cache
    CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")

    # (re)genera Continguts
    lines = ["---","title: Continguts publicats","---",""]
    for sec in sorted(sections.keys()):
        lines.append(f"## {sec}")
        for el in sections[sec]:
            lines.append(f"- [{el['title']}]({el['page']})")
            for li in el["downloads"]:
                lines.append(f"  - Descàrrega: [{os.path.basename(li)}]({li})")
        lines.append("")
    CONTINGUTS.parent.mkdir(parents=True, exist_ok=True)
    CONTINGUTS.write_text("\n".join(lines), encoding="utf-8")
    print("Regenerat:", CONTINGUTS)

if __name__ == "__main__":
    main()
