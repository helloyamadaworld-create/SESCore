/* Read-only mirror of the customer meeting feedback analytics UI. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
function render(){const root=$('sf-analytics-root'),api=window.SESCustomerFeedbackAnalytics;if(root&&api)root.innerHTML=api.html();}
function init(){const view=$('view-feedback');if(!view)return;
if(!view.dataset.sfAnalytics){view.dataset.sfAnalytics='1';view.innerHTML=`<div class="sf-page-heading"><h2>お客様からのフィードバック管理</h2><p>顧客打ち合わせ管理のメンバーフィードバックを参照します。登録・編集・削除は顧客打ち合わせ管理から行ってください。</p></div><div id="sf-analytics-root" class="cm-root"></div>`;}
/* The shared details dialog must not be trapped inside the hidden meetings tab. */
const modal=$('cm-modal');if(modal&&modal.parentElement!==document.body)document.body.appendChild(modal);
render();}
/* Original customer-meeting listeners run first, then redraw this read-only projection. */
document.addEventListener('click',e=>{if(e.target.closest('#view-feedback [data-cm]'))render();});
document.addEventListener('change',e=>{if(e.target.closest('#view-feedback [data-fb-filter]'))render();});
document.addEventListener('input',e=>{if(e.target.closest('#view-feedback [data-fb-keyword]'))return;});
const previous=window.switchTab;window.switchTab=function(tab){if(typeof previous==='function')previous.apply(this,arguments);if(tab==='feedback')init();};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
