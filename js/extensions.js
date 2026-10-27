/* SES_Core extensions: tasks, matching, global search, reports, audit, safer data operations */
(function () {
    'use strict';
    const originalRenderAllViews = window.renderAllViews;
    const originalSaveStoredData = window.saveStoredData;
    const originalProcessJSONImport = window.processJSONImport;
    const originalExportDataJSON = window.exportDataJSON;
    const originalHandleLogin = window.handleLogin;
    const originalSaveProject = window.saveProject;
    const originalSaveMember = window.saveMember;
    const originalRenderRevenueView = window.renderRevenueView;
    const originalSetTheme = window.setTheme;
    const originalSaveClient = window.saveClient;
    const originalSaveInterview = window.saveInterview;
    const originalDeleteClient = window.deleteClient;
    const originalDeleteProject = window.deleteProject;
    const originalDeleteMember = window.deleteMember;
    const originalDeleteInterview = window.deleteInterview;
    let currentSession = null;
    const DEFAULT_DEMO_USERS = [{username:'admin',password:'SESCore2026!',name:'システム管理者',role:'admin',active:true}];

    const safeText = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    const today = () => new Date().toISOString().slice(0, 10);
    const uid = prefix => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const yen = value => '¥' + Math.round(Number(value || 0) * 10000).toLocaleString('ja-JP');
    const ensureSchema = () => {
        if (typeof db === 'undefined') return;
        db.tasks = Array.isArray(db.tasks) ? db.tasks : [];
        db.interviews = Array.isArray(db.interviews) ? db.interviews : [];
        db.clients = Array.isArray(db.clients) ? db.clients : [];
        db.projects = Array.isArray(db.projects) ? db.projects : [];
        db.members = Array.isArray(db.members) ? db.members : [];
        db.auditLog = Array.isArray(db.auditLog) ? db.auditLog : [];
        db.monthlyRevenue = db.monthlyRevenue && typeof db.monthlyRevenue === 'object' ? db.monthlyRevenue : {};
        db.spotJobs = Array.isArray(db.spotJobs) ? db.spotJobs : [];
        db.expenses = Array.isArray(db.expenses) ? db.expenses : [];
        db.tasks = db.tasks.map((t, i) => ({ status: '未着手', assignee: '管理者', createdAt: today(), ...t, id: t.id == null ? uid('TSK') : t.id, priority: t.priority || 'MEDIUM' }));
        db.projects = db.projects.map(p => ({ contractEnd: '', startDate: '', assignedMemberIds: [], ...p }));
        db.members = db.members.map(m => ({ assignedProjectId: '', contractEnd: '', ...m }));
        // Legacy records are classified from current member/project links; explicit user selection is preserved.
        db.projects = db.projects.map(p => {
            const linked = db.members.some(m => m.assignedProjectId === p.id || m.currentProject === p.title) || (p.assignedMemberIds || []).length > 0;
            return { ...p, projectType: ['参画案件','共有案件'].includes(p.projectType) ? p.projectType : (linked ? '参画案件' : '共有案件') };
        });
        // Client project totals are derived from current project records, not stale imported counters.
        db.clients.forEach(c => { c.activeProjects = db.projects.filter(p => p.clientId === c.id && !['見送り','募集終了'].includes(p.status)).length; });
    };
    function logAction(action, detail) {
        try {
            ensureSchema();
            db.auditLog.unshift({ id: uid('LOG'), at: new Date().toISOString(), user: 'admin', action, detail: String(detail || '').slice(0, 240) });
            db.auditLog = db.auditLog.slice(0, 500);
            localStorage.setItem('ses_access_audit', JSON.stringify(db.auditLog));
        } catch (e) { /* audit logging must not break the primary operation */ }
    }
    function makeView(id, title, subtitle, content) {
        return `<section id="view-${id}" class="view-panel hidden space-y-5"><div><h2 class="text-xl font-bold tracking-tight">${title}</h2><p class="text-xs text-slate-400 mt-1">${subtitle}</p></div>${content}</section>`;
    }
    function injectUI() {
        const nav = document.querySelector('#sidebar > div.py-4');
        const main = document.querySelector('#app-container main');
        if (!nav || !main || document.getElementById('nav-tasks')) return;
        const links = [
            ['tasks','fa-list-check','タスク・期限管理'],['matching','fa-code-branch','人材マッチング'],['spot','fa-bolt','スポット業務'],['expenses','fa-receipt','経費登録'],['reports','fa-chart-line','分析・レポート'],['audit','fa-clock-rotate-left','操作履歴・設定']
        ].map(([id,icon,label]) => `<a href="#" onclick="switchTab('${id}');return false" id="nav-${id}" class="nav-item flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition space-x-3 text-slate-400 hover:text-white hover:bg-slate-800/50"><i class="fa-solid ${icon} w-5 text-center text-base"></i><span class="sidebar-text">${label}</span></a>`).join('');
        nav.insertAdjacentHTML('beforeend', links);
        const taskView = makeView('tasks','タスク・期限管理','面談、契約更新、営業フォローの対応漏れを防止します。', `
          <div class="glass-card rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
            <input id="task-title" class="ext-input" placeholder="タスク名 / 対応内容">
            <input id="task-date" type="date" class="ext-input" value="${today()}">
            <select id="task-priority" class="ext-input"><option value="HIGH">高優先度</option><option value="MEDIUM" selected>通常</option><option value="LOW">低</option></select>
            <input id="task-assignee" class="ext-input" placeholder="担当者" value="管理者">
            <button onclick="addTask()" class="ext-button"><i class="fa-solid fa-plus mr-1"></i>タスク追加</button>
          </div>
          <div class="glass-card rounded-xl overflow-hidden"><div class="p-3 flex flex-wrap gap-3 items-center justify-between"><div class="text-sm font-semibold">タスク一覧 <span id="task-count" class="text-cyan-400"></span></div><select id="task-filter" class="ext-input max-w-xs" onchange="renderTasks()"><option value="all">すべて</option><option value="未着手">未着手</option><option value="対応中">対応中</option><option value="完了">完了</option><option value="overdue">期限超過</option></select></div><div class="overflow-x-auto"><table class="ext-table"><thead><tr><th>期限</th><th>タスク</th><th>担当</th><th>優先度</th><th>状態</th><th>操作</th></tr></thead><tbody id="tasks-table-body"></tbody></table></div></div>`);
        const matchingView = makeView('matching','人材マッチング','案件の必須スキルとエンジニアの保有スキルを照合します。提案可否の最終判断は担当者が行ってください。', `
          <div class="glass-card rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3"><label class="text-xs text-slate-400">案件<select id="match-project" class="ext-input mt-2" onchange="renderMatching()"></select></label><label class="text-xs text-slate-400">ステータス<select id="match-status" class="ext-input mt-2" onchange="renderMatching()"><option value="eligible" selected>待機中・提案中のみ</option><option value="待機中">待機中のみ</option><option value="提案中">提案中のみ</option></select></label><div class="text-xs text-slate-400 flex items-end">一致スキル数と一致率を表示</div></div>
          <div id="matching-results" class="grid grid-cols-1 lg:grid-cols-2 gap-4"></div>`);
        const reportsView = makeView('reports','分析・レポート','現在登録されているデータをもとに集計します。金額は登録された月額単価（万円）を基準に算出します。', `
          <div class="grid grid-cols-2 xl:grid-cols-4 gap-3" id="report-kpis"></div>
          <div class="glass-card rounded-xl p-4 space-y-3"><div class="flex flex-wrap justify-between gap-3 items-center"><h3 class="font-bold">案件ステータス集計</h3><button onclick="exportCSV('projects')" class="ext-button"><i class="fa-solid fa-file-csv mr-1"></i>案件CSV</button></div><div id="report-project-status" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3"></div></div>
          <div class="glass-card rounded-xl p-4 space-y-3"><div class="flex flex-wrap justify-between gap-3 items-center"><h3 class="font-bold">稼働メンバー別 売上・原価・粗利（月額）</h3><div class="flex gap-2"><button onclick="exportCSV('members')" class="ext-button">メンバーCSV</button><button onclick="exportCSV('clients')" class="ext-button">取引先CSV</button></div></div><div class="overflow-x-auto"><table class="ext-table"><thead><tr><th>エンジニア</th><th>ステータス</th><th>売上/月</th><th>原価/月</th><th>粗利/月</th><th>粗利率</th></tr></thead><tbody id="report-margin-body"></tbody></table></div></div>
          <div class="glass-card rounded-xl p-4"><h3 class="font-bold mb-3">営業ファネル</h3><div id="report-funnel" class="grid grid-cols-2 md:grid-cols-4 gap-3"></div></div>`);
        const auditView = makeView('audit','操作履歴・設定','ローカル試作版の運用情報、バックアップ、診断結果を管理します。', `
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="glass-card rounded-xl p-4 space-y-3"><h3 class="font-bold">データ管理</h3><p class="text-xs text-slate-400">ブラウザ内に保存されたデータをJSONでバックアップできます。復元前には必ずバックアップを取得してください。</p><div class="flex flex-wrap gap-2"><button onclick="exportDataJSON()" class="ext-button">JSONバックアップ</button><button onclick="openImportModal()" class="ext-button">JSONから復元</button><button onclick="downloadAuditCSV()" class="ext-button">操作履歴CSV</button><button onclick="restoreAutoBackup()" class="ext-button">自動退避から復元</button><select id="csv-import-type" class="ext-input max-w-36"><option value="clients">取引先CSV</option><option value="projects">案件CSV</option><option value="members">メンバーCSV</option><option value="interviews">面談CSV</option><option value="tasks">タスクCSV</option></select><button onclick="document.getElementById('csv-import-input').click()" class="ext-button">CSVインポート</button><input id="csv-import-input" type="file" accept=".csv,text/csv" class="hidden" onchange="importCSVFile(event)"></div><div id="data-health" class="text-xs space-y-2"></div></div>
          <div class="glass-card rounded-xl p-4 space-y-3"><h3 class="font-bold">システム情報</h3><div class="text-xs text-slate-400 space-y-2"><p>保存先：このブラウザのローカルストレージ</p><p>認証：フロントエンドのデモ認証（本番用のアクセス制御ではありません）</p><p>外部ライブラリ：Tailwind CSS / Chart.js / Font Awesome / Google Fonts</p></div><button onclick="logoutSES()" class="ext-button border-rose-500/40 text-rose-300">ログアウト</button></div></div>
          <div class="glass-card rounded-xl overflow-hidden"><div class="p-4 flex justify-between items-center"><h3 class="font-bold">操作履歴（最新100件）</h3><button onclick="clearAuditLog()" class="ext-button">履歴クリア</button></div><div class="overflow-x-auto"><table class="ext-table"><thead><tr><th>日時</th><th>ユーザー</th><th>操作</th><th>詳細</th></tr></thead><tbody id="audit-table-body"></tbody></table></div></div>`);
        // Add optional relationship and contract dates without replacing the existing forms.
        const projectForm = document.getElementById('form-project');
        if (projectForm && !document.getElementById('project-contract-end')) {
            const footer = projectForm.querySelector('.border-t');
            if (footer) footer.insertAdjacentHTML('beforebegin', `<div class="grid grid-cols-2 gap-3"><label class="text-slate-400">開始日<input id="project-start-date" type="date" class="ext-input mt-1"></label><label class="text-slate-400">契約終了日<input id="project-contract-end" type="date" class="ext-input mt-1"></label></div>`);
        }
        const memberForm = document.getElementById('form-member');
        if (memberForm && !document.getElementById('member-project')) {
            const footer = memberForm.querySelector('.border-t');
            if (footer) footer.insertAdjacentHTML('beforebegin', `<div class="grid grid-cols-1 md:grid-cols-3 gap-3"><label class="text-slate-400">参画案件<select id="member-project" class="ext-input mt-1"><option value="">未紐付け</option></select></label><label class="text-slate-400">契約終了日<input id="member-contract-end" type="date" class="ext-input mt-1"></label><label class="text-slate-400">基本交通費（月額・万円）<input id="member-transport-cost" type="number" min="0" step="0.1" value="0" class="ext-input mt-1" placeholder="例：1.2"></label></div>`);
        }
        const spotView = makeView('spot','スポット業務','月額契約以外の単発業務・スポット売上を登録します。金額単位は万円です。', `
          <form onsubmit="addSpotJob(event)" class="glass-card rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <label class="text-xs text-slate-400">業務名<input id="spot-title" class="ext-input mt-1" required placeholder="例：追加改修・短期支援"></label>
            <label class="text-xs text-slate-400">実施日<input id="spot-date" type="date" class="ext-input mt-1" required value="${today()}"></label>
            <label class="text-xs text-slate-400">売上（万円）<input id="spot-amount" type="number" min="0" step="0.1" class="ext-input mt-1" required placeholder="例：15"></label>
            <label class="text-xs text-slate-400">メンバー<select id="spot-member" class="ext-input mt-1"><option value="">未指定</option></select></label>
            <label class="text-xs text-slate-400">取引先<input id="spot-client" class="ext-input mt-1" placeholder="取引先名"></label>
            <label class="text-xs text-slate-400">メモ<input id="spot-note" class="ext-input mt-1" placeholder="作業内容・請求情報など"></label>
            <div class="md:col-span-3 flex justify-end"><button class="ext-button" type="submit"><i class="fa-solid fa-plus mr-1"></i>スポット売上を登録</button></div>
          </form>
          <div class="glass-card rounded-xl overflow-hidden"><div class="p-4 flex justify-between gap-3"><b>スポット業務一覧</b><span id="spot-total" class="text-cyan-300 font-bold"></span></div><div class="overflow-x-auto"><table class="ext-table"><thead><tr><th>実施日</th><th>業務名</th><th>メンバー</th><th>取引先</th><th>売上</th><th>メモ</th><th>操作</th></tr></thead><tbody id="spot-table-body"></tbody></table></div></div>`);
        const expensesView = makeView('expenses','経費登録','SES事業に関連する経費を記録します。金額単位は万円です。', `
          <form onsubmit="addExpense(event)" class="glass-card rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <label class="text-xs text-slate-400">発生日<input id="expense-date" type="date" class="ext-input mt-1" required value="${today()}"></label>
            <label class="text-xs text-slate-400">費目<select id="expense-category" class="ext-input mt-1"><option>交通費</option><option>宿泊費</option><option>備品・消耗品</option><option>通信費</option><option>外注費</option><option>採用費</option><option>その他</option></select></label>
            <label class="text-xs text-slate-400">金額（万円）<input id="expense-amount" type="number" min="0" step="0.1" class="ext-input mt-1" required placeholder="例：1.2"></label>
            <label class="text-xs text-slate-400">関連メンバー<select id="expense-member" class="ext-input mt-1"><option value="">全体経費・未指定</option></select></label>
            <label class="text-xs text-slate-400 md:col-span-2">内容・備考<input id="expense-note" class="ext-input mt-1" placeholder="支払先、用途など"></label>
            <div class="md:col-span-3 flex justify-end"><button class="ext-button" type="submit"><i class="fa-solid fa-plus mr-1"></i>経費を登録</button></div>
          </form>
          <div class="glass-card rounded-xl overflow-hidden"><div class="p-4 flex justify-between gap-3"><b>経費一覧</b><span id="expense-total" class="text-rose-300 font-bold"></span></div><div class="overflow-x-auto"><table class="ext-table"><thead><tr><th>発生日</th><th>費目</th><th>関連メンバー</th><th>金額</th><th>内容・備考</th><th>操作</th></tr></thead><tbody id="expense-table-body"></tbody></table></div></div>`);
        main.insertAdjacentHTML('beforeend', taskView + matchingView + spotView + expensesView + reportsView + auditView);
        
        document.getElementById('view-audit').insertAdjacentHTML('beforeend', `<div id="user-management" class="glass-card rounded-xl p-4 space-y-4"><div><h3 class="font-bold">ユーザー・権限管理（試作版）</h3><p class="text-xs text-slate-400 mt-1">デモ環境内の画面表示権限を設定します。セキュリティ境界としては使用できません。</p></div><form onsubmit="addDemoUser(event)" class="grid grid-cols-1 md:grid-cols-5 gap-2"><input id="new-user-id" class="ext-input" placeholder="ユーザーID" required><input id="new-user-name" class="ext-input" placeholder="表示名" required><input id="new-user-password" class="ext-input" type="password" placeholder="初期パスワード" required minlength="8"><select id="new-user-role" class="ext-input"><option value="sales">営業</option><option value="leader">リーダー</option><option value="employee">一般社員</option><option value="admin">管理者</option></select><button class="ext-button" type="submit">ユーザー追加</button></form><div class="overflow-x-auto"><table class="ext-table"><thead><tr><th>ユーザーID</th><th>表示名</th><th>権限</th><th>状態</th><th>操作</th></tr></thead><tbody id="users-table-body"></tbody></table></div><form onsubmit="changeDemoPassword(event)" class="grid grid-cols-1 md:grid-cols-3 gap-2 border-t border-slate-700 pt-4"><input id="password-current" class="ext-input" type="password" placeholder="現在のパスワード" required><input id="password-new" class="ext-input" type="password" placeholder="新しいパスワード（8文字以上）" minlength="8" required><button class="ext-button" type="submit">自分のパスワードを変更</button></form></div>`);

        const navbar = document.querySelector('#top-navbar > div:last-child');
        if (navbar && !document.getElementById('global-search')) {
            const search = document.createElement('div');
            search.className = 'global-search-wrap';
            search.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i><input id="global-search" placeholder="全体検索…" oninput="runGlobalSearch(this.value)" autocomplete="off"><div id="global-search-results" class="hidden"></div>`;
            navbar.prepend(search);
            const passwordButton=document.createElement('button');passwordButton.className='ext-button';passwordButton.textContent='PW変更';passwordButton.title='自分のパスワードを変更';passwordButton.setAttribute('onclick','promptChangePassword()');navbar.insertBefore(passwordButton,navbar.children[1]||null);
        }
        const dashboard = document.getElementById('view-dashboard');
        if (dashboard && !document.getElementById('extended-dashboard')) dashboard.insertAdjacentHTML('beforeend', `<div id="extended-dashboard" class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="glass-card rounded-xl p-4"><div class="flex justify-between items-center mb-3"><h3 class="font-bold text-sm">期限・契約アラート</h3><button class="text-xs text-cyan-400" onclick="switchTab('tasks')">タスク管理へ →</button></div><div id="dashboard-alerts" class="space-y-2"></div></div><div class="glass-card rounded-xl p-4"><div class="flex justify-between items-center mb-3"><h3 class="font-bold text-sm">営業KPI</h3><button class="text-xs text-cyan-400" onclick="switchTab('reports')">分析を見る →</button></div><div id="dashboard-sales-kpis" class="grid grid-cols-2 gap-3"></div></div></div>`);
    }
    function addStyles() {
        if (document.getElementById('ses-extension-css')) return;
        const link = document.createElement('link'); link.id='ses-extension-css'; link.rel='stylesheet'; link.href='css/extensions.css'; document.head.appendChild(link);
    }
    window.renderAllViews = function () {
        if (typeof originalRenderAllViews === 'function') originalRenderAllViews();
        ensureSchema();
        const projectSelect=document.getElementById('member-project');
        if(projectSelect){const selected=projectSelect.value;projectSelect.innerHTML='<option value="">未紐付け</option>'+db.projects.map(p=>`<option value="${safeText(p.id)}">${safeText(p.title)}</option>`).join('');if(db.projects.some(p=>p.id===selected))projectSelect.value=selected;}
        const currentMemberId=document.getElementById('member-id')?.value;const currentMember=db.members.find(m=>m.id===currentMemberId);if(currentMember&&projectSelect)projectSelect.value=currentMember.assignedProjectId||'';
        const currentProjectId=document.getElementById('project-id')?.value;const currentProject=db.projects.find(p=>p.id===currentProjectId);if(currentProject){const sd=document.getElementById('project-start-date'),ed=document.getElementById('project-contract-end');if(sd)sd.value=currentProject.startDate||'';if(ed)ed.value=currentProject.contractEnd||'';}
        if(currentMember){const ce=document.getElementById('member-contract-end');if(ce)ce.value=currentMember.contractEnd||'';}
        renderTasks(); renderMatching(); renderReports(); renderAudit(); renderDashboardExtensions(); updateGlobalSearchData();
    };
    window.saveStoredData = function () {
        ensureSchema();
        try { const previous = localStorage.getItem('ses_access_db'); if (previous) localStorage.setItem('ses_access_db_prebackup', previous); } catch (e) {}
        logAction('データ保存・更新', '業務データを保存しました');
        if (typeof originalSaveStoredData === 'function') originalSaveStoredData();
    };
    function getDemoUsers(){try{const parsed=JSON.parse(localStorage.getItem('ses_access_users')||'null');if(Array.isArray(parsed)&&parsed.length)return parsed;}catch(e){}localStorage.setItem('ses_access_users',JSON.stringify(DEFAULT_DEMO_USERS));return JSON.parse(JSON.stringify(DEFAULT_DEMO_USERS));}
    function saveDemoUsers(users){localStorage.setItem('ses_access_users',JSON.stringify(users));}
    window.handleLogin = function(event){event.preventDefault();const username=document.getElementById('login-username').value.trim();const password=document.getElementById('login-password').value;const error=document.getElementById('login-error');const user=getDemoUsers().find(u=>u.username===username&&u.password===password&&u.active!==false);if(!user){error.classList.remove('hidden');document.getElementById('login-password').value='';document.getElementById('login-password').focus();return;}currentSession={username:user.username,name:user.name,role:user.role};sessionStorage.setItem('ses_core_session',JSON.stringify(currentSession));logAction('ログイン成功',`${username} / ${user.role}`);error.classList.add('hidden');document.getElementById('login-screen').classList.add('login-screen-exit');setTimeout(()=>{document.getElementById('login-screen').style.display='none';document.getElementById('opening-screen').style.display='flex';startOpeningAnimation();applyRolePermissions();},350);};
    window.setTheme = function(theme) { if(typeof originalSetTheme==='function')originalSetTheme(theme); if(typeof db!=='undefined'&&typeof Chart!=='undefined')window.initCharts(); };
    window.processJSONImport = function () {
        if (typeof selectedImportFileContent === 'undefined' || !selectedImportFileContent) { alert('インポートするJSONファイルを選択してください。'); return; }
        let parsed;
        try { parsed = JSON.parse(selectedImportFileContent); } catch (e) { alert('JSONを解析できませんでした：' + e.message); return; }
        const required = ['clients','projects','members'];
        if (!parsed || !required.every(k => Array.isArray(parsed[k]))) { alert('データ形式が不正です。clients / projects / members が配列である必要があります。'); return; }
        if (!confirm(`取引先 ${parsed.clients.length}件、案件 ${parsed.projects.length}件、エンジニア ${parsed.members.length}名のデータで現在の情報を置き換えます。実行前のデータは自動退避します。続行しますか？`)) return;
        try {
            const existing = localStorage.getItem('ses_access_db'); if (existing) localStorage.setItem('ses_access_db_prebackup', existing);
            db = parsed; ensureSchema(); logAction('JSONインポート', `clients=${db.clients.length}, projects=${db.projects.length}, members=${db.members.length}`);
            localStorage.setItem('ses_access_db', JSON.stringify(db)); closeModal('modal-import'); renderAllViews(); alert('JSONデータを復元しました。');
        } catch (e) { alert('インポートに失敗しました：' + e.message); }
    };
    window.exportDataJSON = function () {
        ensureSchema();
        const payload = JSON.parse(JSON.stringify(db));
        payload.metadata = { ...(payload.metadata || {}), systemName: 'SES_Core', exportedAt: new Date().toISOString(), schemaVersion: '3.0.0' };
        downloadBlob(JSON.stringify(payload, null, 2), `SES_Core_Backup_${today()}.json`, 'application/json;charset=utf-8');
        logAction('JSONバックアップ', 'データバックアップを出力しました');
    };
    function downloadBlob(content, filename, type) {
        const blob = new Blob([content], {type}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }
    const originalEditProject = window.editProject;
    const originalEditMember = window.editMember;
    window.editProject = function(id){if(typeof originalEditProject==='function')originalEditProject(id);const p=db.projects.find(x=>x.id===id);if(p){document.getElementById('project-start-date').value=p.startDate||'';document.getElementById('project-contract-end').value=p.contractEnd||'';}};
    window.editMember = function(id){if(typeof originalEditMember==='function')originalEditMember(id);const m=db.members.find(x=>x.id===id);if(m){document.getElementById('member-project').value=m.assignedProjectId||'';document.getElementById('member-contract-end').value=m.contractEnd||'';document.getElementById('member-transport-cost').value=Number(m.transportCost||0);}};
    const originalOpenMemberModal = window.openMemberModal;
    window.openMemberModal = function(){if(typeof originalOpenMemberModal==='function')originalOpenMemberModal();const el=document.getElementById('member-transport-cost');if(el)el.value='0';};
    window.saveProject = function(e) {
        if(!canEditEntity('projects')){e?.preventDefault();alert('案件データの編集権限がありません。');return;}
        const id = document.getElementById('project-id')?.value;
        const title = document.getElementById('project-title')?.value;
        const startDate = document.getElementById('project-start-date')?.value || '';
        const contractEnd = document.getElementById('project-contract-end')?.value || '';
        if (typeof originalSaveProject === 'function') originalSaveProject(e);
        const project = (id && db.projects.find(p => p.id === id)) || [...db.projects].reverse().find(p => p.title === title);
        if (project) { project.startDate = startDate; project.contractEnd = contractEnd; saveStoredData(); }
    };
    window.saveMember = function(e) {
        if(!canEditEntity('members')){e?.preventDefault();alert('エンジニアデータの編集権限がありません。');return;}
        const id = document.getElementById('member-id')?.value;
        const name = document.getElementById('member-name')?.value;
        const assignedProjectId = document.getElementById('member-project')?.value || '';
        const contractEnd = document.getElementById('member-contract-end')?.value || '';
        const transportCost = Math.max(0, Number(document.getElementById('member-transport-cost')?.value) || 0);
        if (typeof originalSaveMember === 'function') originalSaveMember(e);
        const member = (id && db.members.find(m => m.id === id)) || [...db.members].reverse().find(m => m.name === name);
        if (member) { member.assignedProjectId = assignedProjectId; member.contractEnd = contractEnd; member.transportCost = transportCost; saveStoredData(); }
    };
    window.renderRevenueView = function() {
        if (typeof originalRenderRevenueView === 'function') originalRenderRevenueView();
        const section = document.getElementById('view-revenue');
        if (!section || typeof db === 'undefined') return;
        ensureSchema();
        db.monthlyRevenue = db.monthlyRevenue || {};
        db.monthlyCost = db.monthlyCost || {};
        db.monthlyTransport = db.monthlyTransport || {};
        db.monthlyRevenueActual = db.monthlyRevenueActual || {};
        db.monthlyCostActual = db.monthlyCostActual || {};
        db.monthlyTransportActual = db.monthlyTransportActual || {};
        let matrix = document.getElementById('monthly-revenue-matrix');
        if (!matrix) {
            const oldTable = document.getElementById('revenue-table-body')?.closest('.glass-card');
            if (oldTable) oldTable.style.display = 'none';
            matrix = document.createElement('div'); matrix.id = 'monthly-revenue-matrix';
            const heading = section.querySelector('h2')?.parentElement || section;
            heading.insertAdjacentElement('afterend', matrix);
        }
        const year = Number(document.getElementById('revenue-year')?.value || new Date().getFullYear());
        const mode = document.getElementById('revenue-mode')?.value || 'plan';
        const deptFilter = document.getElementById('revenue-department-filter')?.value || 'ALL';
        const memberFilter = document.getElementById('revenue-member-filter')?.value || 'ALL';
        const months = Array.from({length:12}, (_,i)=>`${year}-${String(i+1).padStart(2,'0')}`);
        const money = n => '¥' + Math.round(Number(n||0)*10000).toLocaleString('ja-JP');
        const safeNum = n => Math.max(0, Number(n)||0);
        const revenueStore = mode === 'actual' ? db.monthlyRevenueActual : db.monthlyRevenue;
        const costStore = mode === 'actual' ? db.monthlyCostActual : db.monthlyCost;
        const transportStore = mode === 'actual' ? db.monthlyTransportActual : db.monthlyTransport;
        const keyFor = (m, month) => `${m.id}|${month}`;
        const getField = (store, m, month, fallback) => store[keyFor(m,month)] !== undefined ? safeNum(store[keyFor(m,month)]) : safeNum(fallback);
        const projectFor = m => (db.projects||[]).find(p=>p.id===m.assignedProjectId) || null;
        const departments = [...new Set((db.members||[]).map(m=>m.department||'未登録'))].sort((a,b)=>a.localeCompare(b,'ja'));
        const filteredMembers = (db.members||[]).filter(m=>(deptFilter==='ALL'||(m.department||'未登録')===deptFilter)&&(memberFilter==='ALL'||m.id===memberFilter));
        const memberOptions = (db.members||[]).map(m=>`<option value="${safeText(m.id)}" ${memberFilter===m.id?'selected':''}>${safeText(m.name)}</option>`).join('');
        const rows = filteredMembers.map(m => {
            const project = projectFor(m);
            const sub = `<div class="text-[10px] leading-5 font-normal text-slate-400">${safeText(project?.title||'案件情報未登録')} · 単価 ${safeNum(m.rate).toFixed(1)}万 · 原価 ${safeNum(m.cost).toFixed(1)}万 · 交通費 ${safeNum(m.transportCost).toFixed(1)}万/月</div>`;
            const monthCells = months.map(month => {
                const active = m.status === '稼働中';
                const start = m.contractStart || m.startDate || '';
                const end = m.contractEnd || '';
                const inPeriod = active && (!start || start.slice(0,7)<=month) && (!end || end.slice(0,7)>=month);
                const rev = getField(revenueStore,m,month,inPeriod?(mode==='actual'?0:m.rate):0);
                const cost = getField(costStore,m,month,inPeriod?(mode==='actual'?0:m.cost):0);
                const transport = getField(transportStore,m,month,inPeriod?(mode==='actual'?0:m.transportCost):0);
                const profit = rev-cost-transport;
                return `<td class="p-2 min-w-[190px] align-top"><div class="space-y-1.5"><label class="block text-[10px] text-slate-400">売上（万円）<input class="ext-input revenue-month-cell" type="number" min="0" step="0.1" value="${rev}" data-kind="revenue" data-member="${safeText(m.id)}" data-month="${month}" data-mode="${mode}" onchange="saveMonthlyFinance(this)" aria-label="${safeText(m.name)} ${month} 売上"></label><label class="block text-[10px] text-slate-400">原価（万円）<input class="ext-input" type="number" min="0" step="0.1" value="${cost}" data-kind="cost" data-member="${safeText(m.id)}" data-month="${month}" data-mode="${mode}" onchange="saveMonthlyFinance(this)" aria-label="${safeText(m.name)} ${month} 原価"></label><label class="block text-[10px] text-slate-400">交通費（万円）<input class="ext-input" type="number" min="0" step="0.1" value="${transport}" data-kind="transport" data-member="${safeText(m.id)}" data-month="${month}" data-mode="${mode}" onchange="saveMonthlyFinance(this)" aria-label="${safeText(m.name)} ${month} 交通費"></label><div class="text-xs pt-1 border-t border-white/10 ${profit>=0?'text-emerald-300':'text-rose-300'}">粗利：${money(profit)}</div></div></td>`;
            }).join('');
            const annualRev = months.reduce((a,month)=>a+getField(revenueStore,m,month,(mode==='actual'?0:(m.status==='稼働中'?m.rate:0))),0);
            return `<tr class="border-b border-white/5"><th class="sticky left-0 z-10 bg-slate-950/95 text-left p-3 min-w-[220px] align-top"><div class="font-semibold text-slate-100">${safeText(m.name)}</div>${sub}<div class="text-[10px] text-slate-500">${safeText(m.department||'未登録')} / ${safeText(m.role||'役職未登録')}</div></th>${monthCells}<td class="p-3 text-right font-bold text-cyan-300">${money(annualRev)}</td></tr>`;
        }).join('');
        const totals = months.map(month=>filteredMembers.reduce((sum,m)=>sum+getField(revenueStore,m,month,(mode==='actual'?0:(m.status==='稼働中'?m.rate:0))),0));
        const annualTotal = totals.reduce((a,b)=>a+b,0);
        const annualCost = months.reduce((sum,month)=>sum+filteredMembers.reduce((a,m)=>a+getField(costStore,m,month,(mode==='actual'?0:(m.status==='稼働中'?m.cost:0))),0),0);
        const annualTransport = months.reduce((sum,month)=>sum+filteredMembers.reduce((a,m)=>a+getField(transportStore,m,month,(mode==='actual'?0:(m.status==='稼働中'?m.transportCost:0))),0),0);
        const annualProfit = annualTotal-annualCost-annualTransport;
        matrix.innerHTML = `<div class="glass-card rounded-xl p-4 mb-4"><div class="flex flex-wrap items-center justify-between gap-3 mb-3"><div><h3 class="font-bold text-cyan-300"><i class="fa-solid fa-table mr-2"></i>売上・粗利管理</h3><p class="text-xs text-slate-400 mt-1">予定と実績は別データです。金額は万円単位。各月の売上・原価・交通費を編集すると粗利を自動計算します。</p></div><div class="flex flex-wrap gap-2 items-center"><label class="text-xs text-slate-400">データ<select id="revenue-mode" class="ext-input ml-2" onchange="renderRevenueView()"><option value="plan" ${mode==='plan'?'selected':''}>予定</option><option value="actual" ${mode==='actual'?'selected':''}>実績</option></select></label><label class="text-xs text-slate-400">対象年<select id="revenue-year" class="ext-input ml-2" onchange="renderRevenueView()">${[year-1,year,year+1].map(y=>`<option value="${y}" ${y===year?'selected':''}>${y}年</option>`).join('')}</select></label></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4"><label class="text-xs text-slate-400">部署で絞り込み<select id="revenue-department-filter" class="ext-input mt-1" onchange="renderRevenueView()"><option value="ALL">全部署</option>${departments.map(d=>`<option value="${safeText(d)}" ${deptFilter===d?'selected':''}>${safeText(d)}</option>`).join('')}</select></label><label class="text-xs text-slate-400">メンバーで絞り込み<select id="revenue-member-filter" class="ext-input mt-1" onchange="renderRevenueView()"><option value="ALL">全メンバー</option>${memberOptions}</select></label></div><div class="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4"><div class="p-3 rounded-lg border border-cyan-400/30 bg-cyan-500/10"><div class="text-xs text-slate-400">年間売上合計</div><div class="text-xl font-bold text-cyan-300">${money(annualTotal)}</div></div><div class="p-3 rounded-lg border border-rose-400/30 bg-rose-500/10"><div class="text-xs text-slate-400">年間原価合計</div><div class="text-xl font-bold text-rose-300">${money(annualCost)}</div></div><div class="p-3 rounded-lg border border-amber-400/30 bg-amber-500/10"><div class="text-xs text-slate-400">年間交通費合計</div><div class="text-xl font-bold text-amber-300">${money(annualTransport)}</div></div><div class="p-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10"><div class="text-xs text-slate-400">年間粗利合計</div><div class="text-xl font-bold text-emerald-300">${money(annualProfit)}</div></div></div><div class="overflow-x-auto"><table class="ext-table min-w-[2600px]"><thead><tr><th class="sticky left-0 z-20 bg-slate-900 p-3 text-left">メンバー／案件・単価情報</th>${months.map(m=>`<th class="p-3">${Number(m.slice(5))}月</th>`).join('')}<th class="p-3">年間売上</th></tr></thead><tbody>${rows||`<tr><td colspan="14" class="p-6 text-center text-slate-500">条件に一致するメンバーがいません。</td></tr>`}<tr class="bg-cyan-500/10"><th class="sticky left-0 z-10 bg-slate-950 p-3 text-left text-cyan-300">月別売上合計</th>${totals.map(v=>`<td class="p-3 text-right font-bold text-cyan-300">${money(v)}</td>`).join('')}<td class="p-3 text-right font-bold text-cyan-300">${money(annualTotal)}</td></tr></tbody></table></div><p class="text-[11px] text-slate-500 mt-3">基本交通費はメンバー管理ダイアログで登録します。月ごとに変更がある場合は該当月の交通費欄を編集してください。粗利＝売上−原価−交通費。予定と実績は独立して保存されます。</p></div>`;
    };
    window.saveMonthlyFinance = function(input){
        const mode=input.dataset.mode||'plan'; const kind=input.dataset.kind; const key=`${input.dataset.member}|${input.dataset.month}`; const value=Math.max(0,Number(input.value)||0);
        const stores = mode==='actual' ? {revenue:db.monthlyRevenueActual,cost:db.monthlyCostActual,transport:db.monthlyTransportActual} : {revenue:db.monthlyRevenue,cost:db.monthlyCost,transport:db.monthlyTransport};
        if(!stores[kind]) stores[kind]={}; stores[kind][key]=value; saveStoredData(); renderRevenueView();
    };
    window.saveMonthlyRevenue = function(input){ input.dataset.kind='revenue'; input.dataset.mode=document.getElementById('revenue-mode')?.value||'plan'; saveMonthlyFinance(input); };
    function fillMemberSelect(id, includeBlank){ const el=document.getElementById(id);if(!el)return;const blank=includeBlank?'<option value="">未指定</option>':'';el.innerHTML=blank+(db.members||[]).map(m=>`<option value="${safeText(m.id)}">${safeText(m.name)}</option>`).join(''); }
    window.renderSpotJobs = function(){ fillMemberSelect('spot-member',true);const body=document.getElementById('spot-table-body');if(!body)return;const list=[...(db.spotJobs||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)));body.innerHTML=list.map(x=>`<tr><td>${safeText(x.date)}</td><td>${safeText(x.title)}</td><td>${safeText((db.members.find(m=>m.id===x.memberId)||{}).name||'未指定')}</td><td>${safeText(x.client||'-')}</td><td class="text-fuchsia-300">${moneyLabel(x.amount)}</td><td>${safeText(x.note||'')}</td><td><button class="text-rose-300" onclick="deleteSpotJob('${safeText(x.id)}')">削除</button></td></tr>`).join('')||'<tr><td colspan="7" class="p-5 text-center text-slate-500">登録データはありません。</td></tr>';const total=list.reduce((a,x)=>a+Number(x.amount||0),0);document.getElementById('spot-total').textContent=`合計 ${moneyLabel(total)}`;};
    const moneyLabel = value => '¥'+Math.round(Number(value||0)*10000).toLocaleString('ja-JP');
    window.addSpotJob = function(e){e.preventDefault();if(!canEditEntity('projects')){alert('スポット業務の登録権限がありません。');return;}db.spotJobs.push({id:uid('SPT'),title:document.getElementById('spot-title').value.trim(),date:document.getElementById('spot-date').value,amount:Number(document.getElementById('spot-amount').value)||0,memberId:document.getElementById('spot-member').value,client:document.getElementById('spot-client').value.trim(),note:document.getElementById('spot-note').value.trim()});logAction('スポット売上登録',document.getElementById('spot-title').value);saveStoredData();e.target.reset();document.getElementById('spot-date').value=today();renderSpotJobs();renderRevenueView();};
    window.deleteSpotJob = function(id){if(!confirm('このスポット売上を削除しますか？'))return;db.spotJobs=db.spotJobs.filter(x=>x.id!==id);logAction('スポット売上削除',id);saveStoredData();renderSpotJobs();renderRevenueView();};
    window.renderExpenses = function(){fillMemberSelect('expense-member',true);const body=document.getElementById('expense-table-body');if(!body)return;const list=[...(db.expenses||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)));body.innerHTML=list.map(x=>`<tr><td>${safeText(x.date)}</td><td>${safeText(x.category)}</td><td>${safeText((db.members.find(m=>m.id===x.memberId)||{}).name||'全体経費')}</td><td class="text-rose-300">${moneyLabel(x.amount)}</td><td>${safeText(x.note||'')}</td><td><button class="text-rose-300" onclick="deleteExpense('${safeText(x.id)}')">削除</button></td></tr>`).join('')||'<tr><td colspan="6" class="p-5 text-center text-slate-500">登録データはありません。</td></tr>';document.getElementById('expense-total').textContent=`合計 ${moneyLabel(list.reduce((a,x)=>a+Number(x.amount||0),0))}`;};
    window.addExpense = function(e){e.preventDefault();if(!canEditEntity('projects')){alert('経費の登録権限がありません。');return;}db.expenses.push({id:uid('EXP'),date:document.getElementById('expense-date').value,category:document.getElementById('expense-category').value,amount:Number(document.getElementById('expense-amount').value)||0,memberId:document.getElementById('expense-member').value,note:document.getElementById('expense-note').value.trim()});logAction('経費登録',document.getElementById('expense-category').value);saveStoredData();e.target.reset();document.getElementById('expense-date').value=today();renderExpenses();renderRevenueView();};
    window.deleteExpense = function(id){if(!confirm('この経費を削除しますか？'))return;db.expenses=db.expenses.filter(x=>x.id!==id);logAction('経費削除',id);saveStoredData();renderExpenses();renderRevenueView();};
    window.initCharts = function() {
        if (typeof Chart === 'undefined' || typeof db === 'undefined') return;
        ensureSchema();
        const isNeon=document.body.classList.contains('theme-neon'), textColor=isNeon?'#94A3B8':'#64748B', gridColor=isNeon?'rgba(255,255,255,.05)':'#E2E8F0';
        const active=db.members.filter(m=>m.status==='稼働中');const rev=active.reduce((s,m)=>s+Number(m.rate||0),0);const cost=active.reduce((s,m)=>s+Number(m.cost||0),0);
        const revTitle=document.querySelector('#view-dashboard .lg\\:col-span-2 h3');if(revTitle)revTitle.innerHTML='<i class="fa-solid fa-chart-column mr-2 text-cyan-400"></i>現在の月額売上・粗利（登録データ基準）';
        const ctxRev=document.getElementById('chart-revenue-trend');if(ctxRev){if(window.revenueChart)window.revenueChart.destroy();window.revenueChart=new Chart(ctxRev,{type:'bar',data:{labels:['登録データ'],datasets:[{label:'売上（月額・万円）',data:[rev],backgroundColor:isNeon?'rgba(6,182,212,.75)':'#2563EB',borderRadius:6},{label:'粗利（月額・万円）',data:[rev-cost],backgroundColor:isNeon?'rgba(139,92,246,.75)':'#9333EA',borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:textColor,font:{size:11}}}},scales:{x:{ticks:{color:textColor},grid:{color:gridColor}},y:{beginAtZero:true,ticks:{color:textColor},grid:{color:gridColor}}}}});}
        const ctx=document.getElementById('chart-pipeline-funnel');if(ctx){if(window.funnelChart)window.funnelChart.destroy();const labels=['提案公募','面談調整','成約','募集終了'];const values=[db.projects.filter(p=>p.status==='提案公募中').length,db.projects.filter(p=>String(p.status).includes('面談')).length,db.projects.filter(p=>String(p.status).includes('成約')).length,db.projects.filter(p=>p.status==='募集終了').length];window.funnelChart=new Chart(ctx,{type:'doughnut',data:{labels,datasets:[{data:values,backgroundColor:['#06B6D4','#3B82F6','#10B981','#64748B'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:textColor,font:{size:10}}}},cutout:'65%'}});}
    };
    window.switchTab = function (tabName) {
        if(currentSession && !allowedTabsForRole(currentSession.role).includes(tabName)){alert('このユーザーには当該画面の閲覧権限がありません。');return;}
        document.querySelectorAll('.view-panel').forEach(panel => panel.classList.add('hidden'));
        document.querySelectorAll('.nav-item').forEach(item => { item.classList.remove('text-cyan-400','bg-cyan-500/10','border-l-4','border-cyan-400'); item.classList.add('text-slate-400'); });
        const panel = document.getElementById(`view-${tabName}`); const nav = document.getElementById(`nav-${tabName}`);
        if (panel) panel.classList.remove('hidden'); if (nav) { nav.classList.add('text-cyan-400','bg-cyan-500/10','border-l-4','border-cyan-400'); nav.classList.remove('text-slate-400'); }
        if (tabName === 'tasks') renderTasks(); if (tabName === 'matching') renderMatching(); if (tabName === 'spot') renderSpotJobs(); if (tabName === 'expenses') renderExpenses(); if (tabName === 'reports') renderReports(); if (tabName === 'audit') renderAudit(); if (tabName === 'revenue') renderRevenueView();
    };
    window.addTask = function () {
        if(!canEditEntity('tasks')){alert('タスクの編集権限がありません。');return;}
        const title = document.getElementById('task-title').value.trim(); if (!title) { alert('タスク名を入力してください。'); return; }
        db.tasks.push({id: uid('TSK'), title, date: document.getElementById('task-date').value || today(), priority: document.getElementById('task-priority').value, assignee: document.getElementById('task-assignee').value.trim() || '未割当', status:'未着手', createdAt:today()});
        document.getElementById('task-title').value=''; logAction('タスク登録', title); saveStoredData();
    };
    window.updateTaskStatus = function (id, status) { if(!canEditEntity('tasks')){alert('タスクの編集権限がありません。');renderTasks();return;} const task = db.tasks.find(t => String(t.id) === String(id)); if (!task) return; task.status=status; task.completedAt=status==='完了'?today():''; logAction('タスク状態変更', `${task.title}: ${status}`); saveStoredData(); };
    window.deleteTask = function (id) { if(!canEditEntity('tasks')){alert('タスクの編集権限がありません。');return;} const task=db.tasks.find(t=>String(t.id)===String(id)); if (!task || !confirm(`「${task.title}」を削除しますか？`)) return; db.tasks=db.tasks.filter(t=>String(t.id)!==String(id)); logAction('タスク削除', task.title); saveStoredData(); };
    window.renderTasks = function () {
        const body=document.getElementById('tasks-table-body'); if(!body || typeof db === 'undefined') return; ensureSchema();
        const filter=document.getElementById('task-filter')?.value || 'all'; const tasks=[...db.tasks].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
        const visible=tasks.filter(t=>filter==='all'||(filter==='overdue'&&t.status!=='完了'&&t.date<today())||t.status===filter);
        document.getElementById('task-count').textContent=`${visible.length}件`;
        body.innerHTML=visible.map(t=>{const overdue=t.status!=='完了'&&t.date<today();return `<tr><td class="${overdue?'text-rose-400 font-bold':'text-slate-400'}">${safeText(t.date||'未設定')}${overdue?' <span class="text-[10px]">期限超過</span>':''}</td><td class="font-semibold">${safeText(t.title)}</td><td>${safeText(t.assignee||'未割当')}</td><td><span class="ext-pill ${t.priority==='HIGH'?'danger':t.priority==='LOW'?'muted':'warn'}">${t.priority==='HIGH'?'高':t.priority==='LOW'?'低':'通常'}</span></td><td><select class="ext-input min-w-24" onchange="updateTaskStatus('${String(t.id).replace(/'/g,'')}',this.value)" aria-label="タスク状態" data-task-id="${safeText(t.id)}"><option ${t.status==='未着手'?'selected':''}>未着手</option><option ${t.status==='対応中'?'selected':''}>対応中</option><option ${t.status==='完了'?'selected':''}>完了</option></select></td><td><button onclick="deleteTask('${String(t.id).replace(/'/g,'')}')" class="text-rose-400 hover:text-rose-300" title="削除"><i class="fa-solid fa-trash"></i></button></td></tr>`}).join('')||'<tr><td colspan="6" class="text-center text-slate-500 p-6">該当するタスクはありません。</td></tr>';
        body.querySelectorAll('select[data-task-id]').forEach(sel=>sel.onchange=()=>updateTaskStatus(sel.dataset.taskId,sel.value));
    };
    window.renderMatching = function () {
        const select=document.getElementById('match-project'); const container=document.getElementById('matching-results'); if(!select||!container||typeof db === 'undefined') return; ensureSchema();
        const matchProjects=db.projects.filter(p=>!['見送り','募集終了'].includes(p.status) && (p.projectType !== '参画案件'));
        const old=select.value; select.innerHTML=matchProjects.map(p=>`<option value="${safeText(p.id)}">${safeText(p.title)}</option>`).join(''); if(matchProjects.some(p=>p.id===old)) select.value=old;
        const project=matchProjects.find(p=>p.id===select.value); if(!project){container.innerHTML='<p class="text-slate-500">人材提案に利用できる共有案件がありません。案件管理で共有案件を登録してください。</p>';return;}
        const required=(project.skills||[]).map(s=>String(s).toLowerCase()); const status=document.getElementById('match-status')?.value||'eligible';
        // 人材マッチングには「待機中」「提案中」のみを表示し、稼働中のメンバーは除外する。
        const eligibleStatuses=['待機中','提案中'];
        const list=db.members.filter(m=>eligibleStatuses.includes(String(m.status||''))&&(status==='eligible'||m.status===status)).map(m=>{const skills=(m.skills||[]);const matches=skills.filter(s=>required.some(r=>r===String(s).toLowerCase()||r.includes(String(s).toLowerCase())||String(s).toLowerCase().includes(r))); const ratio=required.length?Math.round(new Set(matches.map(x=>x.toLowerCase())).size/required.length*100):0;return {...m,matches:[...new Set(matches)],ratio};}).sort((a,b)=>b.ratio-a.ratio);
        container.innerHTML=list.map(m=>`<article class="glass-card rounded-xl p-4 space-y-3"><div class="flex justify-between gap-3"><div><div class="font-bold">${safeText(m.name)}</div><div class="text-xs text-slate-400 mt-1">${safeText(m.type)} / ${safeText(m.exp||'経験年数未設定')}</div></div><span class="ext-pill ${m.ratio>=70?'good':m.ratio>=35?'warn':'muted'}">一致率 ${m.ratio}%</span></div><div class="h-2 rounded-full bg-slate-800 overflow-hidden"><div class="h-full bg-gradient-to-r from-cyan-500 to-violet-500" style="width:${m.ratio}%"></div></div><div class="text-xs text-slate-400">一致スキル：${m.matches.length?safeText(m.matches.join('、')):'なし'}<br>必須スキル：${safeText(required.join('、')||'未設定')}</div><div class="flex justify-between items-center text-xs"><span class="ext-pill muted">${safeText(m.status)}</span><button class="text-cyan-400" onclick="createProposalTask('${safeText(m.id)}','${safeText(project.id)}')">提案タスクを作成 →</button></div></article>`).join('')||'<p class="text-slate-500">待機中または提案中のメンバーがいません。メンバー管理でステータスを確認してください。</p>';
    };
    window.createProposalTask = function(memberId, projectId) {if(!canEditEntity('tasks')){alert('提案タスクを作成する権限がありません。');return;}const m=db.members.find(x=>x.id===memberId),p=db.projects.find(x=>x.id===projectId);if(!m||!p)return;db.tasks.push({id:uid('TSK'),title:`${m.name}：${p.title} の提案可否確認`,date:today(),priority:'MEDIUM',assignee:'管理者',status:'未着手',createdAt:today()});logAction('提案タスク作成',`${m.name} / ${p.title}`);saveStoredData();switchTab('tasks');};
    window.renderReports = function () {
        const k=document.getElementById('report-kpis'); if(!k||typeof db === 'undefined')return;ensureSchema();
        const active=db.members.filter(m=>m.status==='稼働中'); const waiting=db.members.filter(m=>m.status==='待機中'); const rev=active.reduce((s,m)=>s+Number(m.rate||0),0); const cost=active.reduce((s,m)=>s+Number(m.cost||0),0); const profit=rev-cost;
        const items=[['登録エンジニア',`${db.members.length}名`],['稼働率',`${db.members.length?Math.round(active.length/db.members.length*100):0}%`],['月間売上（稼働中）',`${rev.toLocaleString()}万円`],['月間粗利',`${profit.toLocaleString()}万円`]];
        k.innerHTML=items.map(([label,val])=>`<div class="glass-card rounded-xl p-4"><div class="text-xs text-slate-400">${label}</div><div class="text-xl font-bold text-cyan-300 mt-2">${val}</div></div>`).join('');
        const statuses=[...new Set(db.projects.map(p=>p.status||'未設定'))];document.getElementById('report-project-status').innerHTML=statuses.map(s=>`<div class="p-3 rounded-lg bg-slate-800/60 border border-slate-700"><div class="text-xs text-slate-400">${safeText(s)}</div><div class="text-xl font-bold mt-1">${db.projects.filter(p=>p.status===s).length}件</div></div>`).join('')||'<p class="text-slate-500">案件データなし</p>';
        document.getElementById('report-margin-body').innerHTML=db.members.map(m=>{const margin=Number(m.rate||0)-Number(m.cost||0);const rate=Number(m.rate||0)?(margin/Number(m.rate)*100):0;return `<tr><td class="font-semibold">${safeText(m.name)}</td><td>${safeText(m.status)}</td><td>${Number(m.rate||0).toLocaleString()}万円</td><td>${Number(m.cost||0).toLocaleString()}万円</td><td class="${margin<0?'text-rose-400':'text-cyan-300'}">${margin.toLocaleString()}万円</td><td>${rate.toFixed(1)}%</td></tr>`}).join('');
        const pipeline=[['提案中',db.projects.filter(p=>p.status==='提案公募中').length],['面談調整',db.projects.filter(p=>String(p.status).includes('面談')).length],['成約',db.projects.filter(p=>String(p.status).includes('成約')).length],['見送り',db.projects.filter(p=>p.status==='見送り').length],['面談予定',db.interviews.filter(i=>i.status==='予定調整済').length]];
        document.getElementById('report-funnel').innerHTML=pipeline.map(([l,n])=>`<div class="p-3 rounded-lg bg-slate-800/60"><div class="text-xs text-slate-400">${l}</div><div class="text-2xl font-bold text-cyan-300">${n}</div></div>`).join('');
    };
    window.renderDashboardExtensions = function () {
        const alerts=document.getElementById('dashboard-alerts');if(!alerts||typeof db === 'undefined')return;ensureSchema();
        const overdue=db.tasks.filter(t=>t.status!=='完了'&&t.date&&t.date<today()).map(t=>({label:`期限超過：${t.title}`,date:t.date,kind:'task'}));
        const due=db.projects.filter(p=>p.contractEnd&&p.contractEnd>=today()&&p.contractEnd<=new Date(Date.now()+30*86400000).toISOString().slice(0,10)).map(p=>({label:`契約終了予定：${p.title}`,date:p.contractEnd,kind:'project'}));
        const soon=db.interviews.filter(i=>i.date&&i.date.slice(0,10)>=today()&&i.date.slice(0,10)<=new Date(Date.now()+7*86400000).toISOString().slice(0,10)).map(i=>({label:`面談予定：${i.memberName} / ${i.projectTitle}`,date:i.date.replace('T',' '),kind:'interview'}));
        const all=[...overdue,...due,...soon].slice(0,8);alerts.innerHTML=all.map(a=>`<div class="flex items-start justify-between gap-3 p-2 rounded-lg bg-slate-800/50"><span class="text-xs">${safeText(a.label)}</span><span class="text-[10px] text-cyan-300 whitespace-nowrap">${safeText(a.date)}</span></div>`).join('')||'<p class="text-xs text-slate-500">期限が近いタスクや予定はありません。契約終了日を登録するとアラートに表示されます。</p>';
        const active=db.members.filter(m=>m.status==='稼働中').length, proposals=db.projects.filter(p=>p.status==='提案公募中').length, scheduled=db.interviews.filter(i=>i.status==='予定調整済').length, tasks=db.tasks.filter(t=>t.status!=='完了').length;
        const passed=db.projects.filter(p=>p.status==='見送り').length;
        document.getElementById('dashboard-sales-kpis').innerHTML=[['提案募集中',proposals+'件'],['見送り',passed+'件'],['面談予定',scheduled+'件'],['未完了タスク',tasks+'件'],['稼働エンジニア',active+'名']].map(([a,b])=>`<div class="p-3 rounded-lg bg-slate-800/50"><div class="text-xs text-slate-400">${a}</div><div class="text-lg font-bold text-cyan-300">${b}</div></div>`).join('');
    };
    let searchIndex=[];
    function updateGlobalSearchData(){if(typeof db === 'undefined')return;ensureSchema();searchIndex=[...db.clients.map(x=>({type:'取引先',id:x.id,name:x.name,detail:x.contact,tab:'clients'})),...db.projects.map(x=>({type:'案件',id:x.id,name:x.title,detail:x.clientName,tab:'projects'})),...db.members.map(x=>({type:'エンジニア',id:x.id,name:x.name,detail:(x.skills||[]).join(', '),tab:'members'})),...db.interviews.map(x=>({type:'面談',id:x.id,name:x.memberName,detail:x.projectTitle,tab:'interviews'})),...db.tasks.map(x=>({type:'タスク',id:x.id,name:x.title,detail:x.date,tab:'tasks'}))];}
    window.runGlobalSearch=function(query){const box=document.getElementById('global-search-results');if(!box)return;const q=String(query||'').trim().toLowerCase();if(!q){box.classList.add('hidden');return;}const results=searchIndex.filter(x=>`${x.name} ${x.detail} ${x.id} ${x.type}`.toLowerCase().includes(q)).slice(0,12);box.innerHTML=results.map(x=>`<button class="global-result" onclick="switchTab('${x.tab}');document.getElementById('global-search-results').classList.add('hidden');document.getElementById('global-search').value=''"><span class="ext-pill muted">${x.type}</span><span><strong>${safeText(x.name)}</strong><small>${safeText(x.detail||x.id)}</small></span></button>`).join('')||'<div class="p-3 text-xs text-slate-400">該当データがありません。</div>';box.classList.remove('hidden');};
    window.saveClient=function(e){if(!canEditEntity('clients')){e?.preventDefault();alert('取引先データの編集権限がありません。');return;}const name=document.getElementById('client-name')?.value||'';logAction('取引先保存',name);if(typeof originalSaveClient==='function')originalSaveClient(e);};
    window.saveInterview=function(e){if(!canEditEntity('interviews')){e?.preventDefault();alert('面談データの編集権限がありません。');return;}const member=document.getElementById('interview-member');const project=document.getElementById('interview-project');logAction('面談登録',`${member?.selectedOptions?.[0]?.text||''} / ${project?.selectedOptions?.[0]?.text||''}`);if(typeof originalSaveInterview==='function')originalSaveInterview(e);};
    window.deleteClient=function(id){if(!canEditEntity('clients')){alert('取引先データの編集権限がありません。');return;}const item=db.clients.find(x=>x.id===id);if(item)logAction('取引先削除',item.name);if(typeof originalDeleteClient==='function')originalDeleteClient(id);};
    window.deleteProject=function(id){if(!canEditEntity('projects')){alert('案件データの編集権限がありません。');return;}const item=db.projects.find(x=>x.id===id);if(item)logAction('案件削除',item.title);if(typeof originalDeleteProject==='function')originalDeleteProject(id);};
    window.deleteMember=function(id){if(!canEditEntity('members')){alert('エンジニアデータの編集権限がありません。');return;}const item=db.members.find(x=>x.id===id);if(item)logAction('エンジニア削除',item.name);if(typeof originalDeleteMember==='function')originalDeleteMember(id);};
    window.deleteInterview=function(id){if(!canEditEntity('interviews')){alert('面談データの編集権限がありません。');return;}const item=db.interviews.find(x=>x.id===id);if(item)logAction('面談削除',item.memberName+' / '+item.projectTitle);if(typeof originalDeleteInterview==='function')originalDeleteInterview(id);};
    function canEditEntity(entity){const role=currentSession?.role||'admin';if(role==='admin')return true;if(role==='sales')return ['clients','projects','members','interviews','tasks'].includes(entity);if(role==='leader')return ['members','interviews','tasks'].includes(entity);return false;}
    function allowedTabsForRole(role){if(role==='admin')return ['dashboard','clients','projects','members','interviews','revenue','tasks','matching','spot','expenses','reports','audit'];if(role==='sales')return ['dashboard','clients','projects','members','interviews','revenue','tasks','matching','spot','expenses','reports'];if(role==='leader')return ['dashboard','members','interviews','tasks','matching','reports'];return ['dashboard','members','tasks'];}
    function applyRolePermissions(){const role=currentSession?.role||'admin';document.querySelectorAll('.nav-item').forEach(a=>{const tab=a.id.replace('nav-','');a.style.display=allowedTabsForRole(role).includes(tab)?'flex':'none';});const userBox=document.querySelector('#sidebar .p-3.border-t');if(userBox){const name=userBox.querySelector('.text-xs.font-semibold');const roleText=userBox.querySelector('p:last-child');if(name)name.textContent=currentSession?.name||'SES営業統括部';if(roleText)roleText.textContent=({admin:'管理者権限 (Admin)',sales:'営業権限 (Sales)',leader:'リーダー権限 (Leader)',employee:'一般社員権限 (Employee)'})[role]||role;}const userPanel=document.getElementById('user-management');if(userPanel)userPanel.style.display=role==='admin'?'block':'none';document.querySelectorAll('button[onclick="confirmResetData()"],button[onclick="openImportModal()"],button[onclick="exportDataJSON()"]').forEach(b=>b.style.display=role==='admin'?'':'none');}
    window.addDemoUser=function(e){e.preventDefault();if(currentSession?.role!=='admin'){alert('管理者のみ実行できます。');return;}const username=document.getElementById('new-user-id').value.trim();const name=document.getElementById('new-user-name').value.trim();const password=document.getElementById('new-user-password').value;const role=document.getElementById('new-user-role').value;if(!/^[a-zA-Z0-9._-]{3,32}$/.test(username)){alert('ユーザーIDは英数字と . _ - の3〜32文字で入力してください。');return;}const users=getDemoUsers();if(users.some(u=>u.username.toLowerCase()===username.toLowerCase())){alert('同じユーザーIDが既に存在します。');return;}users.push({username,password,name,role,active:true});saveDemoUsers(users);logAction('ユーザー追加',`${username} / ${role}`);document.getElementById('new-user-id').value='';document.getElementById('new-user-name').value='';document.getElementById('new-user-password').value='';renderUsers();};
    window.toggleDemoUser=function(username){if(currentSession?.role!=='admin')return;const users=getDemoUsers();const user=users.find(u=>u.username===username);if(!user||username==='admin'){alert('初期管理者アカウントは停止できません。');return;}user.active=user.active===false;saveDemoUsers(users);logAction('ユーザー状態変更',`${username} / ${user.active?'有効':'停止'}`);renderUsers();};
    window.resetDemoUserPassword=function(username){if(currentSession?.role!=='admin')return;const password=prompt(`${username} の新しいパスワード（8文字以上）を入力してください`);if(password===null)return;if(password.length<8){alert('パスワードは8文字以上にしてください。');return;}const users=getDemoUsers();const user=users.find(u=>u.username===username);if(!user)return;user.password=password;saveDemoUsers(users);logAction('パスワード再設定',username);alert('パスワードを更新しました。');};
    window.promptChangePassword=function(){if(!currentSession){alert('ログインしてください。');return;}const users=getDemoUsers();const user=users.find(u=>u.username===currentSession.username);const current=prompt('現在のパスワードを入力してください');if(current===null)return;if(!user||user.password!==current){alert('現在のパスワードが正しくありません。');return;}const next=prompt('新しいパスワードを入力してください（8文字以上）');if(next===null)return;if(next.length<8){alert('パスワードは8文字以上にしてください。');return;}user.password=next;saveDemoUsers(users);logAction('自分のパスワード変更',currentSession.username);alert('パスワードを変更しました。次回ログインから新しいパスワードを使用してください。');};
    window.changeDemoPassword=function(e){e.preventDefault();if(!currentSession){alert('ログインしてください。');return;}const current=document.getElementById('password-current').value;const next=document.getElementById('password-new').value;const users=getDemoUsers();const user=users.find(u=>u.username===currentSession.username);if(!user||user.password!==current){alert('現在のパスワードが正しくありません。');return;}if(next.length<8){alert('新しいパスワードは8文字以上にしてください。');return;}user.password=next;saveDemoUsers(users);document.getElementById('password-current').value='';document.getElementById('password-new').value='';logAction('自分のパスワード変更',currentSession.username);alert('パスワードを変更しました。次回ログインから新しいパスワードを使用してください。');};
    window.renderUsers=function(){const body=document.getElementById('users-table-body');if(!body)return;const roleNames={admin:'管理者',sales:'営業',leader:'リーダー',employee:'一般社員'};body.innerHTML=getDemoUsers().map(u=>`<tr><td>${safeText(u.username)}</td><td>${safeText(u.name)}</td><td>${roleNames[u.role]||safeText(u.role)}</td><td><span class="ext-pill ${u.active===false?'danger':'good'}">${u.active===false?'停止':'有効'}</span></td><td class="space-x-2"><button class="text-cyan-300" onclick="resetDemoUserPassword('${safeText(u.username)}')">PW再設定</button><button class="text-rose-300" onclick="toggleDemoUser('${safeText(u.username)}')">${u.active===false?'有効化':'停止'}</button></td></tr>`).join('');};
    window.restoreAutoBackup=function(){const backup=localStorage.getItem('ses_access_db_prebackup');if(!backup){alert('自動退避データがありません。');return;}if(!confirm('直前の保存前データに復元します。現在のデータは自動退避されます。続行しますか？'))return;try{const parsed=JSON.parse(backup);if(!parsed||!Array.isArray(parsed.clients)||!Array.isArray(parsed.projects)||!Array.isArray(parsed.members))throw new Error('バックアップ形式が不正です');const current=localStorage.getItem('ses_access_db');if(current)localStorage.setItem('ses_access_db_prebackup',current);db=parsed;ensureSchema();logAction('自動退避から復元','保存前のデータを復元');localStorage.setItem('ses_access_db',JSON.stringify(db));renderAllViews();alert('自動退避データを復元しました。');}catch(e){alert('復元に失敗しました：'+e.message);}};
    function parseCSV(text) {
        const rows=[];let row=[],cell='',quoted=false;const input=String(text||'').replace(/^\uFEFF/,'');
        for(let i=0;i<input.length;i++){const ch=input[i],next=input[i+1];if(ch==='"'&&quoted&&next==='"'){cell+='"';i++;}else if(ch==='"'){quoted=!quoted;}else if(ch===','&&!quoted){row.push(cell);cell='';}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&next==='\n')i++;row.push(cell);if(row.some(v=>v!==''))rows.push(row);row=[];cell='';}else cell+=ch;}
        if(cell!==''||row.length){row.push(cell);rows.push(row);}return rows;
    }
    window.importCSVFile=function(event){const file=event.target.files?.[0];if(!file)return;const type=document.getElementById('csv-import-type').value;const reader=new FileReader();reader.onload=()=>{try{const rows=parseCSV(reader.result);if(rows.length<2)throw new Error('CSVにデータ行がありません');const headers=rows[0].map(x=>x.trim());const records=rows.slice(1).filter(r=>r.some(v=>v.trim())).map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]||'').trim()])));const defs={clients:{id:'ID',name:'企業名',type:'区分',contact:'担当者',email:'メール',status:'ステータス'},projects:{id:'ID',title:'案件名',clientName:'顧客',price:'単価（万円）',skills:'スキル',location:'勤務地',status:'ステータス',startDate:'開始日',contractEnd:'契約終了日'},members:{id:'ID',name:'氏名',type:'区分',skills:'スキル',exp:'経験',rate:'売上単価（万円）',cost:'原価単価（万円）',status:'稼働状況',assignedProjectId:'参画案件ID',contractEnd:'契約終了日'},interviews:{id:'ID',memberId:'エンジニアID',memberName:'エンジニア',projectId:'案件ID',projectTitle:'案件',clientName:'顧客',date:'日時',location:'形式',status:'ステータス'},tasks:{id:'ID',title:'タスク',date:'期限',priority:'優先度',assignee:'担当者',status:'状態'}};const map=defs[type];if(!map)throw new Error('対象データが不正です');const converted=records.map(r=>{const o={};Object.entries(map).forEach(([key,label])=>{let v=r[label]||'';if(key==='skills')v=v.split(/[;,；]/).map(x=>x.trim()).filter(Boolean);if(['price','rate','cost'].includes(key))v=Number(v)||0;o[key]=v;});if(type==='projects'){const c=db.clients.find(x=>x.name===o.clientName);o.clientId=c?.id||o.clientId||'';o.startDate=o.startDate||'';o.assignedMemberIds=o.assignedMemberIds||[];}if(type==='members'){o.assignedProjectId=o.assignedProjectId||'';o.available=o.available||'未設定';}if(type==='tasks'){o.createdAt=today();}return o;});if(converted.some(r=>!r.id))throw new Error('ID列がありません。SES_Coreから出力したCSVを使用してください');if(!confirm(`${type} のCSV ${converted.length}件をID基準で追加・更新します。続行しますか？`))return;const list=db[type];let added=0,updated=0;converted.forEach(item=>{const index=list.findIndex(x=>String(x.id)===String(item.id));if(index>=0){list[index]={...list[index],...item};updated++;}else{list.push(item);added++;}});logAction('CSVインポート',`${type}: 追加${added}件 / 更新${updated}件`);saveStoredData();alert(`CSVを取り込みました。追加 ${added}件 / 更新 ${updated}件`);}catch(e){alert('CSVインポートに失敗しました：'+e.message);}finally{event.target.value='';}};reader.readAsText(file,'UTF-8');};
    window.exportCSV=function(type){ensureSchema();const maps={clients:{rows:db.clients,cols:[['ID','id'],['企業名','name'],['区分','type'],['担当者','contact'],['メール','email'],['ステータス','status']]},projects:{rows:db.projects,cols:[['ID','id'],['案件名','title'],['顧客','clientName'],['単価（万円）','price'],['スキル','skills'],['勤務地','location'],['ステータス','status'],['開始日','startDate'],['契約終了日','contractEnd']]},members:{rows:db.members,cols:[['ID','id'],['氏名','name'],['区分','type'],['スキル','skills'],['経験','exp'],['売上単価（万円）','rate'],['原価単価（万円）','cost'],['稼働状況','status'],['参画案件ID','assignedProjectId'],['契約終了日','contractEnd']]},interviews:{rows:db.interviews,cols:[['ID','id'],['エンジニアID','memberId'],['エンジニア','memberName'],['案件ID','projectId'],['案件','projectTitle'],['顧客','clientName'],['日時','date'],['形式','location'],['ステータス','status']]},tasks:{rows:db.tasks,cols:[['ID','id'],['タスク','title'],['期限','date'],['優先度','priority'],['担当者','assignee'],['状態','status']]}};const spec=maps[type];if(!spec)return;const quote=v=>'"'+String(Array.isArray(v)?v.join('; '):(v??'')).replace(/"/g,'""')+'"';const csv='\uFEFF'+[spec.cols.map(c=>quote(c[0])).join(','),...spec.rows.map(r=>spec.cols.map(c=>quote(r[c[1]])).join(','))].join('\r\n');downloadBlob(csv,`SES_Core_${type}_${today()}.csv`,'text/csv;charset=utf-8');logAction('CSV出力',type);};
    window.downloadAuditCSV=function(){ensureSchema();const rows=db.auditLog||[];const csv='\uFEFF'+[['日時','ユーザー','操作','詳細'].map(v=>'"'+v+'"').join(','),...rows.map(r=>[r.at,r.user,r.action,r.detail].map(v=>'"'+String(v||'').replace(/"/g,'""')+'"').join(','))].join('\r\n');downloadBlob(csv,`SES_Core_audit_${today()}.csv`,'text/csv;charset=utf-8');};
    window.clearAuditLog=function(){if(!confirm('操作履歴をすべて削除しますか？'))return;db.auditLog=[];localStorage.setItem('ses_access_audit','[]');renderAudit();};
    window.renderAudit=function(){const body=document.getElementById('audit-table-body');if(!body||typeof db === 'undefined')return;ensureSchema();const health=document.getElementById('data-health');if(health){const problems=[];for(const [label,list] of [['取引先',db.clients],['案件',db.projects],['エンジニア',db.members],['面談',db.interviews],['タスク',db.tasks]]){const ids=list.map(x=>String(x.id));if(new Set(ids).size!==ids.length)problems.push(`${label}のID重複`);}db.projects.forEach(p=>{if(p.clientId&&!db.clients.some(c=>c.id===p.clientId))problems.push(`案件 ${p.id} の取引先参照先が存在しません`);});db.members.forEach(m=>{if(m.assignedProjectId&&!db.projects.some(p=>p.id===m.assignedProjectId))problems.push(`エンジニア ${m.id} の参画案件参照先が存在しません`);});db.interviews.forEach(i=>{if(i.memberId&&!db.members.some(m=>m.id===i.memberId))problems.push(`面談 ${i.id} のエンジニア参照先が存在しません`);if(i.projectId&&!db.projects.some(p=>p.id===i.projectId))problems.push(`面談 ${i.id} の案件参照先が存在しません`);});health.innerHTML=`<div class="p-3 rounded-lg bg-slate-800/50">取引先：${db.clients.length}件 / 案件：${db.projects.length}件 / エンジニア：${db.members.length}名 / 面談：${db.interviews.length}件 / タスク：${db.tasks.length}件</div><div class="p-3 rounded-lg ${problems.length?'bg-rose-500/10 border border-rose-500/30':'bg-emerald-500/10 border border-emerald-500/30'}">データ整合性：${problems.length?`要確認 ${problems.length}件`:'問題は検出されませんでした'}${problems.length?'<ul class="list-disc pl-5 mt-2">'+problems.slice(0,10).map(x=>`<li>${safeText(x)}</li>`).join('')+'</ul>':''}</div><div class="p-3 rounded-lg bg-slate-800/50">最終確認：${new Date().toLocaleString('ja-JP')} / 自動退避データ：${localStorage.getItem('ses_access_db_prebackup')?'あり':'未作成'}</div>`;}body.innerHTML=(db.auditLog||[]).slice(0,100).map(r=>`<tr><td class="whitespace-nowrap">${safeText(r.at?new Date(r.at).toLocaleString('ja-JP'):'')}</td><td>${safeText(r.user)}</td><td>${safeText(r.action)}</td><td>${safeText(r.detail)}</td></tr>`).join('')||'<tr><td colspan="4" class="text-center text-slate-500 p-6">操作履歴はまだありません。</td></tr>';};
    window.logoutSES=function(){if(!confirm('ログアウトしますか？'))return;logAction('ログアウト','デモセッションを終了');currentSession=null;sessionStorage.removeItem('ses_core_session');document.getElementById('app-container').classList.add('opacity-0');document.getElementById('login-screen').style.display='flex';document.getElementById('login-screen').classList.remove('login-screen-exit');document.getElementById('opening-screen').style.display='none';document.getElementById('login-password').value='';document.getElementById('login-username').focus();};

    // Current assignment reference screen + grouped accordion navigation
    function renderCurrentAssignments(){
      const panel=document.getElementById('view-current-assignments'); if(!panel)return;
      const members=(db.members||[]).filter(m=>['稼働中','参画中','参画中（稼働中）'].includes(m.status));
      const esc=v=>String(v??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      panel.innerHTML=`<div class="p-6 space-y-5"><div class="flex flex-wrap items-center justify-between gap-3"><div><h2 class="text-2xl font-bold neon-heading">現在の参画状況</h2><p class="text-sm opacity-70 mt-1">現在、実際に案件へ参画しているメンバーの確認画面です。案件がない人・退場予定者向けの人材マッチングとは分けて管理します。</p></div><div class="px-4 py-2 rounded-xl border border-emerald-400/40 text-emerald-300">稼働中 ${members.length} 名</div></div><div class="glass-card rounded-xl overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left border-b border-white/10"><th class="p-3">メンバー</th><th class="p-3">参画案件</th><th class="p-3">取引先</th><th class="p-3">月額単価</th><th class="p-3">ステータス</th><th class="p-3">備考</th></tr></thead><tbody>${members.map(m=>{const pname=m.currentProject||m.projectName||m.projectTitle||m.assignment||m.project||'案件情報未登録';const proj=(db.projects||[]).find(p=>p.id===pname||p.title===pname);return `<tr class="border-b border-white/5 hover:bg-white/5"><td class="p-3 font-semibold">${esc(m.name||m.fullName||m.id)}</td><td class="p-3">${esc(proj?.title||pname)}</td><td class="p-3">${esc(proj?.clientName||m.clientName||'—')}</td><td class="p-3 text-emerald-300">${Number(m.rate||m.monthlyRate||0).toLocaleString('ja-JP')} 万円</td><td class="p-3"><span class="px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-300">${esc(m.status)}</span></td><td class="p-3">${esc(m.assignmentNote||m.note||'—')}</td></tr>`}).join('')||'<tr><td colspan="6" class="p-8 text-center opacity-60">稼働中のメンバーがいません。メンバー管理でステータスを確認してください。</td></tr>'}</tbody></table></div><p class="text-xs opacity-60">※参画案件の紐付け情報が登録されていない場合は「案件情報未登録」と表示されます。</p></div>`;
    }
    function setupGroupedNavigation(){
      const sidebar=document.querySelector('#sidebar > div.py-4'); if(!sidebar||sidebar.dataset.grouped==='1')return;
      const ids=['dashboard','clients','projects','members','interviews','revenue','matching','tasks','reports','spot-jobs','expenses','current-assignments'];
      const links=Array.from(sidebar.querySelectorAll('a.nav-item'));
      const groupDefs=[['概要',['dashboard']],['営業・案件管理',['clients','projects','matching']],['メンバー管理',['members','current-assignments','interviews']],['売上・経費',['revenue','spot-jobs','expenses']],['業務支援',['tasks','reports']]];
      const linkMap={}; links.forEach(a=>{const id=(a.id||'').replace('nav-','');if(id)linkMap[id]=a});
      // Keep any existing non-link header; move only known menu links into accordion groups.
      sidebar.innerHTML='';
      const titleRow=document.createElement('div');titleRow.className='sidebar-title-row flex items-center px-2 py-2 mb-2';
      const title=document.createElement('div');title.className='text-[11px] font-mono tracking-wider text-slate-400 uppercase sidebar-text';title.textContent='メニュー';
      titleRow.append(title);sidebar.appendChild(titleRow);
      const groupIcons={'概要':'fa-gauge-high','営業・案件管理':'fa-briefcase','メンバー管理':'fa-users','売上・経費':'fa-sack-dollar','業務支援':'fa-list-check'};
      groupDefs.forEach((g,idx)=>{const available=g[1].map(id=>linkMap[id]).filter(Boolean);if(!available.length)return;const wrap=document.createElement('section');wrap.className='menu-accordion-group mb-2';const btn=document.createElement('button');btn.type='button';btn.className='menu-accordion-toggle w-full flex items-center justify-between px-3 py-2 text-xs font-semibold tracking-wide opacity-75 hover:opacity-100';btn.title=g[0];btn.setAttribute('aria-label',g[0]);btn.innerHTML=`<span class="menu-group-label flex items-center gap-3"><i class="fa-solid ${groupIcons[g[0]]||'fa-folder'} menu-group-icon w-5 text-center text-base"></i><span class="sidebar-text">${g[0]}</span></span><i class="menu-chevron fa-solid fa-chevron-down transition-transform"></i>`;const body=document.createElement('div');body.className='menu-accordion-body space-y-1';if(idx!==0)body.classList.add('hidden');btn.setAttribute('aria-expanded',String(idx===0));body.classList.toggle('is-collapsed',idx!==0);btn.addEventListener('click',()=>{const collapsed=body.classList.toggle('is-collapsed');body.classList.toggle('hidden',collapsed);btn.setAttribute('aria-expanded',String(!collapsed));btn.querySelector('.menu-chevron').classList.toggle('rotate-180',!collapsed)});available.forEach(a=>{a.title=a.querySelector('.sidebar-text')?.textContent?.trim()||a.title||'';a.setAttribute('aria-label',a.title);body.appendChild(a)});wrap.append(btn,body);sidebar.appendChild(wrap)});
      sidebar.dataset.grouped='1';
    }
    const baseSwitchTab=window.switchTab;
    window.switchTab=function(tab){if(typeof baseSwitchTab==='function')baseSwitchTab(tab);if(tab==='current-assignments')renderCurrentAssignments();const link=document.getElementById('nav-'+tab);if(link){const group=link.closest('.menu-accordion-group');if(group){group.querySelector('.menu-accordion-body')?.classList.remove('hidden');group.querySelector('button i')?.classList.add('rotate-180')}}};
    document.addEventListener('DOMContentLoaded',()=>{
      const main=document.querySelector('main')||document.querySelector('#main-content')||document.querySelector('.flex-1.overflow-y-auto');
      if(main&&!document.getElementById('view-current-assignments')){const p=document.createElement('section');p.id='view-current-assignments';p.className='view-panel hidden h-full overflow-y-auto';main.appendChild(p)}
      // Insert a navigation entry before grouping existing navigation.
      const navRoot=document.querySelector('#sidebar > div.py-4');
      if(navRoot&&!document.getElementById('nav-current-assignments')){const a=document.createElement('a');a.href='#';a.id='nav-current-assignments';a.className='nav-item flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition space-x-3 text-slate-400 hover:text-white hover:bg-slate-800/50';a.innerHTML='<i class="fa-solid fa-user-check w-5 text-center text-base"></i><span class="sidebar-text">現在の参画状況</span>';a.onclick=e=>{e.preventDefault();window.switchTab('current-assignments')};navRoot.appendChild(a)}
      if(typeof renderAllViews==='function'){const old=window.renderAllViews;window.renderAllViews=function(){if(old)old();renderCurrentAssignments()};}
    });

    document.addEventListener('DOMContentLoaded',()=>{addStyles();injectUI();ensureSchema();const storedAudit=localStorage.getItem('ses_access_audit');if(storedAudit){try{db.auditLog=JSON.parse(storedAudit)}catch(e){}}renderAllViews();renderUsers();renderSpotJobs();renderExpenses();applyRolePermissions();setupGroupedNavigation();document.addEventListener('click',e=>{const wrap=document.querySelector('.global-search-wrap');if(wrap&&!wrap.contains(e.target))document.getElementById('global-search-results')?.classList.add('hidden');});});
})();
