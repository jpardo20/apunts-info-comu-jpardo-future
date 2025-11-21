
/* Inicialització comuna de Reveal.js per a totes les presentacions */
(function () {
  const deck = new Reveal({
    hash: true,
    slideNumber: true,
    transition: 'slide',
    plugins: [ RevealMarkdown, RevealHighlight, RevealNotes ],
  });
  deck.initialize();

  // Expose a helper per canviar de tema des de la consola si cal
  window.setTheme = function(name) {
    document.getElementById('theme')
      .setAttribute('href', `https://unpkg.com/reveal.js/dist/theme/${name}.css`);
  };
})();
