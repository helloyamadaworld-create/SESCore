/* Fiscal target settings: dashboard modal, while preserving the existing sidebar settings page. */
(function(){
  let originalParent=null, originalNext=null, panel=null, overlay=null;
  function close(){
    if(!overlay || overlay.classList.contains('hidden'))return;
    if(panel && originalParent){originalParent.insertBefore(panel,originalNext);}
    overlay.classList.add('hidden');document.body.classList.remove('ses-fiscal-dialog-open');
  }
  function open(){
    const view=document.getElementById('view-fiscal-targets');
    if(!view)return;
    panel=view.querySelector('.glass-card');if(!panel)return;
    originalParent=panel.parentNode;originalNext=panel.nextSibling;
    if(!overlay){
      overlay=document.createElement('div');overlay.id='ses-fiscal-target-overlay';overlay.className='ses-fiscal-target-overlay hidden';
      overlay.innerHTML='<div class="ses-fiscal-target-dialog" role="dialog" aria-modal="true" aria-labelledby="ses-fiscal-target-title"><header class="ses-fiscal-target-header"><h2 id="ses-fiscal-target-title">売上・粗利目標設定</h2><button type="button" class="ses-fiscal-target-close" aria-label="閉じる">×</button></header><div class="ses-fiscal-target-body"></div><footer class="ses-fiscal-target-footer"><button type="button" class="ses-fiscal-target-cancel">閉じる</button></footer></div>';
      document.body.appendChild(overlay);
      overlay.querySelector('.ses-fiscal-target-close').addEventListener('click',close);
      overlay.querySelector('.ses-fiscal-target-cancel').addEventListener('click',close);
      overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.classList.contains('hidden'))close();});
    }
    overlay.querySelector('.ses-fiscal-target-body').appendChild(panel);
    overlay.classList.remove('hidden');document.body.classList.add('ses-fiscal-dialog-open');
    if(typeof window.renderFiscalTargetSettings==='function')window.renderFiscalTargetSettings();
  }
  // Load after fiscal-dashboard.js, replacing only the dashboard button action.
  window.openFiscalTargetSettings=open;
})();
