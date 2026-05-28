// Animierte horizontale Balken (Ranglisten / Wirkungs-Explorer). D3 global.
import { showTip, hideTip } from "../ui.js";

// items: [{label, value, color, sub, onClick, tipHtml}]
export function drawBars(container, items, { unit="", height=null }={}){
  container.innerHTML = "";
  if(!items.length){ container.innerHTML = `<div class="empty" style="padding:30px">Keine Treffer.</div>`; return; }
  const W = container.clientWidth||560, rowH=34, m={l:158,r:54,t:6,b:6};
  const H = height || (m.t+m.b+items.length*rowH);
  const max = d3.max(items,d=>d.value)||1;
  const x = d3.scaleLinear().domain([0,max]).range([m.l, W-m.r]);
  const svg = d3.select(container).append("svg").attr("class","chart").attr("viewBox",`0 0 ${W} ${H}`).attr("width","100%");
  items.forEach((d,i)=>{
    const y=m.t+i*rowH, g=svg.append("g").attr("class","barrow").attr("transform",`translate(0,${y})`);
    if(d.onClick) g.style("cursor","pointer").on("click",d.onClick);
    g.on("mousemove",e=> d.tipHtml && showTip(d.tipHtml,e)).on("mouseleave",hideTip);
    if(d.tag){ // kleine Tier-Pille ganz links
      g.append("rect").attr("x",2).attr("y",rowH/2-8).attr("width",20).attr("height",16).attr("rx",8).attr("fill",d.tag.color);
      g.append("text").attr("x",12).attr("y",rowH/2).attr("dy",".32em").attr("text-anchor","middle").attr("font-size",10).attr("font-weight",800).attr("fill","#fff").text(d.tag.text);
    }
    g.append("text").attr("x",m.l-10).attr("y",rowH/2).attr("dy",".32em").attr("text-anchor","end").attr("class","blabel").text(d.label);
    g.append("rect").attr("x",m.l).attr("y",6).attr("height",rowH-12).attr("rx",6).attr("fill","var(--surface-3)").attr("width",W-m.r-m.l);
    g.append("rect").attr("class","bar").attr("x",m.l).attr("y",6).attr("height",rowH-12).attr("rx",6).attr("fill",d.color||"var(--accent)").attr("width",0)
      .transition().duration(680).delay(i*40).ease(d3.easeCubicOut).attr("width",Math.max(2,x(d.value)-m.l));
    g.append("text").attr("x",W-m.r+6).attr("y",rowH/2).attr("dy",".32em").attr("font-size",11).attr("font-weight",700).attr("fill","var(--ink-soft)")
      .text((d.valLabel!=null?d.valLabel:d.value)+ (unit?(" "+unit):""));
    if(d.sub) g.append("title").text(d.sub);
  });
}
