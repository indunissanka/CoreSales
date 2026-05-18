(function () {
  // Inject search input into the topbar
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const token = localStorage.getItem('token');
  if (!token) return; // not logged in — skip

  // Build search widget
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;flex:1;max-width:360px;margin:0 24px;';
  wrapper.innerHTML = `
    <div style="position:relative;display:flex;align-items:center;">
      <span style="position:absolute;left:10px;color:#8ab0cc;font-size:14px;pointer-events:none;">🔍</span>
      <input id="global-search-input" type="text" placeholder="Search orders, contacts, products…"
        autocomplete="off"
        style="width:100%;padding:7px 12px 7px 32px;border:1px solid rgba(255,255,255,.2);border-radius:4px;
               background:rgba(255,255,255,.1);color:#fff;font-size:13px;outline:none;box-sizing:border-box;">
    </div>
    <div id="global-search-results"
      style="display:none;position:absolute;top:calc(100% + 6px);left:0;right:0;
             background:#fff;border:1px solid #c0c8d4;border-radius:4px;
             box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:999;max-height:440px;overflow-y:auto;">
    </div>
  `;

  // Insert between brand and user-info
  const brand    = topbar.querySelector('.brand');
  const userInfo = topbar.querySelector('.user-info');
  if (brand && userInfo) topbar.insertBefore(wrapper, userInfo);
  else topbar.appendChild(wrapper);

  const input   = document.getElementById('global-search-input');
  const results = document.getElementById('global-search-results');

  // Style placeholder
  const style = document.createElement('style');
  style.textContent = `
    #global-search-input::placeholder { color: rgba(255,255,255,.5); }
    #global-search-input:focus { border-color: rgba(255,255,255,.6) !important; background: rgba(255,255,255,.18) !important; }
    .gs-result { display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer;border-bottom:1px solid #f0f3f7; }
    .gs-result:last-child { border-bottom:none; }
    .gs-result:hover { background:#eaf1fb; }
    .gs-type { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;
               padding:2px 7px;border-radius:3px;white-space:nowrap;flex-shrink:0; }
    .gs-body { flex:1;min-width:0; }
    .gs-title { font-size:13px;font-weight:600;color:#1a3a5c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .gs-sub   { font-size:11px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .gs-group { padding:6px 14px 4px;font-size:10px;font-weight:700;text-transform:uppercase;
                letter-spacing:.6px;color:#aaa;background:#f7f9fc;border-bottom:1px solid #eee; }
    .gs-empty { padding:20px;text-align:center;color:#aaa;font-size:13px; }
    .gs-loading { padding:14px;text-align:center;color:#888;font-size:12px; }
  `;
  document.head.appendChild(style);

  const TYPE_COLORS = {
    Order:   { bg: '#e3f2fd', color: '#1565c0' },
    Contact: { bg: '#e8f5e9', color: '#2e7d32' },
    Product: { bg: '#f3e5f5', color: '#6a1b9a' },
    Meeting: { bg: '#fff8e1', color: '#e65100' },
    Note:    { bg: '#fce4ec', color: '#880e4f' },
    Sample:  { bg: '#e0f2f1', color: '#00695c' },
  };

  let debounceTimer = null;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (q.length < 2) { results.style.display = 'none'; return; }
    results.style.display = 'block';
    results.innerHTML = '<div class="gs-loading">Searching…</div>';
    debounceTimer = setTimeout(() => doSearch(q), 280);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { results.style.display = 'none'; input.blur(); }
  });

  document.addEventListener('click', e => {
    if (!wrapper.contains(e.target)) results.style.display = 'none';
  });

  async function doSearch(q) {
    try {
      const resp = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!resp.ok) throw new Error('Search failed');
      const data = await resp.json();
      renderResults(data, q);
    } catch (_) {
      results.innerHTML = '<div class="gs-empty">Search unavailable.</div>';
    }
  }

  function hl(text, q) {
    if (!q) return esc(text);
    return esc(text).replace(new RegExp(escRe(q), 'gi'), m => `<mark style="background:#fff176;padding:0 1px;border-radius:2px;">${m}</mark>`);
  }
  function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function renderResults(data, q) {
    if (!data.length) {
      results.innerHTML = `<div class="gs-empty">No results for "<strong>${esc(q)}</strong>"</div>`;
      return;
    }

    // Group by type
    const groups = {};
    data.forEach(r => { (groups[r.type] = groups[r.type] || []).push(r); });

    let html = '';
    for (const [type, items] of Object.entries(groups)) {
      const c = TYPE_COLORS[type] || { bg: '#f5f5f5', color: '#555' };
      html += `<div class="gs-group">${esc(type)}s</div>`;
      html += items.map(r => `
        <div class="gs-result" onclick="location.href='${r.url}'">
          <span class="gs-type" style="background:${c.bg};color:${c.color};">${esc(type)}</span>
          <div class="gs-body">
            <div class="gs-title">${hl(r.title, q)}</div>
            ${r.sub || r.meta ? `<div class="gs-sub">${esc(r.sub)}${r.sub && r.meta ? ' · ' : ''}${esc(r.meta)}</div>` : ''}
          </div>
        </div>`).join('');
    }

    html += `<div style="padding:6px 14px;font-size:11px;color:#bbb;text-align:right;">${data.length} result${data.length !== 1 ? 's' : ''}</div>`;
    results.innerHTML = html;
    results.style.display = 'block';
  }
})();
