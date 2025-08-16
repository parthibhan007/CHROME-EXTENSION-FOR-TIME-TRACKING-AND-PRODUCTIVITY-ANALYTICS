function formatSeconds(s) {
  if (!s) return '0';
  return Math.round(s);
}

function renderTable(data) {
  const tbody = document.querySelector('#timeTable tbody');
  tbody.innerHTML = '';
  let totalTime = 0;
  const entries = Object.entries(data).filter(([k]) => !k.startsWith('__')); // ignore internal keys
  entries.sort((a,b) => (b[1].time || 0) - (a[1].time || 0));
  for (const [site, info] of entries) {
    totalTime += info.time || 0;
    const tr = document.createElement('tr');
    const siteCell = document.createElement('td');
    siteCell.textContent = site;
    const catCell = document.createElement('td');
    catCell.textContent = info.category || 'neutral';
    const timeCell = document.createElement('td');
    timeCell.textContent = formatSeconds(info.time);
    tr.appendChild(siteCell);
    tr.appendChild(catCell);
    tr.appendChild(timeCell);
    tbody.appendChild(tr);
  }
  if (entries.length === 0) {
    tbody.innerHTML = '<tr><td class="empty" colspan="3">No data tracked yet.</td></tr>';
  }
}

function load() {
  chrome.storage.local.get(null, (data) => {
    renderTable(data);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  document.getElementById('refreshBtn').addEventListener('click', load);
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Reset all locally stored tracking data?')) return;
    chrome.storage.local.clear(() => load());
  });
  document.getElementById('openDashboard').addEventListener('click', (e) => {
    e.preventDefault();
    // open a local dashboard file that we include in the package
    const url = chrome.runtime.getURL('dashboard/index.html');
    chrome.tabs.create({ url });
  });
});
