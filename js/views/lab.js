// Nährstoff-Lab: Verteilung (Beeswarm) + Top-Rangliste eines Nährstoffs.
import { DB } from "../data.js";
import { el, slug, fmt } from "../ui.js";
import { NUTRIENTS, nutLabel, nutUnit, nrvPct } from "../meta.js";
import { drawBeeswarm } from "../charts/beeswarm.js";
import { drawBars } from "../charts/bars.js";

let current = "vitamin_c_mg";

export function renderLab(main){
  main.innerHTML = "";
  main.append(el("div","view-head",`<h2>Nährstoff-Lab</h2><p>Wähle einen Nährstoff und sieh die Verteilung über alle Lebensmittel — wo liegt die Spitze, wo der Durchschnitt? Punkte sind anklickbar.</p>`));

  // Auswahl gruppiert
  const sel = el("select"); sel.style.marginBottom="16px";
  const groups = {};
  for(const [k,m] of Object.entries(NUTRIENTS)){ if(!DB.nutrientStats.has(k)) continue; (groups[m.group] ||= []).push([k,m]); }
  for(const [g,arr] of Object.entries(groups)){ const og=el("optgroup"); og.label=g; arr.sort((a,b)=>a[1].label.localeCompare(b[1].label,"de")).forEach(([k,m])=>{ const o=el("option"); o.value=k; o.textContent=m.label+(m.unit?` (${m.unit})`:""); if(k===current)o.selected=true; og.append(o); }); sel.append(og); }
  main.append(sel);

  const stat = el("div","stats"); stat.style.marginBottom="16px"; main.append(stat);
  const pBee = el("div","panel"); pBee.innerHTML=`<h3>Verteilung über 328 Lebensmittel</h3><div class="hint" id="beeHint"></div>`; const beeBox=el("div"); pBee.append(beeBox); main.append(pBee);
  const pTop = el("div","panel"); pTop.style.marginTop="16px"; pTop.innerHTML=`<h3>Top 20</h3><div class="hint">höchster Gehalt pro 100 g · klicken öffnet das Lebensmittel</div>`; const topBox=el("div"); pTop.append(topBox); main.append(pTop);

  function update(){
    const st = DB.nutrientStats.get(current); if(!st){ beeBox.innerHTML=`<div class="empty">keine Daten</div>`; return; }
    document.getElementById("beeHint").textContent = `${nutLabel(current)} · ${st.n} Lebensmittel mit Wert · Median ${fmt(st.median)} ${nutUnit(current)}`;
    stat.innerHTML = `
      <div class="stat"><div class="n">${fmt(st.max)}</div><div class="l">Maximum (${nutUnit(current)})</div></div>
      <div class="stat"><div class="n">${fmt(st.median)}</div><div class="l">Median</div></div>
      <div class="stat"><div class="n">${st.n}</div><div class="l">LM mit Wert</div></div>
      ${NUTRIENTS[current].nrv?`<div class="stat"><div class="n">${NUTRIENTS[current].nrv}</div><div class="l">EU-NRV (${nutUnit(current)})</div></div>`:""}`;
    drawBeeswarm(beeBox, current, st.values, { onPick:n=>location.hash="#/food/"+slug(n) });
    const top = st.values.slice().sort((a,b)=>b.val-a.val).slice(0,20).map(v=>{
      const pct = nrvPct(current, v.val);
      return { label:v.name.length>26?v.name.slice(0,25)+"…":v.name, value:v.val, valLabel:fmt(v.val),
        color:"var(--accent)", tipHtml:`<b>${v.name}</b><br>${fmt(v.val)} ${nutUnit(current)}${pct?`<br><span class="t-src">${Math.round(pct)}% NRV</span>`:""}`,
        onClick:()=>location.hash="#/food/"+slug(v.name) }; });
    drawBars(topBox, top, { unit:nutUnit(current) });
  }
  sel.onchange = ()=>{ current=sel.value; update(); };
  update();
}
