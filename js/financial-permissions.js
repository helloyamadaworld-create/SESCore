(function(){
  const blocked=['operations','operations-contracts','operations-projects','operations-close','operations-meeting','member-rates','grades','revenue','spot','expenses','merchandise','audit','fiscal-targets','accounts'];
  window.sesBlockedTabs=blocked;
  const restricted=()=>window.sesRestricted?.();
  const guard=(name)=>{const original=window[name];if(typeof original==='function')window[name]=function(...args){if(restricted()){args[0]?.preventDefault?.();return;}return original.apply(this,args);};};
  function init(){
    const original=window.switchTab;
    window.switchTab=function(tab,...args){if(restricted()&&blocked.includes(tab))return;return original.call(this,tab,...args);};
    ['openClientModal','editClient','saveClient','deleteClient','openProjectModal','editProject','saveProject','deleteProject','openMemberModal','editMember','saveMember','deleteMember','openInterviewModal','saveInterview','deleteInterview','saveFiscalTargets','saveMonthlyFinance','saveMonthlyRevenue','removeProjectParticipant','addProjectParticipant','editProjectParticipant','addMerchExpense','deleteMerchExpense','deleteMerchProduct','deleteMerchSale','clearAuditLog','openGradeManagement','editGrade','saveGrade','assignGrade','applyGradeCost','copyPlannedFinanceToActual','addSpotJob','deleteSpotJob','addExpense','deleteExpense','addMerchProduct','addMerchSale','exportCSV','importCSVFile','exportDataJSON','openImportModal','processJSONImport','confirmResetData'].forEach(guard);
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,150));
})();
/* Standard users: keep read-only navigation and filters, block mutations. */
(function(){
 const allowed=new Set(['view-oneonones','view-meetings','view-tasks','view-chat','view-mypage']);
 const restricted=()=>window.sesRestricted?.();
 const actions=/^(?:open(?:Client|Project|Member|Interview)Modal|(?:edit|delete|save|add|remove)(?:Client|Project|Member|Interview|Fiscal|Monthly|Spot|Expense|Merch|Grade)|clearAuditLog|confirmResetData)/;
 const cm=/^(new|edit|save|delete|csv)/i;
 function blocked(el){if(!el)return false;const view=el.closest('.view-panel');if(view&&allowed.has(view.id))return false;return actions.test((el.getAttribute('onclick')||el.getAttribute('onsubmit')||'').trim())||cm.test(el.dataset.cm||'')||['member-detail-edit','member-detail-delete'].includes(el.id)||el.matches('#cm-master-methods');}
 function scan(){if(!restricted())return;document.querySelectorAll('button,a,input[type=submit],[data-cm],#cm-master-methods').forEach(el=>{if(blocked(el)&&!el.classList.contains('ses-readonly-action'))el.classList.add('ses-readonly-action');});}
 document.addEventListener('click',e=>{if(restricted()&&blocked(e.target.closest('button,a,[data-cm],input[type=submit]'))){e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('submit',e=>{if(!restricted())return;const form=e.target,view=form.closest('.view-panel');if(form.id==='login-form'||view&&allowed.has(view.id)||form.closest('#oo-overlay,#rm-overlay')||form.id==='support-detail-form'&&['oneonones','meetings'].includes(form.closest('#member-support-detail-modal')?.dataset.type))return;e.preventDefault();e.stopImmediatePropagation();},true);
 document.addEventListener('DOMContentLoaded',()=>{new MutationObserver(scan).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});scan();});
})();

window.sesCanModify = record => !!record && !!window.sesCurrentAccount && (window.sesCurrentAccount.role === "admin" || (!!record.createdBy && record.createdBy === window.sesCurrentAccount.username));
