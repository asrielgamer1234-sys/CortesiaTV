(async () => {
  const { carregar, esc, prefs, cabecalho } = CortesiaTV;
  cabecalho();
  const main = document.getElementById('conteudo');
  const qs = new URLSearchParams(location.search), id = qs.get('id');
  let a;
  try { a = (await carregar()).find(x => x.id === id); }
  catch { main.innerHTML = '<p class="msg">Não foi possível carregar o catálogo.</p>'; return; }
  if (!a) { main.innerHTML = '<p class="msg">Anime não encontrado.</p>'; return; }
  const flat = a.temporadas.flatMap(t => t.episodios.map(e => ({ t, e })));
  let i = flat.findIndex(x => x.t.numero == qs.get('t') && x.e.numero == qs.get('e')); if (i < 0) i = 0;
  main.innerHTML = `<div class="pl"><div class="tela" id="tela"><video id="v" playsinline preload="metadata"></video>
    <div class="erro" id="erro">Este vídeo não pôde ser carregado. Confira se o arquivo é MP4 (H.264/AAC) e está na pasta certa.</div>
    <div class="ctl"><button id="pp" aria-label="Reproduzir ou pausar">▶</button><button id="ant" aria-label="Episódio anterior">⏮</button><button id="prox" aria-label="Próximo episódio">⏭</button>
    <input id="prog" type="range" min="0" max="1000" value="0" aria-label="Progresso"><time id="tempo">0:00</time>
    <button id="mudo" aria-label="Silenciar">🔊</button><input id="vol" type="range" min="0" max="1" step=".05" value="1" aria-label="Volume"><button id="fs" aria-label="Tela cheia">⛶</button></div></div>
    <div class="wrap" style="padding:0"><h1 id="tit"></h1><p class="sub"><a href="anime.html?id=${encodeURIComponent(id)}" style="color:var(--pri2)">${esc(a.nome)}</a></p>
    <div class="eps" id="eps" style="margin-top:20px"></div></div></div>`;
  const $ = x => document.getElementById(x), v = $('v'), tela = $('tela');
  const fmt = s => { s = Math.floor(s || 0); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s % 60).padStart(2, '0'); };
  const chave = () => `prog:${id}:${flat[i].t.numero}:${flat[i].e.numero}`;
  let ultimoSave = 0;
  function carregarEp(n) {
    i = n; const { t, e } = flat[i];
    $('erro').style.display = 'none';
    v.src = e.video; $('tit').textContent = `T${t.numero} E${e.numero} · ${e.titulo}`;
    document.title = `${e.titulo} · ${a.nome}`;
    history.replaceState(null, '', `?id=${encodeURIComponent(id)}&t=${t.numero}&e=${e.numero}`);
    prefs.set('ultimo:' + id, { t: t.numero, e: e.numero });
    $('ant').disabled = i === 0; $('prox').disabled = i === flat.length - 1;
    $('eps').innerHTML = flat.map((x, k) => `<a class="ep ${k === i ? 'on' : ''}" href="#" data-k="${k}"><div class="mini">${x.e.thumbnail ? `<img src="${esc(x.e.thumbnail)}" alt="" loading="lazy">` : x.e.numero}</div><div><h3>T${x.t.numero} E${x.e.numero} · ${esc(x.e.titulo)}</h3></div></a>`).join('');
  }
  v.addEventListener('loadedmetadata', () => {
    const p = prefs.get(chave());
    if (p && p.s > 5 && p.s < v.duration - 10) v.currentTime = p.s;
  });
  v.addEventListener('timeupdate', () => {
    $('prog').value = v.duration ? v.currentTime / v.duration * 1000 : 0;
    $('tempo').textContent = `${fmt(v.currentTime)} / ${fmt(v.duration)}`;
    if (Date.now() - ultimoSave > 3000) { ultimoSave = Date.now(); prefs.set(chave(), { s: v.currentTime, d: v.duration }); }
  });
  v.addEventListener('play', () => $('pp').textContent = '⏸');
  v.addEventListener('pause', () => { $('pp').textContent = '▶'; prefs.set(chave(), { s: v.currentTime, d: v.duration }); });
  v.addEventListener('ended', () => { prefs.set(chave(), { s: 0, d: v.duration }); if (i < flat.length - 1) { carregarEp(i + 1); v.play().catch(() => {}); } });
  v.addEventListener('error', () => $('erro').style.display = 'grid');
  const alternar = () => v.paused ? v.play().catch(() => {}) : v.pause();
  $('pp').onclick = alternar; v.onclick = alternar;
  $('ant').onclick = () => { carregarEp(i - 1); v.play().catch(() => {}); };
  $('prox').onclick = () => { carregarEp(i + 1); v.play().catch(() => {}); };
  $('prog').oninput = e => { if (v.duration) v.currentTime = e.target.value / 1000 * v.duration; };
  $('vol').oninput = e => { v.volume = e.target.value; v.muted = false; };
  $('mudo').onclick = () => { v.muted = !v.muted; $('mudo').textContent = v.muted ? '🔇' : '🔊'; };
  $('fs').onclick = () => document.fullscreenElement ? document.exitFullscreen() : (tela.requestFullscreen || tela.webkitRequestFullscreen).call(tela);
  $('eps').onclick = e => { const l = e.target.closest('[data-k]'); if (!l) return; e.preventDefault(); carregarEp(+l.dataset.k); v.play().catch(() => {}); scrollTo({ top: 0 }); };
  document.addEventListener('keydown', e => { if (e.target.tagName === 'INPUT') return; if (e.code === 'Space') { e.preventDefault(); alternar(); } if (e.key === 'f') $('fs').click(); });
  carregarEp(i);
})();
