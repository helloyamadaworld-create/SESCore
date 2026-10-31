/* v3.2.16: 11月〜10月の年度別目標・実績ダッシュボード */
(() => {
  const now = new Date();
  const currentEndYear = now.getFullYear() + (now.getMonth() >= 10 ? 1 : 0);
  let selectedYear = currentEndYear;
  const charts = {};
  const man = n => { const v=Number(n)||0; const a=Math.abs(v); return a>=10000 ? `¥${(Math.round(v/1000)/10).toLocaleString('ja-JP')}億円` : `¥${(Math.round(v*10)/10).toLocaleString('ja-JP')}万円`; };
  const monthsFor = y => Array.from({length:12}, (_,i) => {
    const month = (i + 10) % 12 + 1;
    return `${month >= 11 ? y-1 : y}-${String(month).padStart(2,'0')}`;
  });
  const getDb = () => typeof db !== 'undefined' ? db : null;
  const getTargets = d => (d.fiscalTargets ||= {});
  const options = () => {
    const d = getDb();
    const years = new Set([currentEndYear, selectedYear, 2026]);
    for (let y=currentEndYear-4; y<=currentEndYear+4; y++) years.add(y);
    Object.keys(d?.fiscalTargets || {}).forEach(y=>years.add(Number(y)));
    return [...years].filter(Number.isFinite).sort((a,b)=>b-a).map(y=>`<option value="${y}">${y}年（${y-2012}期）</option>`).join('');
  };
  const sumStore = (store, month) => Object.entries(store || {}).reduce((sum,[key,value]) => key.endsWith(`|${month}`) ? sum+(Number(value)||0) : sum, 0);
  function calc(d) {
    const months = monthsFor(selectedYear);
    const revActual = d.monthlyRevenueActual || {};
    const costActual = d.monthlyCostActual || {};
    const transportActual = d.monthlyTransportActual || {};
    // 確定実績のみ使用。計画値へのフォールバックは行わない。
    const revenue = revActual;
    const cost = costActual;
    const transport = transportActual;
    const rows = months.map(month => {const r=sumStore(revenue,month); return {month,revenue:r,profit:r-sumStore(cost,month)-sumStore(transport,month)};});
    const totalRevenue=rows.reduce((s,r)=>s+r.revenue,0), totalProfit=rows.reduce((s,r)=>s+r.profit,0);
    const monthNow = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const current=rows.find(r=>r.month===monthNow) || {revenue:0,profit:0};
    return {rows,totalRevenue,totalProfit,current};
  }
  function chart(id, title, target, actual, color) {
    const canvas=document.getElementById(id);
    if (!canvas || typeof Chart==='undefined') return;
    if(charts[id]) charts[id].destroy();
    charts[id]=new Chart(canvas,{type:'bar',data:{labels:[title],datasets:[{label:'年間目標',data:[target],backgroundColor:'#ffdc36',borderRadius:6},{label:'現状',data:[actual],backgroundColor:color,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#d5e6fa'}},tooltip:{callbacks:{label:ctx=>`${ctx.dataset.label}: ${man(ctx.parsed.y)}`}}},scales:{x:{ticks:{color:'#d5e6fa'}},y:{beginAtZero:true,ticks:{color:'#d5e6fa'},title:{display:true,text:'万円'}}}}});
  }
  window.setDashboardFiscalYear = value => {selectedYear=Number(value)||currentEndYear;renderFiscalDashboard();renderFiscalTargetSettings();};
  window.renderFiscalTargetSettings = () => {
    const d=getDb();if(!d)return;
    const select=document.getElementById('target-fiscal-year');if(select){select.innerHTML=options();select.value=String(selectedYear);}
    const goal=getTargets(d)[selectedYear] || {};
    const rev=document.getElementById('target-revenue-input'),profit=document.getElementById('target-profit-input');
    if(rev)rev.value=goal.revenue ?? '';if(profit)profit.value=goal.profit ?? '';updateMonthlyTargetPreview();
  };
  window.openFiscalTargetSettings = () => {
    if(typeof switchTab==='function')switchTab('fiscal-targets');
    renderFiscalTargetSettings();
  };
  function updateMonthlyTargetPreview(){
    [['target-revenue-input','monthly-revenue-target-preview'],['target-profit-input','monthly-profit-target-preview']].forEach(([inputId,previewId])=>{
      const input=document.getElementById(inputId), preview=document.getElementById(previewId);
      if(preview)preview.textContent=input && input.value.trim()!=='' && Number.isFinite(Number(input.value)) && Number(input.value)>=0 ? man(Number(input.value)/12) : '未設定';
    });
  }
  document.addEventListener('input',e=>{if(['target-revenue-input','target-profit-input'].includes(e.target?.id))updateMonthlyTargetPreview();});
  window.saveFiscalTargets = () => {
    const d=getDb();if(!d)return;
    const revenue=Number(document.getElementById('target-revenue-input').value);
    const profit=Number(document.getElementById('target-profit-input').value);
    if(!Number.isFinite(revenue)||!Number.isFinite(profit)||revenue<0||profit<0||!document.getElementById('target-revenue-input').value||!document.getElementById('target-profit-input').value){alert('目標は0以上の数値で入力してください。');return;}
    getTargets(d)[selectedYear]={revenue,profit};
    if(typeof saveStoredData==='function')saveStoredData();else localStorage.setItem('ses_access_db',JSON.stringify(d));
    const msg=document.getElementById('target-save-message');if(msg)msg.textContent=`${selectedYear}年（${selectedYear-2012}期）の目標を保存しました。`;
    renderFiscalDashboard();updateMonthlyTargetPreview();
  };
  window.renderFiscalDashboard = () => {
    const d=getDb();if(!d)return;
    const select=document.getElementById('dashboard-fiscal-year');if(select){select.innerHTML=options();select.value=String(selectedYear);}
    const range=document.getElementById('dashboard-fiscal-range');if(range)range.textContent=`${selectedYear-1}年11月〜${selectedYear}年10月`;
    const {totalRevenue,totalProfit,current}=calc(d);
    const target=getTargets(d)[selectedYear]||{};
    const kpis={'target-revenue':target.revenue==null?'未設定':man(target.revenue),'target-profit':target.profit==null?'未設定':man(target.profit),'total-revenue':man(totalRevenue),'total-profit':man(totalProfit),'profit-rate':totalRevenue?`${(totalProfit/totalRevenue*100).toFixed(1)}%`:'0%','bench':`${(d.members||[]).filter(m=>m.status==='待機中').length}名`,'month-revenue':man(current.revenue),'month-profit':man(current.profit)};
    Object.entries(kpis).forEach(([key,value])=>{const el=document.getElementById(`fy-kpi-${key}`);if(el)el.textContent=value;});
    const note=document.getElementById('fy-data-note');if(note)note.textContent='※確定実績のみを集計しています。未入力月は0として扱い、計画値では補完しません。';
    chart('fy-revenue-chart','売上',target.revenue||0,totalRevenue,'#ff35c5');
    chart('fy-profit-chart','粗利',target.profit||0,totalProfit,'#00efb7');
  };
  const originalRender=window.renderAllViews;
  window.renderAllViews=function(...args){const result=typeof originalRender==='function'?originalRender.apply(this,args):undefined;renderFiscalDashboard();return result;};
  document.addEventListener('DOMContentLoaded',()=>{renderFiscalDashboard();renderFiscalTargetSettings();});
})();
