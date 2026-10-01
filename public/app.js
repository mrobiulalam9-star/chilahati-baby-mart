const REFRESH_SECONDS = 1;
const state = { sortKey: 'code', sortDir: 1, search: '', group: '', securities: [], market: null };

const $ = (sel) => document.querySelector(sel);

function fmtNum(n) {
  if (n == null) return '--';
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function fmtInt(n) {
  if (n == null) return '--';
  return n.toLocaleString('en-US');
}

function fmtPct(n) {
  if (n == null) return '--';
  return (n > 0 ? '+' : '') + n.toFixed(2) + '%';
}

function dirClass(n) {
  if (n == null || n === 0) return 'flat';
  return n > 0 ? 'up' : 'down';
}

async function fetchJson(url) {
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body;
}

/* ---------- Header ---------- */
function renderHeader(market) {
  const statusEl = $('#marketStatus');
  const status = market.marketStatus;
  statusEl.textContent = status ? `Market ${status}` : 'Status unknown';
  statusEl.className = 'status-pill' + (status ? ' ' + status.toLowerCase() : '');

  $('#lastUpdate').textContent = market.lastUpdateRaw || '';
}

/* ---------- Ticker ---------- */
function renderTicker(securities) {
  const ticker = $('#ticker');
  let group = ticker.querySelector('.ticker-group');
  if (!group) {
    group = document.createElement('span');
    group.className = 'ticker-group';
    ticker.appendChild(group);
  }
  let clone = ticker.querySelectorAll('.ticker-group')[1];
  if (!clone) {
    clone = group.cloneNode(true);
    ticker.appendChild(clone);
  }

  const html = securities
    .map((s) => {
      const cls = dirClass(s.changePct);
      const pct = s.changePct == null ? '' : ` (${fmtPct(s.changePct)})`;
      const chg = s.change == null ? '' : `${s.change > 0 ? '+' : ''}${fmtNum(s.change)} `;
      return `<span class="tick-item"><span class="tick-code">${s.code}</span>` +
        `<span class="${cls}">${fmtNum(s.ltp)} ${chg}${pct}</span></span>`;
    })
    .join('');

  // Replacing children does not restart the CSS animation on the parent.
  group.innerHTML = html;
  clone.innerHTML = html;

  const duration = Math.max(60, Math.round(securities.length * 1.1));
  ticker.style.animationDuration = duration + 's';
}

/* ---------- Index cards & stats ---------- */
function renderIndices(indices) {
  $('#indexCards').innerHTML = indices
    .map((idx) => {
      const cls = dirClass(idx.change);
      const arrow = idx.change == null || idx.change === 0 ? '' : idx.change > 0 ? '▲ ' : '▼ ';
      if (idx.name === 'DSES') {
        return `<div class="index-card index-card-graph">
          <div id="dseGraphBox" class="index-graph-box">Loading graph…</div>
          <div class="index-change ${cls}">${arrow}${fmtNum(idx.change)} (${fmtPct(idx.changePct)})</div>
        </div>`;
      }
      return `<div class="index-card">
        <div class="index-name">${idx.name}</div>
        <div class="index-value">${fmtNum(idx.value)}</div>
        <div class="index-change ${cls}">${arrow}${fmtNum(idx.change)} (${fmtPct(idx.changePct)})</div>
      </div>`;
    })
    .join('');
  loadDseGraph();
}

async function loadDseGraph() {
  const box = $('#dseGraphBox');
  if (!box || typeof Dygraph === 'undefined') return;
  try {
    const res = await fetch('/api/dse-graph');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const csvMatch = html.match(/"Date,DSEX Index\\n"\s*\+\s*([\s\S]*?)\\n",/);
    if (!csvMatch) throw new Error('Graph data not found');
    const raw = csvMatch[1].replace(/"\s*\+\s*"/g, '').replace(/\\n/g, '\n').replace(/"/g, '').trim();
    const csv = 'Date,DSEX Index\n' + raw;
    box.textContent = '';
    new Dygraph(box, csv, {
      legend: 'always',
      animatedZooms: false,
      title: 'DSE Broad Index',
      titleHeight: 19,
      colors: ['#2865a0'],
      series: { 'DSEX Index': { fillGraph: true, strokeWidth: 1, highlightCircleSize: 3 } }
    });
  } catch (err) {
    box.textContent = 'Graph unavailable';
  }
}

function renderStats(stats) {
  const chips = [
    ['Total Trade', fmtInt(stats.totalTrade)],
    ['Total Volume', fmtInt(stats.totalVolume)],
    ['Total Value (mn BDT)', fmtNum(stats.totalValueMn)],
    ['Advanced', fmtInt(stats.issuesAdvanced), 'up'],
    ['Declined', fmtInt(stats.issuesDeclined), 'down'],
    ['Unchanged', fmtInt(stats.issuesUnchanged)]
  ];
  $('#marketStats').innerHTML = chips
    .map(([label, value, cls]) =>
      `<div class="stat-chip"><span>${label}</span><b class="${cls || ''}">${value}</b></div>`
    )
    .join('');
}

/* ---------- Securities table ---------- */
function visibleSecurities() {
  const q = state.search.toUpperCase();
  let rows = state.securities;
  if (q) rows = rows.filter((s) => s.code.includes(q));
  const key = state.sortKey;
  const dir = state.sortDir;
  rows = [...rows].sort((a, b) => {
    const av = a[key], bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'string') return av.localeCompare(bv) * dir;
    return (av - bv) * dir;
  });
  return rows;
}

function renderTable() {
  const rows = visibleSecurities();
  $('#rowCount').textContent = `Showing ${rows.length} of ${state.securities.length} instruments`;

  document.querySelectorAll('#secTable thead th').forEach((th) => {
    th.classList.remove('sorted-asc', 'sorted-desc');
    if (th.dataset.key === state.sortKey) {
      th.classList.add(state.sortDir === 1 ? 'sorted-asc' : 'sorted-desc');
    }
  });

  if (!rows.length) {
    $('#secTableBody').innerHTML =
      '<tr><td colspan="7" class="empty-row">No matching securities</td></tr>';
    return;
  }

  $('#secTableBody').innerHTML = rows
    .map((s) => {
      const foreign = s.foreignPct == null ? '--' : fmtNum(s.foreignPct) + '%';
      return `<tr>
        <td><a class="code-link" href="https://www.dsebd.org/displayCompany.php?name=${encodeURIComponent(s.code)}"
               target="_blank" rel="noopener">${s.code}</a></td>
        <td>${s.category || '--'}</td>
        <td>${fmtInt(s.freeFloatShares)}</td>
        <td>${foreign}</td>
        <td>${fmtNum(s.week52Low)}</td>
        <td>${fmtNum(s.week52High)}</td>
        <td>${fmtNum(s.ltp)}</td>
      </tr>`;
    })
    .join('');
}

/* ---------- Loading / errors ---------- */
function showError(msg) {
  const banner = $('#errorBanner');
  if (msg) {
    banner.textContent = msg;
    banner.hidden = false;
  } else {
    banner.hidden = true;
  }
}

let secondsLeft = REFRESH_SECONDS;

function tickCountdown() {
  if (REFRESH_SECONDS > 5) {
    secondsLeft -= 1;
    if (secondsLeft <= 0) secondsLeft = REFRESH_SECONDS;
    $('#countdown').textContent = `Next refresh in ${secondsLeft}s`;
  }
}

let lastSig = null;

async function refresh() {
  secondsLeft = REFRESH_SECONDS;
  try {
    const [market, secs] = await Promise.all([
      fetchJson('/api/market'),
      fetchJson('/api/securities' + (state.group ? `?group=${state.group}` : ''))
    ]);
    const sig = JSON.stringify([market.lastUpdateRaw, market.marketStatus, secs.securities]);
    if (sig !== lastSig) {
      lastSig = sig;
      state.market = market;
      state.securities = secs.securities;
      renderHeader(market);
      renderTicker(state.securities);
      renderIndices(market.indices || []);
      renderStats(market.marketStats || {});
      renderTable();
    }
    showError(null);
  } catch (err) {
    showError(`Data refresh failed: ${err.message}. Retrying automatically.`);
  }
}

/* ---------- Events ---------- */
$('#searchBox').addEventListener('input', (e) => {
  state.search = e.target.value.trim();
  renderTable();
});

$('#groupSelect').addEventListener('change', (e) => {
  state.group = e.target.value;
  $('#secTableBody').innerHTML =
    '<tr><td colspan="7" class="empty-row">Loading securities…</td></tr>';
  refresh();
});

$('#refreshBtn').addEventListener('click', refresh);

document.querySelectorAll('#secTable thead th').forEach((th) => {
  th.addEventListener('click', () => {
    const key = th.dataset.key;
    if (state.sortKey === key) {
      state.sortDir = -state.sortDir;
    } else {
      state.sortKey = key;
      state.sortDir = key === 'code' ? 1 : -1;
    }
    renderTable();
  });
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refresh();
});

if (REFRESH_SECONDS <= 5) {
  $('#countdown').textContent = '● Live';
}

setInterval(tickCountdown, 1000);
setInterval(refresh, REFRESH_SECONDS * 1000);
refresh();
