/* Utilitários compartilhados */
const CortesiaTV = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function carregar() {
    const r = await fetch('data/animes.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return ((await r.json()).animes || []).filter(a => a.publicado !== false);
  }
  const hue = s => 250 + ([...String(s)].reduce((h, c) => h + c.charCodeAt(0), 0) % 70);
  const capaBg = n => `background:linear-gradient(160deg,hsl(${hue(n)} 55% 38%),hsl(${hue(n)} 45% 10%))`;
  const card = a => `<a class="card" href="anime.html?id=${encodeURIComponent(a.id)}">
    <div class="cap">${a.classificacao ? `<span class="badge">${esc(a.classificacao)}</span>` : ''}${a.thumbnail ? `<img src="${esc(a.thumbnail)}" alt="${esc(a.nome)}" loading="lazy">` : `<div class="ph" style="${capaBg(a.nome)}">${esc(a.nome)}</div>`}</div>
    <h3>${esc(a.nome)}</h3><small>${a.ano ? esc(a.ano) + ' · ' : ''}${esc(a.status)}</small></a>`;
  const adSlot = id => `<div class="ad" data-slot="${id}">Espaço publicitário</div>`;
  const prefs = {
    get: (k, d) => { try { return JSON.parse(localStorage.getItem('ctv:' + k)) ?? d; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem('ctv:' + k, JSON.stringify(v)); } catch {} }
  };
  function cabecalho(ativo) {
    const el = document.getElementById('topo'); if (!el) return;
    el.innerHTML = `<div class="wrap"><a class="logo" href="index.html"><img src="assets/logo/logo.svg" alt="">Cortesia<b>TV</b></a>
      <nav class="menu"><a href="index.html" class="${ativo === 'home' ? 'on' : ''}">Início</a><a href="catalogo.html" class="${ativo === 'catalogo' ? 'on' : ''}">Catálogo</a></nav>
      <form class="busca" action="catalogo.html"><input type="search" name="q" placeholder="Buscar anime" aria-label="Buscar anime"></form></div>`;
    document.getElementById('rodape').innerHTML = `<div class="wrap">© ${new Date().getFullYear()} CortesiaTV · Todo o conteúdo exibido possui autorização de distribuição.</div>`;
    const b = document.createElement('nav'); b.className = 'bnav';
    b.innerHTML = `<a href="index.html" class="${ativo === 'home' ? 'on' : ''}"><span>⌂</span>Início</a><a href="catalogo.html" class="${ativo === 'catalogo' ? 'on' : ''}"><span>▦</span>Catálogo</a><a href="catalogo.html?foco=1"><span>⌕</span>Buscar</a>`;
    document.body.appendChild(b);
  }
  return { esc, carregar, card, adSlot, prefs, cabecalho, capaBg };
})();
