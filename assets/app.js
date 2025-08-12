// FILE: assets/app.js
// helpers
const $=(q)=>document.querySelector(q);
const svgNS='http://www.w3.org/2000/svg';
const toNum=(el)=>Number(el?.value || el || 0);
const fmt=(x)=>new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(x);
const closeTo=(a,b,t=0.02)=>Math.abs(a-b)<=t*Math.max(1,Math.abs(b));

// SVG utils
function line(svg,x1,y1,x2,y2,stroke){ const L=document.createElementNS(svgNS,'line'); L.setAttribute('x1',x1);L.setAttribute('y1',y1);L.setAttribute('x2',x2);L.setAttribute('y2',y2);L.setAttribute('stroke',stroke);L.setAttribute('stroke-width','1');L.setAttribute('opacity','.9'); svg.appendChild(L); }
function rect(svg,x,y,w,h,fill){ const R=document.createElementNS(svgNS,'rect'); R.setAttribute('x',x);R.setAttribute('y',y);R.setAttribute('width',w);R.setAttribute('height',h);R.setAttribute('rx','8');R.setAttribute('fill',fill);R.setAttribute('opacity','.9'); svg.appendChild(R); }
function text(svg,txt,x,y,anchor,fill,size){ const T=document.createElementNS(svgNS,'text'); T.textContent=txt; T.setAttribute('x',x); T.setAttribute('y',y); T.setAttribute('text-anchor',anchor); T.setAttribute('fill',fill); T.setAttribute('font-size',size||'12px'); svg.appendChild(T); }
function drawBars(values, labels, colors){
  const w=560,h=200,p=30; const max=Math.max(...values)*1.1 || 1;
  const svg=document.createElementNS(svgNS,'svg'); svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  line(svg,p,10,p,h-30,'#334155'); line(svg,p,h-30,w-10,h-30,'#334155');
  values.forEach((v,i)=>{ const bw=60; const x=p+40+i*(bw+40); const bh=(v/max)*(h-60);
    rect(svg,x,h-30-bh,bw,bh,colors[i%colors.length]||'#8b5cf6');
    text(svg,labels[i],x+bw/2,h-10,'middle','#94a3b8','10px');
    text(svg,'$'+v.toFixed(2),x+bw/2,h-35-bh,'middle','#a7f3d0','11px');
  });
  return svg;
}
function plotCurve(xs, ys, xlabel, ylabel){
  const w=560,h=200,p=34; const minY=Math.min(...ys), maxY=Math.max(...ys);
  const minX=Math.min(...xs), maxX=Math.max(...xs);
  const sx = x=> p + (x-minX)/(maxX-minX||1)*(w-p-14);
  const sy = y=> h-26 - (y-minY)/(maxY-minY||1)*(h-60);
  const svg=document.createElementNS(svgNS,'svg'); svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  line(svg,p,10,p,h-26,'#334155'); line(svg,p,h-26,w-10,h-26,'#334155');
  let d=""; ys.forEach((y,i)=>{ const X=sx(xs[i]), Y=sy(y); d += (i?"L":"M")+X+","+Y; });
  const path=document.createElementNS(svgNS,'path'); path.setAttribute('d',d); path.setAttribute('fill','none'); path.setAttribute('stroke', '#8b5cf6'); path.setAttribute('stroke-width','2'); svg.appendChild(path);
  text(svg,xlabel,(p+w-10)/2,h-6,'middle','#94a3b8','10px');
  text(svg,ylabel,12,(h-26)/2,'middle','#94a3b8','10px');
  return svg;
}

// ---- Chapter 9 ----
function calcSpread(){
  const bid=toNum($('#bid')), ask=toNum($('#ask')), q=toNum($('#qty'));
  const spread = ask - bid;
  const pct = spread / ((ask+bid)/2) * 100;
  const cost = spread * q;
  const out=$('#spreadOut'); if(out) out.innerHTML = `Spread: $${spread.toFixed(2)} (${pct.toFixed(2)}%). Round-trip cost for ${fmt(q)} shares: <b>$${fmt(cost)}</b>`;
  const el=$('#spreadViz'); if(el){ const svg=drawBars([bid, ask],["Bid","Ask"], ['#22c55e','#8b5cf6']); el.innerHTML=''; el.appendChild(svg); }
}
function grade9(){
  let score=0; let msg=[];
  if((($('#q9_1')?.value||'').trim().toLowerCase()).includes('primary')){score++;} else msg.push('Q1: Primary');
  if((($('#q9_2')?.value||'').trim().toLowerCase()).includes('money')){score++;} else msg.push('Q2: Money');
  if((($('#q9_3')?.value||'').trim().toLowerCase()).includes('dealer')){score++;} else msg.push('Q3: Dealer');
  const s= (10.08-10.00)*2000; if(closeTo(Number($('#q9_4')?.value), s, 0.001))score++; else msg.push('Q4: $160');
  const res=$('#res9'); if(res) res.innerHTML = `Score ${score}/4 ${score===4?'✅':'❗'} <span class="muted">${msg.join(' · ')}</span>`;
}

// ---- Chapter 11 ----
function drawTimeline(container, n, pv, r, fromFV){
  if(!container) return;
  const w=560,h=200,p=30;
  const svg=document.createElementNS(svgNS,'svg'); svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  line(svg,p,h/2,w-10,h/2,'#334155');
  for(let i=0;i<=n;i++){ const x=p + i*(w-p-40)/n; line(svg,x,h/2-8,x,h/2+8,'#475569'); text(svg,'t'+i,x,h/2+24,'middle','#94a3b8','10px'); }
  text(svg, fromFV?'PV':'FV', w-40, 30, 'middle','#a5b4fc','12px');
  container.innerHTML=''; container.appendChild(svg);
}
function calcFV(){
  const pv=toNum($('#pv')), r=toNum($('#rate'))/100, n=toNum($('#nper'));
  const fv=pv*Math.pow(1+r,n);
  const out=$('#tvmOut'); if(out) out.textContent = `FV = $${fmt(fv)}`;
  drawTimeline($('#tvmViz'), n, pv, r);
}
function calcPV(){
  const fv=toNum($('#fv_in')), r=toNum($('#rate'))/100, n=toNum($('#nper'));
  const pv=fv/Math.pow(1+r,n);
  const out=$('#tvmOut'); if(out) out.textContent = `PV = $${fmt(pv)}`;
  drawTimeline($('#tvmViz'), n, pv, r, true);
}
function calcAnnuityPV(){
  const PMT=toNum($('#pmt')), r=toNum($('#arate'))/100, n=toNum($('#anper'));
  const pv = PMT * (1-Math.pow(1+r,-n))/r;
  const out=$('#annOut'); if(out) out.textContent=`PV (OA) = $${fmt(pv)}`;
}
function calcAnnuityFV(){
  const PMT=toNum($('#pmt')), r=toNum($('#arate'))/100, n=toNum($('#anper'));
  const fv = PMT * (Math.pow(1+r,n)-1)/r;
  const out=$('#annOut'); if(out) out.textContent=`FV (OA) = $${fmt(fv)}`;
}
function grade11(){
  const a1 = 12000/Math.pow(1.07,5);
  const a2 = 1200*(1-Math.pow(1.06,-10))/0.06;
  const a3 = Math.pow(1+0.12/12,12)-1;
  let s=0;
  if(closeTo(Number($('#q11_1')?.value), a1, 0.01)) s++; 
  if(closeTo(Number($('#q11_2')?.value), a2, 0.01)) s++;
  if(closeTo(Number($('#q11_3')?.value)/100, a3, 0.0005)) s++;
  const res=$('#res11'); if(res) res.textContent=`Score ${s}/3 (Targets: ${fmt(a1)}, ${fmt(a2)}, ${(a3*100).toFixed(2)}%)`;
}

// ---- Chapter 12 ----
function gordon(){
  const D1=toNum($('#d1')), r=toNum($('#dr'))/100, g=toNum($('#dg'))/100;
  const out=$('#gordonOut'); if(r<=g){ if(out) out.innerHTML='<span class="bad">Error:</span> r must exceed g.'; return; }
  const P = D1/(r-g);
  if(out) out.innerHTML=`<b>P₀ = $${fmt(P)}</b>`;
}
function miniDCF(){
  const fcf=[100,115,130]; const r=0.08, g=0.02;
  const pv = fcf.map((c,i)=> c/Math.pow(1+r,i+1)).reduce((a,b)=>a+b,0);
  const tv = (fcf[fcf.length-1]*(1+g))/(r-g);
  const pvTV = tv/Math.pow(1+r,3);
  const EV = pv + pvTV;
  const out=$('#dcfOut'); if(out) out.innerHTML = `PV(years1-3) = $${fmt(pv)} · PV(Terminal) = $${fmt(pvTV)} → <b>EV ≈ $${fmt(EV)}</b>`;
}

// ---- Chapter 13 ----
function NPV(rate, k0, cash){ return k0 + cash.reduce((acc,c,i)=> acc + c/Math.pow(1+rate,(i+1)), 0); }
function calcNPV_IRR(){
  const k0=toNum($('#k0')); const cfs=$('#cfs').value.split(',').map(s=>Number(s.trim())||0);
  const r=toNum($('#disc'))/100;
  const npv = NPV(r, k0, cfs);
  const out=$('#npvOut'); if(out) out.innerHTML=`NPV(@${(r*100).toFixed(2)}%) = <b>$${fmt(npv)}</b>`;
  const rates=[...Array(21)].map((_,i)=> i*0.02);
  const pts=rates.map(rt=>NPV(rt,k0,cfs));
  const svg = plotCurve(rates.map(x=>x*100), pts, 'Rate %', 'NPV');
  const el=$('#npvViz'); if(el){ el.innerHTML=''; el.appendChild(svg); }
}
function grade13(){
  let s=0; const t1=140; if(closeTo(Number($('#q13_1')?.value), t1, 0.001)) s++;
  if(closeTo(Number($('#q13_2')?.value), 3, 0.001)) s++;
  const pi = 950/900; if(closeTo(Number($('#q13_3')?.value), pi, 0.001)) s++;
  const res=$('#res13'); if(res) res.textContent = `Score ${s}/3 (NPV=140, PB≈3.00, PI≈${pi.toFixed(3)})`;
}

// ---- Chapter 15 ----
function underprice(){
  const offer=toNum($('#offer')), close=toNum($('#close')), M=toNum($('#shares'));
  const left=(close-offer)*M*1_000_000;
  const out=$('#underOut'); if(out) out.innerHTML=`Money left on the table: <b>$${fmt(left)}</b>`;
}
function netProceeds(){
  const gross=toNum($('#gross')), fee=toNum($('#fee'))/100;
  const net = gross*(1-fee);
  const out=$('#netOut'); if(out) out.innerHTML = `Net proceeds ≈ <b>$${fmt(net)}</b>`;
}
function calcTERP(){
  const Pcum=toNum($('#pcum')), S=toNum($('#subp')), n=toNum($('#rn'));
  const TERP = (n*Pcum + S)/(n+1);
  const rightVal = Pcum - TERP;
  const out=$('#rightsOut'); if(out) out.innerHTML=`TERP ≈ <b>$${fmt(TERP)}</b>; Right value ≈ <b>$${fmt(rightVal)}</b>`;
}

// gentle init
window.addEventListener('DOMContentLoaded', ()=>{ if($('#spreadViz')) calcSpread(); });
