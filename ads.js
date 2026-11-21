/* Google AdSense. Preencha após a conta ser aprovada. O ID é público (não é segredo). */
window.CTV_ADS = {
  client: "",              // ex.: "ca-pub-1234567890123456"
  slots: {                 // ex.: "home-1": "1234567890"
    "home-1": "", "home-2": "", "anime-1": ""
  },
  mostrarReservado: true   // false esconde os espaços vazios em produção
};
(() => {
  const c = window.CTV_ADS; let carregado = false;
  function aplicar() {
    document.querySelectorAll('.ad[data-slot]:not([data-ok])').forEach(el => {
      const slot = c.slots[el.dataset.slot];
      if (c.client && slot) {
        if (!carregado) { carregado = true; const s = document.createElement('script'); s.async = true; s.crossOrigin = 'anonymous';
          s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(c.client); document.head.appendChild(s); }
        el.innerHTML = `<ins class="adsbygoogle" data-ad-client="${c.client}" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
      } else if (!c.mostrarReservado) el.style.display = 'none';
      el.dataset.ok = '1';
    });
  }
  new MutationObserver(aplicar).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('DOMContentLoaded', aplicar);
})();
