// Sunburst der Evidenzverteilung (Tier → Cluster). D3 global.
import { showTip, hideTip } from "../ui.js";
import { TIERS, clusterColor } from "../meta.js";

// root: {name, children:[{name(tier), children:[{name(cluster), value}]}]}
export function drawSunburst(container, root, { size=420, onClick=null }={}){
  container.innerHTML = "";
  const radius = size/2;
  const hierarchy = d3.hierarchy(root).sum(d=>d.value).sort((a,b)=>b.value-a.value);
  const part = d3.partition().size([2*Math.PI, radius])(hierarchy);
  const arc = d3.arc().startAngle(d=>d.x0).endAngle(d=>d.x1).innerRadius(d=>d.y0).outerRadius(d=>d.y1-1).padAngle(.006).padRadius(radius/2);

  const svg = d3.select(container).append("svg").attr("class","chart").attr("viewBox",`${-radius} ${-radius} ${size} ${size}`).attr("width","100%").style("max-width",size+"px").style("margin","0 auto").style("display","block");
  const total = hierarchy.value;

  const segColor = d=>{
    if(d.depth===1) return TIERS[d.data.name]?.color || "var(--grey)";
    if(d.depth===2) return clusterColor(d.data.name);
    return "var(--surface)";
  };

  svg.append("g").selectAll("path").data(part.descendants().filter(d=>d.depth)).join("path")
    .attr("class","sun-seg").attr("fill",segColor).attr("d",arc)
    .style("opacity",0)
    .on("mousemove",(e,d)=>{ const tier=d.depth===1?d.data.name:d.parent.data.name;
      showTip(`<b>${d.depth===1?(TIERS[d.data.name]?.label||d.data.name):d.data.name}</b><br>${d.value} Wirkungen · ${(100*d.value/total).toFixed(0)}%${d.depth===2?"<br><span class='t-src'>Tier "+tier+"</span>":""}`,e); })
    .on("mouseleave",hideTip)
    .on("click",(e,d)=>{ if(!onClick) return; const tier=d.depth===1?d.data.name:d.parent.data.name; const cluster=d.depth===2?d.data.name:null; onClick({tier,cluster}); })
    .transition().duration(500).delay(d=>d.depth*120).style("opacity",d=>d.depth===1?.95:.82);

  const c = svg.append("g").attr("class","sun-center");
  c.append("text").attr("class","big").attr("dy","-.1em").text(total.toLocaleString("de-CH"));
  c.append("text").attr("class","small").attr("dy","1.4em").text("Wirkungen gesamt");
  return svg.node();
}
