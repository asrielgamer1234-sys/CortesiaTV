(async () => {
  const { carregar, esc, prefs, adSlot, cabecalho } = CortesiaTV;
  cabecalho();
  const main = document.getElementById('conteudo');
  const id = new URLSearchParams(location.search).get('id');
  let a;
  try { a = (await carregar()).find(x => x.id === id); }
  catch { main.innerHTML = '<p class="msg">Não foi possível carregar o catálogo.</p>'; return; }
  if (!a) { main.innerHTML = '<p class="msg">Anime não encontrado. <a href="catalogo.html" style="color:var(--pri2)">Ver catálogo</a></p>'; return; }
  document.title = a.nome + ' · CortesiaTV';
  const tags = [a.ano || '', a.status, a.classificacao && 'Classificação ' + a.classificacao, ...(a.generos || [])].filter(Boolean);
  let ts = a.temporadas.findIndex(t => t.numero === prefs.get('ts:' + id, 1)); if (ts < 0) ts = 0;
  const ep1 = a.temporadas[0].episodios[0];
  main.innerHTML = `<div class="ahero" ${a.banner ? `style="background-image:url('${encodeURI(a.banner)}')"` : ''}><div class="wrap ainfo">
    <div class="capa">${a.thumbnail ? `<img src="${esc(a.thumbnail)}" alt="Capa de ${esc(a.nome)}">` : ''}</div>
    <div><h1>${esc(a.nome)}</h1><div class="tags" style="margin:10px 0 0">${tags.map(t => `<span>${esc(t)}</span>`).join('')}</div></div></div></div>
    <div class="wrap"><p class="sinopse" id="info">${esc(a.sinopse)}</p>
    <a class="btn" id="assistir" href="player.html?id=${encodeURIComponent(id)}&t=${a.temporadas[0].numero}&e=${ep1.numero}">▶ Assistir</a>
    ${adSlot('anime-1')}<div class="chips" id="abas"></div><div class="eps" id="eps"></div></div>`;
  const ultimo = prefs.get('ultimo:' + id);
  if (ultimo) document.getElementById('assistir').outerHTML = `<a class="btn" id="assistir" href="player.html?id=${encodeURIComponent(id)}&t=${ultimo.t}&e=${ultimo.e}">▶ Continuar T${ultimo.t} E${ultimo.e}</a>`;
  function lista() {
    const t = a.temporadas[ts];
    document.getElementById('abas').innerHTML = a.temporadas.length > 1 ? a.temporadas.map((x, i) => `<button class="chip ${i === ts ? 'on' : ''}" data-i="${i}">${esc(x.nome)}</button>`).join('') : '';
    document.getElementById('eps').innerHTML = t.episodios.map(e => {
      const p = prefs.get(`prog:${id}:${t.numero}:${e.numero}`); const pc = p && p.d ? Math.min(100, p.s / p.d * 100) : 0;
      return `<a class="ep" href="player.html?id=${encodeURIComponent(id)}&t=${t.numero}&e=${e.numero}">
      <div class="mini">${e.thumbnail ? `<img src="${esc(e.thumbnail)}" alt="" loading="lazy">` : e.numero}</div>
      <div style="flex:1"><h3>${e.numero}. ${esc(e.titulo)}</h3><p>${esc(e.descricao || e.duracao)}</p>${pc ? `<div class="bar"><i style="width:${pc}%"></i></div>` : ''}</div></a>`;
    }).join('');
  }
  document.getElementById('abas').addEventListener('click', ev => {
    const b = ev.target.closest('[data-i]'); if (!b) return;
    ts = +b.dataset.i; prefs.set('ts:' + id, a.temporadas[ts].numero); lista();
  });
  lista();
})();
