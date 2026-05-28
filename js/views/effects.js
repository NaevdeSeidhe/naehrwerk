// Wirkungs-Explorer: Cluster → Wirkung → Lebensmittel (tier-gefärbt). Linsen-aware.
import { DB } from "../data.js";
import { el, slug } from "../ui.js";
import { state, on } from "../state.js";
import { TIERS, NUTRIENTS, nutLabel, nutUnit, nrvPct } from "../meta.js";
import { drawBars } from "../charts/bars.js";

const sel = { cluster:null, wirkung:null };

export function renderEffects(main){
  main.innerHTML = "";
  main.append(el("div","view-head",`<h2>Wirkungs-Explorer</h2><p>„Was hilft bei …?" — wähle ein Themen-Cluster, dann eine Wirkung. Die Lebensmittel werden nach Evidenz-Stufe eingefärbt. Die Evidenz-Linse oben blendet schwache Belege aus.</p>`));

  const cl = el("div","chips"); cl.style.marginBottom="16px";
  DB.clusters.forEach(c=>{ const ch=el("button","chip"+(sel.cluster===c?" on":""),c);
    ch.onclick=()=>{ sel.cluster=c; sel.wirkung=null; renderEffects(main); }; cl.append(ch); });
  main.append(cl);

  if(!sel.cluster){ main.append(el("div","empty","Wähle oben ein Cluster.")); return; }

  const grid = el("div"); grid.style.display="grid"; grid.style.gridTemplateColumns="1fr 1fr"; grid.style.gap="18px";
  const pW = el("div","panel"); pW.innerHTML=`<h3>Wirkungen in „${sel.cluster}"</h3><div class="hint">Balkenlänge = Anzahl Lebensmittel · Farbe = beste Evidenz · klicken</div>`;
  const wBox=el("div"); pW.append(wBox);
  const pF = el("div","panel"); pF.innerHTML=`<h3>Lebensmittel</h3><div class="hint" id="fHint">Wirkung links wählen</div>`;
  const fBox=el("div"); pF.append(fBox);
  grid.append(pW,pF); main.append(grid);
  if(innerWidth<860) grid.style.gridTemplateColumns="1fr";

  function wirkungenList(){
    const min=state.lensMinRank;
    const map=new Map(); // wirkung -> {foods:Set, bestRank, tier}
    for(const e of DB.effects){ if(e.cluster!==sel.cluster) continue; const rank=TIERS[e.evidenz_tier]?.rank||0; if(rank<min) continue;
      if(!map.has(e.wirkung)) map.set(e.wirkung,{foods:new Set(),bestRank:0,tier:"D"});
      const o=map.get(e.wirkung); o.foods.add(e.food); if(rank>o.bestRank){o.bestRank=rank;o.tier=e.evidenz_tier;} }
    const items=[...map.entries()].map(([w,o])=>({label:w.length>34?w.slice(0,33)+"…":w, full:w, value:o.foods.size, color:TIERS[o.tier].color,
      tipHtml:`<b>${w}</b><br>${o.foods.size} Lebensmittel · beste Evidenz ${o.tier}`,
      onClick:()=>{ sel.wirkung=w; renderFoods(); document.querySelectorAll(".barrow").forEach(b=>b.style.opacity=.55); } }))
      .sort((a,b)=>b.value-a.value).slice(0,16);
    drawBars(wBox, items);
  }
  function renderFoods(){
    const min=state.lensMinRank;
    // betroffene Effekt-Zeilen
    const erows = DB.effects.filter(e=>e.wirkung===sel.wirkung && (TIERS[e.evidenz_tier]?.rank||0)>=min);
    // Mechanismus bestimmen: häufigster Mechanismus, der ein Nährstoff-Key ist
    const mechVotes={}; for(const e of erows){ if(NUTRIENTS[e.mechanismus]) mechVotes[e.mechanismus]=(mechVotes[e.mechanismus]||0)+1; }
    const mechKey = Object.keys(mechVotes).sort((a,b)=>mechVotes[b]-mechVotes[a])[0] || null;
    const basis = mechKey ? `${nutLabel(mechKey)} (% NRV)` : "Nährstoff-Dichte";
    document.getElementById("fHint").innerHTML = sel.wirkung
      ? `Balkenlänge = <b>${basis}</b> · Farbe/Pille = Evidenz · nährstoffreichste zuoberst`
      : "Wirkung links wählen";

    // pro LM beste Evidenz behalten
    const byFood=new Map();
    for(const e of erows){ const r=TIERS[e.evidenz_tier].rank; const cur=byFood.get(e.food);
      if(!cur||r>cur.rank) byFood.set(e.food,{food:e.food,tier:e.evidenz_tier,rank:r,quelle:e.quelle}); }

    const items=[...byFood.values()].map(o=>{
      const f=DB.byName.get(o.food); let value, valLabel, tip;
      if(mechKey){ const e=f?.nut.get(mechKey); const pct=e?nrvPct(mechKey,e.val):0;
        value=pct||0; valLabel=Math.round(value)+"%"; tip=e?`${nutLabel(mechKey)}: ${e.val} ${nutUnit(mechKey)} (${Math.round(value)}% NRV)`:"kein Wert"; }
      else { value=f?.densityScore||0; valLabel=String(value); tip=`Nährstoff-Dichte: ${value} Mikronährstoffe ≥15% NRV`; }
      return { label:o.food.length>24?o.food.slice(0,23)+"…":o.food, value, valLabel,
        color:TIERS[o.tier].color, tag:{text:o.tier,color:TIERS[o.tier].color},
        tipHtml:`<b>${o.food}</b><br>${tip}<br><span class="t-src">Evidenz ${o.tier} · ${o.quelle}</span>`,
        onClick:()=>location.hash="#/food/"+slug(o.food) };
    }).sort((a,b)=>b.value-a.value).slice(0,20);
    drawBars(fBox, items);
  }
  wirkungenList();
  if(sel.wirkung) renderFoods();
  on("lenschange", ()=>{ if(document.body.contains(wBox)){ wirkungenList(); if(sel.wirkung) renderFoods(); } });
}
