/* v3.2.70 - Keep modal layers in viewport, not inside scrollable/transform page panels. */
(()=>{'use strict';
const selector='[id^="modal-"].fixed.inset-0,.app-dialog-overlay,.cm-overlay,.sf-overlay,.oo-overlay,.rm-overlay,.ses-assignment-modal,.support-detail-modal';
function portal(){document.querySelectorAll(selector).forEach(el=>{if(el.parentElement!==document.body){document.body.appendChild(el);}el.classList.add('ses-viewport-overlay');});}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;portal();});}
function start(){portal();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
