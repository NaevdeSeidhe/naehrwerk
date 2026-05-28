// Heatmap-Matrix: Lebensmittel (Kategorie) × Nährstoffe (%NRV bzw. relativ).
import { DB } from "../data.js";
import { el, slug, fmt } from "../ui.js";
import { NUTRIENTS, nutUnit, nrvPct } from "../meta.js";
import { drawHeatmap } from "../charts/heatmap.js";

let cat = "Beeren", grp = "Vitamin";

export function renderHeatmap(main){
  main.innerHTML = "";
  main.append(el("div","view-head",`<h2>Heatmap</h2><p>Nährstoff-Dichte einer Kategorie auf einen Blick. Farbe = % EU-Referenzwert (NRV) pro 100 g; bei Makros relativ zum 95-Perzentil. Lücken = kein Wert.</p>`));

  const bar = el("div","row"); bar.style.cssText="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;align-items:center";
  const catSel=el("select"); DB.categories.forEach(c=>{ const o=el("option"); o.textContent=c; if(c===cat)o.selected=true; catSel.append(o); });
  const grpSeg=el("div","seg"); ["Vitamin","Mineral","Makro","Fett"].forEach(g=>{ const b=el("button",(g===grp?"on":""),g); b.onclick=()=>{grp=g; renderHeatmap(main);}; grpSeg.append(b); });
  bar.append(el("span","lab","Kategorie"),catSel,el("span","lab","Nährstoffe"),grpSeg); main.append(bar);

  const panel=el("div","panel"); const wrap=el("div","hm-wrap"); panel.append(wrap); main.append(panel);

  const foods = DB.foods.filter(f=>f.kategorie===cat).slice(0,40);
  const cols = Object.entries(NUTRIENTS).filter(([k,m])=>m.group===grp && DB.nutrientStats.has(k)).map(([k])=>k);
  const usesNRV = grp==="Vitamin"||grp==="Mineral";

  const valueFn=(rowName,key)=>{
    const f=DB.byName.get(rowName); const e=f?.nut.get(key); if(!e) return null;
    if(usesNRV){ const pct=nrvPct(key,e.val); return { disp:`${fmt(e.val)} ${nutUnit(key)}`, pct: pct==null? (e.val>0?40:0):pct }; }
    const st=DB.nutrientStats.get(key); const pct=100*e.val/(st.p95||1);
    return { disp:`${fmt(e.val)} ${nutUnit(key)}`, pct };
  };

  if(!foods.length||!cols.length){ wrap.innerHTML=`<div class="empty">Keine Daten für diese Auswahl.</div>`; }
  else drawHeatmap(wrap, foods.map(f=>({name:f.name})), cols, valueFn, { onPick:n=>location.hash="#/food/"+slug(n) });
  catSel.onchange=()=>{ cat=catSel.value; renderHeatmap(main); };
}
