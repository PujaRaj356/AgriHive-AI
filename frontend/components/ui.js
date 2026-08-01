// ---------------- shared UI atoms ----------------
function Badge({ tone = "default", children }) {
  const tones = {
    default: "bg-sand-100 text-ink-900/70",
    GLOBAL: "bg-leaf-100 text-leaf-700",
    LOCAL: "bg-amber-100 text-amber-600",
    CANDIDATE: "bg-sky-100 text-sky-600",
    EXCLUDED: "bg-rose-100 text-rose-600",
    KEEP: "bg-leaf-100 text-leaf-700",
    EXCLUDE: "bg-rose-100 text-rose-600",
    ok: "bg-leaf-100 text-leaf-700",
    error: "bg-rose-100 text-rose-600",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${tones[children] || tones[tone]}`}>{children}</span>;
}

function Card({ title, subtitle, actions, children, pad = "p-5" }) {
  return (
    <div className="bg-white border border-sand-200 rounded-2xl shadow-[0_1px_2px_rgba(20,30,20,0.04)]">
      {(title || actions) && (
        <div className="flex items-start justify-between px-5 pt-5 pb-3.5 border-b border-sand-100">
          <div>
            {title && <h3 className="text-[15px] font-bold text-ink-950">{title}</h3>}
            {subtitle && <p className="text-sm text-ink-950/45 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={pad}>{children}</div>
    </div>
  );
}

function Button({ children, onClick, variant = "primary", disabled, type = "button", icon }) {
  const variants = {
    primary: "bg-leaf-600 text-white hover:bg-leaf-700 disabled:bg-sand-200 disabled:text-ink-950/30",
    secondary: "bg-sand-100 text-ink-900 hover:bg-sand-200",
    ghost: "text-leaf-700 hover:bg-leaf-100",
    danger: "text-rose-600 hover:bg-rose-100",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]}`}>
      {icon}{children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-ink-950/40 mb-1">{label}</span>
      {children}
    </label>
  );
}
const inputCls = "w-full rounded-lg border border-sand-200 bg-sand-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent";

function StatCard({ label, value, hint, tone = "leaf", icon }) {
  const tones = { leaf: "bg-leaf-100 text-leaf-700", amber: "bg-amber-100 text-amber-600", sky: "bg-sky-100 text-sky-600", rose: "bg-rose-100 text-rose-600" };
  return (
    <div className="bg-white border border-sand-200 rounded-2xl p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-950/40">{label}</p>
        <p className="text-2xl font-extrabold mt-1.5">{value}</p>
        {hint && <p className="text-xs text-ink-950/40 mt-1">{hint}</p>}
      </div>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>{icon}</div>
    </div>
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const tone = toast.type === "error" ? "bg-rose-600" : "bg-ink-900";
  return (
    <div className={`fixed bottom-5 right-5 ${tone} text-white px-4 py-3 rounded-xl shadow-lg text-sm max-w-md z-50 flex items-start gap-3`}>
      <span className="flex-1">{toast.msg}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100"><IconX className="w-3.5 h-3.5" /></button>
    </div>
  );
}
