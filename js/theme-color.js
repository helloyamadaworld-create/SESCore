/* v3.2.25 theme color preferences: persists separately from application data. */
(function(){'use strict';
 const KEY='ses_core_theme_accent_v1', DEFAULT='#00eaff';
 const valid=c=>typeof c==='string'&&/^#[0-9a-fA-F]{6}$/.test(c);
 function rgba(hex,alpha){const n=parseInt(hex.slice(1),16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${alpha})`;}
 function get(){try{const c=localStorage.getItem(KEY);return valid(c)?c.toLowerCase():DEFAULT;}catch(e){return DEFAULT;}}
 function apply(color){if(!valid(color))return;const r=document.documentElement;r.style.setProperty('--theme-accent',color);r.style.setProperty('--theme-accent-glow',rgba(color,.55));r.style.setProperty('--theme-accent-soft',rgba(color,.16));r.style.setProperty('--theme-accent-faint',rgba(color,.07));
 const input=document.getElementById('theme-custom-color');if(input)input.value=color;
 const code=document.getElementById('theme-color-code');if(code)code.textContent=color.toUpperCase();
 document.querySelectorAll('[data-theme-preset]').forEach(b=>{const selected=b.dataset.themePreset.toLowerCase()===color;b.classList.toggle('is-selected',selected);b.setAttribute('aria-pressed',String(selected));});
 window.dispatchEvent(new CustomEvent('ses-theme-color-changed',{detail:{color}}));}
 function save(color){if(!valid(color))return;try{localStorage.setItem(KEY,color.toLowerCase());}catch(e){}apply(color);const status=document.getElementById('theme-color-status');if(status)status.textContent='保存しました';}
 window.getSesThemeAccent=get;
 function init(){apply(get());document.querySelectorAll('[data-theme-preset]').forEach(b=>b.addEventListener('click',()=>save(b.dataset.themePreset)));
 const input=document.getElementById('theme-custom-color');if(input)input.addEventListener('input',()=>save(input.value));
 const reset=document.getElementById('theme-color-reset');if(reset)reset.addEventListener('click',()=>save(DEFAULT));}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
