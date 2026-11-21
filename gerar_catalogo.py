#!/usr/bin/env python3
"""Lê a pasta animes/ e gera data/animes.json. Uso: python tools/gerar_catalogo.py"""
import json, re, sys, unicodedata
from datetime import date
from pathlib import Path
from urllib.parse import quote

RAIZ = Path(__file__).resolve().parent.parent
PASTA = RAIZ / "animes"
SAIDA = RAIZ / "data" / "animes.json"
VIDEOS = {".mp4", ".webm", ".m4v", ".ogv"}
IMAGENS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}

def natural(p): return [int(x) if x.isdigit() else x.lower() for x in re.split(r"(\d+)", p.name)]
def url(p): return quote(p.relative_to(RAIZ).as_posix())
def slug(s):
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
def imagem(pasta, nomes):
    for n in nomes:
        for ext in IMAGENS:
            f = pasta / (n + ext)
            if f.exists(): return url(f)
    return ""
def numero(txt, padrao):
    m = re.match(r"\s*(?:ep(?:isodio|isódio)?\s*)?(\d+)", txt, re.I)
    return int(m.group(1)) if m else padrao

def episodios(pasta):
    eps = []
    for i, f in enumerate(sorted((x for x in pasta.iterdir() if x.suffix.lower() in VIDEOS), key=natural), 1):
        n = numero(f.stem, i)
        titulo = re.sub(r"^\s*(?:ep(?:isodio|isódio)?\s*)?\d+\s*[-–_.]*\s*", "", f.stem, flags=re.I).strip()
        desc = (pasta / (f.stem + ".txt"))
        eps.append({
            "numero": n, "titulo": titulo or f"Episódio {n}",
            "descricao": desc.read_text(encoding="utf-8").strip() if desc.exists() else "",
            "thumbnail": imagem(pasta, [f.stem]), "video": url(f), "duracao": ""})
    return eps

def main():
    antigo = {}
    if SAIDA.exists():
        try: antigo = {a["id"]: a for a in json.loads(SAIDA.read_text(encoding="utf-8")).get("animes", [])}
        except Exception: pass
    animes = []
    for pasta in sorted((p for p in PASTA.iterdir() if p.is_dir()), key=natural) if PASTA.exists() else []:
        meta = {}
        mf = pasta / "anime.json"
        if mf.exists():
            try: meta = json.loads(mf.read_text(encoding="utf-8"))
            except Exception as e: print(f"AVISO: {mf} inválido ({e})", file=sys.stderr)
        aid = slug(pasta.name)
        banner = imagem(pasta, ["banner"]); capa = imagem(pasta, ["capa", "poster", "cover"])
        temps = []
        subs = sorted((p for p in pasta.iterdir() if p.is_dir()), key=natural)
        for i, s in enumerate(subs, 1):
            eps = episodios(s)
            if eps: temps.append({"numero": numero(re.sub(r"(?i)^temporada\s*", "", s.name), i), "nome": s.name, "episodios": eps})
        solto = episodios(pasta)
        if solto: temps.insert(0, {"numero": 1, "nome": "Temporada 1", "episodios": solto})
        if not temps: print(f"AVISO: '{pasta.name}' sem vídeos, ignorado", file=sys.stderr); continue
        animes.append({
            "id": aid, "nome": meta.get("nome", pasta.name),
            "descricao": meta.get("descricao", ""), "sinopse": meta.get("sinopse", meta.get("descricao", "")),
            "thumbnail": capa or banner, "banner": banner or capa,
            "generos": meta.get("generos", []), "ano": meta.get("ano", 0),
            "status": meta.get("status", "Disponível"), "classificacao": meta.get("classificacao", "L"),
            "publicado": meta.get("publicado", True), "destaque": meta.get("destaque", False),
            "popularidade": meta.get("popularidade", 0),
            "criadoEm": antigo.get(aid, {}).get("criadoEm", date.today().isoformat()),
            "temporadas": temps})
    SAIDA.parent.mkdir(exist_ok=True)
    SAIDA.write_text(json.dumps({"versao": 1, "animes": animes}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(animes)} anime(s) no catálogo.")
main()
