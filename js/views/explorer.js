// Explorer: filterbares Karten-Raster aller Lebensmittel.
import { DB, getNut } from "../data.js";
import { el, fuzzy, flip, slug, fmt, infoBadge } from "../ui.js";
import { TIERS, MACRO_KEYS, nutLabel } from "../meta.js";

const HCLASS = { arm:"histaminarm", liberator:"Liberator", reich:"histaminreich", unklar:"unklar" };
const HKEY = { arm:"arm", liberator:"liberator", reich:"reich", unklar:"unklar" };
const f = { q:"", cats:new Set(), hist:new Set(), clusters:new Set(), sort:"name" };

function topTier(food){
  let best=null; for(const w of food.wirkungen){ const r=TIERS[w.evidenz_tier]?.rank||0; if(!best||r>best.r) best={t:w.evidenz_tier,r}; }
  return best?.t || null;
}
function sparkline(food){
  const max=55;
  const bars = MACRO_KEYS.map((k,i)=>{ const v=getNut(food,k); if(v==null) return ""; const h=Math.max(2,Math.min(34, 34*v/max));
    return `<rect x="${i*22+2}" y="${34-h}" width="16" height="${h}" rx="3" fill="var(--accent)" opacity="${.45+.12*i}"><title>${nutLabel(k)}: ${fmt(v)} g/100g</title></rect>`; }).join("");
  return `<svg class="spark" viewBox="0 0 ${MACRO_KEYS.length*22} 34" preserveAspectRatio="none">${bars}</svg>`;
}
function matches(food){
  if(f.q && !fuzzy(f.q, food.name)) return false;
  if(f.cats.size && !f.cats.has(food.kategorie)) return false;
  if(f.hist.size && !f.hist.has(food.histamin.klasse)) return false;
  if(f.clusters.size && !food.wirkungen.some(w=>f.clusters.has(w.cluster))) return false;
  return true;
}
function sorted(list){
  if(f.sort==="name") return list.sort((a,b)=>a.name.localeCompare(b.name,"de"));
  if(f.sort==="effects") return list.sort((a,b)=>b.wirkungen.length-a.wirkungen.length);
  if(f.sort==="nutrients") return list.sort((a,b)=>b.naehrwerte.length-a.naehrwerte.length);
  if(f.sort==="density") return list.sort((a,b)=>b.densityScore-a.densityScore);
  return list;
}

export function renderExplorer(main){
  main.innerHTML = "";
  main.append(el("div","view-head",`<h2>Explorer</h2><p>328 Lebensmittel · filtern, suchen, vergleichen. Jede Karte führt zum vollen Nährwert- und Wirkungsprofil mit Quellenangabe.</p>`));

  const fb = el("div","filterbar");
  const rowSearch = el("div","row");
  const search = el("div","search"); const inp=el("input"); inp.placeholder="Lebensmittel suchen…"; inp.value=f.q; search.append(inp);
  const sortSel = el("select"); sortSel.innerHTML = `<option value="name">A–Z</option><option value="density">nährstoffreichste</option><option value="effects">meiste Wirkungen</option><option value="nutrients">meiste Nährwerte</option>`; sortSel.value=f.sort;
  rowSearch.append(search, sortSel);

  const rowCat = el("div","row"); rowCat.append(el("span","lab","Kategorie"));
  const catChips = el("div","chips");
  DB.categories.forEach(c=>{ const ch=el("button","chip"+(f.cats.has(c)?" on":""),c); ch.onclick=()=>{ f.cats.has(c)?f.cats.delete(c):f.cats.add(c); ch.classList.toggle("on"); update(); }; catChips.append(ch); });
  rowCat.append(catChips);

  const rowHist = el("div","row"); const histLab=el("span","lab","Histamin"); histLab.append(infoBadge("histamin")); rowHist.append(histLab);
  const hChips = el("div","chips");
  Object.entries(HCLASS).forEach(([k,lab])=>{ const ch=el("button","chip"+(f.hist.has(k)?" on":""),lab);
    ch.onclick=()=>{ f.hist.has(k)?f.hist.delete(k):f.hist.add(k); ch.classList.toggle("on"); update(); }; hChips.append(ch); });
  rowHist.append(hChips);

  const rowCl = el("div","row"); rowCl.append(el("span","lab","Wirkt bei"));
  const clChips = el("div","chips");
  DB.clusters.forEach(c=>{ const ch=el("button","chip"+(f.clusters.has(c)?" on":""),c);
    ch.onclick=()=>{ f.clusters.has(c)?f.clusters.delete(c):f.clusters.add(c); ch.classList.toggle("on"); update(); }; clChips.append(ch); });
  rowCl.append(clChips);

  fb.append(rowSearch, rowCat, rowHist, rowCl);
  main.append(fb);

  // Legende für die Sparkline
  const legend = el("div","spark-legend");
  legend.append(el("span","",`<svg class="spark" style="width:${MACRO_KEYS.length*22}px;height:22px" viewBox="0 0 ${MACRO_KEYS.length*22} 22">${MACRO_KEYS.map((k,i)=>`<rect x="${i*22+2}" y="${22-(6+i*3.2)}" width="16" height="${6+i*3.2}" rx="2" fill="var(--accent)" opacity="${.45+.12*i}"/>`).join("")}</svg>`));
  legend.append(el("span","sl-text",`Makro-Balken auf den Karten: <b>Protein · Kohlenhydrate · Fett · Ballaststoffe · Zucker</b> (g/100g)`));
  legend.append(infoBadge("sparkline"));
  main.append(legend);

  const countLine = el("div","count-line"); main.append(countLine);
  const grid = el("div","grid"); main.append(grid);

  function card(food){
    const c = el("div","card");
    const tt = topTier(food);
    c.innerHTML = `<div class="cat">${food.kategorie}</div><h3>${food.name}</h3>${sparkline(food)}
      <div class="meta-row">
        ${tt?`<span class="badge tier-badge tier-${tt}"><span class="dot" style="background:#fff"></span>Top-Evidenz ${tt}</span>`:""}
        <span class="badge ghost" title="Nährstoff-Dichte: ${food.densityScore} Mikronährstoffe ≥15% NRV">★ ${food.densityScore}</span>
        ${food.histamin.problematisch?`<span class="badge hist">${HCLASS[food.histamin.klasse]}</span>`:""}
      </div>`;
    c.onclick = ()=> location.hash = "#/food/"+slug(food.name);
    return c;
  }
  function update(){
    const list = sorted(DB.foods.filter(matches));
    countLine.innerHTML = `<b>${list.length}</b> von ${DB.foods.length} Lebensmitteln`;
    flip(grid, ()=>{ grid.innerHTML=""; list.forEach(fd=>grid.append(card(fd))); });
    if(!list.length) grid.innerHTML = `<div class="empty">Keine Treffer – Filter anpassen.</div>`;
  }
  inp.oninput = ()=>{ f.q=inp.value; update(); };
  sortSel.onchange = ()=>{ f.sort=sortSel.value; update(); };
  update();
}
