(() => {
  const rows = document.getElementById('member-assignment-rows');
  const existing = document.getElementById('member-assignment-existing');
  const add = document.getElementById('member-assignment-add');
  const yen = value => Math.round((Number(value) || 0) * 10000);
  const today = () => new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Tokyo'}).format(new Date());

  function registered(project, member) {
    if (!member) return [];
    const row = getProjectParticipants(project).find(item => item.memberId === member.id);
    if (!row) return [];
    const primary = member.assignedProjectId === project.id;
    const legacyPrimary = primary && !row.tracked;
    const startDate = row.startDate || (legacyPrimary && (member.contractStart || member.startDate)) || project.startDate || '';
    const endDate = row.endDate || row.contractEnd || (legacyPrimary && member.contractEnd) || project.contractEnd || '';
    const rateYen = project.participants?.some(item => item.memberId === member.id)
      ? row.rateYen : (primary ? yen(member.rate) : row.rateYen);
    return [{...row, startDate, endDate, rateYen}, ...(row.history || [])];
  }

  window.sesResetMemberAssignments = member => {
    rows.replaceChildren();
    const entries = db.projects.flatMap(project => registered(project, member).map(period => {
      const line = document.createElement('li');
      const rate = Number(period.rateYen || 0).toLocaleString('ja-JP');
      line.textContent = `${project.title} ｜ ${period.startDate || '開始日未登録'} ～ ${period.endDate || '終了日未登録'} ｜ ${rate}円/月 ｜ ${period.allocationPercent == null ? '稼働割合未登録' : period.allocationPercent + '%'}`;
      return line;
    }));
    existing.replaceChildren(...entries);
    add.disabled = !db.projects.length;
  };

  add.addEventListener('click', () => {
    if (window.sesRestricted?.()) return;
    const row = document.createElement('fieldset');
    row.className = 'grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-slate-700 p-3 text-xs';
    row.innerHTML = `
      <label>案件<select data-field="project" class="ext-input" required><option value="">案件を選択</option></select></label>
      <label>開始日<input data-field="start" type="date" class="ext-input" required></label>
      <label>契約終了日<input data-field="end" type="date" class="ext-input"></label>
      <label>月額単価（円）<input data-field="rate" type="number" min="0" step="1" class="ext-input" required></label>
      <label>稼働割合（%）<input data-field="percent" type="number" min="0.01" max="100" step="0.01" value="100" class="ext-input" required></label>
      <button type="button" class="text-rose-300 justify-self-end self-end">行を削除</button>`;
    const select = row.querySelector('select');
    for (const project of db.projects) select.add(new Option(project.title, project.id));
    row.querySelector('button').addEventListener('click', () => row.remove());
    rows.append(row);
    select.focus();
  });

  const overlaps = (a, b) =>
    (!a.endDate || !b.startDate || b.startDate <= a.endDate) &&
    (!b.endDate || !a.startDate || a.startDate <= b.endDate);

  window.sesReadMemberAssignments = (member, primaryId) => {
    const additions = [];
    function reject(message) {
      alert(message);
      return null;
    }
    if (rows.children.length && (member?.assignedProjectId || '') !== primaryId) {
      return reject('参画案件を一括登録する場合は、上の参画案件（切替用）を変更せずに保存してください。');
    }
    for (const row of rows.children) {
      const field = name => row.querySelector(`[data-field="${name}"]`);
      const project = db.projects.find(item => item.id === field('project').value);
      const startDate = field('start').value;
      const endDate = field('end').value;
      const rateYen = field('rate').valueAsNumber;
      const allocationPercent = field('percent').valueAsNumber;
      if (!project || !startDate || !Number.isSafeInteger(rateYen) || rateYen < 0 || !(allocationPercent > 0 && allocationPercent <= 100)) {
        return reject('案件・開始日・月額単価・稼働割合を入力してください。');
      }
      if ((endDate && endDate < startDate) || (project.startDate && startDate < project.startDate) ||
          (project.contractEnd && (startDate > project.contractEnd || (endDate && endDate > project.contractEnd)))) {
        return reject(`${project.title}の参画期間を案件の契約期間内で入力してください。`);
      }
      const period = {startDate, endDate:endDate || project.contractEnd || '', rateYen, allocationPercent};
      const periods = [...registered(project, member), ...additions.filter(item => item.project === project).map(item => item.period)];
      if (periods.some(item => overlaps(item, period))) {
        return reject(`${project.title}に参画期間が重複する登録があります。`);
      }
      additions.push({project, period});
    }
    return additions;
  };

  window.sesAddMemberAssignments = (memberId, additions) => {
    const member = db.members.find(item => item.id === memberId);
    for (const {project, period} of additions) {
      const periods = [...registered(project, member), period];
      periods.sort((a, b) => b.startDate.localeCompare(a.startDate));
      const clean = ({memberId: ignoredId, history: ignoredHistory, tracked: ignoredTracked, ...details}) => details;
      const [latest, ...history] = periods.map(clean);
      const participants = (project.participants || []).filter(item => item.memberId !== memberId);
      project.participants = [...participants, {memberId, ...latest, history, tracked:true}];
      project.assignedMemberIds = [...new Set([...(project.assignedMemberIds || []), memberId])];
      project.projectType = '参画案件';
      const date = today();
      if (period.startDate <= date && (!period.endDate || period.endDate >= date) &&
          ['提案公募中', '募集準備中', '募集終了'].includes(project.status)) project.status = '参画中';
    }
  };
})();
