// Beeswarm-Verteilung eines Nährstoffs über alle LM, mit Hervorhebung. D3 global.
import { showTip, hideTip } from "../ui.js";
import { nutLabel, nutUnit } from "../meta.js";

// data: [{name, val}], highlight: Name(string) optional, onPick(name)
export function drawBeeswarm(container, key, data, { highlight=null, onPick=null }={}){
  container.innerHTML = "";
  const W = container.clientWidth||760, H=190, m={l:18,r:18,t:24,b:34};
  const x = d3.scaleLinear().domain([0, d3.max(data,d=>d.val)*1.02||1]).range([m.l, W-m.r]).nice();
  const svg = d3.select(container).append("svg").attr("class","chart").attr("viewBox",`0 0 ${W} ${H}`).attr("width","100%");
  // Achse
  const ax = d3.axisBottom(x).ticks(6).tickFormat(d=>d>=1000?d/1000+"k":d);
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${H-m.b})`).call(ax).call(g=>g.select(".domain").remove());
  svg.append("text").attr("x",W-m.r).attr("y",H-6).attr("text-anchor","end").attr("font-size",10).attr("fill","var(--muted)").text(`${nutLabel(key)} (${nutUnit(key)}/100g)`);

  // Simulation für Beeswarm
  const cy=(m.t+(H-m.b))/2;
  const nodes = data.map(d=>({...d, x:x(d.val), y:cy}));
  const sim = d3.forceSimulation(nodes)
    .force("x", d3.forceX(d=>x(d.val)).strength(1))
    .force("y", d3.forceY(cy).strength(.08))
    .force("collide", d3.forceCollide(4.4))
    .stop();
  for(let i=0;i<120;i++) sim.tick();

  const color = d3.scaleSequential(d3.interpolateRgbBasis(["#c5d3c6","#9fbba1","#899d8a"])).domain([0,d3.max(data,d=>d.val)||1]);
  svg.append("g").selectAll("circle").data(nodes).join("circle")
    .attr("class",d=> "bee"+(highlight&&d.name===highlight?" hl":"")+(highlight&&d.name!==highlight?" dim":""))
    .attr("cx",d=>d.x).attr("cy",cy).attr("r",0)
    .attr("fill",d=> highlight&&d.name===highlight ? "var(--accent-2)" : color(d.val))
    .style("cursor", onPick?"pointer":"default")
    .on("mousemove",(e,d)=>showTip(`<b>${d.name}</b><br>${d.val} ${nutUnit(key)}`,e))
    .on("mouseleave",hideTip)
    .on("click",(e,d)=> onPick && onPick(d.name))
    .transition().duration(500).delay((d,i)=>i*3).attr("cy",d=>d.y).attr("r",d=> highlight&&d.name===highlight?6.5:3.6);
}
