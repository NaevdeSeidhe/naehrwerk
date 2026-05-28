// Heatmap-Matrix LM × Nährstoff (%NRV oder Wert). D3 global.
import { showTip, hideTip } from "../ui.js";
import { nutLabel } from "../meta.js";

// rows: [{name}], cols: [key], valueFn(rowName,key)->{v, disp, pct} (pct 0..100+ für Farbe)
export function drawHeatmap(container, rows, cols, valueFn, { onPick=null }={}){
  container.innerHTML = "";
  const cell=24, labW=150, labT=120;
  const W = labW + cols.length*cell + 16, H = labT + rows.length*cell + 8;
  const svg = d3.select(container).append("svg").attr("class","chart").attr("viewBox",`0 0 ${W} ${H}`).attr("width",W).style("max-width","none");
  // volle Palette: dusty-rose (niedrig) → … → dunkelgrün (hoch)
  const color = d3.scaleSequential(d3.interpolateRgbBasis(["#bf888d","#d29da3","#e0c0c3","#ebebeb","#c5d3c6","#9fbba1","#6e9070","#4f6e52"])).domain([0,100]);

  // Spaltenlabels (gedreht)
  svg.append("g").selectAll("text").data(cols).join("text")
    .attr("transform",(d,i)=>`translate(${labW+i*cell+cell/2},${labT-6}) rotate(-45)`)
    .attr("font-size",10).attr("fill","var(--ink-soft)").text(d=>nutLabel(d));

  rows.forEach((row,ri)=>{
    const g=svg.append("g").attr("transform",`translate(0,${labT+ri*cell})`);
    g.append("text").attr("x",labW-8).attr("y",cell/2).attr("dy",".32em").attr("text-anchor","end").attr("font-size",10).attr("fill","var(--ink-soft)")
      .style("cursor",onPick?"pointer":"default").text(row.name.length>22?row.name.slice(0,21)+"…":row.name)
      .on("click",()=>onPick&&onPick(row.name));
    cols.forEach((key,ci)=>{
      const r=valueFn(row.name,key);
      const rect=g.append("rect").attr("class","hm-cell").attr("x",labW+ci*cell+1).attr("y",1).attr("width",cell-2).attr("height",cell-2)
        .attr("fill", r==null? "var(--surface-2)" : color(Math.min(r.pct,100)))
        .on("mousemove",e=> r!=null && showTip(`<b>${row.name}</b><br>${nutLabel(key)}: ${r.disp}<br><span class="t-src">${Math.round(r.pct)}% NRV</span>`,e))
        .on("mouseleave",hideTip);
      rect.style("opacity",0).transition().duration(400).delay((ri+ci)*8).style("opacity",1);
    });
  });
}
