(() => {
  const fields = ['rev', 'cost', 'transport'];
  const cents = amount => Math.max(0, Math.round((Number(amount) || 0) * 10000));
  const key = (memberId, month) => memberId + '|' + month;

  window.sesProjectIdsForMonth = (list, memberId, month) => [...new Set(list
    .filter(({member, project, row}) => member.id === memberId && window.sesAssignmentCoversMonth(project, row, member, month))
    .map(({project}) => project.id))];

  function assignmentRevenue(eligible, month) {
    const periods = eligible.map(({project, row, member}) =>
      [project.id, window.sesAssignmentPeriod(project, row, member, month), member, row.tracked]);
    if (!periods.some(([, period]) => period?.allocationPercent != null)) return null;
    return new Map(periods.map(([id, period, member, tracked]) => {
      const percent = period?.allocationPercent ?? 100;
      const rate = !tracked && member.assignedProjectId === id ? cents(member.rate) : (period?.rateYen ?? cents(member.rate));
      return [id, Math.round(rate * percent / 100)];
    }));
  }

  window.sesReadProjectFinance = (member, month, mode, list) => {
    const monthKey = key(member.id, month);
    if (mode === 'actual') return {
      rev:cents(db.monthlyRevenueActual?.[monthKey]) / 10000,
      cost:cents(db.monthlyCostActual?.[monthKey]) / 10000,
      transport:cents(db.monthlyTransportActual?.[monthKey]) / 10000
    };
    const eligible = list.filter(({member: person, project, row}) =>
      person.id === member.id && window.sesAssignmentCoversMonth(project, row, member, month));
    const rates = assignmentRevenue(eligible, month);
    const tracked = eligible.some(({row}) => row.tracked);
    const split = tracked && eligible.length > 1;
    const onlyScheduled = !member.assignedProjectId && list.some(({member: person, row}) =>
      person.id === member.id && [row, ...(row.history || [])].some(period => period.allocationPercent != null));
    const start = member.contractStart || member.startDate;
    const active = !split && (tracked || (!onlyScheduled && member.status === '稼働中' &&
      (!start || start.slice(0, 7) <= month) && (!member.contractEnd || member.contractEnd.slice(0, 7) >= month)));
    const fiscalYear = Number(month.slice(0, 4)) - (Number(month.slice(5)) < 11 ? 1 : 0);
    const rate = tracked && !split
      ? window.sesAssignmentPeriod(eligible[0].project, eligible[0].row, member, month)?.rateYen / 10000
      : member.rate;
    const allocation = db.projectFinance?.plan?.[monthKey];
    const negotiated = !rates && !split && !allocation ? window.memberRatePlan?.(member, month) : null;
    const plannedRevenue = rates ? [...rates.values()].reduce((sum, amount) => sum + amount, 0) / 10000 : (active ? rate : 0);
    return {
      rev:cents(negotiated ?? db.monthlyRevenue?.[monthKey] ?? plannedRevenue) / 10000,
      cost:cents(db.monthlyCost?.[monthKey] ?? (active || rates ? (window.gradeCostFor?.(member, fiscalYear) ?? member.cost) : 0)) / 10000,
      transport:cents(db.monthlyTransport?.[monthKey] ?? (split && !rates ? 0 : member.transportCost)) / 10000
    };
  };

  // The original member-month stores remain the source for aggregate reports.
  // Project allocations consume part of that total, leaving any legacy balance visible.
  window.sesProjectFinanceParts = (memberId, month, mode, projectIds, totals, list) => {
    const allocations = db.projectFinance?.[mode]?.[key(memberId, month)] || {};
    const ids = [...new Set([...projectIds, ...Object.keys(allocations)])];
    const remaining = Object.fromEntries(fields.map(field => [field, cents(totals[field])]));
    const parts = new Map();
    const hasMonthlyRevenue = db.monthlyRevenue?.[key(memberId, month)] != null;
    const rates = mode === 'plan' && !hasMonthlyRevenue && projectIds.length > 0 && assignmentRevenue(
      (list || window.sesFinanceAssignments()).filter(({member, project}) => member.id === memberId && projectIds.includes(project.id)), month);
    for (const id of ids) {
      const values = {};
      for (const field of fields) {
        const plannedYen = field === 'rev' && rates ? (rates.get(id) ?? 0) : 0;
        const amount = Math.min(remaining[field], allocations[id]?.[field] == null ? plannedYen : cents(allocations[id][field]));
        values[field] = amount / 10000;
        remaining[field] -= amount;
      }
      parts.set(id, values);
    }
    const residualId = projectIds.length === 1 ? projectIds[0] : '';
    if (!parts.size || residualId || fields.some(field => remaining[field])) {
      const values = parts.get(residualId) || {};
      for (const field of fields) values[field] = (cents(values[field]) + remaining[field]) / 10000;
      parts.set(residualId, values);
    }
    return parts;
  };

  window.sesWriteProjectFinance = (memberId, month, mode, projectId, field, value, stores, fallback = {}) => {
    const monthKey = key(memberId, month);
    const totals = Object.fromEntries(fields.map(name => [name, stores[name][monthKey] ?? fallback[name]]));
    const ids = window.sesProjectIdsForMonth(window.sesFinanceAssignments(), memberId, month);
    const parts = window.sesProjectFinanceParts(memberId, month, mode, ids, totals);
    const change = parts.get(projectId) || {};
    const previous = cents(change[field]);
    change[field] = value;
    parts.set(projectId, change);
    const increase = cents(value) - previous;
    const unallocated = projectId ? cents(parts.get('')?.[field]) : 0;
    const transferred = Math.min(unallocated, Math.max(0, increase));
    stores[field][monthKey] = (cents(totals[field]) + increase - transferred) / 10000;
    const modeData = ((db.projectFinance ||= {})[mode] ||= {});
    const stored = modeData[monthKey] || {};
    const allocations = [...parts].filter(([id]) => id).map(([id, values]) =>
      [id, {...stored[id], [field]:values[field]}]).filter(([, values]) => fields.some(name => values[name]));
    if (allocations.length) modeData[monthKey] = Object.fromEntries(allocations);
    else delete modeData[monthKey];
  };

  window.sesCopyProjectFinance = (memberId, month, values, assignments) => {
    const monthKey = key(memberId, month);
    const ids = window.sesProjectIdsForMonth(assignments, memberId, month);
    const parts = window.sesProjectFinanceParts(memberId, month, 'plan', ids, values, assignments);
    const entries = [...parts].filter(([id, part]) => id && fields.some(field => part[field]));
    const from = entries.length ? Object.fromEntries(entries) : null;
    if (from) ((db.projectFinance ||= {}).actual ||= {})[monthKey] = from;
    else if (db.projectFinance?.actual) delete db.projectFinance.actual[monthKey];
  };

  window.sesTransferProject = (member, nextId, start, contractEnd, rate) => {
    const previous = db.projects.find(p => p.id === member.assignedProjectId);
    const next = db.projects.find(p => p.id === nextId);
    const active = previous && getProjectParticipants(previous).find(row => row.memberId === member.id);
    const target = next && getProjectParticipants(next).find(row => row.memberId === member.id);
    if ([active, target].some(row => row && [row, ...(row.history || [])].some(period => period.allocationPercent != null))) {
      alert('一括登録済みの案件は、案件管理で参画情報を確認してください。');
      return false;
    }
    const priorStart = active?.startDate || member.contractStart || member.startDate || previous?.startDate;
    if (!start || (priorStart && start <= priorStart && previous)) {
      alert('切替日は、前の案件の参画開始日より後の日付を入力してください。');
      return false;
    }
    if (nextId && (!next || (next.startDate && start < next.startDate) ||
        (next.contractEnd && start > next.contractEnd) || (contractEnd && start > contractEnd))) {
      alert('切替日は、新しい案件の契約期間内の日付を入力してください。');
      return false;
    }
    const existing = target;
    if (existing?.startDate && existing.startDate >= start) {
      alert('新しい案件に同日以降の参画情報が登録されています。');
      return false;
    }
    const dayBefore = new Date(start + 'T00:00:00Z');
    dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
    const cutoff = dayBefore.toISOString().slice(0, 10);
    function put(project, row) {
      project.participants = [...(project.participants || []).filter(item => item.memberId !== member.id), row];
      project.assignedMemberIds = [...new Set([...(project.assignedMemberIds || []), member.id])];
    }
    if (previous) {
      const endDate = [active?.endDate || active?.contractEnd, member.contractEnd, previous.contractEnd, cutoff]
        .filter(Boolean).sort()[0];
      const storedRate = (previous.participants || []).find(row => row.memberId === member.id)?.rateYen;
      put(previous, {...active, memberId:member.id, rateYen:storedRate ?? cents(member.rate), startDate:priorStart || '', endDate, tracked:true});
    }
    if (next) {
      const history = [...(existing?.history || [])];
      if (existing?.startDate || existing?.endDate || existing?.contractEnd) {
        const endDate = [existing.endDate || existing.contractEnd, cutoff].filter(Boolean).sort()[0];
        history.push({startDate:existing.startDate || '', endDate, rateYen:existing.rateYen});
      }
      put(next, {memberId:member.id, rateYen:cents(rate), startDate:start, endDate:contractEnd, history, tracked:true});
      next.projectType = '参画案件';
      if (['提案公募中', '募集準備中', '募集終了'].includes(next.status)) next.status = '参画中';
    }
    return true;
  };
})();
