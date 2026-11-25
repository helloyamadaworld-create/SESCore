/* Format yen fields without changing the numeric values consumed by existing handlers. */
(() => {
  'use strict';
  const ids = ['target-revenue-input','target-profit-input','project-price','participant-rate-yen','member-rate','member-cost','member-transport-cost','spot-amount','expense-amount','merch-product-price','merch-product-cost','merch-sale-price','merch-sale-cost','merch-exp-amount'];
  const selector = ids.map(id => `input#${id}`).concat(['input[data-kind="revenue"]','input[data-kind="cost"]','input[data-kind="transport"]','#grade-fields input[type="number"]','#mr-form input[type="number"]']).join(',');
  const native = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
  const bound = new WeakSet();
  const digits = v => String(v ?? '').normalize('NFKC').replace(/[^0-9]/g,'');
  const format = v => v.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  function bind(el) {
    if (bound.has(el) || el.type !== 'number') return;
    const initial = native.get.call(el);
    el.type = 'text'; el.inputMode = 'numeric'; el.pattern = '[0-9,]*';
    el.dataset.yenInput = 'true'; bound.add(el);
    Object.defineProperty(el,'value',{configurable:true,get(){return digits(native.get.call(this));},set(v){const s=String(v ?? '').replace(/,/g,'');native.set.call(this, s.trim()===''?'':format(String(Math.max(0,Math.round(Number(s)||0)))));}});
    el.value = initial;
    el.addEventListener('input', () => {
      const shown = native.get.call(el), pos = el.selectionStart ?? shown.length;
      const count = digits(shown.slice(0,pos)).length;
      const next = format(digits(shown));
      if (shown !== next) {
        native.set.call(el,next);
        let cursor=0, seen=0;
        while(cursor<next.length && seen<count){if(next[cursor]!==',')seen++;cursor++;}
        el.setSelectionRange(cursor,cursor);
      }
    }, true);
  }
  function scan(){document.querySelectorAll(selector).forEach(bind);}
  document.addEventListener('formdata',e=>{for(const el of e.target.querySelectorAll('input[data-yen-input][name]'))if(!el.disabled)e.formData.set(el.name,el.value);},true);
  document.addEventListener('reset',e=>queueMicrotask(()=>{for(const el of e.target.querySelectorAll('input[data-yen-input]'))el.value=el.value;}),true);
  new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
  scan();
})();
