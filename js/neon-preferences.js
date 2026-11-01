(function(){'use strict';
const KEY='ses_core_neon_preferences_v1';
function read(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
function apply(){const pref=read(), intensity=Math.max(0,Math.min(200,Number(pref.intensity??100))), speed=Math.max(0,Math.min(300,Number(pref.speed??100)));
 document.documentElement.style.setProperty('--neon-intensity',String(intensity/100));
 document.documentElement.style.setProperty('--neon-motion-factor',speed===0?'0':String(100/speed));
 document.documentElement.classList.toggle('neon-motion-off',speed===0);
 const a=document.getElementById('neon-intensity'),b=document.getElementById('neon-speed');if(a)a.value=intensity;if(b)b.value=speed;
 const av=document.getElementById('neon-intensity-value'),bv=document.getElementById('neon-speed-value');if(av)av.textContent=intensity+'%';if(bv)bv.textContent=speed===0?'停止':(speed/100).toFixed(2)+'倍';}
 window.setNeonPreferences=function(){const a=document.getElementById('neon-intensity'),b=document.getElementById('neon-speed');if(!a||!b)return;try{localStorage.setItem(KEY,JSON.stringify({intensity:Number(a.value),speed:Number(b.value)}))}catch(e){}apply()};
 document.addEventListener('DOMContentLoaded',apply);apply();
})();
