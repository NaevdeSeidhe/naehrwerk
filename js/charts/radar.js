// Radar / Spider-Chart für Nährstoff-Profil (%NRV). D3 global.
import { showTip, moveTip, hideTip } from "../ui.js";

// series: [{name, color, points:[{label, pct, valText}]}]
// max: Zahl oder "auto" (skaliert auf Datenmaximum -> bessere Lesbarkeit)
export function drawRadar(container, axes, series, { size=360, max="auto" }={}){
  container.innerHTML = "";
  if(max==="auto"){
    const peak = d3.max(series, s=>d3.max(s.points, p=>p.pct)) || 0;
    const steps=[15,30,50,75,100,150,200,300,500,800,1200,2000,5000];
    max = steps.find(s=>s>=peak) || Math.ceil(peak/100)*100 || 100;
  }
  const r = size/2 - 46, cx = size/2, cy = size/2 + 6;
  const N = axes.length;
  const ang = i => (Math.PI*2*i/N) - Math.PI/2;
  const svg = d3.select(container).append("svg").attr("class","chart").attr("viewBox",`0 0 ${size} ${size}`).attr("width","100%");

  // Gitterringe
  const rings = [0.25,0.5,0.75,1];
  svg.append("g").selectAll("circle").data(rings).join("circle")
    .attr("cx",cx).attr("cy",cy).attr("r",d=>r*d).attr("fill","none").attr("class","gridline");
  svg.append("g").selectAll("text").data(rings).join("text")
    .attr("x",cx+3).attr("y",d=>cy-r*d).attr("font-size",9).attr("opacity",.6)
    .text(d=>Math.round(max*d)+"%");

  // Achsen + Labels
  axes.forEach((a,i)=>{
    const x=cx+Math.cos(ang(i))*r, y=cy+Math.sin(ang(i))*r;
    svg.append("line").attr("x1",cx).attr("y1",cy).attr("x2",x).attr("y2",y).attr("class","gridline");
    const lx=cx+Math.cos(ang(i))*(r+22), ly=cy+Math.sin(ang(i))*(r+22);
    svg.append("text").attr("x",lx).attr("y",ly).attr("text-anchor",Math.abs(Math.cos(ang(i)))<0.3?"middle":(Math.cos(ang(i))>0?"start":"end"))
      .attr("dy",".32em").attr("font-size",10).attr("font-weight",600).text(a);
  });

  series.forEach((s,si)=>{
    const pts = s.points.map((p,i)=>{ const v=Math.min(p.pct,max)/max; return [cx+Math.cos(ang(i))*r*v, cy+Math.sin(ang(i))*r*v]; });
    const line = d3.line().curve(d3.curveLinearClosed);
    const path = svg.append("path").attr("class","radar-area"+(si? " b":"")).attr("d",line(pts.map(()=>[cx,cy])));
    path.transition().duration(620).ease(d3.easeCubicOut).attr("d",line(pts));
    if(s.color){ path.style("stroke",s.color).style("fill",s.color).style("fill-opacity",.24); }
    svg.append("g").selectAll("circle").data(pts).join("circle")
      .attr("class","radar-dot").attr("cx",cx).attr("cy",cy).attr("r",3.5)
      .style("stroke", s.color||null)
      .on("mousemove",(e,d)=>{ const i=pts.indexOf(d); const p=s.points[i];
        showTip(`<b>${axes[i]}</b><br>${p.valText}<br><span class="t-src">${Math.round(p.pct)}% NRV${s.name?" · "+s.name:""}</span>`, e); })
      .on("mouseleave",hideTip)
      .transition().duration(620).delay((d,i)=>i*30).attr("cx",(d)=>d[0]).attr("cy",(d)=>d[1]);
  });
  return svg.node();
}
