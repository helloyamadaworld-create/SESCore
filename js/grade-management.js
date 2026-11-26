/* Grade master: independent from manually registered monthly actuals. */
(()=>{'use strict';
const seed=[
['G1','-（新人）',0,5000,'',255000,3120000,390000,400000,300000,330000],
['G2','-（一般）1年相当',0,10000,'',260000,3240000,421000,450000,331000,380000],
['G3','-（一般）3年相当',0,20000,'',275000,3540000,453500,500000,363500,430000],
['G4','-（一般）5年相当',0,40000,'',285000,3900000,492500,550000,402500,480000],
['G5','-（一般）7年相当',0,70000,'',300000,4440000,551000,650000,461000,580000],
['G6','-（一般）10年相当',0,100000,'',325000,5100000,622500,750000,532500,680000],
['S1','-（スペシャリスト）',0,150000,'',280000,5160000,644000,850000,554000,780000],
['S2','-（スペシャリスト）',0,200000,'',300000,6000000,720000,1000000,630000,930000],
['S3','-（スペシャリスト）',0,300000,'',325000,7500000,882500,1200000,792500,1130000],
['M1','課長代理',85000,0,'',275000,4320000,571000,700000,481000,630000],
['M2','課長代理',100000,0,'',285000,4620000,586000,725000,496500,655000],
['M3','課長代理',120000,0,'',300000,5040000,616000,750000,526000,680000],
['M4','課長',100000,0,'0～3000000',300000,5300000,590000,800000,500000,730000],
['M5','課長',100000,0,'0～4000000',300000,6300000,590000,800000,500000,730000],
['M6','課長',100000,0,'0～5000000',300000,7300000,590000,800000,500000,730000],
['M7','部長代理',150000,0,'',400000,8000000,755000,850000,665000,780000],
['M8','部長代理',150000,0,'',400000,8000000,820000,850000,730000,780000],
['M9','部長・所長',150000,0,'0～7000000',400000,8000000,755000,850000,665000,780000]
];
const fields=['grade','role','roleAllowance','skillAllowance','incentive','salary','annualIncome','tokyoCost','tokyoRate','localCost','localRate'];
const labels=['グレード','役職','役職手当（円）','技術職手当（円）','インセンティブ手当','昇給後額面（円）','年収（円）','想定原価（首都圏・円）','想定単価（首都圏・円）','想定原価（地方・円）','想定単価（地方・円）'];
const initial=seed.map(row=>Object.fromEntries(fields.map((k,i)=>[k,row[i]])));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Number(v||0);const money=v=>v===''?'—':`¥${num(v).toLocaleString('ja-JP')}`;
const fiscalYear = (date = new Date()) => date.getFullYear() - (date.getMonth() < 10 ? 1 : 0);
let selectedYear = fiscalYear();
const periodMonths = year => Array.from({length:12}, (_, index) => {
    const month = (index + 10) % 12 + 1;
    return `${year + (month < 11 ? 1 : 0)}-${String(month).padStart(2, '0')}`;
});
function gradeState() {
    if (!db.gradePeriods || typeof db.gradePeriods !== 'object' || Array.isArray(db.gradePeriods)) db.gradePeriods = {};
    if (!db.gradePeriods[2026]) {
        db.gradePeriods[2026] = {
            grades: (Array.isArray(db.gradeMaster) ? db.gradeMaster : initial).map(grade => ({...grade})),
            assignments: Object.fromEntries((db.members || []).filter(member => member.grade).map(member => [member.id, member.grade]))
        };
    }
    return db.gradePeriods;
}
const grades = (year = selectedYear) => gradeState()[year]?.grades || [];
const assignment = (member, year = selectedYear) => gradeState()[year]?.assignments[member.id] || '';
const periodLabel = year => `${year - 2011}期（${year}年11月～${year + 1}年10月）`;
function reflectGrade(member, year) {
    const cost = window.gradeCostFor(member, year);
    if (cost === null) return;
    for (const store of [db.monthlyCost, db.monthlyCostActual]) {
        for (const month of periodMonths(year)) {
            if (store === db.monthlyCostActual && window.sesMonthClosed?.(month)) continue;
            const key = `${member.id}|${month}`;
            if (Object.hasOwn(store || {}, key) && store[key] != null && store[key] !== '') store[key] = cost;
        }
    }
}
window.setGradeYear = value => { selectedYear = Number(value); renderGradeManagement(); };
window.initializeGradePeriod = () => {
    if (window.sesRestricted?.()) return;
    const state = gradeState();
    if (state[selectedYear]) return;
    const sourceYear = Object.keys(state).map(Number).filter(year => year < selectedYear).sort((a,b) => b-a)[0];
    if (!sourceYear || !confirm(`${periodLabel(sourceYear)}のグレードマスターを${periodLabel(selectedYear)}へコピーしますか？ 社員への割当は新たに指定します。`)) return;
    state[selectedYear] = {grades:state[sourceYear].grades.map(grade => ({...grade})),assignments:{}};
    save();
    renderGradeManagement();
};
function save(){if(typeof window.saveStoredData==='function')window.saveStoredData();else localStorage.setItem('ses_access_db',JSON.stringify(db));}
function setup(){const main=document.querySelector('main');if(!main||document.getElementById('view-grades'))return;
const el=document.createElement('section');el.id='view-grades';el.className='view-panel hidden space-y-5';el.innerHTML=`<div class="sf-page-heading"><h2 class="text-xl font-bold">グレード管理</h2><p class="text-sm opacity-70">会計期ごとにグレード・給与原価・想定単価を管理します。</p></div><div class="glass-card rounded-xl p-4"><h3 class="font-bold mb-3">検索条件</h3><div class="flex flex-wrap gap-3"><label>対象期 <select id="grade-year" class="ext-input" onchange="setGradeYear(this.value)"></select></label><button type="button" id="grade-period-init" class="ext-input" onclick="initializeGradePeriod()">前の登録期からマスターをコピー</button><input id="grade-search" class="ext-input flex-1" placeholder="グレード・役職で検索" oninput="renderGradeManagement()"><select id="grade-group" class="ext-input" onchange="renderGradeManagement()"><option value="">すべて</option><option value="G">Gグレード</option><option value="S">Sグレード</option><option value="M">Mグレード</option></select></div></div><div class="glass-card rounded-xl p-4"><div class="flex items-center justify-between mb-4"><h3 class="font-bold">一覧表示 <span id="grade-count"></span></h3></div><div class="overflow-x-auto"><table class="ext-table w-full"><thead><tr>${labels.map(v=>`<th>${esc(v)}</th>`).join('')}<th>操作</th></tr></thead><tbody id="grade-rows"></tbody></table></div></div><div class="glass-card rounded-xl p-4"><h3 class="font-bold mb-3">社員への紐づけ</h3><p class="text-xs opacity-70 mb-3">社員編集画面でもグレードを変更できます。選択期の割当と地方想定原価を参照します。編集時は登録済みの予定・実績原価を締め済み分も含めて更新します。</p><div class="overflow-x-auto"><table class="ext-table r11-grade-members"><thead><tr><th>社員ID</th><th>氏名</th><th>グレード</th><th>地方想定原価（円/月）</th><th>操作</th></tr></thead><tbody id="grade-members"></tbody></table></div></div>`;main.appendChild(el);
const modal=document.createElement('div');modal.id='grade-modal';modal.className='grade-modal hidden';modal.innerHTML=`<div class="grade-dialog" role="dialog" aria-modal="true" aria-labelledby="grade-modal-title"><div class="grade-dialog-head"><strong id="grade-modal-title">グレード編集</strong><button type="button" onclick="closeGradeModal()" aria-label="閉じる">×</button></div><form id="grade-form" onsubmit="saveGrade(event)"><div class="grade-dialog-body" id="grade-fields"></div><div class="grade-dialog-footer"><button type="button" class="ext-input" onclick="closeGradeModal()">キャンセル</button><button type="submit" class="grade-primary">保存</button></div></form></div>`;document.body.appendChild(modal);
}
window.openGradeManagement=()=>{setup();document.querySelectorAll('.view-panel').forEach(e=>e.classList.add('hidden'));document.getElementById('view-grades').classList.remove('hidden');document.querySelectorAll('.nav-item').forEach(e=>e.classList.remove('text-cyan-400','bg-cyan-500/10'));document.getElementById('nav-grades')?.classList.add('text-cyan-400','bg-cyan-500/10');document.getElementById('nav-grades')?.closest('.menu-accordion-group')?.querySelector('.menu-accordion-body')?.classList.remove('hidden');renderGradeManagement();document.querySelector('main')?.scrollTo(0,0);};
window.renderGradeManagement=()=>{if(!document.getElementById('grade-rows'))return;const period = document.getElementById('grade-year');
const years = [...new Set([2026, ...Object.keys(gradeState()).map(Number), ...Array.from({length:11}, (_,i) => fiscalYear()-5+i)])].sort((a,b) => b-a);
period.innerHTML=years.map(year=>`<option value="${year}">${periodLabel(year)}</option>`).join('');
period.value=String(selectedYear);
document.getElementById('grade-period-init').hidden=!!gradeState()[selectedYear];
const q=document.getElementById('grade-search').value.trim().toLowerCase(),group=document.getElementById('grade-group').value;const rows=grades().filter(g=>(!group||g.grade.startsWith(group))&&(!q||`${g.grade} ${g.role}`.toLowerCase().includes(q)));document.getElementById('grade-count').textContent=`${rows.length}件`;
document.getElementById('grade-rows').innerHTML=rows.map(g=>`<tr>${fields.map((k,i)=>`<td>${i>=2&&i!==4?money(g[k]):esc(g[k]||'—')}</td>`).join('')}<td><button type="button" class="grade-action" onclick="editGrade('${esc(g.grade)}')" aria-label="${esc(g.grade)}を編集"><i class="fa-solid fa-pen"></i></button></td></tr>`).join('');
document.getElementById('grade-members').innerHTML=window.sortMembersByPreferredOrder([...(db.members||[])]).map(m=>{const g=grades().find(x=>x.grade===assignment(m));return `<tr><td>${esc(window.getMemberDisplayId(m))}</td><td>${esc(m.name)}</td><td><select class="ext-input" onchange="assignGrade('${esc(m.id)}',this.value)"><option value="">未設定</option>${grades().map(x=>`<option value="${esc(x.grade)}" ${x.grade===assignment(m)?'selected':''}>${esc(x.grade)}</option>`).join('')}</select></td><td>${g?money(g.localCost):'—'}</td><td><button type="button" class="grade-action" ${g?'':'disabled'} onclick="applyGradeCost('${esc(m.id)}')">再同期</button></td></tr>`}).join('')||'<tr><td colspan="5">社員が登録されていません</td></tr>';};
window.fillMemberGradeSelect=value=>{const el=document.getElementById('member-grade');if(!el)return;el.innerHTML='<option value="">未設定</option>'+grades(fiscalYear()).map(g=>`<option value="${esc(g.grade)}">${esc(g.grade)}｜${esc(g.role)}</option>`).join('');el.value=value||'';window.updateMemberGradeCostPreview(false);};
window.gradeForPeriod = (member, year = fiscalYear()) => assignment(member, year);
window.gradeCostFor = (member, year = fiscalYear()) => {
    const grade = grades(year).find(row => row.grade === assignment(member, year));
    return grade && grade.localCost != null && grade.localCost !== '' ? Number(grade.localCost) / 10000 : null;
};
window.assignMemberGradeForCurrentPeriod = (member, grade) => {
    const year = fiscalYear();
    const period = gradeState()[year];
    if (!period || (grade && !grades(year).some(row => row.grade === grade))) return;
    period.assignments[member.id] = grade;
    reflectGrade(member, year);
};
window.updateMemberGradeCostPreview=(prefill=true)=>{
    const el=document.getElementById('member-cost');
    if(!el)return;
    const grade = grades(fiscalYear()).find(row => row.grade === document.getElementById('member-grade')?.value);
    el.readOnly=false;
    if(prefill && grade?.localCost != null && grade.localCost !== '') el.value=String(grade.localCost);
};
window.assignGrade=(id,grade)=>{
    const member=(db.members||[]).find(row=>row.id===id);
    const period=gradeState()[selectedYear];
    if(!member || !period || window.sesRestricted?.()) return;
    if(!confirm(`${periodLabel(selectedYear)}の割当を更新します。設定時は同じ期の登録済み予定・実績原価（締め済みを含む）に反映します。`)){renderGradeManagement();return;}
    period.assignments[id]=grade;
    reflectGrade(member, selectedYear);
    save();renderGradeManagement();window.sesActionNotice?.('update');
};
window.applyGradeCost=id=>{
    const member=(db.members||[]).find(row=>row.id===id);
    if(!member || window.gradeCostFor(member, selectedYear) === null || window.sesRestricted?.()) return;
    if(!confirm(`${periodLabel(selectedYear)}の登録済み予定・実績原価（締め済みを含む）を更新しますか？`))return;
    reflectGrade(member, selectedYear);
    save();renderGradeManagement();window.sesActionNotice?.('update');
};
window.editGrade=id=>{setup();const g=grades().find(x=>x.grade===id);if(!g)return;document.getElementById('grade-modal-title').textContent=`${id} グレード編集`;document.getElementById('grade-fields').innerHTML=fields.map((k,i)=>`<label><span>${esc(labels[i])}</span><input class="ext-input" name="${k}" value="${esc(g[k])}" ${i===0?'readonly':''} ${i>=2&&i!==4?'type="number" min="0" step="1"':''}></label>`).join('');document.getElementById('grade-modal').classList.remove('hidden');};
window.closeGradeModal=()=>document.getElementById('grade-modal')?.classList.add('hidden');
window.saveGrade=e=>{e.preventDefault();const f=new FormData(e.target),g=grades().find(x=>x.grade===f.get('grade'));if(!g || window.sesRestricted?.())return;if(!confirm(`${periodLabel(selectedYear)}の登録済み予定・実績原価（締め済みを含む）へ変更を反映しますか？`))return;const previousCost=g.localCost;fields.slice(1).forEach((k,i)=>{const value=String(f.get(k)||'');g[k]=(i+1>=2&&i+1!==4)?num(value):value});for(const m of db.members||[])if(g.localCost!==previousCost && assignment(m)===g.grade)reflectGrade(m,selectedYear);save();closeGradeModal();renderGradeManagement();window.sesActionNotice?.('update');};
// Preserve existing navigation and route grade tab through its dedicated handler.
const init=()=>{setup();const original=window.switchTab;if(typeof original==='function'&&!original.__grades){const wrapped=function(tab,...args){if(tab==='grades')return window.openGradeManagement();return original.call(this,tab,...args)};wrapped.__grades=true;window.switchTab=wrapped;}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));else setTimeout(init,0);
})();
