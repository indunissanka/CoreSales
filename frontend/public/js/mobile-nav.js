/**
 * Mobile Navigation — Dynamic bottom nav bar + More drawer
 * Injects mobile-optimized navigation on pages with .topbar
 */

(function() {
  // Guard: only inject on authenticated pages with .topbar
  if (!document.querySelector('.topbar')) {
    return;
  }

  // Tab definitions
  const PRIMARY_TABS = [
    { path: '/dashboard.html', label: 'Dashboard', icon: 'home' },
    { path: '/contacts.html', label: 'Contacts', icon: 'person' },
    { path: '/orders.html', label: 'Orders', icon: 'box' },
    { path: '/reports.html', label: 'Reports', icon: 'chart' },
    { path: '#more', label: 'More', icon: 'grid' }
  ];

  const MORE_TABS = [
    { path: '/pricing.html', label: 'Pricing' },
    { path: '/samples.html', label: 'Samples' },
    { path: '/lc-tracker.html', label: 'Trade Docs' },
    { path: '/forecast.html', label: 'Forecast' },
    { path: '/meetings.html', label: 'Meetings' },
    { path: '/notes.html', label: 'Notes' },
    { path: '/todos.html', label: 'To-Dos' },
    { path: '/settings.html', label: 'Settings' }
  ];

  const ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/></svg>',
    person: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v8H3zm4-8h2v16H7zM3 3h2v8H3zm8-0h2v16h-2zm8 0h2v16h-2zm-4 3h2v13h-2z"/></svg>'
  };

  function isCurrentPage(path) {
    const current = window.location.pathname;
    return current === path || current.endsWith(path);
  }

  function createIcon(name) {
    return `<div class="mobile-nav-icon">${ICONS[name] || ''}</div>`;
  }

  function initMobileNav() {
    // Remove old instances to prevent duplicates
    document.querySelectorAll('.mobile-bottom-nav, .mobile-more-overlay, .mobile-more-drawer').forEach(el => el.remove());

    injectBottomNav();
    injectMoreDrawer();
    labelDataTables();
  }

  function injectBottomNav() {
    let html = '<nav class="mobile-bottom-nav">';
    PRIMARY_TABS.forEach(tab => {
      const active = tab.path !== '#more' && isCurrentPage(tab.path) ? 'active' : '';
      const href = tab.path === '#more' ? '#' : tab.path;
      html += `
        <a href="${href}" class="mobile-nav-tab ${active}" data-path="${tab.path}" data-mobile-tab>
          ${createIcon(tab.icon)}
          <span class="mobile-nav-label">${tab.label}</span>
        </a>
      `;
    });
    html += '</nav>';
    document.body.insertAdjacentHTML('beforeend', html);

    // Attach listener to More button
    document.querySelector('[data-path="#more"]')?.addEventListener('click', (e) => {
      e.preventDefault();
      openMoreDrawer();
    });
  }

  function injectMoreDrawer() {
    let html = `
      <div class="mobile-more-overlay" data-mobile-overlay></div>
      <div class="mobile-more-drawer" data-mobile-drawer>
        <div class="mobile-more-handle"></div>
        <ul class="mobile-more-links">
    `;
    MORE_TABS.forEach(tab => {
      const active = isCurrentPage(tab.path) ? 'active' : '';
      html += `<li><a href="${tab.path}" class="${active}" data-drawer-link>${tab.label}</a></li>`;
    });
    html += `</ul></div>`;
    document.body.insertAdjacentHTML('beforeend', html);

    // Attach listeners
    document.querySelector('[data-mobile-overlay]')?.addEventListener('click', closeMoreDrawer);
    document.querySelectorAll('[data-drawer-link]').forEach(link => {
      link.addEventListener('click', closeMoreDrawer);
    });
  }

  function openMoreDrawer() {
    const overlay = document.querySelector('[data-mobile-overlay]');
    const drawer = document.querySelector('[data-mobile-drawer]');
    overlay?.classList.add('open');
    drawer?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMoreDrawer() {
    const overlay = document.querySelector('[data-mobile-overlay]');
    const drawer = document.querySelector('[data-mobile-drawer]');
    overlay?.classList.remove('open');
    drawer?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function labelDataTables() {
    document.querySelectorAll('.data-table').forEach(table => {
      const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
      table.querySelectorAll('tbody tr').forEach(tr => {
        tr.querySelectorAll('td').forEach((td, i) => {
          if (!td.hasAttribute('data-label') && headers[i]) {
            td.setAttribute('data-label', headers[i]);
          }
        });
      });
    });
  }

  // Expose global API
  window.__mobileNav__ = { openMoreDrawer, closeMoreDrawer };

  // Initialize when DOM is ready
  const init = () => {
    initMobileNav();
    // Watch for new tables
    new MutationObserver(() => labelDataTables()).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
