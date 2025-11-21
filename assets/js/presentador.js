      const params = new URLSearchParams(location.search);
      const src   = params.get('src');
      const title = params.get('title') || 'Presentació';
      const theme = params.get('theme');
      const sep   = params.get('sep');
      const vsep  = params.get('vsep');
      const nsep  = params.get('notes');

      document.title = title;
      document.getElementById('topbar-title').textContent = title;
      if (theme) document.getElementById('theme').href = `https://unpkg.com/reveal.js/dist/theme/${theme}.css`;
      const sec = document.getElementById('md-section');
      if (src) sec.setAttribute('data-markdown', src);
      if (sep)  sec.setAttribute('data-separator', sep);
      if (vsep) sec.setAttribute('data-separator-vertical', vsep);
      if (nsep) sec.setAttribute('data-separator-notes', nsep);

      const deck = new Reveal({
        hash: true,
        plugins: [ RevealMarkdown, RevealHighlight ],
        slideNumber: params.get('slideNumber') === 'true',
        controls: params.get('controls') !== 'false',
        progress: params.get('progress') !== 'true',
        center: params.get('center') !== 'false'
      });
      deck.initialize();

      // Ajustar alçada topbar dinàmicament
      function setTopbarHeight() {
        const tb = document.querySelector('.topbar');
        const h = tb ? tb.offsetHeight : 0;
        document.documentElement.style.setProperty('--topbar-h', h + 'px');
      }
      window.addEventListener('DOMContentLoaded', setTopbarHeight);
      window.addEventListener('resize', setTopbarHeight);
      const obs = new MutationObserver(setTopbarHeight);
      obs.observe(document.querySelector('.topbar'), { childList: true, subtree: true, characterData: true });

