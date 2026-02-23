import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line,
  Cell, Legend
} from "recharts";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      "#f4f6f0",
  header:  "#1b3a2d",
  accent:  "#3a7d5a",
  lime:    "#74c69d",
  gold:    "#d4a017",
  red:     "#e63946",
  card:    "#ffffff",
  muted:   "#6b7c6b",
  border:  "#dce8dc",
};

const STORE_COLORS = {
  Kolsås:   "#2d6a4f",
  Åssiden:  "#52b788",
  Notodden: "#d4a017",
  Sande:    "#e76f51",
  Horten:   "#457b9d",
};

// ── Store data ────────────────────────────────────────────────────────────────
const STORES = {
  Kolsås: {
    salg: 98975, salgPct: -13.4, db: 48.0, dbDiff: -8.0,
    kunder: 268, kunderPct: -21.6, krKunde: 376, krKundeDiff: 36,
    kampanje: 10613, kampanjePct: 10.7,
    varegrupper: [
      { name: "Inneplanter", salg: 20305, db: 42.9 },
      { name: "Frø og løk",  salg: 12711, db: 57.1 },
      { name: "Dekor",       salg: 9713,  db: 56.1 },
      { name: "Pet",         salg: 8353,  db: 60.6 },
      { name: "Hageredskap", salg: 8074,  db: 55.2 },
      { name: "Snittblomst", salg: 7380,  db: 45.5 },
    ],
    radar: [78, 77, 38, 62, 82],
  },
  Åssiden: {
    salg: 66765, salgPct: -48.0, db: 54.7, dbDiff: -1.0,
    kunder: 275, kunderPct: -24.5, krKunde: 250, krKundeDiff: -110,
    kampanje: 10281, kampanjePct: 15.4,
    varegrupper: [
      { name: "Inneplanter", salg: 18557, db: 49.5 },
      { name: "Pet",         salg: 8542,  db: 48.4 },
      { name: "Snittblomst", salg: 7384,  db: 47.3 },
      { name: "Dekor",       salg: 5807,  db: 65.1 },
      { name: "Jord/gjødsel",salg: 5316,  db: 77.3 },
      { name: "Frø og løk",  salg: 4772,  db: 56.8 },
    ],
    radar: [30, 80, 42, 68, 55],
  },
  Notodden: {
    salg: 53981, salgPct: -21.8, db: 55.2, dbDiff: 4.6,
    kunder: 217, kunderPct: -7.3, krKunde: 256, krKundeDiff: -46,
    kampanje: 6996, kampanjePct: 13.0,
    varegrupper: [
      { name: "Inneplanter", salg: 16644, db: 55.9 },
      { name: "Jord/gjødsel",salg: 7018,  db: 73.5 },
      { name: "Pet",         salg: 6436,  db: 40.8 },
      { name: "Frø og løk",  salg: 4418,  db: 58.3 },
      { name: "Hageredskap", salg: 4394,  db: 61.2 },
      { name: "Dekor",       salg: 4391,  db: 57.3 },
    ],
    radar: [56, 82, 60, 58, 65],
  },
  Sande: {
    salg: 101816, salgPct: -13.2, db: 50.4, dbDiff: -3.4,
    kunder: 374, kunderPct: -12.0, krKunde: 280, krKundeDiff: -2,
    kampanje: 10393, kampanjePct: 10.2,
    varegrupper: [
      { name: "Pet",         salg: 21386, db: 40.6 },
      { name: "Inneplanter", salg: 20095, db: 59.0 },
      { name: "Snittblomst", salg: 17181, db: 53.8 },
      { name: "Mat",         salg: 9484,  db: 44.4 },
      { name: "Dekor",       salg: 6876,  db: 57.5 },
      { name: "Innepotter",  salg: 4947,  db: 60.4 },
    ],
    radar: [66, 75, 65, 62, 72],
  },
  Horten: {
    salg: 80343, salgPct: -11.0, db: 52.1, dbDiff: -3.0,
    kunder: 337, kunderPct: -8.7, krKunde: 248, krKundeDiff: -3,
    kampanje: 17120, kampanjePct: 21.3,
    varegrupper: [
      { name: "Inneplanter", salg: 19960, db: 49.2 },
      { name: "Snittblomst", salg: 10608, db: 47.9 },
      { name: "Pet",         salg: 9033,  db: 43.5 },
      { name: "Frø og løk",  salg: 8697,  db: 56.7 },
      { name: "Dekor",       salg: 7137,  db: 54.6 },
      { name: "Jord/gjødsel",salg: 7081,  db: 77.7 },
    ],
    radar: [70, 78, 62, 72, 68],
  },
};

const STORE_NAMES = Object.keys(STORES);
const RADAR_AXES = ["Salg-trend", "DB %", "Kunder", "Kampanje", "Kr/kunde"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => n.toLocaleString("nb-NO");
const pct = (v, decimals = 1) =>
  (v >= 0 ? "+" : "") + v.toFixed(decimals) + "%";

const Arrow = ({ val }) =>
  val >= 0
    ? <span style={{ color: C.accent }}>▲ {Math.abs(val).toFixed(1)}%</span>
    : <span style={{ color: C.red  }}>▼ {Math.abs(val).toFixed(1)}%</span>;

const Tooltip2 = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:`1.5px solid ${C.accent}`,
      borderRadius:8, padding:"10px 14px", fontSize:12 }}>
      <p style={{ margin:0, fontWeight:700, color:C.header }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin:"2px 0", color: p.color || C.header }}>
          {p.name}: <b>{typeof p.value === "number" ? fmt(p.value) : p.value}</b>
        </p>
      ))}
    </div>
  );
};

// ── KPI card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, change, isUp }) => (
  <div style={{
    background: C.card, borderRadius: 12, padding: "16px 14px",
    borderTop: `3px solid ${isUp ? C.accent : C.red}`,
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  }}>
    <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
      color: C.muted, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 800, color: C.header }}>{value}</div>
    <div style={{ fontSize: 12, color: isUp ? C.accent : C.red, fontWeight: 600, marginTop: 3 }}>
      {isUp ? "▲" : "▼"} {change}
    </div>
  </div>
);

// ── Single store view ─────────────────────────────────────────────────────────
const StoreView = ({ name }) => {
  const d = STORES[name];
  const color = STORE_COLORS[name];
  const radarData = RADAR_AXES.map((s, i) => ({ subject: s, A: d.radar[i] }));

  return (
    <div>
      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:20 }}>
        <KpiCard label="Salg" value={`${fmt(d.salg)} kr`}
          change={`${Math.abs(d.salgPct).toFixed(1)}%`} isUp={d.salgPct >= 0} />
        <KpiCard label="DB %" value={`${d.db}%`}
          change={`${Math.abs(d.dbDiff).toFixed(1)} pp`} isUp={d.dbDiff >= 0} />
        <KpiCard label="Kunder" value={fmt(d.kunder)}
          change={`${Math.abs(d.kunderPct).toFixed(1)}%`} isUp={d.kunderPct >= 0} />
        <KpiCard label="Kr / kunde" value={`${fmt(d.krKunde)} kr`}
          change={`${d.krKundeDiff >= 0 ? "+" : ""}${d.krKundeDiff} kr`} isUp={d.krKundeDiff >= 0} />
        <KpiCard label="Kampanje" value={`${fmt(d.kampanje)} kr`}
          change={`${d.kampanjePct}% av total`} isUp={true} />
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:16 }}>
        <div style={{ background:C.card, borderRadius:14, padding:20,
          boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
          <h4 style={{ margin:"0 0 14px", fontSize:13, color:C.header }}>Salg per varegruppe (kr)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.varegrupper} margin={{ bottom:40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" />
              <XAxis dataKey="name" tick={{ fontSize:10 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize:10 }} />
              <Tooltip content={<Tooltip2 />} />
              <Bar dataKey="salg" name="Salg (kr)" fill={color} radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:C.card, borderRadius:14, padding:20,
          boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
          <h4 style={{ margin:"0 0 14px", fontSize:13, color:C.header }}>Ytelsesradar</h4>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e0ece0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize:10, fill:"#555" }} />
              <Radar dataKey="A" stroke={color} fill={color} fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
          {/* DB bars */}
          <div style={{ marginTop:8 }}>
            {d.varegrupper.slice(0,4).map((v, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <div style={{ width:80, fontSize:10, color:C.muted, flexShrink:0 }}>{v.name}</div>
                <div style={{ flex:1, background:"#f0f4f0", borderRadius:4, height:6, overflow:"hidden" }}>
                  <div style={{ width:`${Math.max(0,v.db)}%`, height:"100%", background: v.db > 60 ? C.accent : C.lime, borderRadius:4 }} />
                </div>
                <div style={{ width:38, fontSize:11, fontWeight:700, color: v.db > 50 ? C.accent : C.red, textAlign:"right" }}>{v.db}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Comparison view ───────────────────────────────────────────────────────────
const CompareView = () => {
  const salgsData = STORE_NAMES.map(n => ({
    name: n, salg: STORES[n].salg, db: STORES[n].db, kunder: STORES[n].kunder
  }));

  const trendData = STORE_NAMES.map(n => ({
    name: n,
    "Salg-trend": STORES[n].salgPct,
    "Kunder-trend": STORES[n].kunderPct,
    "DB-endring": STORES[n].dbDiff,
  }));

  return (
    <div style={{ display:"grid", gap:16 }}>
      {/* Summary table */}
      <div style={{ background:C.card, borderRadius:14, padding:20,
        boxShadow:"0 2px 10px rgba(0,0,0,0.05)", overflowX:"auto" }}>
        <h4 style={{ margin:"0 0 14px", fontSize:13, color:C.header }}>Sammenligning – alle butikker uke 8, 2026</h4>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ borderBottom:`2px solid ${C.border}` }}>
              {["Butikk","Salg","Salg +/-","DB %","DB +/-","Kunder","Kunder +/-","Kr/kunde","Kampanje"].map(h => (
                <th key={h} style={{ padding:"6px 10px", textAlign:"right", fontWeight:700,
                  color:C.muted, fontSize:10, letterSpacing:0.5, textTransform:"uppercase",
                  ...(h==="Butikk" ? {textAlign:"left"} : {}) }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STORE_NAMES.map((n, i) => {
              const d = STORES[n];
              return (
                <tr key={n} style={{ borderBottom:`1px solid ${C.border}`,
                  background: i % 2 === 0 ? "#fafcfa" : "#fff" }}>
                  <td style={{ padding:"8px 10px" }}>
                    <span style={{ display:"inline-block", width:10, height:10, borderRadius:"50%",
                      background:STORE_COLORS[n], marginRight:6, verticalAlign:"middle" }} />
                    <b style={{ color:C.header }}>{n}</b>
                  </td>
                  <td style={{ padding:"8px 10px", textAlign:"right", fontWeight:700 }}>{fmt(d.salg)}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right" }}><Arrow val={d.salgPct} /></td>
                  <td style={{ padding:"8px 10px", textAlign:"right", fontWeight:700 }}>{d.db}%</td>
                  <td style={{ padding:"8px 10px", textAlign:"right" }}><Arrow val={d.dbDiff} /></td>
                  <td style={{ padding:"8px 10px", textAlign:"right" }}>{fmt(d.kunder)}</td>
                  <td style={{ padding:"8px 10px", textAlign:"right" }}><Arrow val={d.kunderPct} /></td>
                  <td style={{ padding:"8px 10px", textAlign:"right" }}>{d.krKunde} kr</td>
                  <td style={{ padding:"8px 10px", textAlign:"right" }}>{d.kampanjePct}%</td>
                </tr>
              );
            })}
            {/* Avg row */}
            <tr style={{ borderTop:`2px solid ${C.border}`, background:"#f0f8f2", fontWeight:700 }}>
              <td style={{ padding:"8px 10px", color:C.accent }}>Snitt</td>
              <td style={{ padding:"8px 10px", textAlign:"right" }}>
                {fmt(Math.round(STORE_NAMES.reduce((s,n)=>s+STORES[n].salg,0)/STORE_NAMES.length))}
              </td>
              <td colSpan={7} />
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Salg bar */}
        <div style={{ background:C.card, borderRadius:14, padding:20,
          boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
          <h4 style={{ margin:"0 0 14px", fontSize:13, color:C.header }}>Salg sammenligning (kr)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salgsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" />
              <XAxis dataKey="name" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:10 }} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<Tooltip2 />} />
              <Bar dataKey="salg" name="Salg (kr)" radius={[6,6,0,0]}>
                {salgsData.map((e,i) => <Cell key={i} fill={STORE_COLORS[e.name]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend */}
        <div style={{ background:C.card, borderRadius:14, padding:20,
          boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
          <h4 style={{ margin:"0 0 14px", fontSize:13, color:C.header }}>Endringstrender vs. fjoråret (%)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" horizontal={false}/>
              <XAxis type="number" tick={{ fontSize:10 }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize:11 }} width={68} />
              <Tooltip content={<Tooltip2 />} />
              <Bar dataKey="Salg-trend" fill="#e76f51" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("Sammenligning");
  const tabs = ["Sammenligning", ...STORE_NAMES];
  const today = new Date().toLocaleDateString("nb-NO", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"Georgia, serif" }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(120deg, ${C.header} 0%, #2d5a3d 100%)`,
        color:"#fff", padding:"24px 36px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", opacity:0.6, marginBottom:4 }}>
              Hageland · Daglig salgsrapport
            </div>
            <h1 style={{ margin:0, fontSize:28, fontWeight:400 }}>Butikkoversikt</h1>
            <div style={{ fontSize:12, opacity:0.6, marginTop:4, textTransform:"capitalize" }}>{today} · Uke 8, 2026</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, opacity:0.6 }}>Kjedeomsetning</div>
            <div style={{ fontSize:24, fontWeight:800 }}>7 598 484 kr</div>
            <div style={{ fontSize:12, color:"#ffb3b3" }}>▼ 11,5% vs. fjoråret</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActive(t)} style={{
              background: active === t ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.07)",
              border: active === t ? "1px solid rgba(255,255,255,0.45)" : "1px solid rgba(255,255,255,0.12)",
              color:"#fff", borderRadius:"8px 8px 0 0", padding:"8px 18px",
              fontSize:12, cursor:"pointer", fontFamily:"inherit",
              borderBottom: active === t ? "1px solid " + C.bg : "1px solid rgba(255,255,255,0.12)",
              marginBottom: active === t ? -1 : 0, transition:"all 0.15s",
              ...(active === t ? { paddingBottom:9 } : {}),
              ...(t !== "Sammenligning" ? { borderLeft:`3px solid ${STORE_COLORS[t]}` } : {}),
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"24px 36px" }}>
        {active === "Sammenligning" ? (
          <CompareView />
        ) : (
          <StoreView name={active} />
        )}
      </div>

      <div style={{ textAlign:"center", padding:"8px 0 20px", fontSize:10, color:C.muted }}>
        Kilde: Hageland Seebrite · Oppdateres daglig
      </div>
    </div>
  );
}
