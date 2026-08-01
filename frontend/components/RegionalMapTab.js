// ================= Regional Map Tab =================
function RegionalMapTab({ api, notify, farms, selectedFarmId, setSelectedFarmId, goTo, lang = "en" }) {
  const t = (key) => getTranslation(lang, key);
  const [farmDataMap, setFarmDataMap] = useState({});
  const [xaiDataMap, setXaiDataMap] = useState({});
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAllFarmData = useCallback(async () => {
    try {
      setLoading(true);
      const states = {};
      const xais = {};

      await Promise.all(
        farms.map(async (f) => {
          try {
            const [st, xai] = await Promise.all([
              api(`/virtual-farm/state/${f.id}`).catch(() => null),
              api(`/xai/explain/${f.id}`).catch(() => null)
            ]);
            if (st) states[f.id] = st;
            if (xai) xais[f.id] = xai;
          } catch (e) {}
        })
      );

      setFarmDataMap(states);
      setXaiDataMap(xais);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [api, farms]);

  useEffect(() => {
    loadAllFarmData();
  }, [loadAllFarmData]);

  // 1. Dynamic bounds computed strictly from the active farm coordinates
  const actualLats = farms.map(f => f.latitude || 10.8);
  const actualLons = farms.map(f => f.longitude || 78.5);

  const minLat = Math.min(...actualLats);
  const maxLat = Math.max(...actualLats);
  const minLon = Math.min(...actualLons);
  const maxLon = Math.max(...actualLons);

  const latSpan = maxLat - minLat || 0.05;
  const lonSpan = maxLon - minLon || 0.05;

  // 2. Initial normalized placement across canvas (20% to 80%)
  const rawPlacements = farms.map((f, idx) => {
    const st = farmDataMap[f.id];
    const xai = xaiDataMap[f.id];
    const diseaseRisk = st?.current_metrics?.disease_risk_pct || 30;
    const waterStress = st?.current_metrics?.water_stress_pct || 25;
    const nutrientStatus = st?.current_metrics?.nutrient_status_pct || 60;
    const riskLabel = diseaseRisk >= 70 ? "High Risk" : diseaseRisk >= 45 ? "Medium Risk" : "Low Risk";

    let x = lonSpan < 0.01 ? (20 + (idx * 16) % 65) : 20 + ((f.longitude - minLon) / lonSpan) * 60;
    let y = latSpan < 0.01 ? (20 + (idx * 18) % 65) : 20 + ((maxLat - f.latitude) / latSpan) * 60;

    return {
      id: f.id,
      name: f.name,
      crop: f.crop || "Rice",
      lat: f.latitude,
      lon: f.longitude,
      risk: riskLabel,
      disease: diseaseRisk,
      water: waterStress,
      nutrient: nutrientStatus,
      x: x,
      y: y,
      xai: xai,
      state: st
    };
  });

  // 3. Force-repulsion collision avoidance to prevent badge overlap and congestion
  const minDistX = 15; // Minimum horizontal separation %
  const minDistY = 11; // Minimum vertical separation %

  const mapFarms = [...rawPlacements];
  for (let iter = 0; iter < 15; iter++) {
    for (let i = 0; i < mapFarms.length; i++) {
      for (let j = i + 1; j < mapFarms.length; j++) {
        const dx = mapFarms[j].x - mapFarms[i].x;
        const dy = mapFarms[j].y - mapFarms[i].y;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (absX < minDistX && absY < minDistY) {
          const pushX = (minDistX - absX) * 0.6 * (dx >= 0 ? 1 : -1);
          const pushY = (minDistY - absY) * 0.6 * (dy >= 0 ? 1 : -1);

          mapFarms[i].x = Math.max(12, Math.min(88, mapFarms[i].x - pushX));
          mapFarms[i].y = Math.max(12, Math.min(88, mapFarms[i].y - pushY));
          mapFarms[j].x = Math.max(12, Math.min(88, mapFarms[j].x + pushX));
          mapFarms[j].y = Math.max(12, Math.min(88, mapFarms[j].y + pushY));
        }
      }
    }
  }

  useEffect(() => {
    if (!selectedFarm && mapFarms.length) {
      const match = mapFarms.find(f => f.id === selectedFarmId) || mapFarms[0];
      setSelectedFarm(match);
    }
  }, [mapFarms, selectedFarm, selectedFarmId]);

  const activeFarm = selectedFarm || mapFarms[0] || {
    id: 1, name: "Farm A", crop: "Rice", risk: "Low Risk", disease: 24, water: 20, nutrient: 65
  };

  const activeFactors = activeFarm.xai?.top_contributing_factors || [
    { factor: "High Humidity", score: 0.28 },
    { factor: "High Temperature", score: 0.22 },
    { factor: "Soil Moisture Deficit", score: 0.18 }
  ];

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-ink-950">Regional Intelligence Map</h2>
          <p className="text-xs text-ink-950/50">Real-time risk view dynamically computed across all {farms.length} active farms</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-sand-200 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-leaf-500"></span> Low Risk</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium Risk</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> High Risk</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Map View Container */}
        <div className="lg:col-span-2 bg-[#E6EDDF] rounded-2xl relative border border-sand-200 overflow-hidden shadow-inner flex items-center justify-center">
          {/* Simulated Satellite Map Terrain SVG */}
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,100 Q 150,50 300,120 T 600,100 T 900,180" fill="none" stroke="#A8C3A0" strokeWidth="40" />
            <path d="M 100,0 Q 200,200 150,400 T 250,700" fill="none" stroke="#7FB5DC" strokeWidth="25" />
            <circle cx="55%" cy="48%" r="120" fill="rgba(177,75,62,0.12)" />
            <circle cx="55%" cy="48%" r="70" fill="rgba(177,75,62,0.18)" />
          </svg>

          {/* Map Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
            <button className="w-8 h-8 rounded-lg bg-white shadow border border-sand-200 flex items-center justify-center text-ink-950 font-bold hover:bg-sand-50">+</button>
            <button className="w-8 h-8 rounded-lg bg-white shadow border border-sand-200 flex items-center justify-center text-ink-950 font-bold hover:bg-sand-50">-</button>
            <button className="w-8 h-8 rounded-lg bg-white shadow border border-sand-200 flex items-center justify-center text-ink-950/60 hover:bg-sand-50">
              <IconLayers className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic Farm Markers on Map */}
          {mapFarms.map((f) => {
            const isSelected = activeFarm.id === f.id;
            const isHigh = f.risk === "High Risk";
            const isMed = f.risk === "Medium Risk";
            const colorClass = isHigh ? "bg-rose-600" : isMed ? "bg-amber-500" : "bg-leaf-600";

            return (
              <div
                key={f.id}
                onClick={() => {
                  setSelectedFarm(f);
                  if (setSelectedFarmId) setSelectedFarmId(f.id);
                }}
                className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 z-20`}
                style={{ left: `${f.x}%`, top: `${f.y}%` }}
              >
                {/* Pulsing Ring for High Risk */}
                {isHigh && (
                  <span className="absolute -inset-3 rounded-full bg-rose-600/30 animate-ping"></span>
                )}

                <div className={`relative px-2.5 py-1 rounded-full text-white text-xs font-extrabold shadow-lg flex items-center gap-1.5 ${colorClass} ${isSelected ? "ring-4 ring-white scale-110" : ""}`}>
                  <IconSprout className="w-3.5 h-3.5" />
                  <span>{f.name}</span>
                </div>
              </div>
            );
          })}

          {/* Bottom Legend Overlay */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-sand-200 flex items-center gap-4 text-xs font-bold text-ink-950 shadow">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-leaf-500"></span> Low Risk</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium Risk</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> High Risk</span>
          </div>
        </div>

        {/* Right Detail Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-sand-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-ink-950">{activeFarm.name}</h3>
                <p className="text-xs text-ink-950/40">Lat: {activeFarm.lat?.toFixed(4)}, Lon: {activeFarm.lon?.toFixed(4)}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold text-white ${activeFarm.risk === "High Risk" ? "bg-rose-600" : activeFarm.risk === "Medium Risk" ? "bg-amber-500" : "bg-leaf-600"}`}>
                {activeFarm.risk}
              </span>
            </div>

            {/* Risk Summary Progress Bars */}
            <div className="mt-5 space-y-4">
              <h4 className="text-xs font-extrabold text-ink-950/50 uppercase tracking-wider">Live Risk Summary</h4>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Disease Risk</span>
                  <span className="text-rose-600">{activeFarm.disease}%</span>
                </div>
                <div className="w-full h-2.5 bg-sand-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-600 rounded-full" style={{ width: `${activeFarm.disease}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Water Stress</span>
                  <span className="text-sky-600">{activeFarm.water}%</span>
                </div>
                <div className="w-full h-2.5 bg-sand-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-600 rounded-full" style={{ width: `${activeFarm.water}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Nutrient Status</span>
                  <span className="text-amber-600">{activeFarm.nutrient}%</span>
                </div>
                <div className="w-full h-2.5 bg-sand-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${activeFarm.nutrient}%` }}></div>
                </div>
              </div>
            </div>

            {/* Live SHAP Predominant Factors */}
            <div className="mt-6 space-y-2">
              <h4 className="text-xs font-extrabold text-ink-950/50 uppercase tracking-wider mb-2">Live SHAP Predominant Factors</h4>
              <div className="space-y-1.5 text-xs font-semibold text-ink-950">
                {activeFactors.slice(0, 4).map((fact, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-sand-50 text-rose-600">
                    <div className="flex items-center gap-2">
                      <IconDroplet className="w-4 h-4 shrink-0" />
                      <span>{fact.factor || fact.feature}</span>
                    </div>
                    <span className="font-mono text-[11px]">+{typeof fact.score === "number" ? fact.score.toFixed(2) : fact.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (setSelectedFarmId) setSelectedFarmId(activeFarm.id);
              goTo("recommendations");
            }}
            className="w-full mt-6 py-3 bg-leaf-600 hover:bg-leaf-700 text-white font-extrabold rounded-xl text-sm transition-colors"
          >
            View Farm XAI Attributions
          </button>
        </div>
      </div>
    </div>
  );
}

