// Evidenz-Dashboard: Sunburst Tier→Cluster + Verteilungs-Statistik.
import { DB, tierCounts } from "../data.js";
import { el, slug } from "../ui.js";
import { TIERS } from "../meta.js";
import { drawSunburst } from "../charts/sunburst.js";

export function renderEvidence(main){
  main.innerHTML = "";
  main.append(el("div","view-head",`<h2>Evidenz-Dashboard</h2><p>Die ehrliche Gesamtsicht: Wie verteilen sich alle ${DB.effects.length.toLocaleString("de-CH")} Wirkungs-Aussagen auf die Evidenz-Stufen? Bei Ernährung behauptet jede Quelle etwas anderes — hier zählt die Einordnung.</p>`));

  const c = tierCounts(); const total = DB.effects.length;
  const stats = el("div","stats"); stats.style.marginBottom="18px";
  stats.innerHTML = Object.keys(TIERS).map(t=>`<div class="stat"><div class="n" style="color:${TIERS[t].color}">${Math.round(100*c[t]/total)}%</div><div class="l">${TIERS[t].label.split(" · ")[1]} · ${c[t]}</div></div>`).join("");
  main.append(stats);

  // Tier-Balken (Proportion)
  const propo = el("div","panel"); propo.style.marginBottom="16px";
  propo.innerHTML = `<h3>Verteilung der Belege</h3><div class="hint">A = autorisiert, D = unbelegte Folklore (transparent behalten)</div>
    <div style="display:flex;height:30px;border-radius:99px;overflow:hidden;margin-top:10px">
    ${Object.keys(TIERS).map(t=>`<span title="${TIERS[t].label}: ${c[t]}" style="width:${100*c[t]/total}%;background:${TIERS[t].color}"></span>`).join("")}</div>
    <div style="margin-top:10px;font-size:.85rem;color:var(--ink-soft)">Nur <b>${Math.round(100*c.A/total)}%</b> aller Aussagen sind EFSA-autorisiert (Tier A) · <b>${Math.round(100*(c.C+c.D)/total)}%</b> sind vorläufig oder unbelegt. Krankheits-Claims (z. B. „bekämpft Krebs") sind bewusst nie Tier A.</div>`;
  main.append(propo);

  const panel = el("div","panel");
  panel.innerHTML = `<h3>Tier → Cluster</h3><div class="hint">Innenring = Evidenz-Stufe · Außenring = Themen-Cluster · <b>Segment anklicken</b> für die Liste</div>`;
  const box = el("div"); panel.append(box); main.append(panel);

  const listP = el("div","panel"); listP.style.marginTop="16px";
  listP.innerHTML = `<h3 id="dlTitle">Auswahl</h3><div class="hint">Klicke ein Segment im Ring oben.</div>`;
  const listBox = el("div"); listP.append(listBox); main.append(listP);

  const byTier = d3.group(DB.effects, e=>e.evidenz_tier);
  const root = { name:"root", children: Object.keys(TIERS).filter(t=>byTier.has(t)).map(t=>{
    const byCl = d3.rollup(byTier.get(t), v=>v.length, e=>e.cluster);
    return { name:t, children:[...byCl.entries()].map(([cl,n])=>({name:cl, value:n})) };
  })};

  function drill({tier,cluster}){
    const sub = DB.effects.filter(e=> e.evidenz_tier===tier && (!cluster||e.cluster===cluster));
    document.getElementById("dlTitle").innerHTML = `${TIERS[tier].label}${cluster?` · ${cluster}`:""} <span style="color:var(--muted);font-weight:500">· ${sub.length} Aussagen</span>`;
    // gruppiert nach Wirkung
    const byW = d3.group(sub, e=>e.wirkung);
    listBox.innerHTML = "";
    [...byW.entries()].sort((a,b)=>b[1].length-a[1].length).forEach(([w,arr])=>{
      const g=el("div","effect-cluster");
      g.innerHTML = `<div class="ch"><span class="tchip tier-${tier}" style="background:${TIERS[tier].color}">${tier}</span> ${w} <span style="color:var(--muted);font-weight:500">· ${arr.length} LM</span></div>`;
      const chips=el("div","chips");
      [...new Set(arr.map(e=>e.food))].slice(0,40).forEach(fn=>{ const c=el("button","chip",fn); c.onclick=()=>location.hash="#/food/"+slug(fn); chips.append(c); });
      g.append(chips); listBox.append(g);
    });
  }
  drawSunburst(box, root, { size: Math.min(460, box.clientWidth||460), onClick:drill });
}
