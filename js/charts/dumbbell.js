// Dumbbell: Schweiz (Prio 1) vs USDA (Prio 2) je Nährstoff. D3 global.
import { showTip, moveTip, hideTip } from "../ui.js";
import { nutLabel, nutUnit } from "../meta.js";

// rows: [{key, ch, usda}]  (nur Nährstoffe mit beiden Werten)
export function drawDumbbell(container, rows){
  container.innerHTML = "";
  if(!rows.length){ container.innerHTML = `<div class="empty" style="padding:24px">Keine Nährstoffe mit Schweiz- und USDA-Wert.</div>`; return; }
  rows = rows.slice().sort((a,b)=> Math.abs(b.ch-b.usda)/(Math.abs(b.ch)||1) - Math.abs(a.ch-a.usda)/(Math.abs(a.ch)||1)).slice(0,12);
  const W=container.clientWidth||440, rowH=30, m={l:128,r:24,t:26,b:10}, H=m.t+m.b+rows.length*rowH;
  const max = d3.max(rows, d=>Math.max(d.ch,d.usda))*1.05 || 1;
  const x = d3.scaleLinear().domain([0,max]).range([m.l, W-m.r]);
  const svg = d3.select(container).append("svg").attr("class","chart").attr("viewBox",`0 0 ${W} ${H}`).attr("width","100%");

  // Legende
  const lg = svg.append("g").attr("transform",`translate(${m.l},14)`);
  lg.append("circle").attr("r",5).attr("fill","var(--accent)"); lg.append("text").attr("x",10).attr("y",4).attr("font-size",10).text("Schweiz");
  lg.append("circle").attr("cx",78).attr("r",5).attr("fill","var(--accent-2)"); lg.append("text").attr("x",88).attr("y",4).attr("font-size",10).text("USDA");

  const g = svg.append("g");
  rows.forEach((d,i)=>{
    const y=m.t+i*rowH+rowH/2;
    g.append("text").attr("x",m.l-10).attr("y",y).attr("dy",".32em").attr("text-anchor","end").attr("font-size",10.5).text(nutLabel(d.key));
    g.append("line").attr("x1",x(Math.min(d.ch,d.usda))).attr("x2",x(Math.min(d.ch,d.usda))).attr("y1",y).attr("y2",y)
      .attr("stroke","var(--border-strong)").attr("stroke-width",2)
      .transition().duration(550).attr("x2",x(Math.max(d.ch,d.usda)));
    const mk=(val,color)=> g.append("circle").attr("cx",x(0)).attr("cy",y).attr("r",5.5).attr("fill",color)
      .on("mousemove",e=>showTip(`<b>${nutLabel(d.key)}</b><br>${val} ${nutUnit(d.key)}`,e)).on("mouseleave",hideTip)
      .transition().duration(550).attr("cx",x(val));
    mk(d.usda,"var(--accent-2)"); mk(d.ch,"var(--accent)");
  });
}
