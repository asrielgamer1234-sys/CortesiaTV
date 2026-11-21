/* Home e Catálogo */
(async () => {
  const { carregar, card, adSlot, esc, cabecalho, capaBg } = CortesiaTV;
  const pagina = document.body.dataset.page;
  cabecalho(pagina);
  const main = document.getElementById('conteudo');
  main.innerHTML = `<div class="wrap"><div class="grade" style="margin-top:30px">${'<div class="skel"></div>'.repeat(8)}</div></div>`;
  let animes;
  try { animes = await carregar(); }
  catch (e) { main.innerHTML = '<p class="msg">Não foi possível carregar o catálogo. Verifique a conexão e recarregue a página.</p>'; return; }
  if (!animes.length) { main.innerHTML = '<p class="msg">Nenhum anime publicado ainda. Adicione pastas em <b>animes/</b>.</p>'; return; }
  const generos = [...new Set(animes.flatMap(a => a.generos || []))].sort();
  const fila = (t, l, link) => l.length ? `<section class="fila wrap"><div class="cab"><h2>${t}</h2>${link ? '<a href="catalogo.html">Ver tudo</a>' : ''}</div><div class="carrossel">${l.map(card).join('')}</div></section>` : '';

  if (pagina === 'home') {
    const dest = animes.filter(a => a.destaque), slides = (dest.length ? dest : animes).slice(0, 5);
    const recentes = [...animes].sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
    const pop = [...animes].sort((a, b) => (b.popularidade || 0) - (a.popularidade || 0));
    const hero = document.getElementById('hero');
    hero.innerHTML = slides.map((h, i) => `<div class="slide ${i ? '' : 'on'}" style="${h.banner ? `background-image:url('${encodeURI(h.banner)}')` : `--c1:hsl(${250 + ([...h.nome].reduce((x, c) => x + c.charCodeAt(0), 0) % 70)} 60% 28%)`}">
      <div class="wrap"><span class="selo">${dest.length ? 'Em destaque' : 'Novo no catálogo'}</span>
      <h1>${esc(h.nome)}</h1><div class="tags">${(h.generos || []).slice(0, 4).map(g => `<span>${esc(g)}</span>`).join('')}</div>
      <p>${esc(h.descricao)}</p><div class="acoes"><a class="btn" href="anime.html?id=${encodeURIComponent(h.id)}">▶ Assistir</a><a class="btn sec" href="anime.html?id=${encodeURIComponent(h.id)}#info">Mais informações</a></div></div></div>`).join('')
      + (slides.length > 1 ? `<div class="dots">${slides.map((_, i) => `<button aria-label="Destaque ${i + 1}" class="${i ? '' : 'on'}"></button>`).join('')}</div>` : '');
    if (slides.length > 1) {
      const sl = [...hero.querySelectorAll('.slide')], dt = [...hero.querySelectorAll('.dots button')]; let n = 0, t;
      const ir = k => { sl[n].classList.remove('on'); dt[n].classList.remove('on'); n = k; sl[n].classList.add('on'); dt[n].classList.add('on'); };
      const auto = () => { clearInterval(t); if (!matchMedia('(prefers-reduced-motion:reduce)').matches) t = setInterval(() => ir((n + 1) % sl.length), 7000); };
      dt.forEach((b, i) => b.onclick = () => { ir(i); auto(); }); auto();
    }
    main.innerHTML = fila('Em destaque', dest, true) + adSlot('home-1') + fila('Últimos adicionados', recentes, true) + fila('Mais populares', pop) + adSlot('home-2') +
      `<section class="fila wrap"><div class="cab"><h2>Categorias</h2></div><div class="chips">${generos.map(g => `<a class="chip" href="catalogo.html?genero=${encodeURIComponent(g)}">${esc(g)}</a>`).join('') || '<span class="msg" style="padding:0">Sem categorias ainda.</span>'}</div></section>`;
    return;
  }

  const qs = new URLSearchParams(location.search);
  main.innerHTML = `<div class="wrap"><h1 class="pagina-titulo">Catálogo</h1><div class="filtros">
    <input id="q" type="search" placeholder="Nome do anime" value="${esc(qs.get('q') || '')}" aria-label="Pesquisar por nome">
    <select id="g" aria-label="Gênero"><option value="">Todos os gêneros</option>${generos.map(g => `<option ${g === qs.get('genero') ? 'selected' : ''}>${esc(g)}</option>`).join('')}</select>
    <select id="s" aria-label="Status"><option value="">Todos os status</option>${[...new Set(animes.map(a => a.status))].map(s => `<option>${esc(s)}</option>`).join('')}</select>
    <select id="o" aria-label="Ordenar"><option value="az">A–Z</option><option value="novo">Lançamentos</option></select></div>
    <div id="lista" class="grade"></div></div>`;
  const $ = id => document.getElementById(id);
  const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function render() {
    const l = animes.filter(a => norm(a.nome).includes(norm($('q').value)) && (!$('g').value || (a.generos || []).includes($('g').value)) && (!$('s').value || a.status === $('s').value));
    l.sort($('o').value === 'az' ? (a, b) => a.nome.localeCompare(b.nome, 'pt') : (a, b) => (b.ano || 0) - (a.ano || 0));
    $('lista').innerHTML = l.length ? l.map(card).join('') : '<p class="msg" style="grid-column:1/-1">Nada encontrado. Tente outro nome ou limpe os filtros.</p>';
  }
  ['q', 'g', 's', 'o'].forEach(id => $(id).addEventListener('input', render));
  render(); if (qs.get('foco')) $('q').focus();
})();
