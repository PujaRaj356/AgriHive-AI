// ================= Help & Support Tab =================
function HelpTab({ lang = "en" }) {
  const isTa = lang === "ta";
  const isHi = lang === "hi";

  const SYSTEM_PHASES = [
    { num: 1, name: "Data Ingestion", desc: "Open-Meteo REST Weather, NASA POWER Solar Radiation, SoilGrids Profile, and Local Sensor Feeds" },
    { num: 2, name: "Feature Registry & Selection", desc: "Domain relevance, Data quality checks, Leakage prevention, and Redundancy filtering pipeline" },
    { num: 3, name: "Water-Stress Dataset", desc: "Field dataset creation, automated cleaning, real-label generation, and time-based train/val/test splits" },
    { num: 4, name: "Centralized Baseline", desc: "Baseline Random Forest classifier trained on unified data to benchmark federated performance gains" },
    { num: 5, name: "Standard Federated Learning", desc: "Distributed FedAvg pipeline across local farm clients with secure server model aggregation" },
    { num: 6, name: "Farm Heterogeneity Analysis", desc: "Evaluates soil, crop, microclimate, and irrigation divergences across participating regional farm nodes" },
    { num: 7, name: "Clustered Federated Learning", desc: "Hierarchical similarity clustering grouping homogeneous farm nodes for specialized FL model training" },
    { num: 8, name: "Regional Intelligence", desc: "Combines cross-farm predictions into spatial risk intelligence without exposing raw private farm records" },
    { num: 9, name: "Explainable AI (SHAP XAI)", desc: "TreeSHAP attribution engine translating raw feature importances into clear farmer-friendly 'Main Reasons'" },
    { num: 10, name: "Digital Twin & Simulator", desc: "Physics-based virtual farm state simulation predicting 7-day crop health outcomes under interventions" },
    { num: 11, name: "Swarm Intelligence (PSO)", desc: "50-particle Particle Swarm Optimization searching optimal irrigation, fertilizer NPK, and yield profitability" },
    { num: 12, name: "Actionable Recommendations", desc: "Converts model predictions, simulations, and PSO vectors into step-by-step 'What Should I Do?' advice" },
    { num: 13, name: "React Enterprise Dashboard", desc: "Multi-role dashboard tailored for Farmers, Extension Officers, and Admins supporting English, Tamil & Hindi" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-leaf-900 to-leaf-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="px-3 py-1 bg-leaf-700/80 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-leaf-100">
            {isTa ? "விவசாயி உதவி மையம்" : isHi ? "किसान सहायता केंद्र" : "Farmer & Cooperative Support Hub"}
          </span>
          <h2 className="text-2xl font-black">
            {isTa ? "அக்ரிஹைவ் AI — பயனர் வழிகாட்டி & 13 கட்டமைப்பு" : isHi ? "एग्रीहाइव एआई — उपयोगकर्ता गाइड और 13-चरणीय आर्किटेक्चर" : "AgriHive AI — System Architecture & User Guide"}
          </h2>
          <p className="text-xs text-leaf-100 max-w-2xl leading-relaxed">
            {isTa 
              ? "கூட்டு பண்ணை நுண்ணறிவு தளம் மூலம் உங்கள் பயிர் பாதுகாப்பு, நீர் மேலாண்மை மற்றும் மகசூல் கணிப்பை எளிதாக நிர்வகிக்கவும்."
              : isHi
              ? "सहयोगी कृषि बुद्धिमत्ता मंच के माध्यम से अपनी फसल सुरक्षा, जल प्रबंधन और उपज पूर्वानुमान को आसानी से प्रबंधित करें।"
              : "Learn how AgriHive AI combines 13 architectural phases—from data ingestion and clustered FL to digital twin simulations and swarm optimization."}
          </p>
        </div>
      </div>

      {/* 13-Phase Architecture Pipeline Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand-200 space-y-4">
        <div className="flex items-center justify-between border-b border-sand-100 pb-3">
          <h3 className="text-base font-black text-ink-950 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-leaf-100 text-leaf-700 flex items-center justify-center font-bold text-xs">🏗️</span>
            {isTa ? "13-கட்ட அமைப்பு கட்டமைப்பு (13-Phase System Architecture)" : isHi ? "13-चरणीय प्रणाली आर्किटेक्चर (13-Phase Pipeline)" : "13-Phase System Architecture & Prediction Flow"}
          </h3>
          <span className="text-[11px] font-extrabold bg-leaf-100 text-leaf-700 px-3 py-1 rounded-full">Fully Integrated</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SYSTEM_PHASES.map((p) => (
            <div key={p.num} className="p-3 bg-sand-50 rounded-xl border border-sand-200 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-leaf-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  {p.num}
                </span>
                <h4 className="font-extrabold text-xs text-ink-950 truncate">{p.name}</h4>
              </div>
              <p className="text-[11px] text-ink-950/60 leading-tight pl-7">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand-200 space-y-4">
        <h3 className="text-base font-black text-ink-950 flex items-center gap-2 border-b border-sand-100 pb-3">
          <span className="w-7 h-7 rounded-lg bg-leaf-100 text-leaf-700 flex items-center justify-center font-bold text-xs">1</span>
          {isTa ? "விவசாயிகளுக்கான விரைவு வழிகாட்டி (Quick Start Guide)" : isHi ? "किसानों के लिए त्वरित गाइड (Quick Start Guide)" : "Quick Start Guide for Farmers & Field Officers"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-sand-50 rounded-xl border border-sand-200 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold text-sm">📍</div>
            <h4 className="font-extrabold text-xs text-ink-950">
              {isTa ? "1. பண்ணையைத் தேர்வு செய்க" : isHi ? "1. अपना खेत चुनें" : "1. Select Your Farm Node"}
            </h4>
            <p className="text-[11px] text-ink-950/60 leading-normal">
              {isTa 
                ? "பண்ணைகள் பட்டியலில் உங்கள் இடத்தை தேர்ந்தெடுக்கவும் அல்லது GPS பட்டன் மூலம் இடத்தை தானாக கண்டறியவும்." 
                : isHi 
                ? "फार्म सूची से अपना खेत चुनें या GPS बटन का उपयोग करके स्थान का चयन करें।" 
                : "Choose your active farm node or switch profile to view user-specific predictions."}
            </p>
          </div>

          <div className="p-4 bg-sand-50 rounded-xl border border-sand-200 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-extrabold text-sm">🌤️</div>
            <h4 className="font-extrabold text-xs text-ink-950">
              {isTa ? "2. வானிலை தரவை புதுப்பிக்கவும்" : isHi ? "2. मौसम डेटा अपडेट करें" : "2. Sync Live Weather Data"}
            </h4>
            <p className="text-[11px] text-ink-950/60 leading-normal">
              {isTa 
                ? "டாஷ்போர்டில் உள்ள 'Fetch Weather API' பட்டனை அழுத்தி நேரலை வெப்பநிலை, மழைப்பொழிவு மற்றும் ஈரப்பதத்தை பெறவும்." 
                : isHi 
                ? "डैशबोर्ड पर 'Fetch Weather API' बटन दबाकर लाइव तापमान, वर्षा और आर्द्रता प्राप्त करें।" 
                : "Click 'Fetch Weather API' on the dashboard to pull real-time Open-Meteo and NASA POWER sensor data."}
            </p>
          </div>

          <div className="p-4 bg-sand-50 rounded-xl border border-sand-200 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-leaf-100 text-leaf-700 flex items-center justify-center font-extrabold text-sm">🌱</div>
            <h4 className="font-extrabold text-xs text-ink-950">
              {isTa ? "3. உருவகப்படுத்தி திட்டமிடுங்கள்" : isHi ? "3. अनुकरण और योजना बनाएं" : "3. Simulate Interventions"}
            </h4>
            <p className="text-[11px] text-ink-950/60 leading-normal">
              {isTa 
                ? "டிஜிட்டல் இரட்டை தாவலில் பாசனம் மற்றும் உர அளவை பரிசோதித்து 7 நாள் ஆபத்து மாற்றத்தை பார்க்கவும்." 
                : isHi 
                ? "डिजिटल ट्विन में सिंचाई और उर्वरक मात्रा का परीक्षण करके 7-दिवसीय जोखिम परिवर्तन देखें।" 
                : "Test irrigation and fertilizer adjustments in the Digital Twin simulator to predict 7-day risk outcomes."}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Modules Explanation & FAQ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200 space-y-3">
          <h3 className="font-extrabold text-sm text-ink-950 border-b border-sand-100 pb-2">
            {isTa ? "முக்கிய அம்சங்கள் & பயன்பாடு" : isHi ? "मुख्य विशेषताएं और उपयोग" : "Main Features & Capabilities"}
          </h3>
          <ul className="space-y-2.5 text-xs text-ink-950/70 font-medium">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-leaf-600 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-ink-950">{isTa ? "நேரலை டாஷ்போர்டு:" : isHi ? "लाइव डैशबोर्ड:" : "Live Dashboard:"}</strong>{" "}
                {isTa ? "பயிர் நோய் ஆபத்து, நீர் அழுத்தம் மற்றும் விளைச்சல் கணிப்பை நேரலையாகக் கண்காணிக்கிறது." : isHi ? "फसल रोग जोखिम, जल तनाव और उपज पूर्वानुमान की निगरानी करता है।" : "Tracks real-time disease risk, water stress, nutrient status, and yield predictions."}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-leaf-600 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-ink-950">{isTa ? "பிராந்திய ஆபத்து வரைபடம்:" : isHi ? "क्षेत्रीय जोखिम मानचित्र:" : "Regional Risk Map:"}</strong>{" "}
                {isTa ? "அனைத்துப் பண்ணைகளின் ஆபத்து நிலையை வரைபடத்தில் ஒப்பிட்டுப் பார்க்க உதவுகிறது." : isHi ? "मानचित्र पर सभी खेतों की जोखिम स्थिति की तुलना करने में मदद करता है।" : "Visualizes spatial risk distribution across neighboring farms in your agricultural network."}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-leaf-600 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-ink-950">{isTa ? "டிஜிட்டல் இரட்டை (Digital Twin):" : isHi ? "डिजिटल ट्विन:" : "Digital Twin Simulator:"}</strong>{" "}
                {isTa ? "பண்ணையில் மாற்றங்களைச் செய்வதற்கு முன் விளைவுகளை முன்கூட்டியே கணிக்க உதவுகிறது." : isHi ? "खेत पर बदलाव करने से पहले परिणामों का अनुमान लगाने में मदद करता है।" : "Simulates management scenarios (irrigation, fertilizer, shading) before applying in the field."}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-leaf-600 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-ink-950">{isTa ? "விளக்கமளிக்கும் AI (SHAP XAI):" : isHi ? "स्पष्टीकरणात्मक एआई (SHAP XAI):" : "Explainable AI (SHAP XAI):"}</strong>{" "}
                {isTa ? "ஏன் ஒரு பரிந்துரை வழங்கப்பட்டது என்பதற்கான காரணங்களை தெளிவாக விளக்குகிறது." : isHi ? "बताता है कि एक सिफारिश क्यों दी गई थी।" : "Breaks down top contributing weather and soil factors behind every prediction."}
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200 space-y-3">
          <h3 className="font-extrabold text-sm text-ink-950 border-b border-sand-100 pb-2">
            {isTa ? "அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQ)" : isHi ? "अक्सर पूछे जाने वाले प्रश्न (FAQ)" : "Frequently Asked Questions (FAQ)"}
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <p className="font-bold text-ink-950">
                {isTa ? "கே: எனது பண்ணை தரவு பாதுகாப்பாக இருக்குமா?" : isHi ? "प्र: क्या मेरा फार्म डेटा सुरक्षित है?" : "Q: Is my private farm data kept secure?"}
              </p>
              <p className="text-ink-950/60 mt-0.5">
                {isTa 
                  ? "ஆம்! அக்ரிஹைவ் AI தனியுரிமை பாதுகாக்கப்பட்ட கூட்டமைப்பு கற்றலை பயன்படுத்துகிறது. உங்கள் பண்ணையின் ரகசிய தரவு வெளியில் அனுப்பப்படாது." 
                  : isHi 
                  ? "हाँ! एग्रीहाइव एआई गोपनीयता-संरक्षित फेडरेटेड लर्निंग का उपयोग करता है। आपका निजी डेटा आपके फार्म नोड पर ही रहता है।" 
                  : "Yes! AgriHive AI uses privacy-preserving Federated Learning. Raw field observations remain private on your local farm node."}
              </p>
            </div>

            <div>
              <p className="font-bold text-ink-950">
                {isTa ? "கே: அட்சரேகை/தீர்க்கரேகை (Lat/Lon) தெரியாவிட்டால் என்ன செய்வது?" : isHi ? "प्र: यदि मुझे अक्षांश/देशांतर नहीं पता तो क्या करूँ?" : "Q: How do I add my farm if I don't know coordinates?"}
              </p>
              <p className="text-ink-950/60 mt-0.5">
                {isTa 
                  ? "பண்ணைகள் தாவலில் உள்ள '📍 Use My Current Location (GPS)' பட்டனை அழுத்தவும் அல்லது மாவட்டத்தை தேர்வு செய்யவும்." 
                  : isHi 
                  ? "फार्म टैब में '📍 Use My Current Location (GPS)' बटन दबाएं या अपना जिला चुनें।" 
                  : "Click the '📍 Use My Current Location (GPS)' button in the Farms tab or select your district preset from the dropdown."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
