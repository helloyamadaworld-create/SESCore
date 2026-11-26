/* v3.2.16: 11月〜10月の年度別目標・実績ダッシュボード */
(() => {
  const now = new Date();
  const currentEndYear = now.getFullYear() - (now.getMonth() < 10 ? 1 : 0);
  let selectedYear = currentEndYear;
  const charts = {};
  let trendYear = currentEndYear;
  let trendMetric = 'both';
  let trendMode = 'actual';
  let trendType = 'bar';
  let trendScope = 'all';
  let trendDepartment = '';
  let trendMember = '';
  const man = n => '¥'+Math.round((Number(n)||0)*10000).toLocaleString('ja-JP');
  const monthsFor = y => Array.from({length:12}, (_,i) => {
    const month = (i + 10) % 12 + 1;
    return `${month >= 11 ? y : y+1}-${String(month).padStart(2,'0')}`;
  });
  const getDb = () => typeof db !== 'undefined' ? db : null;
  const getTargets = d => (d.fiscalTargets ||= {});
  const options = () => {
    const d = getDb();
    const years = new Set([currentEndYear, selectedYear, 2026]);
    for (let y=currentEndYear-4; y<=currentEndYear+4; y++) years.add(y);
    Object.keys(d?.fiscalTargets || {}).forEach(y=>years.add(Number(y)));
    return [...years].filter(Number.isFinite).sort((a,b)=>b-a).map(y=>`<option value="${y}">${y}年（${y-2011}期）</option>`).join('');
  };
  const sumStore = (store, month) => Object.entries(store || {}).reduce((sum,[key,value]) => key.endsWith(`|${month}`) ? sum+(Number(value)||0) : sum, 0);
  // 登録経費・スポット・物販は予定／実績共通。金額は万円に統一。
  function monthlyExtras(d, month, match=()=>true, all=true){
    const inMonth=x=>String(x.date||'').slice(0,7)===month;
    const sum=(list,fn,filter=match)=>(list||[]).filter(x=>inMonth(x)&&filter(x.memberId)).reduce((a,x)=>a+fn(x),0);
    const n=x=>Number(x)||0;
    const revenue=sum(d.spotJobs,x=>Math.round(n(x.amount)*10000))+sum(d.merchandiseSales,x=>Math.round(n(x.quantity)*n(x.unitPrice)));
    const cost=sum(d.merchandiseSales,x=>Math.round(n(x.quantity)*n(x.unitCost)));
    const expense=sum(d.expenses,x=>Math.round(n(x.amount)*10000))+(all?sum(d.merchandiseExpenses,x=>n(x.amount),()=>true):0);
    return {revenue:revenue/10000,profit:(revenue-cost-expense)/10000};
  }
  function calc(d) {
    const months = monthsFor(selectedYear);
    const revActual = d.monthlyRevenueActual || {};
    const costActual = d.monthlyCostActual || {};
    const transportActual = d.monthlyTransportActual || {};
    // 確定実績のみ使用。計画値へのフォールバックは行わない。
    const revenue = revActual;
    const cost = costActual;
    const transport = transportActual;
    const rows = months.map(month => {const r=sumStore(revenue,month), extra=monthlyExtras(d,month); return {month,revenue:r+extra.revenue,profit:r-sumStore(cost,month)-sumStore(transport,month)+extra.profit};});
    const totalRevenue=rows.reduce((s,r)=>s+r.revenue,0), totalProfit=rows.reduce((s,r)=>s+r.profit,0);
    const monthNow = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const current=rows.find(r=>r.month===monthNow) || {revenue:0,profit:0};
    return {rows,totalRevenue,totalProfit,current};
  }
  // Strong neon bar gradients, luminous borders, glow and neon grid lines.
  const glowPlugin={id:'sesNeonGlow',beforeDatasetsDraw(chart){const ctx=chart.ctx;ctx.save();ctx.shadowBlur=20;ctx.shadowColor='rgba(255,50,212,.65)';},afterDatasetsDraw(chart){chart.ctx.restore();}};
  function chart(id,title,target,actual,color){
    const canvas=document.getElementById(id);
    if(!canvas||typeof Chart==='undefined')return;
    if(charts[id])charts[id].destroy();
    const accent=typeof window.getSesThemeAccent==='function'?window.getSesThemeAccent():'#00eaff';
    const ctx=canvas.getContext('2d');
    function gradient(top,bottom){const g=ctx.createLinearGradient(0,0,0,280);g.addColorStop(0,top);g.addColorStop(.52,bottom);g.addColorStop(1,'rgba(8,12,35,.8)');return g;}
    const neon=document.body.classList.contains('theme-neon');
    const targetGradient=neon?gradient('#ff5b78','#ac0c40'):gradient('#e69ba3','#bd5361');
    const actualGradient=neon?gradient('#34ff9d','#087a50'):gradient('#57c6a2','#20866a');
    charts[id]=new Chart(canvas,{type:'bar',data:{labels:[title],datasets:[
      {label:'年間目標',data:[target],backgroundColor:targetGradient,borderColor:neon?'#ff365d':'#bf4050',borderWidth:2,borderRadius:9,maxBarThickness:110},
      {label:'確定実績',data:[actual],backgroundColor:actualGradient,borderColor:neon?'#34ff9d':'#20866a',borderWidth:2,borderRadius:9,maxBarThickness:110}
    ]},plugins:neon?[glowPlugin]:[],options:{responsive:true,maintainAspectRatio:false,animation:{duration:850,easing:'easeOutQuart'},plugins:{legend:{labels:{color:neon?'#e8f7ff':'#334155',font:{weight:'bold'},usePointStyle:true}},tooltip:{backgroundColor:'rgba(5,10,32,.95)',borderColor:accent,borderWidth:1,titleColor:accent,bodyColor:'#fff',callbacks:{label:c=>`${c.dataset.label}: ${man(c.parsed.y)}`}}},scales:{x:{ticks:{color:neon?'#e5faff':'#334155',font:{weight:'bold'}},grid:{display:false},border:{color:accent}},y:{beginAtZero:true,ticks:{color:neon?'#b9e9ff':'#334155'},grid:{color:neon?'rgba(0,234,255,.15)':'rgba(100,116,139,.17)',lineWidth:1},border:{color:'rgba(0,234,255,.4)'},title:{display:true,text:'万円',color:accent}}}}});
  }
  window.setFiscalTrendYear=value=>{trendYear=Number(value)||currentEndYear;renderFiscalTrend();};
  window.setFiscalTrendMetric=value=>{trendMetric=['both','revenue','profit'].includes(value)?value:'both';renderFiscalTrend();};
  window.setFiscalTrendMode=value=>{trendMode=['actual','plan','compare'].includes(value)?value:'actual';renderFiscalTrend();};
  window.setFiscalTrendType=value=>{trendType=['bar','line','cumulative'].includes(value)?value:'bar';renderFiscalTrend();};
  window.setFiscalTrendScope=value=>{trendScope=window.sesRestricted?.()&&value==='member'?'all':['all','department','member'].includes(value)?value:'all';trendDepartment='';trendMember='';renderFiscalTrend();};
  window.setFiscalTrendDepartment=value=>{trendDepartment=value;trendMember='';renderFiscalTrend();};
  window.setFiscalTrendMember=value=>{trendMember=value;renderFiscalTrend();};
  function renderFiscalTrend(){
    if(window.sesRestricted?.()&&trendScope==='member'){trendScope='all';trendMember='';}
    const d=getDb(),canvas=document.getElementById('fy-trend-chart');if(!d||!canvas||typeof Chart==='undefined')return;
    const select=document.getElementById('fy-trend-year');if(select){select.innerHTML=options();select.value=String(trendYear);}
    [['fy-trend-metric',trendMetric],['fy-trend-mode',trendMode],['fy-trend-type',trendType]].forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.value=value;});
    const neon=document.body.classList.contains('theme-neon'),text=neon?'#e8f7ff':'#334155';
    const members=d.members||[];
    const departments=[...new Set(members.map(m=>String(m.department||'未登録')))].sort((a,b)=>a.localeCompare(b,'ja'));
    const escapeOption=v=>String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const scopeSelect=document.getElementById('fy-trend-scope');if(scopeSelect)scopeSelect.value=trendScope;
    const deptSelect=document.getElementById('fy-trend-department');
    if(deptSelect){deptSelect.innerHTML='<option value="">すべての部門</option>'+departments.map(v=>`<option value="${escapeOption(v)}">${escapeOption(v)}</option>`).join('');deptSelect.value=trendDepartment;deptSelect.disabled=trendScope==='all';}
    const memberSelect=document.getElementById('fy-trend-member');
    const availableMembers=members.filter(m=>!trendDepartment||String(m.department||'未登録')===trendDepartment);
    if(memberSelect){memberSelect.innerHTML='<option value="">すべての社員</option>'+availableMembers.map(m=>`<option value="${escapeOption(m.id)}">${escapeOption(m.name||m.id)}</option>`).join('');memberSelect.value=trendMember;memberSelect.disabled=trendScope!=='member';}
    const selectedIds=new Set(members.filter(m=>(trendScope==='all'||!trendDepartment||String(m.department||'未登録')===trendDepartment)&&(trendScope!=='member'||!trendMember||String(m.id)===trendMember)).map(m=>String(m.id)));
    const scopedSum=(store,month)=>Object.entries(store||{}).reduce((total,[key,value])=>{
      if(!key.endsWith(`|${month}`))return total;
      if(trendScope==='all')return total+(Number(value)||0);
      const memberId=key.slice(0,key.length-month.length-1);
      return total+(selectedIds.has(memberId)?Number(value)||0:0);
    },0);
    const months=monthsFor(trendYear);
    const stores={actual:[d.monthlyRevenueActual||{},d.monthlyCostActual||{},d.monthlyTransportActual||{}],plan:[d.monthlyRevenue||{},d.monthlyCost||{},d.monthlyTransport||{}]};
    const rows=mode=>months.map(month=>{const extra=monthlyExtras(d,month,id=>trendScope==='all'||selectedIds.has(String(id)),trendScope==='all');const [revenues,costs,transports]=stores[mode];if(mode==='actual'){const revenue=scopedSum(revenues,month);return {revenue:revenue+extra.revenue,profit:revenue-scopedSum(costs,month)-scopedSum(transports,month)+extra.profit};}let revenue=0,profit=0;for(const m of d.members||[]){if(trendScope!=='all'&&!selectedIds.has(m.id))continue;const key=m.id+'|'+month;const active=m.status==='稼働中'&&(!(m.contractStart||m.startDate)||(m.contractStart||m.startDate).slice(0,7)<=month)&&(!m.contractEnd||m.contractEnd.slice(0,7)>=month);const val=(store,field)=>Number(store[key]??((active||field==='transportCost')?m[field]:0))||0;const r=window.memberRatePlan?.(m,month)??val(revenues,'rate'),g=window.gradeCostFor?.(m,trendYear),c=Number(costs[key]??(active?(g??m.cost):0))||0;revenue+=r;profit+=r-c-val(transports,'transportCost');}return {revenue:Math.round((revenue+extra.revenue)*10000)/10000,profit:Math.round((profit+extra.profit)*10000)/10000};});
    const datasets=[];
    const types=trendMetric==='both'?['revenue','profit']:[trendMetric];
    const modes=trendMode==='compare'?['plan','actual']:[trendMode];
    const isLine=trendType!=='bar';
    const colors=neon?{plan:'#2de59a',actual:'#12ff72'}:{plan:'#82bfa2',actual:'#17875c'};
    for(const mode of modes){
      const data=rows(mode);
      for(const metric of types){
        const label=`${metric==='revenue'?'売上':'粗利'}（${mode==='plan'?'予定':'実績'}）`;
        let values=data.map(r=>r[metric]);
        if(trendType==='cumulative'){let running=0;values=values.map(v=>(running+=v));}
        const base=colors[mode];
        const alpha=metric==='revenue'?(neon?'.72':'.72'):(neon?'.40':'.42');
        const fill=metric==='revenue'?base:(neon?'#80ffc1':'#a5d6bd');
        datasets.push({label,data:values,type:isLine?'line':'bar',borderColor:base,backgroundColor:isLine?base:fill,
          borderWidth:isLine?3:1,borderDash:mode==='plan'&&isLine?[6,4]:[],tension:.28,pointRadius:isLine?3:0,
          borderRadius:5,maxBarThickness:28,fill:false});
      }
    }
    if(charts.trend)charts.trend.destroy();
    charts.trend=new Chart(canvas,{type:isLine?'line':'bar',data:{labels:months.map(m=>`${Number(m.slice(5))}月`),datasets},plugins:neon?[glowPlugin]:[],options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{labels:{color:text,usePointStyle:true}},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${man(c.parsed.y)}`}}},scales:{x:{ticks:{color:text},grid:{display:false}},y:{ticks:{color:text},grid:{color:neon?'rgba(0,234,255,.15)':'rgba(100,116,139,.17)'},title:{display:true,text:'万円',color:text}}}}});
  }
  window.addEventListener('ses-theme-color-changed',()=>{if(typeof db!=='undefined')renderFiscalDashboard();});
  window.setDashboardFiscalYear = value => {selectedYear=Number(value)||currentEndYear;renderFiscalDashboard();renderFiscalTargetSettings();};
  window.renderFiscalTargetSettings = () => {
    const d=getDb();if(!d)return;
    const select=document.getElementById('target-fiscal-year');if(select){select.innerHTML=options();select.value=String(selectedYear);}
    const goal=getTargets(d)[selectedYear] || {};
    const rev=document.getElementById('target-revenue-input'),profit=document.getElementById('target-profit-input');
    if(rev)rev.value=goal.revenue==null?'':Math.round(goal.revenue*10000);if(profit)profit.value=goal.profit==null?'':Math.round(goal.profit*10000);updateMonthlyTargetPreview();
  };
  window.openFiscalTargetSettings = () => {
    if(typeof switchTab==='function')switchTab('fiscal-targets');
    renderFiscalTargetSettings();
  };
  function updateMonthlyTargetPreview(){
    [['target-revenue-input','monthly-revenue-target-preview'],['target-profit-input','monthly-profit-target-preview']].forEach(([inputId,previewId])=>{
      const input=document.getElementById(inputId), preview=document.getElementById(previewId);
      if(preview)preview.textContent=input && input.value.trim()!=='' && Number.isFinite(Number(input.value)) && Number(input.value)>=0 ? man(Number(input.value)/120000) : '未設定';
    });
  }
  document.addEventListener('input',e=>{if(['target-revenue-input','target-profit-input'].includes(e.target?.id))updateMonthlyTargetPreview();});
  window.saveFiscalTargets = () => {
    const d=getDb();if(!d)return;
    const revenue=Number(document.getElementById('target-revenue-input').value);
    const profit=Number(document.getElementById('target-profit-input').value);
    if(!Number.isFinite(revenue)||!Number.isFinite(profit)||revenue<0||profit<0||!document.getElementById('target-revenue-input').value||!document.getElementById('target-profit-input').value){alert('目標は0以上の数値で入力してください。');return;}
    getTargets(d)[selectedYear]={revenue:Math.round((revenue+extra.revenue)*10000)/10000,profit:Math.round((profit+extra.profit)*10000)/10000};
    if(typeof saveStoredData==='function')saveStoredData();else localStorage.setItem('ses_access_db',JSON.stringify(d));
    const msg=document.getElementById('target-save-message');if(msg)msg.textContent=`${selectedYear}年（${selectedYear-2011}期）の目標を保存しました。`;
    renderFiscalDashboard();updateMonthlyTargetPreview();
  };
  window.renderFiscalDashboard = () => {
    const d=getDb();if(!d)return;
    const select=document.getElementById('dashboard-fiscal-year');if(select){select.innerHTML=options();select.value=String(selectedYear);}
    const range=document.getElementById('dashboard-fiscal-range');if(range)range.textContent=`${selectedYear}年11月〜${selectedYear+1}年10月`;
    const {totalRevenue,totalProfit,current}=calc(d);
    const target=getTargets(d)[selectedYear]||{};
    const kpis={'target-revenue':target.revenue==null?'未設定':man(target.revenue),'target-profit':target.profit==null?'未設定':man(target.profit),'total-revenue':man(totalRevenue),'total-profit':man(totalProfit),'profit-rate':totalRevenue?`${(totalProfit/totalRevenue*100).toFixed(1)}%`:'0%','active':`${(d.members||[]).filter(m=>(m.currentStatus||m.status)==='稼働中').length}名`,'bench':`${(d.members||[]).filter(m=>['待機中','待机中'].includes(m.currentStatus||m.status)).length}名`,'month-revenue':man(current.revenue),'month-profit':man(current.profit)};
    Object.entries(kpis).forEach(([key,value])=>{const el=document.getElementById(`fy-kpi-${key}`);if(el)el.textContent=value;});
    const note=document.getElementById('fy-data-note');if(note)note.textContent='※社員の確定実績と登録済みスポット・物販・経費を集計しています。社員の未入力月は0とし、予定値では補完しません。';
    chart('fy-revenue-chart','売上',target.revenue||0,totalRevenue,'#ff35c5');
    chart('fy-profit-chart','粗利',target.profit||0,totalProfit,'#00efb7');
    renderFiscalTrend();
  };
  const originalRender=window.renderAllViews;
  window.renderAllViews=function(...args){const result=typeof originalRender==='function'?originalRender.apply(this,args):undefined;renderFiscalDashboard();return result;};
  document.addEventListener('DOMContentLoaded',()=>{renderFiscalDashboard();renderFiscalTargetSettings();});
})();
