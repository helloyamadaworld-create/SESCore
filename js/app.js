
        // Default System Database Preset (initialData.json)
        const DEFAULT_INITIAL_DATA = {
        "metadata": {
                "systemName": "SES_Core",
                "version": "3.0.0",
                "exportedAt": "2026-10-27T07:58:39.127Z",
                "schemaVersion": "3.0.0"
        },
        "clients": [
                {
                        "id": "CLI-001",
                        "name": "アクシス・ソリューションズ株式会社",
                        "type": "エンド企業",
                        "contact": "山田 太郎",
                        "email": "yamada@axis-sol.co.jp",
                        "activeProjects": 3,
                        "status": "アクティブ"
                },
                {
                        "id": "CLI-002",
                        "name": "株式会社ネクスト・イノベーション",
                        "type": "元請SES",
                        "contact": "佐藤 美咲",
                        "email": "sato@next-inno.jp",
                        "activeProjects": 2,
                        "status": "アクティブ"
                },
                {
                        "id": "CLI-003",
                        "name": "サイバー・テック株式会社",
                        "type": "エンド企業",
                        "contact": "高橋 健一",
                        "email": "takahashi@cybertech.com",
                        "activeProjects": 1,
                        "status": "アクティブ"
                },
                {
                        "id": "CLI-004",
                        "name": "グローバルシステムパートナーズ",
                        "type": "協力会社",
                        "contact": "鈴木 隆",
                        "email": "suzuki@gsp-net.jp",
                        "activeProjects": 0,
                        "status": "アクティブ"
                }
        ],
        "projects": [
                {
                        "contractEnd": "",
                        "startDate": "",
                        "assignedMemberIds": [],
                        "id": "PRJ-101",
                        "title": "大手ECサイト マイクロサービス刷新PJ",
                        "clientId": "CLI-001",
                        "clientName": "アクシス・ソリューションズ株式会社",
                        "price": 85,
                        "skills": [
                                "Java",
                                "Spring Boot",
                                "AWS",
                                "Docker"
                        ],
                        "location": "フルリモート",
                        "status": "提案公募中"
                },
                {
                        "contractEnd": "",
                        "startDate": "",
                        "assignedMemberIds": [],
                        "id": "PRJ-102",
                        "title": "次世代FinTechアプリ Frontend開発",
                        "clientId": "CLI-002",
                        "clientName": "株式会社ネクスト・イノベーション",
                        "price": 90,
                        "skills": [
                                "React",
                                "TypeScript",
                                "Next.js",
                                "Tailwind"
                        ],
                        "location": "ハイブリッド (週2-3出社)",
                        "status": "面談調整中"
                },
                {
                        "contractEnd": "",
                        "startDate": "",
                        "assignedMemberIds": [],
                        "id": "PRJ-103",
                        "title": "医療用クラウド基盤 構築・インフラ運用",
                        "clientId": "CLI-003",
                        "clientName": "サイバー・テック株式会社",
                        "price": 95,
                        "skills": [
                                "AWS",
                                "Terraform",
                                "Kubernetes",
                                "Python"
                        ],
                        "location": "常駐 (都内)",
                        "status": "提案公募中"
                },
                {
                        "contractEnd": "",
                        "startDate": "",
                        "assignedMemberIds": [],
                        "id": "PRJ-104",
                        "title": "AI搭載社内ナレッジ検索ツール構築",
                        "clientId": "CLI-001",
                        "clientName": "アクシス・ソリューションズ株式会社",
                        "price": 100,
                        "skills": [
                                "Python",
                                "FastAPI",
                                "OpenAI API",
                                "LangChain"
                        ],
                        "location": "フルリモート",
                        "status": "成約済み"
                },
                {
                        "contractEnd": "",
                        "startDate": "",
                        "assignedMemberIds": [],
                        "id": "PRJ-SENDAI-ASSIGNED-001",
                        "title": "仙台営業所 参画案件（詳細未登録）",
                        "clientId": "",
                        "clientName": "取引先未登録",
                        "price": 40,
                        "skills": [],
                        "location": "未登録",
                        "status": "成約済み",
                        "notes": "実案件の詳細未登録。仮登録データ。"
                }
        ],
        "members": [
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-101",
                        "name": "川合 要",
                        "type": "正社員",
                        "department": "営業",
                        "role": "所長代理",
                        "skills": [],
                        "exp": "2年",
                        "rate": 0,
                        "cost": 36,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-102",
                        "name": "山田 裕也",
                        "type": "正社員",
                        "department": "開発部門統括",
                        "role": "課長代理",
                        "skills": [],
                        "exp": "5年",
                        "rate": 51,
                        "cost": 49,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0,
                        "manages": [
                                "開発1部",
                                "開発2部",
                                "ITソリューション部"
                        ]
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-103",
                        "name": "伊藤 快成",
                        "type": "正社員",
                        "department": "開発1部",
                        "role": "リーダー",
                        "skills": [],
                        "exp": "1年",
                        "rate": 45,
                        "cost": 36,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-104",
                        "name": "佐々木 七海",
                        "type": "正社員",
                        "department": "開発1部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "2.5年",
                        "rate": 44,
                        "cost": 33,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-105",
                        "name": "小関 彩乃",
                        "type": "正社員",
                        "department": "開発1部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "1.5年",
                        "rate": 35,
                        "cost": 33,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-106",
                        "name": "曽根 美咲",
                        "type": "正社員",
                        "department": "開発1部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "1年",
                        "rate": 40,
                        "cost": 30,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-107",
                        "name": "久保 奈美礼",
                        "type": "正社員",
                        "department": "開発1部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "0.5年",
                        "rate": 10,
                        "cost": 33,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-108",
                        "name": "梶原 悠羽",
                        "type": "正社員",
                        "department": "開発2部",
                        "role": "リーダー",
                        "skills": [],
                        "exp": "2.5年",
                        "rate": 50,
                        "cost": 36,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-109",
                        "name": "生天目 慧海",
                        "type": "正社員",
                        "department": "開発2部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "10年",
                        "rate": 65,
                        "cost": 36,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-110",
                        "name": "内海 未奈子",
                        "type": "正社員",
                        "department": "開発2部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "2.5年",
                        "rate": 48,
                        "cost": 36,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-111",
                        "name": "高橋 響哉",
                        "type": "正社員",
                        "department": "開発2部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "3年",
                        "rate": 37,
                        "cost": 33,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-112",
                        "name": "澤村 吏久",
                        "type": "正社員",
                        "department": "開発2部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "1.5年",
                        "rate": 40,
                        "cost": 36,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-113",
                        "name": "正木 裕多竜",
                        "type": "正社員",
                        "department": "開発2部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "2年",
                        "rate": 35,
                        "cost": 33,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-114",
                        "name": "佐々木 翔平",
                        "type": "正社員",
                        "department": "ITソリューション部",
                        "role": "リーダー",
                        "skills": [],
                        "exp": "4年",
                        "rate": 41,
                        "cost": 40,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-115",
                        "name": "古山 淳詞",
                        "type": "正社員",
                        "department": "ITソリューション部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "2.5年",
                        "rate": 43,
                        "cost": 36,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-116",
                        "name": "稲毛 遼河",
                        "type": "正社員",
                        "department": "ITソリューション部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "2年",
                        "rate": 35,
                        "cost": 33,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-117",
                        "name": "鹿又 翔二朗",
                        "type": "正社員",
                        "department": "ITソリューション部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "2年",
                        "rate": 40,
                        "cost": 33,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-118",
                        "name": "遠藤 新太",
                        "type": "正社員",
                        "department": "ITソリューション部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "1.5年",
                        "rate": 35,
                        "cost": 33,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-119",
                        "name": "鈴木 裕斗",
                        "type": "正社員",
                        "department": "ITソリューション部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "1年",
                        "rate": 38,
                        "cost": 33,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                },
                {
                        "assignedProjectId": "PRJ-SENDAI-ASSIGNED-001",
                        "contractEnd": "",
                        "id": "MEM-120",
                        "name": "滝沢 陽",
                        "type": "正社員",
                        "department": "ITソリューション部",
                        "role": "メンバー",
                        "skills": [],
                        "exp": "1年",
                        "rate": 36,
                        "cost": 30,
                        "available": "未登録",
                        "status": "稼働中",
                        "currentProject": "仙台営業所 参画案件（詳細未登録）",
                        "transportCost": 0
                }
        ],
        "interviews": [
                {
                        "id": "INT-501",
                        "memberId": "MEM-002",
                        "memberName": "伊藤 結衣",
                        "projectId": "PRJ-102",
                        "projectTitle": "次世代FinTechアプリ Frontend開発",
                        "clientName": "株式会社ネクスト・イノベーション",
                        "date": "2026-10-28T14:00",
                        "location": "Google Meet",
                        "status": "予定調整済"
                },
                {
                        "id": "INT-502",
                        "memberId": "MEM-004",
                        "memberName": "中村 アレン",
                        "projectId": "PRJ-101",
                        "projectTitle": "大手ECサイト マイクロサービス刷新PJ",
                        "clientName": "アクシス・ソリューションズ株式会社",
                        "date": "2026-10-29T16:00",
                        "location": "Zoom",
                        "status": "予定調整済"
                }
        ],
        "tasks": [
                {
                        "status": "未着手",
                        "assignee": "管理者",
                        "createdAt": "2026-10-27",
                        "id": 2,
                        "title": "アクシス社提案案件 (PRJ-101) パートナー要員の追加提出",
                        "date": "2026-10-28",
                        "priority": "MEDIUM"
                },
                {
                        "status": "完了",
                        "assignee": "管理者",
                        "createdAt": "2026-10-27",
                        "id": "TSK-MVQ81KAY-NO0R",
                        "title": "木村 拓也：大手ECサイト マイクロサービス刷新PJ の提案可否確認",
                        "date": "2026-10-27",
                        "priority": "MEDIUM",
                        "completedAt": "2026-10-27"
                },
                {
                        "status": "未着手",
                        "assignee": "管理者",
                        "createdAt": "2026-10-27",
                        "id": "TSK-MVQ9EZCK-KB53",
                        "title": "木村 拓也：大手ECサイト マイクロサービス刷新PJ の提案可否確認",
                        "date": "2026-10-27",
                        "priority": "MEDIUM"
                },
                {
                        "status": "未着手",
                        "assignee": "管理者",
                        "createdAt": "2026-10-27",
                        "id": "TSK-MVQAJN5I-EIF9",
                        "title": "伊藤 結衣：AI搭載社内ナレッジ検索ツール構築 の提案可否確認",
                        "date": "2026-10-27",
                        "priority": "MEDIUM"
                }
        ],
        "auditLog": [],
        "monthlyRevenue": {
                "MEM-002|2026-01": 87,
                "MEM-002|2026-02": 87,
                "MEM-002|2026-03": 87,
                "MEM-002|2026-04": 87,
                "MEM-002|2026-05": 87,
                "MEM-002|2026-06": 87,
                "MEM-002|2026-07": 87,
                "MEM-002|2026-12": 87
        },
        "spotJobs": [],
        "expenses": [],
        "monthlyCost": {},
        "monthlyTransport": {},
        "monthlyRevenueActual": {},
        "monthlyCostActual": {},
        "monthlyTransportActual": {},
        "oneOnOnes": [],
        "feedbacks": []
};

        // Application Global State
        let db = JSON.parse(JSON.stringify(DEFAULT_INITIAL_DATA));
        let selectedImportFileContent = null;
        let revenueChart = null;
        let funnelChart = null;

        // Initialize App on DOM Loaded
        window.addEventListener('DOMContentLoaded', () => {
            loadStoredTheme();
            loadStoredData();
            initCharts();
            renderAllViews();
            initMatrixCanvas();
        });

        // ----------------------------------------------------
        // 0. LOGIN GATE
        // ----------------------------------------------------
        // Demo credentials for this standalone front-end build.
        // For production, authenticate on a server and never store credentials in client-side code.
        const LOGIN_USERNAME = 'admin';
        const LOGIN_PASSWORD = 'SESCore2026!';

        window.handleLogin = function handleLogin(event) {
            event.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;
            const error = document.getElementById('login-error');
            const loginScreen = document.getElementById('login-screen');
            const openingScreen = document.getElementById('opening-screen');

            if (username !== LOGIN_USERNAME || password !== LOGIN_PASSWORD) {
                error.classList.remove('hidden');
                document.getElementById('login-password').value = '';
                document.getElementById('login-password').focus();
                return;
            }

            error.classList.add('hidden');
            loginScreen.classList.add('login-screen-exit');
            setTimeout(() => {
                loginScreen.style.display = 'none';
                openingScreen.style.display = 'flex';
                startOpeningAnimation();
            }, 350);
        };

        window.togglePasswordVisibility = function togglePasswordVisibility() {
            const password = document.getElementById('login-password');
            const icon = document.getElementById('password-toggle-icon');
            const visible = password.type === 'password';
            password.type = visible ? 'text' : 'password';
            icon.className = visible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
        };

        // ----------------------------------------------------
        // 1. OPENING ANIMATION & MATRIX CANVAS LOGIC
        // ----------------------------------------------------
        let openingTimer = null;

        function startOpeningAnimation() {
            const logsContainer = document.getElementById('terminal-logs');
            const bar = document.getElementById('loader-bar');
            const percentText = document.getElementById('loader-percent');
            const statusText = document.getElementById('loader-status');

            const logMessages = [
                "[SYSTEM] Booting SES_Core Kernel v2.5...",
                "[DATABASE] Loading client & partner registries...",
                "[MATCHING] Indexing engineer skill profiles...",
                "[FINANCE] Calculating monthly revenue pipelines...",
                "[UI/UX] Applying theme configuration...",
                "[READY] SES_Core System fully initialized."
            ];

            let progress = 0;
            let logIndex = 0;

            openingTimer = setInterval(() => {
                progress += 2;
                if (progress > 100) progress = 100;

                bar.style.width = `${progress}%`;
                percentText.innerText = `${progress}%`;

                if (progress % 18 === 0 && logIndex < logMessages.length) {
                    const logElem = document.createElement('div');
                    logElem.innerText = logMessages[logIndex];
                    logsContainer.appendChild(logElem);
                    logsContainer.scrollTop = logsContainer.scrollHeight;
                    statusText.innerText = logMessages[logIndex].replace(/\[.*?\]\s*/, '');
                    logIndex++;
                }

                if (progress >= 100) {
                    clearInterval(openingTimer);
                    setTimeout(skipOpening, 600);
                }
            }, 100);
        }

        function skipOpening() {
            if (openingTimer) clearInterval(openingTimer);
            const openingScreen = document.getElementById('opening-screen');
            const appContainer = document.getElementById('app-container');

            openingScreen.classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => {
                openingScreen.style.display = 'none';
                openingScreen.classList.remove('opacity-0', 'pointer-events-none');
                appContainer.classList.remove('opacity-0');
            }, 600);
        }
        // The inline Skip button must be able to access the handler globally.
        window.skipOpening = skipOpening;

        // Matrix Grid Digital Rain Effect
        function initMatrixCanvas() {
            const canvas = document.getElementById('matrix-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const characters = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZSESACCESS';
            const fontSize = 12;
            const columns = Math.floor(canvas.width / fontSize);
            const drops = Array(columns).fill(1);

            function draw() {
                ctx.fillStyle = 'rgba(11, 15, 25, 0.1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = '#06B6D4';
                ctx.font = `${fontSize}px monospace`;

                for (let i = 0; i < drops.length; i++) {
                    const text = characters.charAt(Math.floor(Math.random() * characters.length));
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            }

            setInterval(draw, 40);
        }

        // ----------------------------------------------------
        // 2. THEME SWITCHING ENGINE
        // ----------------------------------------------------
        function setTheme(theme) {
            const body = document.body;
            const btnStandard = document.getElementById('theme-btn-standard');
            const btnNeon = document.getElementById('theme-btn-neon');

            if (theme === 'standard') {
                body.className = 'theme-standard h-screen flex flex-col overflow-hidden select-none';
                btnStandard.className = 'px-2.5 py-1 rounded-full text-xs font-medium transition bg-blue-600 text-white shadow-sm';
                btnNeon.className = 'px-2.5 py-1 rounded-full text-xs font-medium transition text-slate-400 hover:text-white';
            } else {
                body.className = 'theme-neon h-screen flex flex-col overflow-hidden select-none';
                btnNeon.className = 'px-2.5 py-1 rounded-full text-xs font-medium transition bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm';
                btnStandard.className = 'px-2.5 py-1 rounded-full text-xs font-medium transition text-slate-400 hover:text-white';
            }
            localStorage.setItem('ses_access_theme', theme);
            if (revenueChart && funnelChart) {
                initCharts(); // Refresh charts colors
            }
        }

        function loadStoredTheme() {
            const stored = localStorage.getItem('ses_access_theme') || 'neon';
            setTheme(stored);
        }

        // ----------------------------------------------------
        // 3. NAVIGATION & SIDEBAR TOGGLE
        // ----------------------------------------------------
        // PCではサイドバーをアイコン表示に折り畳み、モバイルでは mobile.js が開閉を処理する。
        function toggleSidebar() {
            if (window.matchMedia('(max-width: 760px)').matches) return;
            const app = document.getElementById('app-container');
            if (!app) return;
            app.classList.toggle('sidebar-collapsed');
            const collapsed = app.classList.contains('sidebar-collapsed');
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.querySelectorAll('.nav-item').forEach(item => {
                    const label = item.querySelector('.sidebar-text');
                    if (label && label.textContent.trim()) item.title = label.textContent.trim();
                });
                sidebar.querySelectorAll('.menu-accordion-toggle').forEach(item => {
                    const label = item.querySelector('.sidebar-text');
                    if (label && label.textContent.trim()) item.title = label.textContent.trim();
                });
            }
            const button = document.querySelector('#top-navbar button[onclick*="toggleSidebar"]');
            if (button) button.setAttribute('aria-expanded', String(!collapsed));
        }

        function switchTab(tabName) {
            document.querySelectorAll('.view-panel').forEach(panel => panel.classList.add('hidden'));
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('text-cyan-400', 'bg-cyan-500/10', 'border-l-4', 'border-cyan-400');
                item.classList.add('text-slate-400');
            });

            const activeView = document.getElementById(`view-${tabName}`);
            const activeNav = document.getElementById(`nav-${tabName}`);

            if (activeView) activeView.classList.remove('hidden');
            if (activeNav) {
                activeNav.classList.remove('text-slate-400');
                activeNav.classList.add('text-cyan-400', 'bg-cyan-500/10', 'border-l-4', 'border-cyan-400');
            }
        }

        // ----------------------------------------------------
        // 4. LOCALSTORAGE STATE MANAGEMENT
        // ----------------------------------------------------
        function saveStoredData() {
            localStorage.setItem('ses_access_db', JSON.stringify(db));
            renderAllViews();
        }

        function loadStoredData() {
            const stored = localStorage.getItem('ses_access_db');
            if (stored) {
                try {
                    db = JSON.parse(stored);
                } catch (e) {
                    db = JSON.parse(JSON.stringify(DEFAULT_INITIAL_DATA));
                }
            } else {
                db = JSON.parse(JSON.stringify(DEFAULT_INITIAL_DATA));
                try { localStorage.setItem('ses_access_db', JSON.stringify(db)); } catch (e) {}
            }
            // Ensure expected collections exist, without overwriting user-provided member statuses or rates.
            db.metadata = db.metadata || { systemName: 'SES_Core', version: '3.0.0', schemaVersion: '3.0.0' };
            ['clients','projects','members','interviews','tasks','auditLog','spotJobs','expenses','oneOnOnes','feedbacks'].forEach(key => {
                if (!Array.isArray(db[key])) db[key] = [];
            });
            ['monthlyRevenue','monthlyCost','monthlyTransport','monthlyRevenueActual','monthlyCostActual','monthlyTransportActual'].forEach(key => {
                if (!db[key] || typeof db[key] !== 'object' || Array.isArray(db[key])) db[key] = {};
            });
        }

        function confirmResetData() {
            if (confirm("すべてのデータを初期のサンプルデータにリセットしますか？この操作は取り消せません。")) {
                db = JSON.parse(JSON.stringify(DEFAULT_INITIAL_DATA));
                saveStoredData();
            }
        }

        // ----------------------------------------------------
        // 5. JSON IMPORT / EXPORT
        // ----------------------------------------------------
        function exportDataJSON() {
            db.metadata.exportedAt = new Date().toISOString();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `SES_Core_Backup_${new Date().toISOString().slice(0,10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        }

        function openImportModal() {
            selectedImportFileContent = null;
            document.getElementById('import-file-name').innerText = '';
            document.getElementById('modal-import').classList.remove('hidden');
        }

        function handleFileSelect(event) {
            const file = event.target.files[0];
            if (!file) return;

            document.getElementById('import-file-name').innerText = file.name;
            const reader = new FileReader();
            reader.onload = function(e) {
                selectedImportFileContent = e.target.result;
            };
            reader.readAsText(file);
        }

        function processJSONImport() {
            if (!selectedImportFileContent) {
                alert("インポートするJSONファイルを選択してください。");
                return;
            }

            try {
                const parsed = JSON.parse(selectedImportFileContent);
                if (!parsed.clients || !parsed.projects || !parsed.members) {
                    throw new Error("フォーマットが不正です。必要なフィールドが含まれていません。");
                }
                db = parsed;
                saveStoredData();
                closeModal('modal-import');
                alert("JSONデータの正常インポートが完了しました。");
            } catch (err) {
                alert("JSONファイルの解析エラー: " + err.message);
            }
        }

        // ----------------------------------------------------
        // 6. RENDER DATA & UI COMPONENTS
        // ----------------------------------------------------
        function renderAllViews() {
            renderDashboard();
            renderClientsTable();
            renderProjectsTable();
            renderMembersTable();
            renderInterviewsTable();
            renderRevenueView();
            updateModalDropdowns();
        }

        // --- DASHBOARD RENDER ---
        function renderDashboard() {
            const activeEng = db.members.filter(m => m.status === '稼働中').length;
            const benchEng = db.members.filter(m => m.status === '待机中' || m.status === '待機中').length;
            const totalEng = db.members.length;
            const activePrj = db.projects.filter(p => !['見送り','募集終了'].includes(p.status)).length;
            const totalCli = db.clients.filter(c => c.status === 'アクティブ').length;

            let totalRev = 0;
            let totalCost = 0;

            db.members.filter(m => m.status === '稼働中').forEach(m => {
                totalRev += (m.rate || 0);
                totalCost += (m.cost || 0);
            });

            const profit = totalRev - totalCost;
            const profitMargin = totalRev > 0 ? ((profit / totalRev) * 100).toFixed(1) : 0;
            const utilizationRate = totalEng > 0 ? ((activeEng / totalEng) * 100).toFixed(0) : 0;

            document.getElementById('kpi-active-engineers').innerText = `${activeEng}名`;
            document.getElementById('kpi-utilization-rate').innerText = `${utilizationRate}%`;
            document.getElementById('kpi-active-projects').innerText = `${activePrj}件`;
            document.getElementById('kpi-total-clients').innerText = `${totalCli}社`;
            document.getElementById('kpi-monthly-revenue').innerText = `¥${(totalRev / 100).toFixed(2)}M`;
            document.getElementById('kpi-monthly-profit').innerText = `¥${(profit / 100).toFixed(2)}M`;
            document.getElementById('kpi-profit-margin').innerText = `${profitMargin}%`;
            document.getElementById('kpi-target-rate').innerText = `${((totalRev / 500) * 100).toFixed(0)}%`; // Target 500万
            document.getElementById('kpi-bench-engineers').innerText = `${benchEng}名`;

            // Immediate Action Tasks
            const taskContainer = document.getElementById('dash-action-list');
            taskContainer.innerHTML = db.tasks.map(t => `
                <div class="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                    <div class="flex items-center space-x-2 min-w-0">
                        <span class="w-2 h-2 rounded-full ${t.priority === 'HIGH' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}"></span>
                        <span class="text-xs truncate text-slate-200">${t.title}</span>
                    </div>
                    <span class="text-[10px] font-mono text-slate-400">${t.date}</span>
                </div>
            `).join('');

            // Upcoming Interviews
            const intContainer = document.getElementById('dash-interviews-list');
            intContainer.innerHTML = db.interviews.map(i => `
                <div class="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                    <div>
                        <div class="text-xs font-bold text-cyan-400">${i.memberName} 氏 &#8594; ${i.clientName}</div>
                        <div class="text-[10px] text-slate-400">${i.projectTitle} (${i.location})</div>
                    </div>
                    <span class="text-xs font-mono px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 font-semibold">
                        ${i.date.replace('T', ' ')}
                    </span>
                </div>
            `).join('');
        }

        // --- CLIENTS TABLE ---
        function renderClientsTable() {
            const query = document.getElementById('client-search').value.toLowerCase();
            const tbody = document.getElementById('clients-table-body');

            const filtered = db.clients.filter(c => 
                c.name.toLowerCase().includes(query) || 
                c.contact.toLowerCase().includes(query)
            );

            tbody.innerHTML = filtered.map(c => `
                <tr class="hover:bg-slate-800/40 transition">
                    <td class="p-3 font-mono text-cyan-400">${c.id}</td>
                    <td class="p-3 font-bold text-slate-200">${c.name}</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300">${c.type}</span></td>
                    <td class="p-3">${c.contact}</td>
                    <td class="p-3 font-mono text-slate-400">${c.email}</td>
                    <td class="p-3 font-mono font-bold">${db.projects.filter(p => p.clientId === c.id && !['見送り','募集終了'].includes(p.status)).length}件</td>
                    <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] ${c.status === 'アクティブ' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'}">
                            ${c.status}
                        </span>
                    </td>
                    <td class="p-3 text-right space-x-2">
                        <button onclick="editClient('${c.id}')" class="text-cyan-400 hover:text-cyan-300"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteClient('${c.id}')" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }

        // --- PROJECTS TABLE ---
        let projectViewMode = '共有案件';
        window.setProjectViewMode = function(mode) {
            projectViewMode = mode === '参画案件' ? '参画案件' : '共有案件';
            const shared = document.getElementById('project-mode-shared');
            const assigned = document.getElementById('project-mode-assigned');
            if (shared) { shared.className = projectViewMode === '共有案件' ? 'px-3 py-2 text-xs bg-cyan-600 text-white' : 'px-3 py-2 text-xs bg-slate-800 text-slate-300'; }
            if (assigned) { assigned.className = projectViewMode === '参画案件' ? 'px-3 py-2 text-xs bg-cyan-600 text-white' : 'px-3 py-2 text-xs bg-slate-800 text-slate-300'; }
            renderProjectsTable();
        };
        function inferredProjectType(p) {
            if (p.projectType === '参画案件' || p.projectType === '共有案件') return p.projectType;
            const linked = (db.members || []).some(m => m.assignedProjectId === p.id || m.currentProject === p.title) || (p.assignedMemberIds || []).length > 0;
            return linked ? '参画案件' : '共有案件';
        }
        function renderProjectsTable() {
            const query = document.getElementById('project-search').value.toLowerCase();
            const statusFilter = document.getElementById('project-filter-status').value;
            const tbody = document.getElementById('projects-table-body');

            const filtered = db.projects.filter(p => {
                const title = String(p.title || '');
                const skills = Array.isArray(p.skills) ? p.skills : [];
                const matchQuery = title.toLowerCase().includes(query) || skills.some(s => String(s).toLowerCase().includes(query));
                const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
                const matchMode = inferredProjectType(p) === projectViewMode;
                return matchQuery && matchStatus && matchMode;
            });

            tbody.innerHTML = filtered.map(p => `
                <tr class="hover:bg-slate-800/40 transition">
                    <td class="p-3 font-mono text-cyan-400">${p.id}</td>
                    <td class="p-3 font-bold text-slate-200">${p.title}</td>
                    <td class="p-3 text-slate-300">${p.clientName || '取引先未登録'}</td>
                    <td class="p-3">
                        <div class="flex flex-wrap gap-1">
                            ${p.skills.map(s => `<span class="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">${s}</span>`).join('')}
                        </div>
                    </td>
                    <td class="p-3 font-mono font-bold text-amber-400">¥${p.price}万/月</td>
                    <td class="p-3 text-slate-400">${p.location}</td>
                    <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] ${p.status === '提案公募中' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : p.status === '成約済み' ? 'bg-emerald-500/10 text-emerald-400' : p.status === '見送り' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30' : p.status === '面談調整中' ? 'bg-amber-500/10 text-amber-300' : 'bg-slate-700 text-slate-300'}">
                            ${p.status || '未設定'}
                        </span>
                    </td>
                    <td class="p-3 text-right space-x-2">
                        <button onclick="editProject('${p.id}')" class="text-cyan-400 hover:text-cyan-300"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteProject('${p.id}')" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }

        // --- MEMBERS TABLE ---
        function renderMembersTable() {
            const query = document.getElementById('member-search').value.toLowerCase();
            const statusFilter = document.getElementById('member-filter-status').value;
            const tbody = document.getElementById('members-table-body');

            const filtered = db.members.filter(m => {
                const matchQuery = m.name.toLowerCase().includes(query) || m.skills.some(s => s.toLowerCase().includes(query));
                const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
                return matchQuery && matchStatus;
            });

            tbody.innerHTML = filtered.map(m => `
                <tr class="hover:bg-slate-800/40 transition">
                    <td class="p-3 font-mono text-cyan-400">${m.id}</td>
                    <td class="p-3 font-bold text-slate-200">
                        ${m.name} 
                        <span class="ml-1 text-[9px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-normal">${m.type}</span>
                    </td>
                    <td class="p-3 text-slate-300">${m.department || '未登録'}</td>
                    <td class="p-3 text-slate-300">${m.role || '未登録'}</td>
                    <td class="p-3">
                        <div class="flex flex-wrap gap-1">
                            ${m.skills.map(s => `<span class="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20">${s}</span>`).join('')}
                        </div>
                    </td>
                    <td class="p-3">${m.exp}</td>
                    <td class="p-3 font-mono">¥${m.rate}万 (原価: ¥${m.cost}万)</td>
                    <td class="p-3 font-mono text-slate-300">${m.available}</td>
                    <td class="p-3">
                        <div class="flex flex-col items-start gap-1">
                            <span class="text-[9px] text-slate-500">現在</span>
                            <span class="px-2 py-0.5 rounded text-[10px] ${m.status === '稼働中' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : m.status === '待機中' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-400'}">${m.status}</span>
                            <span class="text-[9px] text-slate-500 mt-1">来月以降</span>
                            <span class="px-2 py-0.5 rounded text-[10px] ${(m.nextMonthStatus || m.status) === '稼働中' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : (m.nextMonthStatus || m.status) === '待機中' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-400'}">${m.nextMonthStatus || m.status}</span>
                        </div>
                    </td>
                    <td class="p-3 text-right space-x-2">
                        <button onclick="editMember('${m.id}')" class="text-cyan-400 hover:text-cyan-300"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteMember('${m.id}')" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }

        // --- INTERVIEWS TABLE ---
        function renderInterviewsTable() {
            const tbody = document.getElementById('interviews-table-body');

            tbody.innerHTML = db.interviews.map(i => `
                <tr class="hover:bg-slate-800/40 transition">
                    <td class="p-3 font-mono text-cyan-400 font-bold">${i.date.replace('T', ' ')}</td>
                    <td class="p-3 font-bold text-slate-200">${i.memberName}</td>
                    <td class="p-3">${i.projectTitle}</td>
                    <td class="p-3">${i.clientName}</td>
                    <td class="p-3 text-slate-400">${i.location}</td>
                    <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            ${i.status}
                        </span>
                    </td>
                    <td class="p-3 text-right">
                        <button onclick="deleteInterview('${i.id}')" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }

        // --- REVENUE VIEW ---
        function renderRevenueView() {
            const tbody = document.getElementById('revenue-table-body');
            const activeMembers = db.members.filter(m => m.status === '稼働中');

            let totalRev = 0;
            let totalCost = 0;

            tbody.innerHTML = activeMembers.map(m => {
                const assignedPrj = db.projects[0]; // Example fallback link
                const margin = m.rate - m.cost;
                const marginRate = m.rate > 0 ? ((margin / m.rate) * 100).toFixed(1) : 0;

                totalRev += m.rate;
                totalCost += m.cost;

                return `
                    <tr class="hover:bg-slate-800/40 transition">
                        <td class="p-3 font-bold text-slate-200">${m.name}</td>
                        <td class="p-3 text-slate-300">${assignedPrj ? assignedPrj.title : '未紐付け'}</td>
                        <td class="p-3 text-slate-400">${assignedPrj ? assignedPrj.clientName : '-'}</td>
                        <td class="p-3 font-mono font-bold text-emerald-400">¥${m.rate}0,000</td>
                        <td class="p-3 font-mono text-slate-300">¥${m.cost}0,000</td>
                        <td class="p-3 font-mono font-bold text-purple-400">¥${margin}0,000</td>
                        <td class="p-3 font-mono">${marginRate}%</td>
                    </tr>
                `;
            }).join('');

            const totalProfit = totalRev - totalCost;
            const avgMargin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : 0;

            document.getElementById('rev-summary-count').innerText = `${activeMembers.length}名`;
            document.getElementById('rev-summary-total').innerText = `¥${totalRev}0,000`;
            document.getElementById('rev-summary-cost').innerText = `¥${totalCost}0,000`;
            document.getElementById('rev-summary-margin').innerText = `${avgMargin}%`;
        }

        // ----------------------------------------------------
        // 7. MODAL ACTIONS & CRUD HANDLERS
        // ----------------------------------------------------
        function closeModal(id) {
            document.getElementById(id).classList.add('hidden');
        }

        function updateModalDropdowns() {
            const prjClient = document.getElementById('project-client');
            if (prjClient) {
                prjClient.innerHTML = db.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            }

            const intMember = document.getElementById('interview-member');
            if (intMember) {
                intMember.innerHTML = db.members.map(m => `<option value="${m.id}">${m.name} (${m.skills[0] || ''})</option>`).join('');
            }

            const intProject = document.getElementById('interview-project');
            if (intProject) {
                intProject.innerHTML = db.projects.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
            }
        }

        // --- CLIENT CRUD ---
        function openClientModal() {
            document.getElementById('form-client').reset();
            document.getElementById('client-id').value = '';
            document.getElementById('modal-client-title').innerText = '新規取引先追加';
            document.getElementById('modal-client').classList.remove('hidden');
        }

        function editClient(id) {
            const client = db.clients.find(c => c.id === id);
            if (!client) return;
            document.getElementById('client-id').value = client.id;
            document.getElementById('client-name').value = client.name;
            document.getElementById('client-type').value = client.type;
            document.getElementById('client-contact').value = client.contact;
            document.getElementById('client-email').value = client.email;
            document.getElementById('client-status').value = client.status;
            document.getElementById('modal-client-title').innerText = '取引先編集';
            document.getElementById('modal-client').classList.remove('hidden');
        }

        function saveClient(e) {
            e.preventDefault();
            const id = document.getElementById('client-id').value;
            const name = document.getElementById('client-name').value;
            const type = document.getElementById('client-type').value;
            const contact = document.getElementById('client-contact').value;
            const email = document.getElementById('client-email').value;
            const status = document.getElementById('client-status').value;

            if (id) {
                const index = db.clients.findIndex(c => c.id === id);
                if (index !== -1) db.clients[index] = { ...db.clients[index], name, type, contact, email, status };
            } else {
                const newId = `CLI-${String(db.clients.length + 1).padStart(3, '0')}`;
                db.clients.push({ id: newId, name, type, contact, email, activeProjects: 0, status });
            }

            saveStoredData();
            closeModal('modal-client');
        }

        function deleteClient(id) {
            if (confirm("この取引先を削除しますか？")) {
                db.clients = db.clients.filter(c => c.id !== id);
                saveStoredData();
            }
        }

        // --- PROJECT CRUD ---
        function openProjectModal() {
            document.getElementById('form-project').reset();
            document.getElementById('project-id').value = '';
            document.getElementById('modal-project-title').innerText = '新規案件登録';
            const projectTypeInput = document.getElementById('project-type');
            if (projectTypeInput) projectTypeInput.value = projectViewMode;
            document.getElementById('modal-project').classList.remove('hidden');
        }

        function editProject(id) {
            const prj = db.projects.find(p => p.id === id);
            if (!prj) return;
            document.getElementById('project-id').value = prj.id;
            document.getElementById('project-title').value = prj.title;
            document.getElementById('project-client').value = prj.clientId;
            document.getElementById('project-price').value = prj.price;
            document.getElementById('project-skills').value = prj.skills.join(', ');
            document.getElementById('project-location').value = prj.location;
            document.getElementById('project-status').value = prj.status;
            const projectTypeInput = document.getElementById('project-type');
            if (projectTypeInput) projectTypeInput.value = inferredProjectType(prj);
            document.getElementById('modal-project-title').innerText = '案件情報編集';
            document.getElementById('modal-project').classList.remove('hidden');
        }

        function saveProject(e) {
            e.preventDefault();
            const id = document.getElementById('project-id').value;
            const title = document.getElementById('project-title').value;
            const clientId = document.getElementById('project-client').value;
            const clientObj = db.clients.find(c => c.id === clientId);
            const clientName = clientObj ? clientObj.name : '不明クライアント';
            const price = Number(document.getElementById('project-price').value) || 0;
            const skills = document.getElementById('project-skills').value.split(',').map(s => s.trim()).filter(s => s);
            const location = document.getElementById('project-location').value;
            const status = document.getElementById('project-status').value;
            const projectType = document.getElementById('project-type')?.value || projectViewMode || '共有案件';

            if (id) {
                const index = db.projects.findIndex(p => p.id === id);
                if (index !== -1) db.projects[index] = { ...db.projects[index], title, clientId, clientName, price, skills, location, status, projectType };
            } else {
                const newId = `PRJ-${String(db.projects.length + 101)}`;
                db.projects.push({ id: newId, title, clientId, clientName, price, skills, location, status, projectType, assignedMemberIds: [] });
            }

            saveStoredData();
            closeModal('modal-project');
        }

        function deleteProject(id) {
            if (confirm("この案件を削除しますか？")) {
                db.projects = db.projects.filter(p => p.id !== id);
                saveStoredData();
            }
        }

        // --- MEMBER CRUD ---
        function openMemberModal() {
            document.getElementById('form-member').reset();
            document.getElementById('member-id').value = '';
            document.getElementById('modal-member-title').innerText = '新規エンジニア登録';
            document.getElementById('modal-member').classList.remove('hidden');
        }

        function editMember(id) {
            const m = db.members.find(item => item.id === id);
            if (!m) return;
            document.getElementById('member-id').value = m.id;
            document.getElementById('member-name').value = m.name;
            document.getElementById('member-type').value = m.type;
            document.getElementById('member-skills').value = m.skills.join(', ');
            document.getElementById('member-exp').value = m.exp;
            document.getElementById('member-rate').value = m.rate;
            document.getElementById('member-cost').value = m.cost;
            document.getElementById('member-available').value = m.available;
            document.getElementById('member-status').value = m.status;
            document.getElementById('modal-member-title').innerText = 'エンジニア情報編集';
            document.getElementById('modal-member').classList.remove('hidden');
        }

        function saveMember(e) {
            e.preventDefault();
            const id = document.getElementById('member-id').value;
            const name = document.getElementById('member-name').value;
            const type = document.getElementById('member-type').value;
            const skills = document.getElementById('member-skills').value.split(',').map(s => s.trim()).filter(s => s);
            const exp = document.getElementById('member-exp').value;
            const rate = Number(document.getElementById('member-rate').value) || 0;
            const cost = Number(document.getElementById('member-cost').value) || 0;
            const available = document.getElementById('member-available').value;
            const status = document.getElementById('member-status').value;

            if (id) {
                const index = db.members.findIndex(m => m.id === id);
                if (index !== -1) db.members[index] = { ...db.members[index], name, type, skills, exp, rate, cost, available, status };
            } else {
                const newId = `MEM-${String(db.members.length + 1).padStart(3, '0')}`;
                db.members.push({ id: newId, name, type, skills, exp, rate, cost, available, status });
            }

            saveStoredData();
            closeModal('modal-member');
        }

        function deleteMember(id) {
            if (confirm("この要員情報を削除しますか？")) {
                db.members = db.members.filter(m => m.id !== id);
                saveStoredData();
            }
        }

        // --- INTERVIEW CRUD ---
        function openInterviewModal() {
            document.getElementById('form-interview').reset();
            document.getElementById('modal-interview').classList.remove('hidden');
        }

        function saveInterview(e) {
            e.preventDefault();
            const memberId = document.getElementById('interview-member').value;
            const projectId = document.getElementById('interview-project').value;
            const date = document.getElementById('interview-date').value;
            const location = document.getElementById('interview-location').value;
            const status = document.getElementById('interview-status').value;

            const member = db.members.find(m => m.id === memberId);
            const project = db.projects.find(p => p.id === projectId);

            const newId = `INT-${String(db.interviews.length + 501)}`;
            db.interviews.push({
                id: newId,
                memberId,
                memberName: member ? member.name : '要員',
                projectId,
                projectTitle: project ? project.title : '案件',
                clientName: project ? project.clientName : 'クライアント',
                date,
                location,
                status
            });

            saveStoredData();
            closeModal('modal-interview');
        }

        function deleteInterview(id) {
            if (confirm("この面談履歴を削除しますか？")) {
                db.interviews = db.interviews.filter(i => i.id !== id);
                saveStoredData();
            }
        }

        // ----------------------------------------------------
        // 8. CHART.JS INITIALIZATION & UPDATES
        // ----------------------------------------------------
        function initCharts() {
            const isNeon = document.body.classList.contains('theme-neon');
            const textColor = isNeon ? '#94A3B8' : '#64748B';
            const gridColor = isNeon ? 'rgba(255,255,255,0.05)' : '#E2E8F0';

            // Revenue Trend Chart
            const ctxRev = document.getElementById('chart-revenue-trend');
            if (ctxRev) {
                if (revenueChart) revenueChart.destroy();
                revenueChart = new Chart(ctxRev, {
                    type: 'bar',
                    data: {
                        labels: ['5月', '6月', '7月', '8月', '9月', '10月 (見込)'],
                        datasets: [
                            {
                                label: '売上高 (万円)',
                                data: [380, 420, 450, 480, 510, 540],
                                backgroundColor: isNeon ? 'rgba(6, 182, 212, 0.7)' : '#2563EB',
                                borderRadius: 6
                            },
                            {
                                label: '粗利益 (万円)',
                                data: [110, 125, 135, 140, 150, 160],
                                backgroundColor: isNeon ? 'rgba(139, 92, 246, 0.7)' : '#9333EA',
                                borderRadius: 6
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { labels: { color: textColor, font: { size: 11 } } }
                        },
                        scales: {
                            x: { ticks: { color: textColor }, grid: { color: gridColor } },
                            y: { ticks: { color: textColor }, grid: { color: gridColor } }
                        }
                    }
                });
            }

            // Pipeline Funnel Chart
            const ctxFunnel = document.getElementById('chart-pipeline-funnel');
            if (ctxFunnel) {
                if (funnelChart) funnelChart.destroy();
                funnelChart = new Chart(ctxFunnel, {
                    type: 'doughnut',
                    data: {
                        labels: ['提案公募', '社内選考', '面談調整', '成約・参画'],
                        datasets: [{
                            data: [12, 5, 3, 8],
                            backgroundColor: [
                                '#06B6D4',
                                '#3B82F6',
                                '#8B5CF6',
                                '#10B981'
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom', labels: { color: textColor, font: { size: 10 } } }
                        },
                        cutout: '65%'
                    }
                });
            }
        }
    