// Gemeinsame UI-Helfer: Tooltip, DOM, FLIP-Animation, Formatierung.

const tip = document.getElementById("tooltip");
export function showTip(html, evt){
  tip.innerHTML = html;
  tip.classList.add("show");
  moveTip(evt);
}
export function moveTip(evt){
  const pad=14, w=tip.offsetWidth, h=tip.offsetHeight;
  let x=evt.clientX+pad, y=evt.clientY+pad;
  if (x+w>innerWidth-8) x=evt.clientX-w-pad;
  if (y+h>innerHeight-8) y=evt.clientY-h-pad;
  tip.style.left=x+"px"; tip.style.top=y+"px";
}
export function hideTip(){ tip.classList.remove("show"); }

// HTML-Escaping für untrusted Werte (z.B. aus der URL), bevor sie in innerHTML landen.
export const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const el = (tag, cls, html)=>{ const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; };
export const fmt = (v, d=1)=>{ if(v==null||Number.isNaN(v))return "–"; const n=+v; return Math.abs(n)>=100?Math.round(n).toLocaleString("de-CH"):n.toFixed(d).replace(/\.0+$/,""); };
export const debounce = (fn,ms=180)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };
export const slug = s=> encodeURIComponent(s);

// FLIP: smooth Umordnung von Karten im Grid
export function flip(container, mutate){
  const kids=[...container.children];
  const first=new Map(kids.map(k=>[k, k.getBoundingClientRect()]));
  mutate();
  const after=[...container.children];
  for (const k of after){
    const f=first.get(k); if(!f) { k.animate([{opacity:0, transform:"scale(.96)"},{opacity:1, transform:"none"}],{duration:340,easing:"cubic-bezier(.22,.61,.36,1)"}); continue; }
    const l=k.getBoundingClientRect(); const dx=f.left-l.left, dy=f.top-l.top;
    if(dx||dy) k.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:"none"}],{duration:420,easing:"cubic-bezier(.22,.61,.36,1)"});
  }
}

// Info-Badge mit Hover-Popover (Glossar)
import { GLOSSARY } from "./glossary.js";
export function infoBadge(termKey, { label="" }={}){
  const g = GLOSSARY[termKey]; if(!g) return el("span");
  const s = el("span","info"); s.innerHTML = (label?`<span class="info-lab">${label}</span>`:"")+`<span class="info-i">i</span>`;
  const html = `<b>${g.t}</b><br>${g.d}`;
  const show = e=>showTip(html,e);
  s.addEventListener("mousemove",show); s.addEventListener("mouseleave",hideTip);
  s.addEventListener("click",e=>{ e.stopPropagation(); show(e); });
  return s;
}
export function tipFor(termKey){ const g=GLOSSARY[termKey]; return g?`<b>${g.t}</b><br>${g.d}`:""; }

// kleines Fuzzy-Matching für die Suche
export function fuzzy(q, s){
  q=q.toLowerCase().trim(); s=s.toLowerCase();
  if(!q) return true;
  if(s.includes(q)) return true;
  let i=0; for(const ch of s){ if(ch===q[i]) i++; if(i===q.length) return true; }
  return false;
}
