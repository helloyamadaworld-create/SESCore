/* R23: visual classification only; no business event handlers changed. */
(()=>{
 const selector='button,[role="button"],input[type="button"],input[type="submit"],input[type="reset"],a.ext-button,.nav-item,.menu-accordion-toggle';
 function classify(el){
  const t=[el.textContent,el.value,el.getAttribute('title'),el.getAttribute('aria-label')].filter(Boolean).join(' ').trim();
  const action=[el.getAttribute('onclick'),el.getAttribute('data-action'),el.getAttribute('data-rm'),el.getAttribute('data-oo'),el.getAttribute('data-cm'),el.getAttribute('data-sf'),el.id,el.className?.baseVal||el.className].filter(Boolean).join(' ');
  let k='normal';
  if(/キャンセル|閉じる|一覧へ|戻る|取消|全解除|^[×✕✖]$/.test(t)||/closeModal|closeDialog|cancel/i.test(action))k='cancel';
  else if(/削除|除外|delete/i.test(t)||/delete|remove/i.test(action))k='danger';
  else if(/キャンセル|閉じる|一覧へ|戻る|取消|全解除/.test(t))k='cancel';
  else if(/ダウンロード|出力|エクスポート|export/i.test(t)||/download|export/i.test(action))k='export';
  else if(/新規|追加/.test(t))k='normal';
  else if(/保存|登録|確定|更新|ログイン/.test(t)||el.getAttribute('type')==='submit'||el.matches('.rm-primary,.oo-primary,.cm-primary,.sf-primary'))k='save';
  else if(/編集|修正|変更/.test(t)||/edit/i.test(action))k='edit';
  else if(/検索|絞り込み|フィルタ/.test(t)||/search|filter/i.test(action))k='search';
  else if(/詳細|閲覧|参照/.test(t)||/detail|view/i.test(action)||el.matches('.ses-client-detail-button'))k='detail';
  if(el.dataset.r23Tone!==k)el.dataset.r23Tone=k;
 }
 function scan(){document.querySelectorAll(selector).forEach(classify);}
 let pending=false;
 function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;scan();});}
 function start(){scan();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','value','onclick','data-action','data-rm','data-oo','data-cm','data-sf','class']});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
