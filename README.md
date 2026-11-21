# CortesiaTV
Plataforma de streaming de animes em HTML, CSS e JavaScript puro. Sem login, sem painel admin.

## Publicar no GitHub Pages
1. Crie um repositório e envie todo o conteúdo desta pasta (index.html na raiz).
2. Settings > Pages > Deploy from a branch > `main` / `(root)`.
3. Settings > Actions > General > Workflow permissions > **Read and write**.

## Adicionar animes
Crie pastas em `animes/` (veja `animes/LEIA-ME.txt`) e faça commit. A Action "Atualizar catálogo" gera `data/animes.json` sozinha.
Local: `python tools/gerar_catalogo.py`. Teste: `python -m http.server`.

## Anúncios
Edite `js/ads.js` com seu ID e blocos do AdSense depois de aprovado. Nada secreto vai no código.

## APK
Veja `APK.md`.
