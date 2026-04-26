import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  Download,
  Fan,
  Leaf,
  LineChart,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const BRAND = {
  blue: "#006390",
  green: "#34E0A1",
  darkBlue: "#00354E",
  lightBlue: "#00B6ED",
  paleBlue: "#C9E8FB",
};

const fmtSEK = (n) =>
  new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
const fmt = (n, d = 0) => new Intl.NumberFormat("sv-SE", { maximumFractionDigits: d }).format(Number.isFinite(n) ? n : 0);

const systemRefs = {
  ftx: { label: "FTX / till- och frånluft med värmeåtervinning", sfpTarget: 1.6 },
  ft: { label: "FT / till- och frånluft utan värmeåtervinning", sfpTarget: 1.1 },
  fx: { label: "FX / frånluft med återvinning", sfpTarget: 0.75 },
  f: { label: "F / frånluft", sfpTarget: 0.5 },
};

function LogoLockup() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10 rounded-xl bg-white/10 shadow-inner ring-1 ring-white/20">
        <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[5px]" style={{ background: BRAND.green }} />
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px]" style={{ background: BRAND.blue }} />
      </div>
      <div>
        <div className="text-2xl font-black tracking-tight text-white">Bravida</div>
        <div className="-mt-1 text-xs font-medium uppercase tracking-[0.22em] text-white/65">Smart Airflow LCC</div>
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

function Field({ label, value, onChange, type = "number", step = "0.1", suffix, hint }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-sm font-semibold text-slate-700">
        {label}
        {suffix && <span className="text-xs font-medium text-slate-400">{suffix}</span>}
      </span>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#006390] focus:bg-white focus:ring-4 focus:ring-[#00B6ED]/15"
      />
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function KPI({ icon: Icon, label, value, sub, tone = "blue" }) {
  const tones = {
    blue: "from-[#006390] to-[#00354E]",
    green: "from-[#34E0A1] to-[#00B6ED]",
    dark: "from-slate-900 to-[#00354E]",
    warn: "from-amber-500 to-orange-600",
  };
  return (
    <Card className="overflow-hidden p-0">
      <div className={`bg-gradient-to-br ${tones[tone]} p-5 text-white`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white/75">{label}</p>
            <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {sub && <p className="mt-4 text-xs font-medium text-white/70">{sub}</p>}
      </div>
    </Card>
  );
}

function Badge({ children, tone = "blue" }) {
  const tones = {
    blue: "bg-[#C9E8FB] text-[#00354E]",
    green: "bg-[#34E0A1]/20 text-[#006390]",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

export default function App() {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({
    projectName: "Ventilationsaggregat – LCC-förslag",
    customer: "Kund / fastighet",
    buildingType: "Kontor / offentlig fastighet",
    region: "Region Södra Norrland",
    systemType: "ftx",
    airflow: 2.8,
    runtime: 4300,
    oldSfp: 2.45,
    newSfp: 1.35,
    electricityPrice: 1.65,
    oldService: 26000,
    newService: 18000,
    investment: 420000,
    period: 15,
    discountRate: 5.0,
    escalation: 2.0,
    co2Factor: 0.04,
    filterPressureDrop: 180,
    heatRecoveryOld: 62,
    heatRecoveryNew: 82,
  });

  const set = (key) => (value) => setData((d) => ({ ...d, [key]: value }));

  const calc = useMemo(() => {
    const q = Math.max(0, data.airflow);
    const oldPower = data.oldSfp * q;
    const newPower = data.newSfp * q;
    const oldEnergy = oldPower * data.runtime;
    const newEnergy = newPower * data.runtime;
    const savedEnergy = Math.max(0, oldEnergy - newEnergy);
    const energySavings = savedEnergy * data.electricityPrice;
    const serviceSavings = data.oldService - data.newService;
    const yearlySavings = energySavings + serviceSavings;
    const payback = yearlySavings > 0 ? data.investment / yearlySavings : Infinity;
    const co2Ton = (savedEnergy * data.co2Factor) / 1000;
    const target = systemRefs[data.systemType]?.sfpTarget ?? 1.6;
    let npv = -data.investment;
    let cumulative = -data.investment;
    const series = [];
    for (let year = 1; year <= data.period; year++) {
      const grown = yearlySavings * Math.pow(1 + data.escalation / 100, year - 1);
      const discounted = grown / Math.pow(1 + data.discountRate / 100, year);
      npv += discounted;
      cumulative += grown;
      series.push({
        year: `År ${year}`,
        besparing: Math.round(grown),
        nuvarde: Math.round(discounted),
        kumulativt: Math.round(cumulative),
      });
    }
    return {
      q,
      oldPower,
      newPower,
      oldEnergy,
      newEnergy,
      savedEnergy,
      energySavings,
      serviceSavings,
      yearlySavings,
      payback,
      co2Ton,
      npv,
      series,
      target,
      sfpGap: data.oldSfp - target,
      proposedGap: data.newSfp - target,
    };
  }, [data]);

  const recommendations = useMemo(() => {
    const list = [];
    if (data.oldSfp > calc.target) {
      list.push({
        title: "SFP över referensvärde",
        text: "Starta med tryckfallsanalys: filter, batterier, spjäll, don, ljuddämpare och kanalstråk. Kontrollera även fläktverkningsgrad och remdrift.",
        impact: "Hög",
      });
    }
    if (data.runtime > 3500) {
      list.push({
        title: "Drifttid ger stor besparingspotential",
        text: "Inför behovsstyrning via CO₂, närvaro eller zoner. Säkerställ tidkanaler och nattsänkning/nattstopp där verksamheten tillåter.",
        impact: "Hög",
      });
    }
    if (data.filterPressureDrop > 150) {
      list.push({
        title: "Högt filtertryckfall",
        text: "Lägg in filtertrend och larmnivåer. Byt inte bara på kalender – byt på verkligt tryckfall och energikostnad.",
        impact: "Medel",
      });
    }
    if (data.heatRecoveryNew - data.heatRecoveryOld >= 10) {
      list.push({
        title: "Värmeåtervinning kan säljas tydligare",
        text: "Komplettera LCC med värmebesparing baserat på gradtimmar, frånluftstemperatur, verkningsgrad och fjärrvärme-/värmepumpspris.",
        impact: "Medel",
      });
    }
    list.push({
      title: "Paketering mot kund",
      text: "Visa tre nivåer: Bas – injustering och driftoptimering, Plus – styrning och givare, Komplett – aggregat/EC-fläktar + uppföljning i dashboard.",
      impact: "Säljstöd",
    });
    return list;
  }, [data, calc.target]);

  const quality = [
    { label: "Luftflöde angivet", ok: data.airflow > 0 },
    { label: "SFP nuläge angivet", ok: data.oldSfp > 0 },
    { label: "Drifttid angiven", ok: data.runtime > 0 },
    { label: "Elpris angivet", ok: data.electricityPrice > 0 },
    { label: "Investeringskostnad angiven", ok: data.investment > 0 },
    { label: "Kalkylperiod angiven", ok: data.period > 0 },
  ];

  function exportReport() {
    const html = `<!doctype html><html lang="sv"><head><meta charset="utf-8"><title>${data.projectName}</title><style>
      body{font-family:Inter,Arial,sans-serif;margin:40px;color:#00354E} h1{color:#006390} .kpi{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.box{border:1px solid #d7e5ed;border-radius:18px;padding:18px}.big{font-size:28px;font-weight:800}.green{color:#008f68} table{width:100%;border-collapse:collapse;margin-top:18px}td,th{border-bottom:1px solid #e5eef3;padding:10px;text-align:left}.brand{color:#006390;font-weight:900}</style></head><body>
      <p class="brand">Bravida Smart Airflow LCC</p><h1>${data.projectName}</h1><p><b>Kund:</b> ${data.customer}<br><b>Fastighet:</b> ${data.buildingType}<br><b>Region:</b> ${data.region}</p>
      <div class="kpi"><div class="box"><p>Årlig besparing</p><div class="big green">${fmtSEK(calc.yearlySavings)}</div></div><div class="box"><p>Payback</p><div class="big">${fmt(calc.payback,1)} år</div></div><div class="box"><p>NPV</p><div class="big">${fmtSEK(calc.npv)}</div></div><div class="box"><p>CO₂-minskning</p><div class="big">${fmt(calc.co2Ton,2)} ton/år</div></div></div>
      <h2>Tekniska värden</h2><table><tr><th>Parameter</th><th>Nuläge</th><th>Förslag</th></tr><tr><td>SFP</td><td>${data.oldSfp}</td><td>${data.newSfp}</td></tr><tr><td>Fläkteffekt</td><td>${fmt(calc.oldPower,1)} kW</td><td>${fmt(calc.newPower,1)} kW</td></tr><tr><td>Elanvändning</td><td>${fmt(calc.oldEnergy)} kWh/år</td><td>${fmt(calc.newEnergy)} kWh/år</td></tr></table>
      <h2>Rekommenderade åtgärder</h2><ul>${recommendations.map((r) => `<li><b>${r.title}:</b> ${r.text}</li>`).join("")}</ul>
      <p><small>Rapporten är ett internt kalkylunderlag och ska kvalitetssäkras mot uppmätta driftdata, aktuella priser och projektets tekniska förutsättningar.</small></p></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.projectName.replace(/[^a-z0-9åäö]/gi, "_").toLowerCase()}_rapport.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const tabs = [
    { id: "overview", label: "Översikt", icon: BarChart3 },
    { id: "calc", label: "Kalkyl", icon: Settings2 },
    { id: "actions", label: "Åtgärder", icon: ClipboardList },
    { id: "report", label: "Säljunderlag", icon: Download },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${BRAND.darkBlue}, ${BRAND.blue})` }}>
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#34E0A1]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-40 w-[70vw] -translate-x-1/2 rounded-t-[6rem] bg-white/10" />
        <div className="relative mx-auto max-w-7xl px-6 py-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <LogoLockup />
            <div className="flex flex-wrap gap-2">
              <Badge tone="green">LCC</Badge>
              <Badge tone="blue">SFP-analys</Badge>
              <Badge tone="green">Energioptimering</Badge>
            </div>
          </div>
          <div className="grid gap-8 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 ring-1 ring-white/20">
                <Sparkles className="h-4 w-4 text-[#34E0A1]" /> Digitalt sälj- och analysverktyg för ventilation
              </p>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
                Gör ventilations-
                <span className="text-[#34E0A1]">åtgärder</span> begripliga, lönsamma och säljbara.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
                Beräkna LCC, SFP, återbetalning, klimatnytta och skapa ett kundunderlag direkt från tekniska indata.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: 0.12 }}>
              <Card className="bg-white/95 p-4 backdrop-blur">
                <div className="grid grid-cols-2 gap-3">
                  <KPI icon={Zap} label="Årlig besparing" value={fmtSEK(calc.yearlySavings)} sub="Energi + service" tone="green" />
                  <KPI icon={Activity} label="Payback" value={`${fmt(calc.payback, 1)} år`} sub="Enkel återbetalning" tone="blue" />
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-7 max-w-7xl px-6 pb-14">
        <nav className="mb-6 flex flex-wrap gap-2 rounded-[2rem] border border-slate-200 bg-white p-2 shadow-sm">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-3xl px-4 py-3 text-sm font-bold transition ${
                  active ? "bg-[#006390] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </nav>

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <KPI icon={Fan} label="Sparad fläktel" value={`${fmt(calc.savedEnergy)} kWh/år`} sub={`${fmt(calc.oldEnergy)} → ${fmt(calc.newEnergy)} kWh/år`} tone="blue" />
              <KPI icon={Leaf} label="CO₂-minskning" value={`${fmt(calc.co2Ton, 2)} ton/år`} sub={`${data.co2Factor} kg CO₂/kWh`} tone="green" />
              <KPI icon={LineChart} label="Nettonuvärde" value={fmtSEK(calc.npv)} sub={`${data.period} år, ${data.discountRate}% kalkylränta`} tone="dark" />
              <KPI icon={CheckCircle2} label="Föreslagen SFP" value={fmt(data.newSfp, 2)} sub={`Referens: ${calc.target} kW/(m³/s)`} tone={data.newSfp <= calc.target ? "green" : "warn"} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <Card>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-[#00354E]">Besparingskurva</h2>
                    <p className="text-sm text-slate-500">Årlig besparing och diskonterat nuvärde över kalkylperioden.</p>
                  </div>
                  <Badge tone={calc.npv > 0 ? "green" : "amber"}>{calc.npv > 0 ? "Positiv LCC" : "Behöver justeras"}</Badge>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={calc.series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => fmtSEK(v)} />
                      <Area type="monotone" dataKey="besparing" name="Årlig besparing" fill={BRAND.green} stroke={BRAND.green} fillOpacity={0.25} />
                      <Area type="monotone" dataKey="nuvarde" name="Diskonterat nuvärde" fill={BRAND.blue} stroke={BRAND.blue} fillOpacity={0.18} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-black text-[#00354E]">Datakvalitet</h2>
                <p className="mt-1 text-sm text-slate-500">Checklistan visar om kalkylen är redo för kunddialog.</p>
                <div className="mt-5 space-y-3">
                  {quality.map((q) => (
                    <div key={q.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-700">{q.label}</span>
                      {q.ok ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertTriangle className="h-5 w-5 text-amber-500" />}
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl bg-[#C9E8FB]/55 p-4 text-sm text-[#00354E]">
                  Tips: Nästa version bör kunna importera loggdata från BMS/SCADA, elmätdon eller Excel för att ersätta antaganden med verkliga driftdata.
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "calc" && (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <h2 className="text-2xl font-black text-[#00354E]">Projekt</h2>
              <div className="mt-5 grid gap-4">
                <Field label="Projektnamn" type="text" value={data.projectName} onChange={set("projectName")} step="1" />
                <Field label="Kund / fastighet" type="text" value={data.customer} onChange={set("customer")} step="1" />
                <Field label="Fastighetstyp" type="text" value={data.buildingType} onChange={set("buildingType")} step="1" />
                <Field label="Region" type="text" value={data.region} onChange={set("region")} step="1" />
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-slate-700">Systemtyp</span>
                  <select
                    value={data.systemType}
                    onChange={(e) => set("systemType")(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#006390] focus:bg-white focus:ring-4 focus:ring-[#00B6ED]/15"
                  >
                    {Object.entries(systemRefs).map(([key, item]) => (
                      <option key={key} value={key}>{item.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl font-black text-[#00354E]">Tekniska och ekonomiska indata</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Dimensionerande luftflöde" value={data.airflow} onChange={set("airflow")} suffix="m³/s" />
                <Field label="Drifttid" value={data.runtime} onChange={set("runtime")} suffix="h/år" step="100" />
                <Field label="SFP nuläge" value={data.oldSfp} onChange={set("oldSfp")} suffix="kW/(m³/s)" />
                <Field label="SFP förslag" value={data.newSfp} onChange={set("newSfp")} suffix="kW/(m³/s)" />
                <Field label="Elpris" value={data.electricityPrice} onChange={set("electricityPrice")} suffix="kr/kWh" />
                <Field label="Investering" value={data.investment} onChange={set("investment")} suffix="kr" step="10000" />
                <Field label="Servicekostnad nuläge" value={data.oldService} onChange={set("oldService")} suffix="kr/år" step="1000" />
                <Field label="Servicekostnad förslag" value={data.newService} onChange={set("newService")} suffix="kr/år" step="1000" />
                <Field label="Kalkylperiod" value={data.period} onChange={set("period")} suffix="år" step="1" />
                <Field label="Kalkylränta" value={data.discountRate} onChange={set("discountRate")} suffix="%" />
                <Field label="Prisökning energi/service" value={data.escalation} onChange={set("escalation")} suffix="%/år" />
                <Field label="CO₂-faktor" value={data.co2Factor} onChange={set("co2Factor")} suffix="kg/kWh" step="0.01" />
                <Field label="Filtertryckfall" value={data.filterPressureDrop} onChange={set("filterPressureDrop")} suffix="Pa" step="10" />
                <Field label="Återvinning nuläge" value={data.heatRecoveryOld} onChange={set("heatRecoveryOld")} suffix="%" />
                <Field label="Återvinning förslag" value={data.heatRecoveryNew} onChange={set("heatRecoveryNew")} suffix="%" />
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <h2 className="text-2xl font-black text-[#00354E]">Resultat</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <div className="rounded-3xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Fläkteffekt nuläge</p><p className="mt-1 text-2xl font-black">{fmt(calc.oldPower, 1)} kW</p></div>
                <div className="rounded-3xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Fläkteffekt förslag</p><p className="mt-1 text-2xl font-black">{fmt(calc.newPower, 1)} kW</p></div>
                <div className="rounded-3xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Energibesparing</p><p className="mt-1 text-2xl font-black">{fmt(calc.savedEnergy)} kWh/år</p></div>
                <div className="rounded-3xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Besparing totalt</p><p className="mt-1 text-2xl font-black">{fmtSEK(calc.yearlySavings)}</p></div>
              </div>
            </Card>
          </div>
        )}

        {tab === "actions" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-[#00354E]">Prioriterade åtgärder</h2>
                  <p className="mt-1 text-sm text-slate-500">Appen översätter tekniska värden till konkret nästa steg.</p>
                </div>
                <Badge tone="green">{recommendations.length} förslag</Badge>
              </div>
              <div className="mt-5 space-y-4">
                {recommendations.map((r, idx) => (
                  <motion.div key={r.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="text-lg font-black text-slate-900">{r.title}</h3>
                      <Badge tone={r.impact === "Hög" ? "green" : r.impact === "Medel" ? "blue" : "slate"}>{r.impact}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{r.text}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
            <Card>
              <h2 className="text-2xl font-black text-[#00354E]">Säljpaket</h2>
              <div className="mt-5 space-y-4">
                {[
                  ["Bas", "Injustering, tidkanaler, filterstrategi och verifiering av SFP."],
                  ["Plus", "Bas + CO₂-/närvarostyrning, givare, larm och energiuppföljning."],
                  ["Komplett", "Plus + aggregat/EC-fläktar, styrintegration och löpande optimering."],
                ].map(([name, text]) => (
                  <div key={name} className="rounded-3xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-[#34E0A1]/20 p-3"><Building2 className="h-5 w-5 text-[#006390]" /></div>
                      <h3 className="text-xl font-black text-[#00354E]">{name}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "report" && (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <h2 className="text-2xl font-black text-[#00354E]">Kundbudskap</h2>
              <div className="mt-5 rounded-3xl bg-[#00354E] p-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#34E0A1]">Sammanfattning</p>
                <h3 className="mt-3 text-3xl font-black leading-tight">{data.projectName}</h3>
                <p className="mt-4 leading-7 text-white/75">
                  Genom att sänka SFP från {fmt(data.oldSfp, 2)} till {fmt(data.newSfp, 2)} beräknas fläktel minska med {fmt(calc.savedEnergy)} kWh per år. Det motsvarar cirka {fmtSEK(calc.yearlySavings)} i årlig besparing och en enkel återbetalningstid på {fmt(calc.payback, 1)} år.
                </p>
              </div>
              <button onClick={exportReport} className="mt-5 flex w-full items-center justify-center gap-2 rounded-3xl bg-[#006390] px-5 py-4 font-black text-white shadow-sm transition hover:bg-[#00354E]">
                <Download className="h-5 w-5" /> Exportera HTML-rapport
              </button>
            </Card>
            <Card>
              <h2 className="text-2xl font-black text-[#00354E]">Före / efter</h2>
              <p className="mt-1 text-sm text-slate-500">Visualisering för intern prioritering och kundpresentation.</p>
              <div className="mt-5 h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "El kWh/år", Nuläge: Math.round(calc.oldEnergy), Förslag: Math.round(calc.newEnergy) },
                    { name: "Service kr/år", Nuläge: Math.round(data.oldService), Förslag: Math.round(data.newService) },
                    { name: "SFP x 10", Nuläge: Math.round(data.oldSfp * 10), Förslag: Math.round(data.newSfp * 10) },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v, name, props) => props.payload.name.includes("kr") ? fmtSEK(v) : fmt(v)} />
                    <Bar dataKey="Nuläge" fill={BRAND.blue} radius={[10, 10, 0, 0]} />
                    <Bar dataKey="Förslag" fill={BRAND.green} radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
