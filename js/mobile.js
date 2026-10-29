/* Mobile-only navigation and utility sheet. Desktop DOM and behavior remain unchanged. */
(function(){
  const mobileQuery='(max-width: 760px)';
  const isMobile=()=>window.matchMedia(mobileQuery).matches;
  function prepareMobileTables(){
    if(!isMobile()) return;
    document.querySelectorAll('main table').forEach(table=>{
      if(table.closest('.mobile-table-scroll')) return;
      const parent=table.parentElement;
      const parentClass=parent ? String(parent.className||'') : '';
      if(parent && /overflow-x-auto|overflow-auto|revenue-table-wrap|support-desktop-table/.test(parentClass)) return;
      const wrapper=document.createElement('div');
      wrapper.className='mobile-table-scroll';
      wrapper.setAttribute('role','region');
      wrapper.setAttribute('aria-label','横にスクロールできる一覧');
      table.parentNode.insertBefore(wrapper,table);
      wrapper.appendChild(table);
    });
  }

  function setup(){
    const sidebar=document.getElementById('sidebar');
    const app=document.getElementById('app-container');
    const navbar=document.getElementById('top-navbar');
    if(!sidebar||!app||!navbar) return;

    let backdrop=document.getElementById('mobile-nav-backdrop');
    if(!backdrop){ backdrop=document.createElement('div'); backdrop.id='mobile-nav-backdrop'; app.appendChild(backdrop); }
    const closeNav=()=>{ sidebar.classList.remove('mobile-sidebar-open'); backdrop.classList.remove('active'); document.body.classList.remove('mobile-nav-open'); };
    const openNav=()=>{ sidebar.classList.add('mobile-sidebar-open'); backdrop.classList.add('active'); document.body.classList.add('mobile-nav-open'); };
    backdrop.addEventListener('click',closeNav);
    const menuButton=navbar.querySelector('button[onclick*="toggleSidebar"]');
    if(menuButton && !menuButton.dataset.mobileBound){
      menuButton.dataset.mobileBound='1';
      menuButton.addEventListener('click',function(e){ if(!isMobile()) return; e.preventDefault(); e.stopImmediatePropagation(); sidebar.classList.contains('mobile-sidebar-open')?closeNav():openNav(); }, true);
    }
    sidebar.querySelectorAll('.nav-item').forEach(link=>link.addEventListener('click',()=>{
      if(isMobile()) { closeNav(); setTimeout(prepareMobileTables, 80); }
    }));
    prepareMobileTables();
    if(!document.documentElement.dataset.mobileTableObserver){
      document.documentElement.dataset.mobileTableObserver='1';
      const observer=new MutationObserver(()=>prepareMobileTables());
      observer.observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
    }
    window.addEventListener('resize',()=>{if(!isMobile()) closeNav(); else prepareMobileTables();});

    // Build a dedicated mobile utility sheet from existing actions; original controls stay in place for desktop.
    const toolsContainer=navbar.querySelector(':scope > div:last-child');
    if(!toolsContainer || document.getElementById('mobile-tools-dialog')) return;
    const utilityButtons=Array.from(toolsContainer.querySelectorAll('button')).filter(button=>
      /logoutSES|confirmResetData|openImportModal|exportDataJSON/.test(button.getAttribute('onclick')||'')
    );
    const logout=utilityButtons.find(button=>(button.getAttribute('onclick')||'').includes('logoutSES'));
    if(logout) logout.classList.add('mobile-logout-trigger');
    const trigger=document.createElement('button');
    trigger.type='button'; trigger.className='mobile-tools-trigger'; trigger.setAttribute('aria-label','設定・データ操作');
    trigger.innerHTML='<i class="fa-solid fa-sliders"></i><span>設定</span>';
    toolsContainer.insertBefore(trigger,toolsContainer.firstChild);

    const dialog=document.createElement('div'); dialog.id='mobile-tools-dialog'; dialog.className='mobile-tools-dialog'; dialog.setAttribute('role','dialog'); dialog.setAttribute('aria-modal','true'); dialog.setAttribute('aria-label','設定・データ操作');
    const sheet=document.createElement('div'); sheet.className='mobile-tools-sheet';
    const heading=document.createElement('div'); heading.className='mobile-tools-heading'; heading.innerHTML='<h2>設定・データ操作</h2><button type="button" class="mobile-tools-close" aria-label="閉じる">×</button>';
    const list=document.createElement('div'); list.className='mobile-tools-list';
    utilityButtons.filter(button=>button!==logout).forEach(original=>{
      const clone=original.cloneNode(true); clone.removeAttribute('id'); clone.classList.remove('hidden');
      clone.style.display='flex';
      // Keep action handlers and semantics while presenting clearer mobile labels.
      if((original.getAttribute('onclick')||'').includes('confirmResetData')) clone.innerHTML='<i class="fa-solid fa-rotate-right"></i><span>初期データにリセット</span>';
      else if((original.getAttribute('onclick')||'').includes('openImportModal')) clone.innerHTML='<i class="fa-solid fa-file-import"></i><span>JSONをインポート</span>';
      else if((original.getAttribute('onclick')||'').includes('exportDataJSON')) clone.innerHTML='<i class="fa-solid fa-file-export"></i><span>JSONをエクスポート</span>';
      clone.addEventListener('click',()=>closeTools()); list.appendChild(clone);
    });
    const themeOriginal=toolsContainer.querySelector('.theme-switcher') || toolsContainer.querySelector('div:has(#theme-btn-standard)');
    if(themeOriginal){
      const themeWrap=document.createElement('div'); themeWrap.className='mobile-tools-theme';
      Array.from(themeOriginal.querySelectorAll('button')).forEach(original=>{
        const clone=original.cloneNode(true); clone.removeAttribute('id'); clone.style.display='flex'; clone.classList.remove('hidden');
        clone.addEventListener('click',()=>closeTools()); themeWrap.appendChild(clone);
      });
      if(themeWrap.children.length) list.appendChild(themeWrap);
    }
    sheet.appendChild(heading); sheet.appendChild(list); dialog.appendChild(sheet); document.body.appendChild(dialog);
    function closeTools(){ dialog.classList.remove('is-open'); document.body.classList.remove('mobile-tools-open'); trigger.focus({preventScroll:true}); }
    function openTools(){ dialog.classList.add('is-open'); document.body.classList.add('mobile-tools-open'); const close=dialog.querySelector('.mobile-tools-close'); if(close) close.focus({preventScroll:true}); }
    trigger.addEventListener('click',openTools);
    dialog.querySelector('.mobile-tools-close').addEventListener('click',closeTools);
    dialog.addEventListener('click',event=>{if(event.target===dialog) closeTools();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeTools();closeNav();}});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',setup); else setup();
})();
