/* R10: automatic critical task reconciliation. */
(function(root){
  function sync(data, date){
    const desired = new Map();
    const add=(key,title,due)=>desired.set(JSON.stringify(key),{title,date:due});
    for(const m of data.members||[]){
      if(['待機中','待机中'].includes(m.currentStatus||m.status)) add(['bench',m.id],`【待機要員】${m.name}：案件提案・フォロー`,date);
      for(const p of data.projects||[]){
        const row=(p.participants||[]).find(r=>r.memberId===m.id);
        const primary=m.assignedProjectId===p.id || (!m.assignedProjectId && m.currentProject===p.title);
        if(!row&&!primary&&!(p.assignedMemberIds||[]).includes(m.id))continue;
        for(const period of [row||{},...(row?.history||[])]){
          const end=period.endDate||period.contractEnd||(primary&&!row?.tracked&&m.contractEnd)||p.contractEnd;
          if(!/^\d{4}-\d{2}-\d{2}$/.test(end||'')||end<date)continue;
          add(['end',m.id,p.id,end],`【案件終了】${m.name}：${p.title}（${end}）`,end);
        }
      }
    }
    const tasks=data.tasks||(data.tasks=[]); let changed=false;
    const existing=new Map(tasks.filter(t=>t.autoCriticalKey).map(t=>[t.autoCriticalKey,t]));
    for(const [key,item] of desired){
      const old=existing.get(key);
      if(old){if(old.title!==item.title){old.title=item.title;changed=true;} if(old.autoResolved){old.status='未着手';old.completedAt='';delete old.autoResolved;changed=true;} continue;}
      tasks.push({id:'AUTO-'+encodeURIComponent(key).replace(/'/g,'%27'),autoCriticalKey:key,...item,priority:'CRITICAL',status:'未着手',assignee:'管理者',createdAt:date});changed=true;
    }
    for(const t of existing.values())if(!desired.has(t.autoCriticalKey)&&t.status!=='完了'){t.status='完了';t.completedAt=date;t.autoResolved=true;changed=true;}
    return changed;
  }
  root.sesSyncCriticalTasks=sync;
  root.sesRenderCriticalTasks=function(reset=false){
    const panel=document.getElementById('critical-task-panel');if(!panel)return;
    if(reset)panel.open=true;
    const tasks=(db.tasks||[]).filter(t=>t.priority==='CRITICAL'&&t.status!=='完了').sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    panel.dataset.urgent=String(tasks.length>0);
    panel.querySelector('[data-count]').textContent=tasks.length+'件';
    const list=panel.querySelector('[data-list]');list.replaceChildren();
    for(const t of tasks){const row=document.createElement('div');row.className='critical-task-row';const title=document.createElement('strong');title.textContent=t.title;const meta=document.createElement('span');meta.textContent=`期限：${t.date||'未設定'} ／ ${t.status} ／ ${t.assignee||'未割当'}`;row.append(title,meta);list.append(row);}
    if(!tasks.length)list.textContent='未完了の最重要タスクはありません。';
  };
})(typeof window==='undefined'?globalThis:window);
