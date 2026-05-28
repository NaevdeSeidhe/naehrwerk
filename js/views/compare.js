// Vergleich: 2–5 Lebensmittel als Radar-Overlay + Nährstoff-Tabelle.
import { DB } from "../data.js";
import { el, fuzzy, fmt } from "../ui.js";
import { RADAR_KEYS, NUTRIENTS, nutLabel, nutUnit, nrvPct } from "../meta.js";
import { drawRadar } from "../charts/radar.js";

const COLORS = ["#7fa382","#bf888d","#899d8a","#d29da3","#9aa096"];
const picked = [];

export function renderCompare(main){
  main.innerHTML = "";
  main.append(el("div","view-head",`<h2>Vergleich</h2><p>Bis zu 5 Lebensmittel überlagern — Nährstoff-Radar (% NRV) und Detailtabelle. Such und füge hinzu.</p>`));

  const pick = el("div","compare-pick");
  const search = el("div","search"); search.style.maxWidth="260px"; const inp=el("input"); inp.placeholder="Lebensmittel hinzufügen…"; search.append(inp);
  const drop = el("div"); drop.style.cssText="position:relative;width:100%";
  pick.append(search); main.append(pick);
  const suggest = el("div"); suggest.style.cssText="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px"; main.append(suggest);

  const chipsWrap = el("div","compare-pick");
  main.insertBefore(chipsWrap, suggest);

  function renderChips(){
    chipsWrap.innerHTML="";
    picked.forEach((name,i)=>{ const p=el("span","cpill"); p.style.background=COLORS[i]; p.innerHTML=`${name} <button title="entfernen">×</button>`;
      p.querySelector("button").onclick=()=>{ picked.splice(i,1); renderChips(); draw(); }; chipsWrap.append(p); });
    if(!picked.length) chipsWrap.append(el("span","",`<span style="color:var(--muted);font-size:.85rem">noch nichts gewählt</span>`));
  }
  function renderSuggest(q){
    suggest.innerHTML="";
    if(!q){ return; }
    DB.foods.filter(f=>fuzzy(q,f.name)&&!picked.includes(f.name)).slice(0,8).forEach(f=>{ const b=el("button","chip",f.name);
      b.onclick=()=>{ if(picked.length<5){ picked.push(f.name); inp.value=""; renderSuggest(""); renderChips(); draw(); } }; suggest.append(b); });
  }
  inp.oninput=()=>renderSuggest(inp.value.trim());

  const panel=el("div","panel"); panel.innerHTML=`<h3>Nährstoff-Radar (% NRV)</h3><div class="hint">Overlay der Mikronährstoffe</div>`;
  const radarBox=el("div"); panel.append(radarBox);
  const legend=el("div","legend"); legend.style.marginTop="10px"; panel.append(legend);
  main.append(panel);
  const tableP=el("div","panel"); tableP.style.marginTop="16px"; const tableBox=el("div"); tableP.append(tableBox); main.append(tableP);

  function draw(){
    if(picked.length<1){ radarBox.innerHTML=`<div class="empty" style="padding:30px">Mindestens ein Lebensmittel wählen.</div>`; legend.innerHTML=""; tableBox.innerHTML=""; return; }
    // gemeinsame Achsen: RADAR_KEYS, die mind. ein LM hat
    const keys = RADAR_KEYS.filter(k=>picked.some(n=>DB.byName.get(n)?.nut.get(k)));
    const axes = keys.map(nutLabel);
    const series = picked.map((n,i)=>{ const f=DB.byName.get(n);
      return { name:n, color:COLORS[i], points:keys.map(k=>{ const e=f.nut.get(k); const pct=e?nrvPct(k,e.val):0;
        return { pct:pct||0, valText: e?`${fmt(e.val)} ${nutUnit(k)}`:"–" }; }) }; });
    if(axes.length>=3) drawRadar(radarBox, axes, series, {max:"auto"}); else radarBox.innerHTML=`<div class="empty">zu wenig gemeinsame Nährstoffe</div>`;
    legend.innerHTML = `<span class="li" style="color:var(--muted)">Radar skaliert automatisch · % EU-NRV</span>` + picked.map((n,i)=>`<span class="li"><span class="sw" style="background:${COLORS[i]}"></span>${n}</span>`).join("");
    // Tabelle mit Inline-Balken (pro Zeile relativ zum Zeilen-Maximum)
    const allKeys = [...new Set(picked.flatMap(n=>[...DB.byName.get(n).nut.keys()]))]
      .filter(k=>NUTRIENTS[k]).sort((a,b)=>(NUTRIENTS[a].group+nutLabel(a)).localeCompare(NUTRIENTS[b].group+nutLabel(b),"de"));
    const rows = allKeys.map(k=>{
      const vals = picked.map(n=>DB.byName.get(n).nut.get(k)?.val ?? null);
      const rowMax = Math.max(...vals.filter(v=>v!=null), 0) || 1;
      const cells = picked.map((n,i)=>{ const v=vals[i];
        if(v==null) return `<td class="ct"><span class="ct-empty">–</span></td>`;
        const w=Math.max(3, 100*v/rowMax);
        return `<td class="ct"><span class="ctbar-wrap"><span class="ctbar" style="width:${w}%;background:${COLORS[i]}"></span></span><span class="ctval">${fmt(v)}</span></td>`;
      }).join("");
      return `<tr><td class="ck">${nutLabel(k)} <span class="cu">${nutUnit(k)}</span></td>${cells}</tr>`;
    }).join("");
    tableBox.innerHTML = `<div style="overflow-x:auto"><table class="ctable"><thead><tr><th></th>${picked.map((n,i)=>`<th style="color:${COLORS[i]}">${n}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  renderChips(); draw();
}
