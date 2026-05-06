const PAGE_SIZE = 10;

function renderPager(containerId, total, page, goFn, pageSize) {
  const ps = pageSize || PAGE_SIZE;
  const el = document.getElementById(containerId);
  if (!el) return;
  const pages = Math.ceil(total / ps);
  if (pages <= 1) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="pager">
    <button class="pager-btn" onclick="${goFn}(${page - 1})" ${page === 1 ? 'disabled' : ''}>‹ Prev</button>
    <span class="pager-info">Page ${page} of ${pages} &nbsp;·&nbsp; ${total} entries</span>
    <button class="pager-btn" onclick="${goFn}(${page + 1})" ${page === pages ? 'disabled' : ''}>Next ›</button>
  </div>`;
}

function pageSlice(arr, page, pageSize) {
  const ps = pageSize || PAGE_SIZE;
  return arr.slice((page - 1) * ps, page * ps);
}
