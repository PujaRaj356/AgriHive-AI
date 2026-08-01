// ================= Regional Map Tab with Normal & Satellite Google Maps =================
function RegionalMapTab({ api, notify, farms, selectedFarmId, setSelectedFarmId, goTo, lang = "en" }) {
  const t = (key) => getTranslation(lang, key);
  const [farmDataMap, setFarmDataMap] = useState({});
  const [xaiDataMap, setXaiDataMap] = useState({});
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleMapType, setGoogleMapType] = useState("satellite"); // "normal" | "satellite"
  const mapRef = React.useRef(null);
  const leafletMapInstance = React.useRef(null);
  const tileLayerRef = React.useRef(null);
  const markersRef = React.useRef([]);

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
          } catch (e) { }
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

  // Compute map farm attributes
  const mapFarms = useMemo(() => {
    return farms.map((f) => {
      const st = farmDataMap[f.id];
      const xai = xaiDataMap[f.id];
      const diseaseRisk = st?.current_metrics?.disease_risk_pct || 30;
      const waterStress = st?.current_metrics?.water_stress_pct || 25;
      const nutrientStatus = st?.current_metrics?.nutrient_status_pct || 60;
      const riskLabel = diseaseRisk >= 65 ? "High Risk" : diseaseRisk >= 40 ? "Medium Risk" : "Low Risk";

      return {
        id: f.id,
        name: f.name,
        crop: f.crop || "Rice",
        lat: f.latitude || 10.8,
        lon: f.longitude || 78.7,
        risk: riskLabel,
        disease: diseaseRisk,
        water: waterStress,
        nutrient: nutrientStatus,
        xai: xai,
        state: st
      };
    });
  }, [farms, farmDataMap, xaiDataMap]);

  useEffect(() => {
    if (!selectedFarm && mapFarms.length) {
      const match = mapFarms.find(f => f.id === selectedFarmId) || mapFarms[0];
      setSelectedFarm(match);
    }
  }, [mapFarms, selectedFarm, selectedFarmId]);

  // Initialize and update Google Maps tile layer
  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    if (!leafletMapInstance.current) {
      const defaultLat = mapFarms.length ? mapFarms[0].lat : 10.8;
      const defaultLon = mapFarms.length ? mapFarms[0].lon : 78.7;

      const map = window.L.map(mapRef.current, {
        center: [defaultLat, defaultLon],
        zoom: 12,
        zoomControl: false
      });
      window.L.control.zoom({ position: 'topleft' }).addTo(map);

      leafletMapInstance.current = map;
    }

    const map = leafletMapInstance.current;

    // Switch between Normal Google Map & Satellite Google Map
    const tileUrl = googleMapType === "satellite"
      ? "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
      : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = window.L.tileLayer(tileUrl, {
      attribution: '&copy; Google Maps',
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    // Clear existing markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Add Leaflet Markers for each farm
    const bounds = [];
    mapFarms.forEach((f) => {
      const isHigh = f.risk === "High Risk";
      const isMed = f.risk === "Medium Risk";
      const badgeBg = isHigh ? "#DC2626" : isMed ? "#D97706" : "#16A34A";

      const customHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          ${isHigh ? '<span class="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping"></span>' : ''}
          <div class="relative px-2.5 py-1 rounded-full text-white text-xs font-black shadow-lg flex items-center gap-1 border-2 border-white" style="background-color: ${badgeBg};">
            <span>🌾</span>
            <span class="whitespace-nowrap">${f.name}</span>
          </div>
        </div>
      `;

      const customIcon = window.L.divIcon({
        html: customHtml,
        className: 'custom-leaflet-farm-marker',
        iconSize: [120, 36],
        iconAnchor: [60, 18]
      });

      const marker = window.L.marker([f.lat, f.lon], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedFarm(f);
        if (setSelectedFarmId) setSelectedFarmId(f.id);
        map.panTo([f.lat, f.lon]);
      });

      // Bind popup
      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
          <h4 style="font-weight: 800; font-size: 14px; margin: 0 0 4px 0; color: #0E1712;">${f.name} (${f.crop})</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #666;">Lat: ${f.lat.toFixed(4)}, Lon: ${f.lon.toFixed(4)}</p>
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 4px;">
            <span>Disease Risk:</span>
            <span style="color: ${isHigh ? '#DC2626' : isMed ? '#D97706' : '#16A34A'}">${f.disease}%</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 4px;">
            <span>Water Stress:</span>
            <span style="color: #0284C7">${f.water}%</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700;">
            <span>Status:</span>
            <span style="color: ${badgeBg}">${f.risk}</span>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);

      markersRef.current.push(marker);
      bounds.push([f.lat, f.lon]);
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 12);
    }

    // CRITICAL: Invalidate map size so Leaflet recalculates 100% full height tiles without grey background
    const t1 = setTimeout(() => {
      if (map) map.invalidateSize();
    }, 100);
    const t2 = setTimeout(() => {
      if (map) map.invalidateSize();
    }, 300);
    const t3 = setTimeout(() => {
      if (map) map.invalidateSize();
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };

  }, [mapFarms, googleMapType, setSelectedFarmId]);

  // ResizeObserver to handle container size changes
  useEffect(() => {
    if (!mapRef.current || !window.ResizeObserver) return;
    const ro = new ResizeObserver(() => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.invalidateSize();
      }
    });
    ro.observe(mapRef.current);
    return () => ro.disconnect();
  }, []);

  const activeFarm = selectedFarm || mapFarms[0] || {
    id: 1, name: "Farm A", crop: "Rice", risk: "Low Risk", disease: 24, water: 20, nutrient: 65
  };

  const activeFactors = activeFarm.xai?.top_contributing_factors || [
    { factor: "High Humidity", score: 0.28 },
    { factor: "High Temperature", score: 0.22 },
    { factor: "Soil Moisture Deficit", score: 0.18 }
  ];

  return (
    <div className="space-y-4 flex flex-col min-h-[580px]">
      {/* Header Bar with 2 Google Map Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-sand-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-ink-950 flex items-center gap-2">
            <span>🗺️</span> Google Regional Map
          </h2>
          <p className="text-xs text-ink-950/50">Interactive Normal & Satellite Google GIS views across all registered farms</p>
        </div>

        {/* 2 Google Map Mode Options: Normal vs Satellite */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-sand-100 p-1 rounded-xl border border-sand-200 flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setGoogleMapType("normal")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${googleMapType === "normal" ? "bg-leaf-600 text-white font-black shadow-sm" : "text-ink-950/60 hover:text-ink-950"}`}
            >
              <span>🗺️</span>
              <span>Google Map</span>
            </button>
            <button
              onClick={() => setGoogleMapType("satellite")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${googleMapType === "satellite" ? "bg-leaf-600 text-white font-black shadow-sm" : "text-ink-950/60 hover:text-ink-950"}`}
            >
              <span>🛰️</span>
              <span>Satellite Map</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        {/* Google Map Container with explicit min-height */}
        <div className="lg:col-span-2 bg-sand-100 rounded-2xl relative border border-sand-200 overflow-hidden shadow-md min-h-[500px] flex flex-col">
          <div ref={mapRef} className="w-full h-full min-h-[500px] z-0" style={{ width: "100%", height: "100%", minHeight: "500px" }}></div>

          {/* Bottom Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-sand-200 flex items-center gap-4 text-xs font-bold text-ink-950 shadow-md">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-leaf-500"></span> Low Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> High Risk</span>
          </div>
        </div>

        {/* Right Detail Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200 flex flex-col justify-between overflow-y-auto min-h-[500px]">
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
            className="w-full mt-6 py-3 bg-leaf-600 hover:bg-leaf-700 text-white font-extrabold rounded-xl text-sm transition-colors shadow-sm"
          >
            View Farm XAI Attributions
          </button>
        </div>
      </div>
    </div>
  );
}
