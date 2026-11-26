(() => {
  const byId = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[char]);
  const money = value => '¥' + Math.round(value).toLocaleString('ja-JP');
  const normalize = value => String(value ?? '').normalize('NFKC').trim();
  let selectedTab = 'members';
  let savedTabs;
  let selectedClient = 'all';

  window.sesRevenueClients = ({months, memberMonthly, extras, expenseItems, viewMode}) => {
    if (window.sesRestricted?.()) return '';
    const clients = new Map(db.clients.map(client => [client.id, client]));
    const projects = new Map(db.projects.map(project => [project.id, project]));
    const jobs = new Map((db.spotJobs || []).map(job => [job.id, job]));
    const names = new Map();
    for (const client of clients.values()) {
      const name = normalize(client.name);
      if (name) names.set(name, names.has(name) ? '' : client.id);
    }

    const assignments = window.sesFinanceAssignments().reduce((groups, assignment) => {
      const id = assignment.member.id;
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push(assignment);
      return groups;
    }, new Map());
    const rows = new Map();
    const totals = Array(months.length).fill(0);
    const salesRows = new Map(), profitRows = new Map();
    const salesTotals = Array(months.length).fill(0), profitTotals = Array(months.length).fill(0);
    const indexes = new Map(months.map((month, index) => [month, index]));
    const projectClient = project => clients.has(project?.clientId)
      ? project.clientId : names.get(normalize(project?.clientName)) || '';

    function clientFor(entry, month) {
      if (entry.clientId) return clients.has(entry.clientId) ? entry.clientId : '';
      if (entry.client || entry.clientName) return names.get(normalize(entry.client || entry.clientName)) || '';
      if (entry.projectId !== undefined) return projectClient(projects.get(entry.projectId));

      const eligible = (assignments.get(entry.memberId) || []).filter(({project, row, member}) =>
        window.sesAssignmentCoversMonth(project, row, member, month));
      const ids = new Set(eligible.map(({project}) => projectClient(project)));
      return ids.size === 1 ? [...ids][0] : '';
    }

    function add(entry, month, sales, profit) {
      if (!sales && !profit) return;
      const id = clientFor(entry, month);
      if (!rows.has(id)) rows.set(id, Array(months.length).fill(0));
      const index = indexes.get(month);
      if (!salesRows.has(id)) { salesRows.set(id, Array(months.length).fill(0)); profitRows.set(id, Array(months.length).fill(0)); }
      salesRows.get(id)[index] += sales; profitRows.get(id)[index] += profit;
      salesTotals[index] += sales; profitTotals[index] += profit;
      const amount = viewMode === 'profit' ? profit : sales;
      rows.get(id)[index] += amount;
      totals[index] += amount;
    }

    for (const {member, projectId, values} of memberMonthly) {
      values.forEach(({rev, cost, transport}, index) => {
        add({memberId:member.id, projectId}, months[index], rev * 10000, (rev - cost - transport) * 10000);
      });
    }
    for (const sale of extras) add(sale, sale.date.slice(0, 7), sale.rev, sale.rev - sale.cost);
    for (const expense of expenseItems) {
      const job = jobs.get(expense.spotJobId);
      add({...job, ...expense}, expense.date.slice(0, 7), 0, -expense.yen);
    }

    const entries = [...rows].sort(([a], [b]) => {
      if (!a || !b) return Number(!a) - Number(!b);
      return clients.get(a).name.localeCompare(clients.get(b).name, 'ja');
    });
    const label = id => clients.get(id)?.name || '取引先未紐付け';
    const key = id => id ? 'client:' + id : 'unassigned';
    const metric = viewMode === 'profit' ? '粗利' : '売上';
    const sum = values => values.reduce((a,b)=>a+b,0);
    const rate = (sales,profit) => sales ? `${(profit/sales*100).toFixed(1)}%` : '—';
    const cell = (amount,sales,profit) => {
      const pct = sales ? profit/sales*100 : null;
      const level = pct === null ? 'none' : pct < 0 ? 'loss' : pct < 10 ? 'low' : pct < 20 ? 'mid' : 'high';
      const explanation = {high:'良好：20%以上',mid:'標準：10%以上20%未満',low:'注意：0%以上10%未満',loss:'赤字：0%未満',none:'対象外：売上なし'}[level];
      return `<td><span class="r14-amount ${amount < 0 ? 'r14-negative' : amount === 0 ? 'r14-zero' : ''}">${money(amount)}</span><small tabindex="0" data-rate-help="${escape(explanation)}" class="r11-margin r14-rate-${level}">粗利率 ${rate(sales,profit)}</small></td>`;
    };
    const cells = (amounts,sales,profits) => amounts.map((amount,i) => cell(amount,sales[i],profits[i])).join('') + cell(sum(amounts),sum(sales),sum(profits));
    const body = entries.map(([id, amounts]) => `<tr data-client-row="${escape(key(id))}"><th scope="row">${escape(label(id))}</th>${cells(amounts,salesRows.get(id),profitRows.get(id))}</tr>`).join('')
      || `<tr><td colspan="${months.length + 2}">対象データなし</td></tr>`;
    const footer = [['all', totals, salesTotals, profitTotals], ...entries.map(([id, amounts]) => [key(id), amounts,salesRows.get(id),profitRows.get(id)])]
      .map(([id, amounts,sales,profits]) => `<tr data-client-total="${escape(id)}"><th scope="row">${metric}合計</th>${cells(amounts,sales,profits)}</tr>`).join('');
    return `<div class="ops-toolbar" id="r15-client-control"><label>取引先<select id="revenue-client-filter" class="ext-input">
      <option value="all">すべての取引先</option>${entries.map(([id]) => `<option value="${escape(key(id))}">${escape(label(id))}</option>`).join('')}
      </select></label></div>
      <p class="revenue-client-note">案件・明細の取引先を集計します。複数の取引先に参画し、明細から配賦先を特定できない金額は「取引先未紐付け」に表示します。</p>
      <div class="overflow-x-auto r14-client-scroll"><table class="ext-table client-revenue-table"><thead><tr><th scope="col">取引先</th>
      ${months.map(month => `<th scope="col">${Number(month.slice(5))}月</th>`).join('')}
      <th scope="col">期間${metric}</th></tr></thead><tbody>${body}</tbody><tfoot>${footer}</tfoot></table></div>`;
  };

  function applyClientFilter() {
    const select = byId('revenue-client-filter');
    if (!select) return;
    select.value = selectedClient;
    if (!select.value) select.value = 'all';
    byId('revenue-clients-panel').querySelectorAll('[data-client-row], [data-client-total]').forEach(row => {
      row.hidden = row.dataset.clientTotal !== undefined
        ? row.dataset.clientTotal !== select.value
        : select.value !== 'all' && row.dataset.clientRow !== select.value;
    });
  }

  window.sesApplyRevenueTab = () => {
    const view = byId('view-revenue');
    const matrix = byId('monthly-revenue-matrix');
    if (!view || !matrix) return;
    const showClients = selectedTab === 'clients';
    const tabs = byId('revenue-tabs') || savedTabs;
    const toolbar = byId('r15-revenue-toolbar');
    const control = byId('r15-client-control');
    if (toolbar && tabs) { savedTabs = tabs; toolbar.append(tabs); if (control) { toolbar.append(control); control.hidden = !showClients; } }

    view.dataset.revenueTab = selectedTab;
    for (const tab of view.querySelectorAll('[role="tab"]')) {
      const active = tab.dataset.revenueTab === selectedTab;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    }
    byId('revenue-members-panel').hidden = showClients;
    byId('revenue-clients-panel').hidden = !showClients;
    applyClientFilter();
  };

  document.addEventListener('DOMContentLoaded', () => {
    const tabList = byId('revenue-tabs') || savedTabs;
    savedTabs = tabList;
    const buttons = [...tabList.querySelectorAll('[role="tab"]')];
    tabList.addEventListener('click', event => {
      const button = event.target.closest('[role="tab"]');
      if (!button) return;
      selectedTab = button.dataset.revenueTab;
      window.sesApplyRevenueTab();
    });
    tabList.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const button = event.key === 'Home' ? buttons[0] : event.key === 'End' ? buttons[1] : buttons.find(item => item !== event.target);
      button.click();
      button.focus();
    });
    const tip = document.createElement('div');
    tip.id = 'r15-rate-tooltip'; tip.setAttribute('role','tooltip'); tip.hidden = true; document.body.append(tip);
    const show = event => { const el = event.target.closest?.('[data-rate-help]'); if (!el) return; tip.textContent = el.dataset.rateHelp; tip.hidden = false; el.setAttribute('aria-describedby',tip.id); const r = el.getBoundingClientRect(); tip.style.left = Math.max(8,Math.min(r.left,innerWidth-tip.offsetWidth-8))+'px'; tip.style.top = (r.top > tip.offsetHeight+12 ? r.top-tip.offsetHeight-6 : r.bottom+6)+'px'; };
    const hide = () => { tip.hidden = true; };
    const view = byId('view-revenue');
    view.addEventListener('pointerover',show); view.addEventListener('focusin',show); view.addEventListener('pointerout',hide); view.addEventListener('focusout',hide); window.addEventListener('scroll',hide,true); window.addEventListener('resize',hide); document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
    byId('view-revenue').addEventListener('change', event => {
      if (event.target.id !== 'revenue-client-filter') return;
      selectedClient = event.target.value;
      applyClientFilter();
    });
  });
})();
