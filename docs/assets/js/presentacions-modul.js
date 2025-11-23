// Llistat de presentacions per mòdul (pàgines docs/moduls/.../presentacions/index.html)
(function () {
  const el = (sel) => document.querySelector(sel);
  const grid = el('#grid');
  const searchInput = el('#search');
  const sortSelect = el('#sort');
  let items = [];

  function cardTemplate(item) {
    const status = (item.status || 'active').toLowerCase();
    const type = (item.type || 'theory').toLowerCase();
    const desc = item.description ? `<p>${item.description}</p>` : '';
    const title = item.title || 'Presentació';

    const href = `./presentador.html?src=${encodeURIComponent(item.src || '')}${
      item.theme ? `&theme=${encodeURIComponent(item.theme)}` : ''
    }${
      title ? `&title=${encodeURIComponent(title)}` : ''
    }`;

    const articleClass = `card card--${type}${status === 'inactive' ? ' card--inactive' : ''}`;
    const badge = status === 'inactive'
      ? `<span class="badge badge--soon">Properament</span>`
      : '';

    const typeIcon = type === 'activity' ? '🧩' : '📚';
    const typeLabel = type === 'activity' ? 'Activitat' : 'Teoria';

    const button = status === 'inactive'
      ? `<span class="button disabled" role="link" aria-disabled="true" title="Properament">No disponible</span>`
      : `<a class="button primary" href="${href}">Obrir presentació</a>`;

    return `<article class="${articleClass}">
      ${badge}
      <div class="card-meta">
        <span class="card-type-icon">${typeIcon}</span>
        <span class="card-type-badge card-type-badge--${type}">${typeLabel}</span>
      </div>
      <h2>${title}</h2>
      ${desc}
      <p>${button}</p>
    </article>`;
  }

  function render(list) {
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = '<p>No s\'ha trobat cap presentació.</p>';
      return;
    }
    grid.innerHTML = list.map(cardTemplate).join('\n');
  }

  function applyFilters() {
    if (!grid) return;
    const q = (searchInput?.value || '').toLowerCase().trim();
    const mode = sortSelect?.value || 'title-az';

    let list = (items || []).filter((it) => {
      const status = (it.status || 'active').toLowerCase();
      if (status === 'hidden') return false;

      const t = (it.title || '').toLowerCase();
      const d = (it.description || '').toLowerCase();
      return !q || t.includes(q) || d.includes(q);
    });

    list.sort((a, b) => {
      if (mode === 'title-az') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (mode === 'title-za') {
        return (b.title || '').localeCompare(a.title || '');
      }
      if (mode === 'date-new' || mode === 'date-old') {
        const ad = new Date(a.date || 0).getTime() || 0;
        const bd = new Date(b.date || 0).getTime() || 0;
        return mode === 'date-new' ? bd - ad : ad - bd;
      }
      // Per defecte, usa 'order' si existeix
      const oA = a.order !== undefined ? a.order : 9999;
      const oB = b.order !== undefined ? b.order : 9999;
      return oA - oB;
    });

    render(list);
  }

  searchInput?.addEventListener('input', applyFilters);
  sortSelect?.addEventListener('change', applyFilters);

  // Carrega el llistat de presentacions del mòdul actual
  fetch('presentacions.json')
    .then((r) => r.json())
    .then((data) => {
      items = data.presentations || [];
      applyFilters();
    })
    .catch((err) => {
      if (grid) {
        grid.innerHTML = '<p>No s\'ha pogut carregar el llistat de presentacions.</p>';
      }
      console.error(err);
    });
})();
