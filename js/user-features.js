/* SES_Core v3.2.5: hire-date, account, profile and local chat additions.
   Standalone browser demo only: localStorage authentication is not server-side security. */
(function () {
  'use strict';
  const HIRE_DATES = {
    '川合 要':'2025-01-01','山田 裕也':'2022-11-01','佐々木 翔平':'2023-02-01','生天目 慧海':'2023-02-01',
    '梶原 悠羽':'2023-07-01','古山 淳詞':'2024-03-01','内海 未奈子':'2024-03-01','佐々木 七海':'2024-05-01',
    '稲毛 遼河':'2024-06-01','高橋 響哉':'2024-11-01','澤村 吏久':'2025-04-01','鹿又 翔二朗':'2025-05-01',
    '小関 彩乃':'2025-06-01','正木 裕多竜':'2025-07-01','遠藤 新太':'2025-07-01','伊藤 快成':'2025-09-01',
    '鈴木 裕斗':'2025-09-01','曽根 美咲':'2026-01-01','滝沢 陽':'2026-01-01','久保 奈美礼':'2026-04-01'
  };
  const ACCOUNT_KEY = 'ses_core_accounts_v1';
  const PROFILE_KEY = 'ses_core_profiles_v1';
  const CHAT_KEY = 'ses_core_chat_v1';
  let currentAccount = null;
  let originalLogin = null;
  let editing = null;
  const isOwner = () => currentAccount?.username === "admin";
  window.isAccountOwner = isOwner;

  function readJSON(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (_) { return fallback; } }
  function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function accounts() {
    let list = readJSON(ACCOUNT_KEY, null);
    if (!Array.isArray(list)) list = [];
    const defaults = [{"username": "admin", "password": "SESCore2026!", "name": "システム管理者", "role": "admin", "active": true}, {"username": "Yamada1", "password": "Yamada12026!", "name": "山田", "role": "admin", "active": true}, {"username": "Kawaai", "password": "Kawaai2026!", "name": "川合", "role": "admin", "active": true}, {"username": "Itou", "password": "Itou2026!", "name": "伊藤", "role": "user", "active": true}, {"username": "Kajiwara", "password": "Kajiwara2026!", "name": "梶原", "role": "user", "active": true}, {"username": "Sasaki", "password": "Sasaki2026!", "name": "佐々木", "role": "user", "active": true}];
    const legacy = readJSON('ses_access_users', []);
    if (!localStorage.getItem("ses_core_accounts_initialized_v123")) {
    for (const seed of defaults) {
      const existing = list.find(a => a.username.toLowerCase() === seed.username.toLowerCase());
      if (existing) existing.role = seed.role;
      else list.push({...seed, ...(Array.isArray(legacy) ? legacy.find(a => a.username === seed.username) : null), role:seed.role, createdAt:new Date().toISOString()});
    }
    writeJSON(ACCOUNT_KEY, list);
    localStorage.setItem("ses_core_accounts_initialized_v123", "1");
    }
    return list;
  }
  function profileMap() { return readJSON(PROFILE_KEY, {}); }
  function profileFor(account) { const p = profileMap()[account.username] || {}; return { displayName:account.name || account.username, department:'', email:'', phone:'', bio:'', ...p }; }
  function safeText(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function todayParts() { const d = new Date(); return { y:d.getFullYear(), m:d.getMonth(), day:d.getDate() }; }

  window.calculateTenure = function (dateValue) {
    if (!dateValue) return '未登録';
    const start = new Date(dateValue + 'T00:00:00');
    if (Number.isNaN(start.getTime())) return '未登録';
    const now = todayParts();
    if (start.getTime() > new Date(now.y, now.m, now.day).getTime()) return '入社前';
    let months = (now.y - start.getFullYear()) * 12 + (now.m - start.getMonth());
    if (now.day < start.getDate()) months--;
    months = Math.max(0, months);
    const years = Math.floor(months / 12), rem = months % 12;
    if (!years && !rem) return '1か月未満';
    return (years ? years + '年' : '') + (rem ? rem + 'か月' : '');
  };
  window.updateMemberTenurePreview = function () {
    const date = document.getElementById('member-hire-date')?.value;
    const field = document.getElementById('member-exp');
    if (field) field.value = window.calculateTenure(date);
  };

  function applyHireDates() {
    if (typeof db === 'undefined' || !Array.isArray(db.members)) return;
    db.members.forEach(m => { if (HIRE_DATES[m.name]) { m.hireDate = HIRE_DATES[m.name]; m.exp = window.calculateTenure(m.hireDate); } else if (m.hireDate) m.exp = window.calculateTenure(m.hireDate); });
    try { localStorage.setItem('ses_access_db', JSON.stringify(db)); } catch (_) {}
  }
  function setCurrentAccount(account) {
    currentAccount = { username:account.username, name:account.name, role:account.role };
    window.sesCurrentAccount = currentAccount;
    document.body.classList.toggle('ses-standard-user',account.role==='user');
    if(account.role==='user'){window.renderReports?.();window.renderFiscalDashboard?.();}
    const profile = profileFor(account);
    const footer = document.querySelector('#sidebar .border-t .rounded-lg');
    if (footer) {
      const lines = footer.querySelectorAll('p');
      if (lines[0]) lines[0].textContent = profile.displayName;
      if (lines[1]) lines[1].textContent = account.role === 'admin' ? '管理者権限' : '標準ユーザー';
      const avatar = footer.querySelector('.rounded-full'); if (avatar) avatar.textContent = (profile.displayName || account.username).slice(0, 2);
    }
    document.querySelectorAll('[data-admin-only="true"]').forEach(el => { el.classList.remove('hidden'); el.style.display = 'flex'; });
    // extensions.js initially applies a separate role filter; explicitly synchronize account navigation after login.
    const accountNav = document.getElementById('nav-accounts');
    if (accountNav) { accountNav.classList.toggle('hidden', !isOwner()); accountNav.style.setProperty('display', isOwner() ? 'flex' : 'none', 'important'); }
    // 「マイメニュー」は全ユーザー共通。権限切替時も表示を保証する。
    const myMenuGroup = document.getElementById('nav-my-menu-group');
    if (myMenuGroup) { myMenuGroup.classList.remove('hidden'); myMenuGroup.style.display = ''; }
    ['nav-chat', 'nav-mypage', 'nav-manual', 'nav-logout', 'nav-settings'].forEach(id => {
      const item = document.getElementById(id);
      if (item) { item.classList.remove('hidden'); item.style.display = ''; item.removeAttribute('data-admin-only'); }
    });
    renderMyProfile();
    renderAccounts();
    renderChat();
  }
  function renderMyProfile() {
    if (!currentAccount) return;
    const a = accounts().find(x => x.username === currentAccount.username) || currentAccount;
    const p = profileFor(a);
    const values = {'profile-display-name':p.displayName,'profile-department':p.department,'profile-email':p.email,'profile-phone':p.phone,'profile-bio':p.bio};
    Object.entries(values).forEach(([id, value]) => { const el = document.getElementById(id); if (el) el.value = value || ''; });
  }
  window.saveMyProfile = function (event) {
    event.preventDefault(); if (!currentAccount) return;
    const map = profileMap();
    map[currentAccount.username] = {
      displayName:document.getElementById('profile-display-name').value.trim(),
      department:document.getElementById('profile-department').value.trim(),
      email:document.getElementById('profile-email').value.trim(),
      phone:document.getElementById('profile-phone').value.trim(),
      bio:document.getElementById('profile-bio').value.trim()
    };
    writeJSON(PROFILE_KEY, map);
    const list = accounts(); const account = list.find(x => x.username === currentAccount.username); if (account) account.name = map[currentAccount.username].displayName || account.username; writeJSON(ACCOUNT_KEY, list);
    currentAccount.name = account?.name || currentAccount.username; setCurrentAccount(account || currentAccount);
    alert('プロフィールを保存しました。');
  };

  window.openAccountCreate = function () {
    if (!isOwner()) return;
    editing = null;
    document.getElementById("account-role").disabled = false;
    document.getElementById('account-form')?.reset();
    document.getElementById("account-password").required = true;
    document.getElementById('account-username').disabled = false;
    document.getElementById('account-modal-title').textContent = 'アカウント追加';
    document.getElementById('modal-account').classList.remove('hidden');
  };
  window.openAccountEdit = function(username) {
    if (!isOwner()) return;
    const a = accounts().find(x => x.username === username); if (!a) return;
    window.openAccountCreate(); editing = username;
    document.getElementById('account-username').value = username;
    document.getElementById('account-username').disabled = true;
    document.getElementById('account-name').value = a.name;
    document.getElementById('account-role').value = a.role;
    document.getElementById('account-role').disabled = username === 'admin';
    document.getElementById('account-password').required = false;
    document.getElementById('account-modal-title').textContent = 'アカウント編集（PW空欄は変更なし）';
  };
  window.closeAccountModal = function () { document.getElementById('modal-account')?.classList.add('hidden'); };
  window.saveAccount = function (event) {
    event.preventDefault(); if (!isOwner()) return alert('admin専用機能です。');
    const username = document.getElementById('account-username').value.trim();
    const name = document.getElementById('account-name').value.trim();
    const password = document.getElementById('account-password').value;
    const role = document.getElementById('account-role').value;
    const list = accounts();
    if (!/^[a-zA-Z0-9._-]{3,40}$/.test(username)) return alert('ユーザーIDは半角英数字と . _ - を使い、3〜40文字で入力してください。');
    if (!name || !['admin','user'].includes(role)) return;
    if (editing) {
      const a = list.find(x => x.username === editing); if (!a) return;
      if (password && password.length < 8) return alert('パスワードは8文字以上で入力してください。');
      a.name = name; if (editing !== 'admin') a.role = role; if (password) a.password = password;
      const profiles = profileMap(); if (profiles[editing]) { profiles[editing].displayName = name; writeJSON(PROFILE_KEY, profiles); }
      writeJSON(ACCOUNT_KEY, list); window.closeAccountModal(); renderAccounts(); return;
    }
    if (list.some(a => a.username.toLowerCase() === username.toLowerCase())) return alert('そのユーザーIDは既に使用されています。');
    if (password.length < 8) return alert('パスワードは8文字以上で入力してください。');
    list.push({ username, name, password, role, createdAt:new Date().toISOString() }); writeJSON(ACCOUNT_KEY, list);
    window.closeAccountModal(); renderAccounts(); alert('アカウントを作成しました。');
  };
  window.deleteAccount = function (username) {
    if (!isOwner()) return alert('admin専用機能です。');
    if (username === 'admin') return alert('ログイン中のアカウントは削除できません。');
    const list = accounts(); const target = list.find(a => a.username === username);
    if (!target) return;
    if (target.role === 'admin' && list.filter(a => a.role === 'admin').length <= 1) return alert('最後の管理者アカウントは削除できません。');
    if (!confirm(`アカウント「${username}」を削除しますか？`)) return;
    writeJSON(ACCOUNT_KEY, list.filter(a => a.username !== username));
    const profiles = profileMap(); delete profiles[username]; writeJSON(PROFILE_KEY, profiles); renderAccounts();
  };
  function renderAccounts() {
    const body = document.getElementById('accounts-table-body'); if (!body) return;
    body.replaceChildren(); if (!isOwner()) return;
    for (const a of accounts()) {
      const tr = document.createElement('tr'); tr.className = 'border-t border-slate-800';
      for (const value of [a.username, profileFor(a).displayName || a.name, a.role === 'admin' ? '管理者' : '標準ユーザー']) { const td = tr.insertCell(); td.className='p-3'; td.textContent=value; }
      const td=tr.insertCell(); td.className='p-3 space-x-3';
      for (const [label, action, cls] of [['編集',()=>window.openAccountEdit(a.username),'text-cyan-400'],['削除',()=>window.deleteAccount(a.username),'text-rose-400']]) { if(label==='削除' && a.username==='admin') continue; const btn=document.createElement('button'); btn.type='button'; btn.textContent=label; btn.className=cls; btn.onclick=action; td.appendChild(btn); }
      body.appendChild(tr);
    }
  }

  window.renderAccountList = renderAccounts;

  function chatMessages() { return readJSON(CHAT_KEY, []); }
  function renderChat() {
    const el = document.getElementById('chat-messages'); if (!el) return;
    const messages = chatMessages();
    if (!messages.length) { el.innerHTML = '<p class="text-sm text-slate-500 text-center py-8">まだメッセージはありません。最初のメッセージを送信してください。</p>'; return; }
    el.innerHTML = messages.slice(-200).map(m => `<article class="rounded-lg border border-slate-700 bg-slate-900/60 p-3"><div class="flex flex-wrap justify-between gap-2 mb-1"><strong class="text-cyan-300 text-sm">${safeText(m.name)}</strong><time class="text-[11px] text-slate-500">${safeText(new Date(m.at).toLocaleString('ja-JP'))}</time></div><p class="text-sm whitespace-pre-wrap break-words">${safeText(m.text)}</p></article>`).join('');
    el.scrollTop = el.scrollHeight;
  }
  window.sendChatMessage = function (event) {
    event.preventDefault(); if (!currentAccount) return;
    const field = document.getElementById('chat-input'); const text = field.value.trim(); if (!text) return;
    const profile = profileFor(accounts().find(a => a.username === currentAccount.username) || currentAccount);
    const list = chatMessages(); list.push({ username:currentAccount.username, name:profile.displayName, text, at:new Date().toISOString() }); writeJSON(CHAT_KEY, list.slice(-500)); field.value = ''; renderChat();
  };

  document.addEventListener('DOMContentLoaded', function () {
    applyHireDates();
    // Center dialogs on portrait mobile screens and ensure overlays are above the app shell.
    const style = document.createElement('style');
    style.textContent = `
      .app-dialog-overlay{position:fixed;inset:0;z-index:100500;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(2,6,23,.78);overflow-y:auto;overscroll-behavior:contain}
      .app-dialog-overlay.hidden{display:none!important}.app-dialog-panel{position:relative;margin:auto;max-height:calc(100dvh - 32px);overflow-y:auto;overscroll-behavior:contain}
      @media(max-width:760px){#modal-member,#modal-client,#modal-project,#modal-project-detail,#modal-interview,#modal-import{align-items:center!important;padding:12px!important;overflow-y:auto!important}#modal-member>div,#modal-client>div,#modal-project>div,#modal-project-detail>div,#modal-interview>div,#modal-import>div{margin:auto!important;max-height:calc(100dvh - 24px)!important;overflow-y:auto!important;width:100%!important}.app-dialog-panel{width:100%;max-width:520px;padding:18px!important}}
    `;
    document.head.appendChild(style);
    const oldLogout = window.logoutSES;
    window.logoutSES = function() { if (!confirm('ログアウトしますか？')) return; currentAccount=null; window.sesCurrentAccount=null; renderAccounts(); window.closeAccountModal(); document.getElementById('view-accounts')?.classList.add('hidden'); location.reload(); };
    window.promptChangePassword = function() { if (!currentAccount) return; const list=accounts(), a=list.find(x=>x.username===currentAccount.username); const old=prompt('現在のパスワード'); if(old===null)return; if(!a || a.password!==old)return alert('現在のパスワードが正しくありません。'); const next=prompt('新しいパスワード（8文字以上）'); if(next===null)return; if(next.length<8)return alert('8文字以上で入力してください。'); a.password=next; writeJSON(ACCOUNT_KEY,list); alert('パスワードを変更しました。'); };
    window.changeDemoPassword = function(e) { e.preventDefault(); if(!currentAccount)return; const list=accounts(), a=list.find(x=>x.username===currentAccount.username); const old=document.getElementById('password-current'), next=document.getElementById('password-new'); if(!a || a.password!==old.value)return alert('現在のパスワードが正しくありません。'); if(next.value.length<8)return alert('8文字以上で入力してください。'); a.password=next.value; writeJSON(ACCOUNT_KEY,list); old.value=next.value=''; alert('パスワードを変更しました。'); };
    originalLogin = window.handleLogin;
    window.handleLogin = function (event) {
      event.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const error = document.getElementById('login-error');
      const loginScreen = document.getElementById('login-screen');
      const openingScreen = document.getElementById('opening-screen');
      const account = accounts().find(a => a.username.toLowerCase() === username.toLowerCase() && a.password === password && a.active !== false);
      if (!account) { error.classList.remove('hidden'); document.getElementById('login-password').value=''; document.getElementById('login-password').focus(); return; }
      error.classList.add('hidden'); setCurrentAccount(account);
      loginScreen.classList.add('login-screen-exit');
      setTimeout(() => { loginScreen.style.display='none'; openingScreen.style.display='flex'; if (typeof startOpeningAnimation === 'function') startOpeningAnimation(); }, 350);
    };
    // Seed member dates on first load, and refresh calculated experience after the app's initial render.
    setTimeout(() => { applyHireDates(); if (typeof renderMembersTable === 'function') renderMembersTable(); }, 100);
  });
})();
