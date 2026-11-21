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

  function readJSON(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (_) { return fallback; } }
  function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function accounts() {
    let list = readJSON(ACCOUNT_KEY, null);
    if (!Array.isArray(list) || !list.length) {
      list = [{ username:'admin', name:'管理者', password:'SESCore2026!', role:'admin', createdAt:new Date().toISOString() }];
      writeJSON(ACCOUNT_KEY, list);
    }
    if (!list.some(a => a.username === 'admin' && a.role === 'admin')) list.unshift({ username:'admin', name:'管理者', password:'SESCore2026!', role:'admin', createdAt:new Date().toISOString() });
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
    const profile = profileFor(account);
    const footer = document.querySelector('#sidebar .border-t .rounded-lg');
    if (footer) {
      const lines = footer.querySelectorAll('p');
      if (lines[0]) lines[0].textContent = profile.displayName;
      if (lines[1]) lines[1].textContent = account.role === 'admin' ? '管理者権限' : '一般ユーザー';
      const avatar = footer.querySelector('.rounded-full'); if (avatar) avatar.textContent = (profile.displayName || account.username).slice(0, 2);
    }
    document.querySelectorAll('[data-admin-only="true"]').forEach(el => { el.classList.remove('hidden'); el.style.display = 'flex'; });
    // extensions.js initially applies a separate role filter; explicitly synchronize account navigation after login.
    const accountNav = document.getElementById('nav-accounts');
    if (accountNav) { accountNav.classList.remove('hidden'); accountNav.style.display = 'flex'; accountNav.removeAttribute('data-admin-only'); }
    // 「マイメニュー」は全ユーザー共通。権限切替時も表示を保証する。
    const myMenuGroup = document.getElementById('nav-my-menu-group');
    if (myMenuGroup) { myMenuGroup.classList.remove('hidden'); myMenuGroup.style.display = ''; }
    ['nav-chat', 'nav-mypage', 'nav-logout', 'nav-settings'].forEach(id => {
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
    document.getElementById('account-form')?.reset();
    document.getElementById('account-username').disabled = false;
    document.getElementById('account-modal-title').textContent = 'アカウント追加';
    document.getElementById('modal-account').classList.remove('hidden');
  };
  window.closeAccountModal = function () { document.getElementById('modal-account')?.classList.add('hidden'); };
  window.saveAccount = function (event) {
    event.preventDefault(); if (!currentAccount) return alert('ログインしてください。');
    const username = document.getElementById('account-username').value.trim();
    const name = document.getElementById('account-name').value.trim();
    const password = document.getElementById('account-password').value;
    const role = document.getElementById('account-role').value;
    const list = accounts();
    if (!/^[a-zA-Z0-9._-]{3,40}$/.test(username)) return alert('ユーザーIDは半角英数字と . _ - を使い、3〜40文字で入力してください。');
    if (list.some(a => a.username.toLowerCase() === username.toLowerCase())) return alert('そのユーザーIDは既に使用されています。');
    if (password.length < 8) return alert('パスワードは8文字以上で入力してください。');
    list.push({ username, name, password, role, createdAt:new Date().toISOString() }); writeJSON(ACCOUNT_KEY, list);
    window.closeAccountModal(); renderAccounts(); alert('アカウントを作成しました。');
  };
  window.deleteAccount = function (username) {
    if (!currentAccount) return alert('ログインしてください。');
    if (username === currentAccount.username) return alert('ログイン中のアカウントは削除できません。');
    const list = accounts(); const target = list.find(a => a.username === username);
    if (!target) return;
    if (target.role === 'admin' && list.filter(a => a.role === 'admin').length <= 1) return alert('最後の管理者アカウントは削除できません。');
    if (!confirm(`アカウント「${username}」を削除しますか？`)) return;
    writeJSON(ACCOUNT_KEY, list.filter(a => a.username !== username));
    const profiles = profileMap(); delete profiles[username]; writeJSON(PROFILE_KEY, profiles); renderAccounts();
  };
  function renderAccounts() {
    const body = document.getElementById('accounts-table-body'); if (!body) return;
    body.innerHTML = accounts().map(a => `<tr class="border-t border-slate-800"><td class="p-3 font-mono">${safeText(a.username)}</td><td class="p-3">${safeText(profileFor(a).displayName || a.name)}</td><td class="p-3">${a.role === 'admin' ? '管理者' : '一般ユーザー'}</td><td class="p-3">${a.username === currentAccount.username ? '<span class="text-slate-500">ログイン中</span>' : `<button onclick="deleteAccount('${safeText(a.username)}')" class="text-rose-400 hover:text-rose-300">削除</button>`}</td></tr>`).join('');
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
    originalLogin = window.handleLogin;
    window.handleLogin = function (event) {
      event.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const error = document.getElementById('login-error');
      const loginScreen = document.getElementById('login-screen');
      const openingScreen = document.getElementById('opening-screen');
      const account = accounts().find(a => a.username.toLowerCase() === username.toLowerCase() && a.password === password);
      if (!account) { error.classList.remove('hidden'); document.getElementById('login-password').value=''; document.getElementById('login-password').focus(); return; }
      error.classList.add('hidden'); setCurrentAccount(account);
      loginScreen.classList.add('login-screen-exit');
      setTimeout(() => { loginScreen.style.display='none'; openingScreen.style.display='flex'; if (typeof startOpeningAnimation === 'function') startOpeningAnimation(); }, 350);
    };
    // Seed member dates on first load, and refresh calculated experience after the app's initial render.
    setTimeout(() => { applyHireDates(); if (typeof renderMembersTable === 'function') renderMembersTable(); }, 100);
  });
})();
