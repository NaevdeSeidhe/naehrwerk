// Lädt den Master-Datensatz und baut Indizes + Statistiken.
import { NUTRIENTS } from "./meta.js";

export const DB = {
  meta:null, foods:[], byName:new Map(),
  categories:[], clusters:[], effects:[], nutrientStats:new Map(),
};

export async function loadData(){
  const d = await fetch("data/healthdata_master.json").then(r=>r.json());
  DB.meta = d._meta;
  DB.foods = d.lebensmittel.map(f=>{
    const nut = new Map();
    for (const n of f.naehrwerte){ const v = parseFloat(n.wert); if(!Number.isNaN(v)) nut.set(n.naehrstoff, {val:v, quelle:n.quelle, usda:n.usda_vergleich}); }
    return { ...f, nut };
  });
  // Nährstoff-Dichte-Score: Anzahl Mikronährstoffe >=15% NRV/100g
  for (const f of DB.foods){
    let score=0;
    for (const [k,m] of Object.entries(NUTRIENTS)){ if(!m.nrv) continue; const e=f.nut.get(k); if(e && 100*e.val/m.nrv>=15) score++; }
    f.densityScore = score;
  }
  DB.byName = new Map(DB.foods.map(f=>[f.name,f]));
  DB.categories = [...new Set(DB.foods.map(f=>f.kategorie))].sort((a,b)=>a.localeCompare(b,"de"));

  // Wirkungen flach indexieren
  const cl = new Set();
  for (const f of DB.foods){
    for (const w of f.wirkungen){
      cl.add(w.cluster);
      DB.effects.push({ food:f.name, ...w });
    }
  }
  DB.clusters = [...cl].sort((a,b)=>a.localeCompare(b,"de"));

  // Nährstoff-Statistik (für Verteilungen / Heatmap-Skalen)
  for (const key of Object.keys(NUTRIENTS)){
    const vals = [];
    for (const f of DB.foods){ const e=f.nut.get(key); if(e) vals.push({name:f.name, val:e.val}); }
    if (vals.length){
      const arr = vals.map(v=>v.val).sort((a,b)=>a-b);
      DB.nutrientStats.set(key, {
        values:vals, n:vals.length,
        min:arr[0], max:arr[arr.length-1],
        median:arr[Math.floor(arr.length/2)],
        p95:arr[Math.floor(arr.length*0.95)],
      });
    }
  }
  return DB;
}

export const getNut = (f,k)=> f.nut.get(k)?.val ?? null;
export const hasNut = (f,k)=> f.nut.has(k);

// Effekt-Aggregat pro Tier (für Stats / Dashboard)
export function tierCounts(effects=DB.effects){
  const c = {A:0,B:0,C:0,D:0};
  for (const e of effects) if (c[e.evidenz_tier]!=null) c[e.evidenz_tier]++;
  return c;
}
