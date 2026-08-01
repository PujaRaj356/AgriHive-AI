function LoginModal({ onLogin, onClose, lang }) {
  const t = (key) => getTranslation(lang, key);
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", fullName: "", role: "farmer" });

  const submit = (e) => {
    e.preventDefault();
    const user = {
      id: Date.now(),
      name: form.fullName || form.username || "Ramesh Kumar",
      email: form.username.includes("@") ? form.username : `${form.username || "user"}@agrihive.in`,
      role: form.role,
      farmId: form.role === "admin" ? null : 1
    };
    onLogin(user);
  };

  const loginDemo = (role) => {
    if (role === "admin") {
      onLogin({ id: "admin_1", name: "Dr. S. Anbarasan", email: "anbarasan@agrihive.in", role: "admin", farmId: 2 });
    } else {
      onLogin({ id: "farmer_1", name: "Ramesh Kumar", email: "ramesh@agrihive.in", role: "farmer", farmId: 1 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-sand-200 w-full max-w-md p-6 space-y-5 relative">
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-ink-950/40 hover:text-ink-950 hover:bg-sand-100 transition-colors">
            <IconX className="w-5 h-5" />
          </button>
        )}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-leaf-600 text-white flex items-center justify-center mx-auto shadow-md">
            <IconSprout className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-ink-950 mt-2">{t("loginTitle")}</h2>
          <p className="text-xs text-ink-950/50 leading-relaxed">{t("loginSub")}</p>
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="text-xs font-bold text-ink-950">{t("fullName")}</label>
              <input required className={inputCls + " mt-1"} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Ramesh Kumar" />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-ink-950">{t("username")}</label>
            <input required className={inputCls + " mt-1"} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="ramesh@agrihive.in" />
          </div>

          <div>
            <label className="text-xs font-bold text-ink-950">{t("password")}</label>
            <input required type="password" className={inputCls + " mt-1"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>

          <div>
            <label className="text-xs font-bold text-ink-950">{t("selectRole")}</label>
            <select className={inputCls + " mt-1"} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="farmer">👨‍🌾 {t("roleFarmer")}</option>
              <option value="admin">🌾 {t("roleAdmin")}</option>
            </select>
          </div>

          <button type="submit" className="w-full py-2.5 bg-leaf-600 hover:bg-leaf-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors">
            {isRegister ? t("createAccountBtn") : t("signIn")}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-sand-100 space-y-2">
          <button onClick={() => setIsRegister(!isRegister)} className="text-xs font-bold text-leaf-700 hover:underline">
            {isRegister ? t("alreadyHaveAccount") : t("noAccountYet")}
          </button>

          <div className="pt-2 space-y-1.5">
            <p className="text-[11px] font-bold text-ink-950/40">{t("quickDemoLogin")}</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => loginDemo("farmer")} className="py-1.5 px-2 bg-sand-100 hover:bg-sand-200 text-ink-950 text-[11px] font-bold rounded-lg transition-colors truncate">
                {t("loginAsFarmer")}
              </button>
              <button type="button" onClick={() => loginDemo("admin")} className="py-1.5 px-2 bg-leaf-100 hover:bg-leaf-200 text-leaf-800 text-[11px] font-bold rounded-lg transition-colors truncate">
                {t("loginAsAdmin")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= App shell =================
function App() {
  const [apiBase, setApiBase] = useState(DEFAULT_API);
  const [connected, setConnected] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");

  // User Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("agri_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("agri_user", JSON.stringify(user));
    setShowLoginModal(false);
    
    // Assign unique distinct farmId per user so analytics are unique
    let assignedId = 1;
    if (user.role === "admin") assignedId = 2;
    else if (user.name.includes("Priya")) assignedId = 3;
    else if (user.name.includes("Murugan")) assignedId = 2;
    else if (user.id && typeof user.id === "number") assignedId = (user.id % Math.max(1, farms.length)) + 1;
    
    setSelectedFarmId(assignedId);
    notify(`Welcome ${user.name}! Switched to assigned farm analysis.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("agri_user");
    notify("Logged out successfully");
    setShowLoginModal(true);
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("agri_lang", newLang);
  };

  const t = (key) => getTranslation(lang, key);

  const api = useApi(apiBase);
  const notify = (msg, type = "ok") => {
    setToast({ msg, type });
    window.clearTimeout(window.__t);
    window.__t = window.setTimeout(() => setToast(null), 4500);
  };

  const refreshFarms = useCallback(async () => {
    try {
      const data = await api("/farms");
      setFarms(data);
      setConnected(true);
      if (!selectedFarmId && data.length) setSelectedFarmId(data[0].id);
    } catch (err) {
      setConnected(false);
    }
  }, [api, selectedFarmId]);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await api("/alerts/");
      setAlerts(data);
    } catch (err) {
      console.error("Alerts fetch error:", err);
    }
  }, [api]);

  useEffect(() => {
    refreshFarms();
    loadAlerts();
  }, [refreshFarms, loadAlerts]);

  const [nowStr, setNowStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const formatted = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }) + ", " + d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
      setNowStr(formatted);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const nav = [
    { key: "dashboard", label: t("nav_dashboard"), icon: IconGrid },
    { key: "regional_map", label: t("nav_regional_map"), icon: IconMap },
    { key: "digital_twin", label: t("nav_digital_twin"), icon: IconSliders },
    { key: "analytics", label: t("nav_analytics"), icon: IconBarChart },
    { key: "farm_network", label: t("nav_farm_network"), icon: IconNetwork },
    { key: "recommendations", label: t("nav_recommendations"), icon: IconShield },
    { key: "ingestion", label: t("nav_ingestion"), icon: IconCloud },
    { key: "registry", label: t("nav_registry"), icon: IconLayers },
    { key: "selection", label: t("nav_selection"), icon: IconFilter },
    { key: "help", label: t("nav_help"), icon: IconHelp },
    { key: "login", label: t("nav_login"), icon: IconLock },
  ];

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || farms[0] || { id: 1, name: "Farm A" };

  return (
    <div className="min-h-screen flex bg-sand-50">
      {/* Login Screen for unauthenticated users or when Login item clicked */}
      {(!currentUser || showLoginModal) && (
        <LoginModal
          onLogin={handleLogin}
          onClose={currentUser ? () => setShowLoginModal(false) : null}
          lang={lang}
        />
      )}

      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-ink-950 text-white flex flex-col justify-between">
        <div>
          {/* Logo Header */}
          <div className="px-5 py-5 flex items-center gap-2.5 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-leaf-600 flex items-center justify-center text-white">
              <IconSprout className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-[15px] leading-tight text-white">{t("appTitle")}</p>
              <p className="text-[11px] text-white/40 -mt-0.5 truncate max-w-[150px]">{t("tagline")}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="py-4 px-3 space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto">
            {nav.map((n) => (
              <button
                key={n.key}
                onClick={() => {
                  if (n.key === "login") {
                    setShowLoginModal(true);
                  } else {
                    setTab(n.key);
                  }
                }}
                className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-colors ${tab === n.key && n.key !== "login" ? "active bg-leaf-600/30 text-white font-black" : ""}`}
              >
                <n.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{n.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Card */}
        <div className="p-3 border-t border-white/10">
          {currentUser && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-leaf-600 text-white flex items-center justify-center text-xs font-extrabold shrink-0">
                  {currentUser.role === "admin" ? "🌾" : "👨‍🌾"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-extrabold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-leaf-400 truncate font-semibold">
                    {currentUser.role === "admin" ? t("roleAdmin") : t("roleFarmer")}
                  </p>
                </div>
              </div>

              {/* Clean Logout Button */}
              <button
                onClick={handleLogout}
                className="px-2 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-[10px] font-extrabold transition-colors shrink-0"
                title={t("logout")}
              >
                {t("logout")}
              </button>
            </div>
          )}

          <button
            onClick={() => setShowSettings((s) => !s)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-left"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${connected === null ? "bg-white/20" : connected ? "bg-leaf-500" : "bg-rose-500"}`}></span>
            <span className="text-[11px] text-white/50 flex-1 truncate">{connected ? "Backend Live" : "Disconnected"}</span>
            <IconChevron className={`w-3.5 h-3.5 text-white/30 transition-transform ${showSettings ? "rotate-90" : ""}`} />
          </button>
          {showSettings && (
            <div className="px-2 pb-2 pt-1 space-y-2">
              <input
                className="w-full text-[11px] font-mono bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white placeholder-white/30"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                onBlur={refreshFarms}
              />
              <button onClick={refreshFarms} className="w-full text-[11px] font-bold bg-white/10 hover:bg-white/15 rounded-lg py-1">
                {t("reconnect")}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="px-8 py-4 border-b border-sand-200 bg-white/80 backdrop-blur sticky top-0 z-20 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-ink-950 truncate">{nav.find((n) => n.key === tab)?.label}</h1>
            <p className="text-xs text-ink-950/45 truncate">
              {t("sub_" + tab)}
            </p>
          </div>

          <div className="flex items-center gap-3 relative shrink-0">
            {/* Multi-Language Selector Pill */}
            <div className="flex items-center bg-sand-100 p-1 rounded-xl border border-sand-200 shadow-sm text-xs font-bold">
              <button
                onClick={() => changeLanguage("en")}
                className={`px-2.5 py-1 rounded-lg transition-all ${lang === "en" ? "bg-leaf-600 text-white font-extrabold shadow-sm" : "text-ink-950/60 hover:text-ink-950"}`}
                title="English"
              >
                🇬🇧 EN
              </button>
              <button
                onClick={() => changeLanguage("ta")}
                className={`px-2.5 py-1 rounded-lg transition-all ${lang === "ta" ? "bg-leaf-600 text-white font-extrabold shadow-sm" : "text-ink-950/60 hover:text-ink-950"}`}
                title="தமிழ் (Tamil)"
              >
                🇮🇳 தமிழ்
              </button>
              <button
                onClick={() => changeLanguage("hi")}
                className={`px-2.5 py-1 rounded-lg transition-all ${lang === "hi" ? "bg-leaf-600 text-white font-extrabold shadow-sm" : "text-ink-950/60 hover:text-ink-950"}`}
                title="हिंदी (Hindi)"
              >
                🇮🇳 हिंदी
              </button>
            </div>

            {/* Live Ticking Clock */}
            <span className="text-xs font-semibold text-ink-950/70 font-mono flex items-center gap-2 bg-sand-100/70 px-3 py-1.5 rounded-xl border border-sand-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-leaf-500 animate-pulse"></span>
              {nowStr}
            </span>

            {/* Top Right Bell Icon */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAlertsDropdown((s) => !s);
                  if (!showAlertsDropdown) loadAlerts();
                }}
                className="relative p-2 rounded-xl hover:bg-sand-100 text-ink-950/60 transition-colors"
                title="View Notifications & Risk Alerts"
              >
                <IconBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-white"></span>
              </button>

              {/* Alerts Dropdown Panel */}
              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-sand-200 p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-sand-100 pb-2">
                    <h3 className="text-xs font-extrabold text-ink-950 uppercase tracking-wider">Risk Alerts & Notifications</h3>
                    <button onClick={() => setShowAlertsDropdown(false)} className="text-ink-950/40 hover:text-ink-950">
                      <IconX className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                    {alerts.map((a) => (
                      <div key={a.id} className="p-3 rounded-xl bg-sand-50 border border-sand-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${a.level === "high" ? "bg-rose-600 text-white" : "bg-amber-500 text-white"}`}>
                            {a.category}
                          </span>
                          <span className="text-[10px] text-ink-950/40">{a.time_ago}</span>
                        </div>
                        <p className="text-xs font-bold text-ink-950">{a.title}</p>
                      </div>
                    ))}
                    {!alerts.length && (
                      <div className="text-xs text-ink-950/50 italic py-4 text-center">No unread alerts</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Clean Logged In User Avatar & Logout */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-sand-100/70 p-1.5 rounded-xl border border-sand-200">
                <div className="w-7 h-7 rounded-full bg-ink-950 text-white flex items-center justify-center text-xs font-extrabold">
                  {currentUser.role === "admin" ? "🌾" : "👨‍🌾"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-extrabold text-ink-950 leading-tight">{currentUser.name}</p>
                  <p className="text-[9px] text-leaf-700 font-bold uppercase">{currentUser.role === "admin" ? t("roleAdmin") : t("roleFarmer")}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-extrabold transition-colors shadow-sm ml-1"
                  title={t("logout")}
                >
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Body Container */}
        <main className="flex-1 px-8 py-6">
          {connected === false && (
            <div className="mb-5 bg-rose-100 text-rose-600 text-xs font-bold rounded-xl px-4 py-3 border border-rose-200">
              Can't reach the backend server at {apiBase}. Make sure `uvicorn app.main:app` is running.
            </div>
          )}

          {tab === "dashboard" && <DashboardTab api={api} notify={notify} farms={farms} goTo={setTab} selectedFarmId={selectedFarmId} lang={lang} currentUser={currentUser} />}
          {tab === "regional_map" && <RegionalMapTab api={api} notify={notify} farms={farms} selectedFarmId={selectedFarmId} setSelectedFarmId={setSelectedFarmId} goTo={setTab} lang={lang} />}
          {tab === "digital_twin" && <DigitalTwinTab api={api} notify={notify} farms={farms} selectedFarmId={selectedFarmId} lang={lang} />}
          {tab === "analytics" && <AnalyticsTab api={api} notify={notify} lang={lang} />}
          {tab === "farm_network" && <FarmNetworkTab api={api} notify={notify} farms={farms} refreshFarms={refreshFarms} lang={lang} />}
          {tab === "recommendations" && <XaiTab api={api} notify={notify} farms={farms} selectedFarmId={selectedFarmId} lang={lang} />}
          {tab === "farms" && <FarmsTab api={api} notify={notify} farms={farms} refreshFarms={refreshFarms} selectedFarmId={selectedFarmId} setSelectedFarmId={setSelectedFarmId} lang={lang} />}
          {tab === "ingestion" && <IngestionTab api={api} notify={notify} farms={farms} selectedFarmId={selectedFarmId} setSelectedFarmId={setSelectedFarmId} lang={lang} />}
          {tab === "registry" && <RegistryTab api={api} notify={notify} selectedFarmId={selectedFarmId} lang={lang} />}
          {tab === "selection" && <SelectionTab api={api} notify={notify} farms={farms} lang={lang} />}
          {tab === "help" && <HelpTab lang={lang} />}
        </main>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
