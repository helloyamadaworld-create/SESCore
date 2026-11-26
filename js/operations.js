(() => {
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const yen = value => Math.round((Number(value) || 0) * 10000);
  const money = value => '¥' + value.toLocaleString('ja-JP');
  const today = () => new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Tokyo'}).format(new Date());
  const monthOf = value => String(value || '').slice(0, 7);
  const fiscalYear = month => Number(month.slice(0, 4)) - (Number(month.slice(5)) < 11 ? 1 : 0);
  const financeAccess = () => !window.sesRestricted?.() && ['admin','sales'].includes(window.sesOperationSession?.()?.role || 'admin');
  const closeAccess = () => financeAccess() && (window.sesOperationSession?.()?.role || 'admin') === 'admin';
  const actor = () => window.sesCurrentAccount?.username || window.sesOperationSession?.()?.username || '管理者';
  const stages = ['未対応','更新確認待ち','交渉中','更新確定','終了予定'];
  const assignmentKey = (member, project) => member.id + '|' + project.id;
  const followUp = (member, project) => db.contractFollowUps?.[assignmentKey(member, project)] || {};
  window.sesMonthClosed = month => Boolean(db.financeClosings?.[month]?.closed);
  window.sesAllowFinanceDates = (...dates) => {
    if (!dates.some(date => window.sesMonthClosed(monthOf(date)))) return true;
    alert('締め済みの月が含まれています。月次締め画面で再開してください。');
    return false;
  };

  const assignments = () => db.projects.flatMap(project => getProjectParticipants(project).flatMap(row => {
    const member = db.members.find(item => item.id === row.memberId);
    return member ? [{member, project, row}] : [];
  }));
  function coversMonth(project, row, member, month) {
    return Boolean(window.sesAssignmentPeriod(project, row, member, month));
  }
  window.sesAssignmentPeriod = (project, row, member, month) =>
    [row, ...(row.history || [])].find(period => coversPeriod(project, period, member, month, row.tracked));
  function coversPeriod(project, row, member, month, tracked) {
    const starts = [project.startDate, row.startDate];
    const ends = [project.contractEnd, row.endDate || row.contractEnd];
    if (!tracked && member.assignedProjectId === project.id) {
      starts.push(member.contractStart || member.startDate);
      ends.push(member.contractEnd);
    }
    return starts.every(date => !date || monthOf(date) <= month) && ends.every(date => !date || monthOf(date) >= month);
  }
  window.sesFinanceAssignments = assignments;
  window.sesAssignmentCoversMonth = coversMonth;
  function figures(member, month, list) {
    const key = member.id + '|' + month;
    const has = name => db[name]?.[key] != null && db[name][key] !== '';
    const active = member.status === '稼働中' &&
      (!(member.contractStart || member.startDate) || monthOf(member.contractStart || member.startDate) <= month) &&
      (!member.contractEnd || monthOf(member.contractEnd) >= month);
    return {
      plan: yen(window.sesReadProjectFinance(member, month, 'plan', list).rev),
      active,
      missing: !has('monthlyRevenueActual'),
      sales: yen(db.monthlyRevenueActual?.[key]),
      cost: yen(db.monthlyCostActual?.[key]),
      travel: yen(db.monthlyTransportActual?.[key])
    };
  }
  function extras(month) {
    const rows = [];
    for (const job of db.spotJobs || []) if (monthOf(job.date) === month) {
      rows.push({type:'spot', id:job.id, memberId:job.memberId, projectId:job.projectId, sales:yen(job.amount), cost:yen(job.amount) - yen(job.grossProfit ?? job.amount)});
    }
    for (const sale of db.merchandiseSales || []) if (monthOf(sale.date) === month) {
      rows.push({type:'merch', id:sale.id, memberId:sale.memberId, projectId:sale.projectId, sales:Math.round(sale.quantity * sale.unitPrice), cost:Math.round(sale.quantity * sale.unitCost)});
    }
    for (const expense of db.expenses || []) if (monthOf(expense.date) === month) {
      const job = db.spotJobs?.find(row => row.id === expense.spotJobId);
      rows.push({type:'expense', id:expense.id, memberId:expense.memberId, projectId:expense.projectId || job?.projectId, expense:yen(expense.amount)});
    }
    for (const expense of db.merchandiseExpenses || []) if (monthOf(expense.date) === month) {
      rows.push({type:'merch-expense', id:expense.id, memberId:expense.memberId, projectId:expense.projectId, expense:Math.round(Number(expense.amount) || 0)});
    }
    return rows;
  }
  function monthSummary(month, list) {
    const people = db.members.map(member => ({id:member.id, name:member.name, ...figures(member, month, list)}));
    const items = extras(month);
    const eligible = list.filter(({project,row,member}) => coversMonth(project,row,member,month));
    const totals = new Map();
    const add = (entry, projectId) => {
      const project = db.projects.find(item => item.id === projectId);
      const id = project?.id || '';
      const row = totals.get(id) || {id, name:project?.title || '案件未配賦', sales:0, cost:0, travel:0, expense:0};
      for (const key of ['sales','cost','travel','expense']) row[key] += entry[key] || 0;
      totals.set(id, row);
    };
    const projectFor = id => {
      const matches = eligible.filter(item => item.member.id === id);
      return matches.length === 1 ? matches[0].project.id : '';
    };
    for (const person of people) {
      const ids = eligible.filter(item => item.member.id === person.id).map(item => item.project.id);
      const parts = window.sesProjectFinanceParts(person.id, month, 'actual', ids, {
        rev:person.sales / 10000, cost:person.cost / 10000, transport:person.travel / 10000
      });
      for (const [id, {rev, cost, transport}] of parts) {
        if (rev || cost || transport) add({sales:yen(rev), cost:yen(cost), travel:yen(transport)}, id);
      }
    }
    for (const item of items) add(item, item.projectId || projectFor(item.memberId));
    return {people, items, projects:[...totals.values()]};
  }

  const table = (columns, rows) => `<div class="overflow-x-auto"><table class="ext-table"><thead><tr>${columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${columns.length}">対象データなし</td></tr>`}</tbody></table></div>`;
  const options = (values, selected) => values.map(value => `<option ${value === selected ? 'selected' : ''}>${esc(value)}</option>`).join('');
  function contracts(list) {
    const filter = $('ops-contract-filter').value;
    return table(['メンバー／案件','契約終了日','対応状況・担当者・期限'], list.map(({member,project,row}) => {
      const record = followUp(member,project);
      const dates = [row.endDate, row.contractEnd, member.assignedProjectId === project.id && member.contractEnd, project.contractEnd].filter(Boolean).sort();
      const end = dates[0] || '';
      const remaining = end ? Math.round((Date.parse(end) - Date.parse(today())) / 86400000) : null;
      return {member,project,record,end,remaining};
    }).filter(({record,remaining}) => filter === 'all' || (filter === 'due' ? remaining !== null && remaining <= 60 && !['更新確定','終了予定'].includes(record.stage) : (record.stage || stages[0]) === filter))
      .sort((a,b) => (a.remaining ?? Infinity) - (b.remaining ?? Infinity)).map(({member,project,record,end,remaining}) => [
        `${esc(member.name)}<br>${esc(project.title)}`, `${esc(end || '未登録')}${remaining === null ? '' : remaining < 0 ? `（超過 ${-remaining}日）` : `（残り ${remaining}日）`}`,
        financeAccess() ? `<form class="flex flex-wrap gap-2" data-member="${esc(member.id)}" data-project="${esc(project.id)}">
          <select class="ext-input" name="stage" aria-label="対応状況">${options(stages,record.stage || stages[0])}</select>
          <input class="ext-input" name="owner" aria-label="対応担当" placeholder="対応担当" value="${esc(record.owner)}">
          <input class="ext-input" type="date" name="due" aria-label="対応期限" value="${esc(record.due)}">
          <button class="ext-button">保存</button></form>` : esc([record.stage,record.owner,record.due].filter(Boolean).join(' / ') || '未対応')
      ]));
  }
  function meetingRows(month, list) {
    const previous = (db.regularMeetings || []).filter(r => monthOf(r.meetingMonth || r.date) < month)
      .sort((a,b) => String(b.date || b.meetingMonth).localeCompare(String(a.date || a.meetingMonth)))[0];
    const rows = db.members.map(member => {
      const projects = list.filter(item => item.member.id === member.id && coversMonth(item.project,item.row,member,month));
      const feedback = (db.customerMeetings || []).filter(r => !r.deleted && !r.deletedAt &&
        r.type === 'メンバーフィードバック' && monthOf(r.date) === month &&
        (r.memberIds?.includes(member.id) || [member.id,member.name].includes(r.extra?.['対象メンバー'])));
      const evaluation = feedback.map(r => [monthOf(r.date),r.title,r.extra?.['評価・要望'],...Object.entries(r.extra || {}).filter(([key]) => /評価|要望|コメント/.test(key)).map(([key,value]) => key + ' ' + value)].filter(Boolean).join(' / ')).join('\n');
      const rate = db.memberRates?.find(r => r.memberId === member.id && Number(r.year) === fiscalYear(month));
      const progress = projects.map(({project}) => {
        const record = followUp(member,project);
        return [project.title,record.stage,record.owner,record.due].filter(Boolean).join(' / ');
      });
      if (rate?.status) progress.push(rate.status);
      if (rate?.rate != null && financeAccess()) progress.push(money(Number(rate.rate)));
      return ['メンバー',member.name,projects.map(item => item.project.title).join('、'),evaluation,progress.join('\n')];
    });
    if (previous?.carryover) rows.push(['前回からの持ち越し',previous.title || '',previous.date || '',previous.carryover,'']);
    for (const item of previous?.decisionRows || previous?.tasks || []) {
      if (['完了','対応済み','対応完了'].includes(item.status)) continue;
      rows.push(['前回の対応事項',item.topic || item.text || '',item.owner || '',item.due || '',item.status || '']);
    }
    return rows;
  }
  const meetingColumns = ['区分','メンバー／議題','案件／担当','顧客評価／期限・内容','交渉状況／対応状況'];
  let activeTab;
  let selectedMonth = today().slice(0, 7);
  function render(tab = activeTab) {
    const panel = $('view-' + tab);
    if (!panel || panel.classList.contains('hidden') || window.sesRestricted?.()) return;
    activeTab = tab;
    const monthInput = panel.querySelector('[data-ops-month]');
    if (monthInput) monthInput.value = selectedMonth;
    const month = selectedMonth;
    const list = assignments();
    if (tab === 'operations-contracts') {
      $('ops-contracts').innerHTML = contracts(list);
      $('ops-rates-link').hidden = !financeAccess();
      return;
    }
    if (tab === 'operations-meeting') {
      $('ops-meeting').innerHTML = table(meetingColumns, meetingRows(month,list).map(row => row.map(esc)));
      return;
    }
    if (!financeAccess()) return;
    const live = monthSummary(month,list);
    const close = db.financeClosings?.[month];
    const report = close?.closed ? close.snapshot : live;
    if (tab === 'operations-projects') {
      $('ops-projects').innerHTML = table(['案件','売上','原価','交通費','経費','粗利','粗利率'], report.projects.map(row => {
        const profit = row.sales - row.cost - row.travel - row.expense;
        return [esc(row.name), ...[row.sales,row.cost,row.travel,row.expense,profit].map(money),
          row.sales ? (100 * profit / row.sales).toFixed(1) + '%' : '—'];
      }));
      return;
    }
    $('ops-differences').innerHTML = table(['メンバー','予定売上','実績売上','差額','確認事項'], report.people.filter(row => row.active || row.plan || !row.missing).map(row => [
      esc(row.name), money(row.plan), row.missing ? '未入力' : money(row.sales), row.missing ? '—' : money(row.sales-row.plan), row.missing && (row.active || row.plan) ? '実績売上を確認' : '—'
    ]));
    const changed = close?.closed && JSON.stringify(live) !== JSON.stringify(close.snapshot);
    $('ops-close-status').textContent = (close?.closed ? '締め済み' : '未締め') + (changed ? ' ／ 締め後に元データに差分あり' : '');
    $('ops-expenses-checked').checked = Boolean(close?.expensesChecked);
    $('ops-expenses-checked').disabled = !closeAccess() || Boolean(close?.closed);
    $('ops-close-button').hidden = !closeAccess();
    $('ops-close-button').textContent = close?.closed ? '締めを再開' : '月次締め';
    $('ops-history').innerHTML = table(['日時','担当','操作','変更内容'], (close?.history || []).slice().reverse().map(row => [
      esc(row.at),esc(row.by),esc(row.action),esc(row.note)
    ]));
  }
  window.renderOperations = render;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-ops-month]').forEach(input => {
      input.value = selectedMonth;
      input.addEventListener('change', () => {
        selectedMonth = input.value || selectedMonth;
        render();
      });
    });
    $('ops-contract-filter').addEventListener('change', () => render());
    $('ops-contracts').addEventListener('submit', event => {
      event.preventDefault();
      if (!financeAccess()) return;
      const {member,project} = event.target.dataset;
      if (!assignments().some(row => row.member.id === member && row.project.id === project)) return;
      const value = Object.fromEntries(new FormData(event.target));
      if (!stages.includes(value.stage)) return;
      (db.contractFollowUps ||= {})[member+'|'+project] = value;
      saveStoredData();
      render();
    });
    $('ops-close-button').addEventListener('click', () => {
      if (!closeAccess()) return;
      const month = selectedMonth;
      if (!month) return;
      const existing = db.financeClosings?.[month];
      const reopening = Boolean(existing?.closed);
      const checked = $('ops-expenses-checked').checked;
      if (!reopening && !checked) return alert('経費の計上を確認してください。');
      const reason = prompt(reopening ? '再開理由を入力してください。' : '締めメモを入力してください（任意）。');
      if (reason === null || (reopening && !reason.trim())) return;
      const snapshot = reopening ? existing.snapshot : monthSummary(month,assignments());
      const pending = snapshot.people.filter(row => row.missing && (row.active || row.plan)).length;
      if (!reopening && pending && !confirm(`売上の未入力が${pending}名あります。この状態で締めますか？`)) return;
      const changed = existing?.snapshot && JSON.stringify(existing.snapshot) !== JSON.stringify(snapshot);
      const history = [...(existing?.history || []), {
        at:new Date().toISOString(), by:actor(), action:reopening ? '再開' : '締め',
        note:[reason.trim(),changed ? '前回締めから集計内容を更新' : ''].filter(Boolean).join(' / '),
        ...(!reopening ? {snapshot} : {})
      }];
      (db.financeClosings ||= {})[month] = {closed:!reopening, expensesChecked:!reopening && checked, snapshot, history};
      saveStoredData();
      render();
    });
    $('ops-export').addEventListener('click', () => {
      if (window.sesRestricted?.()) return;
      const month = selectedMonth;
      if (!month) return;
      const cell = value => {
        const raw = String(value ?? '');
        return '"' + (/^[\s]*[=+\-@]/.test(raw) ? "'" + raw : raw).replaceAll('"','""') + '"';
      };
      const rows = [meetingColumns,...meetingRows(month,assignments())];
      const url = URL.createObjectURL(new Blob(['\uFEFF',rows.map(row => row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
      const link = document.createElement('a');
      link.href = url;
      link.download = `SES_Core_リーダー定例会_${month}.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url),1000);
    });
  });
})();
