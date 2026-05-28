// Lebensmittel-Detail: Radar, Schweiz/USDA-Vergleich, Wirkungen nach Cluster.
import { DB } from "../data.js";
import { el, fmt, slug, esc } from "../ui.js";
import { state, on } from "../state.js";
import { RADAR_KEYS, MACRO_KEYS, NUTRIENTS, TIERS, nutLabel, nutUnit, nrvPct, clusterColor } from "../meta.js";
import { drawRadar } from "../charts/radar.js";
import { drawDumbbell } from "../charts/dumbbell.js";

const HCLASS = { arm:"histaminarm", liberator:"Histamin-Liberator", reich:"histaminreich", unklar:"unklar (frisch=arm)" };

export function renderDetail(main, name){
  const food = DB.byName.get(name);
  main.innerHTML = "";
  if(!food){ main.innerHTML = `<div class="empty">Lebensmittel „${esc(name)}" nicht gefunden. <a href="#/" style="color:var(--accent)">zurück</a></div>`; return; }

  const back = el("a","back-btn","‹ zurück zum Explorer"); back.href="#/"; main.append(back);

  const kcal = food.nut.get("kalorien_kcal")?.val, prot = food.nut.get("eiweisse_g")?.val;
  const head = el("div","detail-head");
  head.innerHTML = `<div class="titles"><div class="cat">${food.kategorie}</div><h2>${food.name}</h2>
      <div style="margin-top:8px"><span class="badge ${food.histamin.problematisch?"risk":"ghost"}">Histamin: ${HCLASS[food.histamin.klasse]}</span></div></div>
    <div class="kpis">
      <div class="kpi"><div class="v">${fmt(kcal,0)}</div><div class="k">kcal/100g</div></div>
      <div class="kpi"><div class="v">${fmt(prot)}</div><div class="k">g Protein</div></div>
      <div class="kpi"><div class="v">${food.naehrwerte.length}</div><div class="k">Nährwerte</div></div>
      <div class="kpi"><div class="v">${food.wirkungen.length}</div><div class="k">Wirkungen</div></div>
    </div>`;
  main.append(head);

  // Grid: Radar | Dumbbell
  const grid = el("div","detail-grid");
  const pRadar = el("div","panel"); pRadar.innerHTML = `<h3>Nährstoff-Profil</h3><div class="hint">% des EU-Referenzwerts (NRV) pro 100 g · Hover für Wert &amp; Quelle</div>`;
  const radarBox = el("div"); pRadar.append(radarBox);
  const pCmp = el("div","panel"); pCmp.innerHTML = `<h3>Schweiz vs. USDA</h3><div class="hint">Prio 1 (Schweiz) vs. Prio 2 (USDA, Vergleichswert) — größte Abweichungen</div>`;
  const cmpBox = el("div"); pCmp.append(cmpBox);
  grid.append(pRadar, pCmp); main.append(grid);

  // Radar-Daten
  const axes=[], pts=[];
  for(const k of RADAR_KEYS){ const e=food.nut.get(k); if(!e) continue; const pct=nrvPct(k,e.val); if(pct==null) continue;
    axes.push(nutLabel(k)); pts.push({pct, valText:`${fmt(e.val)} ${nutUnit(k)} <span class="t-src">(${e.quelle})</span>`}); }
  if(axes.length>=3) drawRadar(radarBox, axes, [{name:food.name, points:pts}], {max:"auto"});
  else radarBox.innerHTML = `<div class="empty" style="padding:24px">Zu wenig Mikronährstoffe mit NRV für ein Radar.</div>`;

  // Macro-Bars
  const macro = el("div"); macro.style.marginTop="14px";
  macro.innerHTML = `<div class="hint" style="margin-bottom:6px">Makronährstoffe (g/100g)</div>` + MACRO_KEYS.map(k=>{
    const e=food.nut.get(k); if(!e) return ""; const w=Math.min(100, e.val/55*100);
    return `<div style="display:flex;align-items:center;gap:8px;margin:3px 0;font-size:.82rem">
      <span style="width:96px;color:var(--ink-soft)">${nutLabel(k)}</span>
      <span style="flex:1;height:9px;background:var(--surface-3);border-radius:99px;overflow:hidden"><span style="display:block;height:100%;width:${w}%;background:var(--accent);border-radius:99px"></span></span>
      <b style="width:48px;text-align:right">${fmt(e.val)}</b></div>`; }).join("");
  pRadar.append(macro);

  // Dumbbell-Daten
  const dumb=[]; for(const n of food.naehrwerte){ const u=parseFloat(n.usda_vergleich); const ch=food.nut.get(n.naehrstoff); if(ch && n.quelle.startsWith("CH-") && !Number.isNaN(u)) dumb.push({key:n.naehrstoff, ch:ch.val, usda:u}); }
  drawDumbbell(cmpBox, dumb);

  // Wirkungen nach Cluster
  const eff = el("div","panel"); eff.style.marginTop="18px";
  eff.innerHTML = `<h3>Wirkungen &amp; Evidenz</h3><div class="hint">Farbe = Evidenz-Stufe (A autorisiert → D unbelegt). Evidenz-Linse oben blendet schwache aus. Hover für Quelle.</div>`;
  const clBox = el("div"); eff.append(clBox); main.append(eff);

  const byCluster = d3.group(food.wirkungen, w=>w.cluster);
  const order = [...byCluster.keys()].sort((a,b)=> bestRank(byCluster.get(b))-bestRank(byCluster.get(a)));
  function bestRank(arr){ return Math.max(...arr.map(w=>TIERS[w.evidenz_tier]?.rank||0)); }

  for(const cl of order){
    const list = byCluster.get(cl).slice().sort((a,b)=>(TIERS[b.evidenz_tier]?.rank||0)-(TIERS[a.evidenz_tier]?.rank||0));
    const grp = el("div","effect-cluster");
    grp.innerHTML = `<div class="ch"><span class="cdot" style="background:${clusterColor(cl)}"></span>${cl} <span style="color:var(--muted);font-weight:500">· ${list.length}</span></div>`;
    const ul = el("div","effect-list");
    for(const w of list){
      const isRisk = w.typ==="risiko";
      const row = el("div",`effect-row t-${w.evidenz_tier}${isRisk?" risk":""}`);
      row.dataset.rank = TIERS[w.evidenz_tier]?.rank||0;
      row.innerHTML = `<span class="wname">${w.wirkung}</span><span class="tchip tier-${w.evidenz_tier}" style="background:${TIERS[w.evidenz_tier]?.color}">${w.evidenz_tier}</span>`;
      row.title = `${TIERS[w.evidenz_tier]?.desc}\nMechanismus: ${w.mechanismus}\nQuelle: ${w.quelle}\n${w.kommentar||""}`;
      ul.append(row);
    }
    grp.append(ul); clBox.append(grp);
  }
  applyLens(clBox);
  const off = on("lenschange", ()=>applyLens(clBox));
  // (Listener bleibt für die Sitzung; harmlos bei Re-Render)

  if(food.bemerkung){ const b=el("div","panel"); b.style.marginTop="14px"; b.innerHTML=`<h3>Bemerkung</h3><div style="font-size:.9rem;color:var(--ink-soft)">${food.bemerkung}</div>`; main.append(b); }
}

function applyLens(clBox){
  const min = state.lensMinRank;
  clBox.querySelectorAll(".effect-cluster").forEach(grp=>{
    let visible=0;
    grp.querySelectorAll(".effect-row").forEach(r=>{ const show=(+r.dataset.rank)>=min; r.classList.toggle("lens-hidden",!show); if(show)visible++; });
    grp.style.display = visible? "":"none";
  });
}
