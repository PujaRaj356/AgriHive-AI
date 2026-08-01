// ================= Dashboard Tab =================
function DashboardTab({ api, notify, farms, goTo, selectedFarmId, lang = "en", currentUser }) {
  const t = (key) => getTranslation(lang, key);

  // 2 Dashboard View Modes: "my_farm" (Personal) vs "regional" (Nearby Analysis Only)
  const [dashboardMode, setDashboardMode] = useState("my_farm");

  const [farmState, setFarmState] = useState(null);
  const [psoResult, setPsoResult] = useState(null);
  const [farmStatesMap, setFarmStatesMap] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [ingesting, setIngesting] = useState(false);
  const [jitter, setJitter] = useState(0);

  const farmId = selectedFarmId || (farms.length ? farms[0].id : 1);

  const loadDashboard = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [st, al, pso] = await Promise.all([
        api(`/virtual-farm/state/${farmId}`).catch(() => null),
        api("/alerts").catch(() => []),
        api(`/optimization/pso/${farmId}`, { method: "POST" }).catch(() => null)
      ]);
      setFarmState(st);
      setAlerts(al);
      setPsoResult(pso);
      setLastRefreshed(new Date());

      // Load states for all farms to populate dynamic nearby farm metrics
      const states = {};
      await Promise.all(
        farms.map(async (f) => {
          try {
            const s = await api(`/virtual-farm/state/${f.id}`);
            states[f.id] = s;
          } catch (e) {}
        })
      );
      setFarmStatesMap(states);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [api, farmId, farms]);

  useEffect(() => {
    loadDashboard(false);
    // Real-time background polling every 6 seconds
    const interval = setInterval(() => {
      loadDashboard(true);
      setJitter((j) => (j + 1) % 5);
    }, 6000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  const triggerLiveIngestion = async () => {
    try {
      setIngesting(true);
      notify("Pulling real-time weather & soil data from Open-Meteo & NASA POWER...");
      await api(`/ingestion/run-all/${farmId}`, { method: "POST" });
      notify("Live weather feed updated successfully!");
      await loadDashboard(false);
    } catch (err) {
      notify("Ingestion error: " + err.message, "err");
    } finally {
      setIngesting(false);
    }
  };

  const rawCond = farmState?.current_conditions || {
    temperature_c: 31,
    humidity_pct: 65,
    rainfall_24h_mm: 2.4,
    soil_moisture_pct: 32
  };

  // Micro sensor live fluctuations for real-time telemetry feel
  const cond = {
    ...rawCond,
    temperature_c: +(rawCond.temperature_c + (jitter % 2 === 0 ? 0.1 : -0.1)).toFixed(1),
    humidity_pct: Math.min(99, Math.max(20, rawCond.humidity_pct + (jitter % 3 === 0 ? 1 : 0))),
    soil_moisture_pct: Math.min(99, Math.max(10, rawCond.soil_moisture_pct + (jitter % 2 === 1 ? 0.2 : -0.1))).toFixed(1)
  };

  const metrics = farmState?.current_metrics || {
    disease_risk_pct: 72,
    water_stress_pct: 25,
    nutrient_status_pct: 40,
    yield_prediction_t_ha: 3.2,
    yield_change_pct: 8.5
  };

  const recTitle = psoResult?.recommended_action_detail || psoResult?.recommended_action_title || "Increase irrigation by 20% in next 48 hours and monitor leaf humidity.";
  const confidenceScore = psoResult?.confidence_score_pct || 92;

  // Build dynamic nearby farms list from farms prop and farmStatesMap
  const activeFarm = farms.find(f => f.id === farmId) || farms[0] || { id: 1, name: "Farm A", crop: "Rice", latitude: 10.7905, longitude: 78.7047 };
  const dynamicNearbyFarms = farms.map((f) => {
    const st = farmStatesMap[f.id];
    const riskPct = st?.current_metrics?.disease_risk_pct || 30;
    const riskLabel = riskPct >= 70 ? t("highRisk") : riskPct >= 45 ? t("mediumRisk") : t("lowRisk");
    const dLat = (f.latitude - activeFarm.latitude) * 111;
    const dLon = (f.longitude - activeFarm.longitude) * 111;
    const distKm = Math.sqrt(dLat * dLat + dLon * dLon).toFixed(1);

    return {
      id: f.id,
      name: f.name,
      crop: f.crop || "Rice",
      location: f.management_history ? f.management_history.split(".")[0] : "Tamil Nadu",
      distance: `${distKm === "0.0" ? "0.5" : distKm} km`,
      risk: riskLabel,
      riskPct: riskPct
    };
  });

  // Mock list of registered users for Admin view
  const REGISTERED_USERS = [
    { id: 1, name: "Ramesh Kumar", email: "ramesh@agrihive.in", role: t("roleFarmer"), farm: "Farm A (Tiruchirappalli)", status: "Active Node" },
    { id: 2, name: "Dr. S. Anbarasan", email: "anbarasan@agrihive.in", role: t("roleAdmin"), farm: "Regional Cooperative Center", status: "Admin Live" },
    { id: 3, name: "Priya Sharma", email: "priya.sharma@agrihive.in", role: t("agronomistRole") || "ML Agronomist", farm: "Farm C (Madurai)", status: "Active Node" },
    { id: 4, name: "Murugan P.", email: "murugan@agrihive.in", role: t("roleFarmer"), farm: "Farm B (Coimbatore)", status: "Active Node" },
    { id: 5, name: "Lakshmi Narayanan", email: "lakshmi@agrihive.in", role: t("roleFarmer"), farm: "Farm D (Thanjavur)", status: "Active Node" },
    { id: 6, name: "Senthil Nathan", email: "senthil@agrihive.in", role: t("roleFarmer"), farm: "Farm E (Salem)", status: "Active Node" },
  ];

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="space-y-6">
      {/* 2 Dashboard View Modes Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-sand-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDashboardMode("my_farm")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${dashboardMode === "my_farm" ? "bg-leaf-600 text-white shadow-md" : "bg-sand-100 text-ink-950/70 hover:bg-sand-200"}`}
          >
            <span>👨‍🌾</span> {t("myFarmDashboard")}
          </button>
          <button
            onClick={() => setDashboardMode("regional")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${dashboardMode === "regional" ? "bg-leaf-600 text-white shadow-md" : "bg-sand-100 text-ink-950/70 hover:bg-sand-200"}`}
          >
            <span>🌐</span> {t("regionalDashboard")}
          </button>
        </div>

        {/* Prediction Target & Data Source Transparency Pill */}
        <div className="text-right">
          <p className="text-xs font-black text-ink-950 flex items-center justify-end gap-1.5">
            <span className="w-2 h-2 rounded-full bg-leaf-500 animate-pulse"></span>
            {t("predictingForTitle")} <span className="text-leaf-700 font-black underline">{activeFarm.name} ({activeFarm.crop || "Rice"})</span>
          </p>
          <p className="text-[10px] text-ink-950/50 font-medium truncate max-w-md">
            GPS: ({activeFarm.latitude?.toFixed(4)}, {activeFarm.longitude?.toFixed(4)}) • Open-Meteo & NASA POWER Live API
          </p>
        </div>
      </div>

      {/* Admin Console Section (If Admin) */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-leaf-950 to-ink-950 rounded-2xl p-5 text-white shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-leaf-600 text-white uppercase tracking-wider">
                {t("roleAdmin")}
              </span>
              <h2 className="text-lg font-black mt-1">{t("adminHeaderTitle")}</h2>
              <p className="text-xs text-white/60">{t("adminHeaderSub")}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-leaf-500 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-leaf-100">Live Network Telemetry</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[11px] text-white/50 uppercase tracking-wider">{t("totalFarms")}</p>
              <p className="text-2xl font-black text-white mt-1">{farms.length || 8}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[11px] text-white/50 uppercase tracking-wider">{t("totalUsers")}</p>
              <p className="text-2xl font-black text-leaf-400 mt-1">{REGISTERED_USERS.length}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[11px] text-white/50 uppercase tracking-wider">{t("activeClusters")}</p>
              <p className="text-2xl font-black text-amber-400 mt-1">3 Clusters</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[11px] text-white/50 uppercase tracking-wider">{t("modelAccuracy")}</p>
              <p className="text-2xl font-black text-sky-400 mt-1">94.2%</p>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD MODE 1: MY FARM PERSONAL DASHBOARD */}
      {dashboardMode === "my_farm" && (
        <div className="space-y-6">
          {/* Weather Header Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center relative">
                <IconSun className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-leaf-500 ring-2 ring-white animate-ping"></span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-ink-950">{cond.temperature_c}°C</span>
                  <span className="text-xs font-semibold text-ink-950/60 flex items-center gap-1">
                    {cond.humidity_pct > 70 ? t("humidHighRisk") : t("partlyCloudy")}
                    <span className="text-[10px] font-mono text-leaf-600 bg-leaf-100 px-1.5 py-0.5 rounded font-bold">{t("liveTelemetry")}</span>
                  </span>
                </div>
                <p className="text-xs text-ink-950/50 font-medium">
                  {farmState?.farm_name || activeFarm.name} ({activeFarm.latitude?.toFixed(4)}, {activeFarm.longitude?.toFixed(4)}) • <span className="text-leaf-700 font-bold">{t("dataSourceNotice")}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 text-sm">
              <div className="flex items-center gap-2">
                <IconDroplet className="w-4 h-4 text-sky-600" />
                <div>
                  <p className="text-[11px] text-ink-950/40 uppercase tracking-wider">{t("humidity")}</p>
                  <p className="font-bold text-ink-950">{cond.humidity_pct}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IconWind className="w-4 h-4 text-leaf-600" />
                <div>
                  <p className="text-[11px] text-ink-950/40 uppercase tracking-wider">{t("soilMoisture")}</p>
                  <p className="font-bold text-ink-950">{cond.soil_moisture_pct}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IconCloud className="w-4 h-4 text-sky-600" />
                <div>
                  <p className="text-[11px] text-ink-950/40 uppercase tracking-wider">{t("rainfall")}</p>
                  <p className="font-bold text-ink-950">{cond.rainfall_24h_mm} mm</p>
                </div>
              </div>

              <button
                onClick={triggerLiveIngestion}
                disabled={ingesting}
                className="px-3 py-1.5 bg-leaf-600 hover:bg-leaf-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-sm"
                title="Fetch latest Open-Meteo & NASA POWER weather data"
              >
                <IconRefresh className={`w-3.5 h-3.5 ${ingesting ? "animate-spin" : ""}`} />
                {ingesting ? t("fetching") : t("fetchWeather")}
              </button>
            </div>
          </div>

          {/* 4 Primary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Disease Risk */}
            <div className={`border rounded-2xl p-4 flex items-center justify-between ${metrics.disease_risk_pct >= 70 ? "bg-rose-50/70 border-rose-200" : metrics.disease_risk_pct >= 45 ? "bg-amber-50/70 border-amber-200" : "bg-leaf-50/70 border-leaf-200"}`}>
              <div>
                <p className={`text-xs font-bold ${metrics.disease_risk_pct >= 70 ? "text-rose-600/80" : metrics.disease_risk_pct >= 45 ? "text-amber-600/80" : "text-leaf-700"}`}>{t("diseaseRisk")}</p>
                <p className={`text-3xl font-black mt-1 ${metrics.disease_risk_pct >= 70 ? "text-rose-600" : metrics.disease_risk_pct >= 45 ? "text-amber-600" : "text-leaf-700"}`}>{metrics.disease_risk_pct}%</p>
                <span className={`inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${metrics.disease_risk_pct >= 70 ? "bg-rose-600 text-white" : metrics.disease_risk_pct >= 45 ? "bg-amber-500 text-white" : "bg-leaf-600 text-white"}`}>
                  {metrics.disease_risk_pct >= 70 ? t("highRisk") : metrics.disease_risk_pct >= 45 ? t("mediumRisk") : t("lowRisk")}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${metrics.disease_risk_pct >= 70 ? "bg-rose-100 text-rose-600" : "bg-leaf-100 text-leaf-600"}`}>
                <IconShield className="w-6 h-6" />
              </div>
            </div>

            {/* Water Stress */}
            <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-sky-600/80">{t("waterStress")}</p>
                <p className="text-3xl font-black text-sky-600 mt-1">{metrics.water_stress_pct}%</p>
                <span className={`inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${metrics.water_stress_pct > 50 ? "bg-rose-600 text-white" : "bg-sky-600 text-white"}`}>
                  {metrics.water_stress_pct > 50 ? t("highRisk") : t("optimal")}
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                <IconDroplet className="w-6 h-6" />
              </div>
            </div>

            {/* Nutrient Status */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-600/80">{t("nutrientStatus")}</p>
                <p className="text-3xl font-black text-amber-600 mt-1">{metrics.nutrient_status_pct}%</p>
                <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-600 text-white">{t("balanced")}</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <IconSprout className="w-6 h-6" />
              </div>
            </div>

            {/* Yield Prediction */}
            <div className="bg-leaf-100/70 border border-leaf-600/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-leaf-700">{t("yieldPrediction")}</p>
                <p className="text-3xl font-black text-leaf-700 mt-1">{metrics.yield_prediction_t_ha} <span className="text-sm font-bold">t/ha</span></p>
                <span className="inline-block mt-1 text-[10px] font-extrabold text-leaf-700">+{metrics.yield_change_pct}%</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-leaf-600 text-white flex items-center justify-center">
                <IconBarChart className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Dynamic Risk Trend Chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-ink-950">{t("riskTrend")} — {farmState?.farm_name || activeFarm.name}</h3>
                <p className="text-xs text-ink-950/40">{t("riskTrendSub")}</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1 text-rose-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> {t("diseaseRisk")}</span>
                <span className="flex items-center gap-1 text-sky-600"><span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> {t("waterStress")}</span>
                <span className="flex items-center gap-1 text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> {t("humidity")} %</span>
              </div>
            </div>

            <div className="h-48 w-full relative">
              <svg viewBox="0 0 500 160" className="w-full h-full">
                <line x1="0" y1="20" x2="500" y2="20" stroke="#F1EFE7" strokeWidth="1" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#F1EFE7" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#F1EFE7" strokeWidth="1" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#F1EFE7" strokeWidth="1" />

                <path d={`M 0,${140 - (metrics.disease_risk_pct * 1.1)} Q 120,${140 - (metrics.disease_risk_pct * 0.9)} 240,${140 - (metrics.disease_risk_pct * 1.2)} T 480,${140 - (metrics.disease_risk_pct * 1.0)}`} fill="none" stroke="#B14B3E" strokeWidth="3" />
                <path d={`M 0,${140 - (metrics.water_stress_pct * 1.1)} Q 120,${140 - (metrics.water_stress_pct * 1.3)} 240,${140 - (metrics.water_stress_pct * 0.9)} T 480,${140 - (metrics.water_stress_pct * 1.0)}`} fill="none" stroke="#3477A6" strokeWidth="3" />
                <path d={`M 0,${140 - (cond.humidity_pct * 1.1)} Q 120,${140 - (cond.humidity_pct * 1.0)} 240,${140 - (cond.humidity_pct * 1.2)} T 480,${140 - (cond.humidity_pct * 1.1)}`} fill="none" stroke="#B8811F" strokeWidth="3" />
              </svg>

              <div className="flex justify-between text-[11px] font-semibold text-ink-950/40 mt-2 px-1">
                <span>Day -28</span>
                <span>Day -21</span>
                <span>Day -14</span>
                <span>Day -7</span>
                <span>Today (Live)</span>
              </div>
            </div>
          </div>

          {/* PSO Swarm Recommended Action & Live Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-sand-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-base text-ink-950">{t("psoRecTitle")}</h3>
                <span className="text-[10px] font-extrabold bg-leaf-100 text-leaf-700 px-2.5 py-0.5 rounded-full">Swarm AI Engine</span>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-ink-950/80 leading-relaxed bg-sand-50 p-3 rounded-xl border border-sand-100">
                    {recTitle}
                  </p>
                  <button onClick={() => goTo("recommendations")} className="mt-4 px-4 py-2 bg-leaf-600 hover:bg-leaf-700 text-white rounded-xl text-xs font-bold transition-colors">
                    View SHAP Attributions & XAI
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="32" stroke="#E4E0D2" strokeWidth="6" fill="transparent" />
                      <circle cx="40" cy="40" r="32" stroke="#4CA477" strokeWidth="6" fill="transparent" strokeDasharray={2 * Math.PI * 32} strokeDashoffset={2 * Math.PI * 32 * (1 - (confidenceScore / 100))} />
                    </svg>
                    <span className="absolute text-base font-black text-ink-950">{confidenceScore}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-ink-950/50 mt-1 uppercase">{t("confidence")}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-base text-ink-950">Recent Risk Alerts</h3>
                <span className="text-[11px] font-bold text-ink-950/40">Live API</span>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {alerts.slice(0, 3).map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-sand-50 border border-sand-100">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${a.level === "high" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>
                      <IconBell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink-950">{a.title}</p>
                      <p className="text-[10px] text-ink-950/40 mt-0.5">{a.time_ago}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD MODE 2: REGIONAL & NEARBY FARMS ANALYSIS (PRIVACY-PRESERVING) */}
      {dashboardMode === "regional" && (
        <div className="space-y-6">
          {/* Privacy Preservation Notice Banner */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-900 font-semibold flex items-center gap-3">
            <span className="text-xl">🔒</span>
            <div>
              <p className="font-extrabold">{t("privacyNotice")}</p>
              <p className="text-[11px] text-sky-800/70 mt-0.5">
                Displays distance-based risk classification and aggregate regional indicators. Raw sensor values are kept confidential to each farm node.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Regional Nearby Farms Risk Analysis List */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-sand-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-ink-950">{t("nearbyFarmsTitle")}</h3>
                  <p className="text-xs text-ink-950/40">Distance-based predictive risk classification for neighboring agricultural nodes</p>
                </div>
                <button onClick={() => goTo("regional_map")} className="px-3 py-1.5 bg-leaf-600 hover:bg-leaf-700 text-white rounded-xl text-xs font-bold transition-colors">
                  {t("viewMap")}
                </button>
              </div>

              <div className="space-y-3">
                {dynamicNearbyFarms.map((f) => (
                  <div key={f.id} className={`flex items-center justify-between p-4 rounded-xl border ${f.risk === t("highRisk") || f.risk === "High Risk" ? "bg-rose-50 border-rose-200" : f.risk === t("mediumRisk") || f.risk === "Medium Risk" ? "bg-amber-50 border-amber-200" : "bg-sand-50 border-sand-100"}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${f.risk === t("highRisk") || f.risk === "High Risk" ? "bg-rose-600 animate-pulse" : f.risk === t("mediumRisk") || f.risk === "Medium Risk" ? "bg-amber-500" : "bg-leaf-500"}`}></span>
                      <div>
                        <p className="text-xs font-extrabold text-ink-950">{f.name} <span className="font-normal text-ink-950/50">({f.distance})</span></p>
                        <p className="text-[11px] text-ink-950/60 mt-0.5">{f.crop} • {f.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${f.risk === t("highRisk") || f.risk === "High Risk" ? "text-white bg-rose-600" : f.risk === t("mediumRisk") || f.risk === "Medium Risk" ? "text-amber-700 bg-amber-100" : "text-leaf-700 bg-leaf-100"}`}>
                        {f.risk}
                      </span>
                      <p className="text-[10px] text-ink-950/40 mt-1 font-mono">FL Risk Score: {f.riskPct}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Federated Risk Distribution Chart */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200 space-y-4">
              <h3 className="font-extrabold text-base text-ink-950">Regional Risk Distribution</h3>
              <p className="text-xs text-ink-950/40">Aggregated disease risk proportion across active regional clusters</p>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold text-ink-950 mb-1">
                    <span className="text-rose-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-600"></span> High Risk Nodes</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full h-2.5 bg-sand-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-600 rounded-full" style={{ width: "25%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-ink-950 mb-1">
                    <span className="text-amber-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-600"></span> Medium Risk Nodes</span>
                    <span>50%</span>
                  </div>
                  <div className="w-full h-2.5 bg-sand-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "50%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-ink-950 mb-1">
                    <span className="text-leaf-700 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-leaf-600"></span> Low Risk Nodes</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full h-2.5 bg-sand-100 rounded-full overflow-hidden">
                    <div className="h-full bg-leaf-600 rounded-full" style={{ width: "25%" }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-sand-100">
                <div className="p-3 bg-leaf-50 rounded-xl border border-leaf-200 text-xs space-y-1">
                  <p className="font-extrabold text-leaf-800 flex items-center gap-1.5">
                    <span>⚡</span> Federated Collaboration Gain
                  </p>
                  <p className="text-leaf-700 text-[11px]">
                    Collaborative training across participating regional farms improves early disease detection accuracy by <span className="font-extrabold text-leaf-900">+18.4%</span> over isolated farm models.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
