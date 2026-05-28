// App-Bootstrap: Daten laden, Router, Theme, Evidenz-Linse, Navigation.
import { loadData } from "./data.js";
import { state, emit } from "./state.js";
import { LENS_LABELS, TIERS } from "./meta.js";
import { infoBadge, showTip, hideTip, esc } from "./ui.js";
import { GLOSSARY } from "./glossary.js";
import { renderExplorer } from "./views/explorer.js";
import { renderDetail } from "./views/detail.js";
import { renderEffects } from "./views/effects.js";
import { renderLab } from "./views/lab.js";
import { renderHeatmap } from "./views/heatmap.js";
import { renderEvidence } from "./views/evidence.js";
import { renderCompare } from "./views/compare.js";

const TABS = [
  { id:"explorer", label:"Explorer", route:"#/" },
  { id:"effects",  label:"Wirkungen", route:"#/effects" },
  { id:"lab",      label:"Nährstoff-Lab", route:"#/lab" },
  { id:"heatmap",  label:"Heatmap", route:"#/heatmap" },
  { id:"evidence", label:"Evidenz", route:"#/evidence" },
  { id:"compare",  label:"Vergleich", route:"#/compare" },
];
const view = document.getElementById("view");

function setActiveTab(id){
  document.querySelectorAll("#tabs button").forEach(b=> b.classList.toggle("active", b.dataset.id===id));
}

function router(){
  const h = location.hash || "#/";
  const m = h.match(/^#\/food\/(.+)$/);
  view.scrollIntoView({block:"start"});
  try {
    if (m){ setActiveTab("explorer"); renderDetail(view, decodeURIComponent(m[1])); return; }
    if (h.startsWith("#/effects")){ setActiveTab("effects"); renderEffects(view); return; }
    if (h.startsWith("#/lab")){ setActiveTab("lab"); renderLab(view); return; }
    if (h.startsWith("#/heatmap")){ setActiveTab("heatmap"); renderHeatmap(view); return; }
    if (h.startsWith("#/evidence")){ setActiveTab("evidence"); renderEvidence(view); return; }
    if (h.startsWith("#/compare")){ setActiveTab("compare"); renderCompare(view); return; }
    setActiveTab("explorer"); renderExplorer(view);
  } catch(err){ view.innerHTML = `<div class="empty">Fehler beim Rendern: ${esc(err.message)}</div>`; console.error(err); }
}

function buildTabs(){
  const nav = document.getElementById("tabs");
  for (const t of TABS){
    const b = document.createElement("button");
    b.textContent = t.label; b.dataset.id = t.id;
    b.onclick = ()=> location.hash = t.route;
    nav.appendChild(b);
  }
}

function initTheme(){
  const saved = localStorage.getItem("nw-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark":"light");
  setTheme(saved);
  document.getElementById("themeBtn").onclick = ()=> setTheme(state.theme==="dark"?"light":"dark");
}
function setTheme(t){
  state.theme = t;
  document.documentElement.dataset.theme = t;
  localStorage.setItem("nw-theme", t);
  document.getElementById("themeBtn").textContent = t==="dark" ? "☀" : "◐";
  emit("themechange", t);
}

function initLens(){
  // Segment-Band: D(0) · C(1) · B(2) · A(3) — Schwelle = ab diesem Tier sichtbar.
  const cap = document.getElementById("lensCap");
  cap.append(infoBadge("lens"));
  const seg = document.getElementById("lensSeg");
  const TIER_BY_V = ["D","C","B","A"]; // Segment-Reihenfolge (v = min sichtbarer Tier-Index)
  seg.innerHTML = "";
  TIER_BY_V.forEach((t,v)=>{
    const b = document.createElement("button"); b.className="lseg"; b.dataset.v=v; b.dataset.tier=t;
    b.style.setProperty("--c", TIERS[t].color);
    b.innerHTML = `<span class="ls-letter">${t}</span><span class="ls-word">${t==="D"?"alle":TIERS[t].label.split(" · ")[1]}</span>`;
    const g = GLOSSARY["tier_"+t];
    b.addEventListener("mousemove",e=> showTip(`<b>${g.t}</b><br>${g.d}<br><span class="t-src">Klick: nur ab Stufe ${t} zeigen</span>`,e));
    b.addEventListener("mouseleave",hideTip);
    b.onclick = ()=>{ state.lensValue = v; updateLens(); emit("lenschange", v); };
    seg.append(b);
  });
  updateLens();
}
function updateLens(){
  const v = state.lensValue;
  document.querySelectorAll("#lensSeg .lseg").forEach(b=>{
    const bv = +b.dataset.v;
    b.classList.toggle("lit", bv>=v);     // diese Tiers werden gezeigt
    b.classList.toggle("active", bv===v); // aktuelle Schwelle
  });
}

(async function main(){
  buildTabs(); initTheme(); initLens();
  try { await loadData(); }
  catch(e){ view.innerHTML = `<div class="empty">Daten konnten nicht geladen werden.<br><small>${esc(e.message)}</small><br><br>Bitte die App über einen lokalen Server öffnen (siehe README): <code>python -m http.server</code></div>`; return; }
  addEventListener("hashchange", router);
  router();
})();
