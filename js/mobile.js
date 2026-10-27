/* Mobile navigation behavior; desktop sidebar behavior remains unchanged. */
(function(){
  function isMobile(){ return window.matchMedia('(max-width: 760px)').matches; }
  function setup(){
    const sidebar=document.getElementById('sidebar');
    const app=document.getElementById('app-container');
    if(!sidebar||!app) return;
    let backdrop=document.getElementById('mobile-nav-backdrop');
    if(!backdrop){ backdrop=document.createElement('div'); backdrop.id='mobile-nav-backdrop'; app.appendChild(backdrop); }
    function close(){ sidebar.classList.remove('mobile-sidebar-open'); backdrop.classList.remove('active'); document.body.classList.remove('mobile-nav-open'); }
    function open(){ sidebar.classList.add('mobile-sidebar-open'); backdrop.classList.add('active'); document.body.classList.add('mobile-nav-open'); }
    backdrop.addEventListener('click',close);
    const menuButton=document.querySelector('#top-navbar button[onclick*="toggleSidebar"]');
    if(menuButton && !menuButton.dataset.mobileBound){
      menuButton.dataset.mobileBound='1';
      menuButton.addEventListener('click',function(){ if(isMobile()){ setTimeout(function(){ if(sidebar.classList.contains('mobile-sidebar-open')) close(); else open(); },0); } });
    }
    sidebar.querySelectorAll('.nav-item').forEach(function(link){ link.addEventListener('click',function(){ if(isMobile()) close(); }); });
    window.addEventListener('resize',function(){ if(!isMobile()) close(); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',setup); else setup();
})();
