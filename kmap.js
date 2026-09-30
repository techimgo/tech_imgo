/* kmap.js — 대한민국 17개 시·도 백지도 (공용)
 * 사용법:
 *   <script src="kmap.js"></script>   (스타일은 이 파일이 스스로 넣으므로 CSS 파일 불필요)
 *   <div id="kmap-mount"></div>
 *   const km = KMap.mount('#kmap-mount', {
 *     initial: '서울',
 *     render: name => KMap.card({title:name, big:{label:'..', value:'..', sub:'..'}, rows:[['라벨','값']]}),
 *     onSelect: name => { ... }   // 사용자가 지도에서 지역을 눌렀을 때
 *   });
 *   km.select('부산');   // 코드에서 선택 변경 (onSelect는 호출되지 않음)
 *   km.refresh();        // 데이터가 바뀌었을 때 카드만 다시 그림
 * 지역 이름: 서울 경기 인천 강원 충북 충남 대전 세종 경북 경남 대구 울산 부산 전북 전남 광주 제주
 */
(function(){
  const CSS=`/* Shared Korea map (kmap.js) — 페이지가 정의한 CSS 변수를 쓰되, 없으면 fallback */ .mapbox{display:grid;grid-template-columns:minmax(0,290px) 1fr;gap:18px;align-items:start} @media(max-width:640px){.mapbox{grid-template-columns:1fr}} .kmap{width:100%;max-width:290px;height:auto;display:block;margin:0 auto} .kmap .rg{fill:var(--surface-2,#fafcfb);stroke:var(--line-2,#c3d1cb);stroke-width:.8;stroke-linejoin:round;cursor:pointer;transition:fill .12s;outline:none} .kmap .rg:hover{fill:var(--avg-soft,#07e29e2e)} .kmap .rg.is-me{fill:var(--cut2-soft,var(--warn-soft,#b8503f1a))} .kmap .rg:focus-visible{stroke:var(--avg-ink,#05815c);stroke-width:1.6} .kmap .mhl{fill:none;stroke:var(--cut2,var(--warn,#b8503f));stroke-width:1.8;stroke-linejoin:round;pointer-events:none} .kmap .lb{font:800 9px var(--sans,sans-serif);fill:var(--ink-2,#56655f);text-anchor:middle;pointer-events:none} .kmap .lb.sm2{font-size:6.5px} .kmap-note{margin:0;color:var(--ink-3,#869590);font-size:12.5px} .mcard{border:1px solid var(--line,#dde6e2);border-radius:14px;padding:16px;background:var(--surface,#fff);display:flex;flex-direction:column;gap:12px} .mcard h3{margin:0;font-size:18px;font-weight:800} .mcard h3 small{font-size:11.5px;color:var(--cut2,var(--warn,#b8503f));font-weight:700;margin-left:4px} .mbig{background:var(--ink,#0e1a16);color:#fff;border-radius:12px;padding:12px 14px} .mbig small{display:block;font-size:11.5px;color:#9fb3ab;font-weight:700} .mbig b{display:block;font-family:var(--mono,monospace);font-size:30px;line-height:1.2} .mbig span{font-size:12px;color:#9fb3ab} .mcard dl{margin:0;display:flex;flex-direction:column} .mcard dl>div{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--line,#dde6e2);font-size:13px} .mcard dt{color:var(--ink-3,#869590);font-weight:700;flex:none} .mcard dd{margin:0;text-align:right;font-family:var(--mono,monospace);font-variant-numeric:tabular-nums} .mcard dd small{font-family:var(--sans,sans-serif);font-size:11.5px;color:var(--ink-2,#56655f)} .mcard dd i{font-style:normal} .mcard .up{color:var(--cut2,var(--warn,#b8503f))}.mcard .dn{color:var(--avg-ink,#05815c)} .mcard .good{color:var(--avg-ink,#05815c)}.mcard .bad{color:var(--cut2,var(--warn,#b8503f))} `;
  function injectCSS(){if(document.getElementById('kmap-style'))return;const st=document.createElement('style');st.id='kmap-style';st.textContent=CSS;document.head.appendChild(st)}
const V={P1:[126.65,37.95],P2:[127.05,38.25],B1:[127.3,38.2],B2:[127.5,37.9],B3:[127.7,37.65],B4:[127.75,37.45],B5:[127.65,37.3],C1:[127.55,37.12],C2:[127.35,37.0],C3:[127.0,36.95],C4:[126.85,36.98],G1:[126.7,37.15],G2:[126.6,37.35],G3:[126.55,37.65],
d1:[127.7,38.3],d2:[128.1,38.3],d3:[128.37,38.62],E1:[128.6,38.1],E2:[128.95,37.75],E3:[129.1,37.5],E4:[129.35,37.25],K1:[129.3,37.08],K2:[128.9,37.05],K3:[128.5,37.0],H1:[128.2,37.15],H2:[127.9,37.3],
Q1:[128.4,36.85],Q2:[128.25,36.7],Q3:[128.05,36.45],Q4:[127.95,36.0],Q5:[127.6,36.05],Q6:[127.4,36.2],Q7:[127.35,36.5],Q8:[127.3,36.8],
R1:[127.3,35.97],R2:[127.0,36.0],R3:[126.7,36.0],T4:[126.5,36.1],T3:[126.45,36.4],T2:[126.12,36.85],T1:[126.5,37.0],
V0:[127.9,35.88],S1:[127.85,35.75],S2:[127.7,35.6],S3:[127.55,35.35],S4:[127.3,35.3],S5:[127.0,35.4],S6:[126.7,35.45],S7:[126.45,35.45],W1:[126.45,35.65],W2:[126.6,35.95],
U1:[127.65,35.15],U2:[127.75,34.95],U3:[127.6,34.65],U4:[127.3,34.5],U5:[127.05,34.55],U6:[126.75,34.4],U7:[126.5,34.3],U8:[126.3,34.5],U9:[126.3,34.85],U10:[126.4,35.15],
V1:[128.2,35.85],V2:[128.4,35.65],V3:[128.7,35.45],V4:[128.95,35.55],V5:[129.25,35.35],X4:[129.4,35.65],X3:[129.45,35.85],X2:[129.55,36.1],X1:[129.45,36.6],X0:[129.4,36.95],
F1:[129.1,35.05],F2:[128.85,35.0],F3:[128.6,34.85],F4:[128.3,34.85],F5:[127.95,34.75]};
const BR={경기:'P1 P2 B1 B2 B3 B4 B5 C1 C2 C3 C4 G1 G2 G3',강원:'B1 d1 d2 d3 E1 E2 E3 E4 K1 K2 K3 H1 H2 B5 B4 B3 B2',
충북:'B5 H2 H1 K3 Q1 Q2 Q3 Q4 Q5 Q6 Q7 Q8 C2 C1',충남:'C3 C2 Q8 Q7 Q6 Q5 R1 R2 R3 T4 T3 T2 T1 C4',
전북:'R3 R2 R1 Q5 Q4 V0 S1 S2 S3 S4 S5 S6 S7 W1 W2',전남:'S7 S6 S5 S4 S3 U1 U2 U3 U4 U5 U6 U7 U8 U9 U10',
경북:'K1 K2 K3 Q1 Q2 Q3 Q4 V0 V1 V2 V3 V4 X4 X3 X2 X1 X0',경남:'V0 V1 V2 V3 V4 V5 F1 F2 F3 F4 F5 U2 U1 S3 S2 S1'};
const MP={제주:[[126.15,33.33],[126.3,33.5],[126.55,33.52],[126.8,33.5],[126.95,33.45],[126.9,33.3],[126.65,33.22],[126.4,33.22]],
서울:[[126.8,37.58],[126.95,37.7],[127.1,37.68],[127.18,37.55],[127.05,37.45],[126.85,37.46]],
인천:[[126.38,37.82],[126.6,37.8],[126.72,37.62],[126.78,37.48],[126.68,37.33],[126.5,37.3],[126.35,37.45],[126.3,37.62]],
대전:[[127.3,36.3],[127.32,36.44],[127.46,36.47],[127.53,36.35],[127.42,36.22],[127.32,36.22]],
세종:[[127.18,36.5],[127.22,36.62],[127.35,36.66],[127.37,36.5],[127.28,36.45]],
광주:[[126.72,35.1],[126.82,35.25],[126.98,35.2],[126.95,35.05],[126.8,35.03]],
대구:[[128.42,35.85],[128.5,36.0],[128.75,36.0],[128.85,35.85],[128.7,35.72],[128.52,35.72]],
울산:[[128.95,35.52],[129.05,35.7],[129.4,35.72],[129.47,35.55],[129.35,35.38],[129.2,35.33]],
부산:[[128.85,35.05],[128.98,35.28],[129.15,35.33],[129.25,35.3],[129.2,35.15],[129.05,35.03]]};
const LB={강원:[128.35,37.6],경기:[127.3,37.8],충북:[127.85,36.8],충남:[126.8,36.6],전북:[127.2,35.7],전남:[127.1,34.85],경북:[128.75,36.5],경남:[128.3,35.35],제주:[126.55,33.37],
서울:[127.0,37.56],인천:[126.5,37.55],대전:[127.4,36.35],세종:[127.27,36.58],광주:[126.85,35.15],대구:[128.65,35.86],울산:[129.27,35.55],부산:[129.1,35.18]};
const SM=new Set(['서울','인천','대전','세종','광주','대구','울산','부산']);
const PX=q=>((q[0]-125.9)*72).toFixed(1)+','+((38.75-q[1])*90).toFixed(1),PD={};
for(const n in BR)PD[n]='M'+BR[n].split(' ').map(k=>PX(V[k])).join('L')+'Z';
for(const n in MP)PD[n]='M'+MP[n].map(PX).join('L')+'Z';

const ORD=[...Object.keys(BR),'제주','서울','인천','대전','세종','광주','대구','울산','부산'];
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function card(o){
  return `<h3>${esc(o.title)}${o.badge?` <small>${esc(o.badge)}</small>`:''}</h3>`+
    (o.big?`<div class="mbig"><small>${o.big.label}</small><b>${o.big.value}</b>${o.big.sub?`<span>${o.big.sub}</span>`:''}</div>`:'')+
    `<dl>${(o.rows||[]).map(r=>`<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('')}</dl>`;
}
function delta(v,digits){const d=digits==null?2:digits;return `<i class="${v>0?'up':v<0?'dn':''}">${v>0?'▲':v<0?'▼':''}${Math.abs(v).toFixed(d)}</i>`}
function mount(target,opt){
  opt=opt||{};
  injectCSS();
  const host=typeof target=='string'?document.querySelector(target):target;
  if(!host)throw new Error('KMap: mount target not found');
  host.innerHTML='<div class="mapbox"><svg class="kmap" viewBox="0 0 272 510" role="group" aria-label="대한민국 지역 백지도"></svg><div class="mcard" aria-live="polite"></div></div>'+
    (opt.note===false?'':'<p class="kmap-note">※ 지역 위치를 알기 쉽게 단순화한 백지도예요(도서 지역 일부 생략). 실제 경계와는 차이가 있어요.</p>');
  const svg=host.querySelector('.kmap'),mc=host.querySelector('.mcard');
  svg.innerHTML=ORD.map(n=>`<path class="rg" data-n="${n}" d="${PD[n]}" tabindex="0" role="button" aria-label="${n}"/>`).join('')+'<path class="mhl" d=""/>'+
    ORD.map(n=>{const p=PX(LB[n]).split(',');return `<text x="${p[0]}" y="${p[1]}" dy=".35em" class="lb${SM.has(n)?' sm2':''}">${n}</text>`}).join('');
  const hl=svg.querySelector('.mhl');
  let cur=opt.initial||'서울';
  function refresh(){mc.innerHTML=opt.render?opt.render(cur):''}
  function select(n){
    if(!PD[n])return;cur=n;
    svg.querySelectorAll('.rg').forEach(q=>q.classList.toggle('is-me',q.dataset.n==n));
    hl.setAttribute('d',PD[n]);refresh();
  }
  const pick=q=>{if(!q)return;select(q.dataset.n);if(opt.onSelect)opt.onSelect(q.dataset.n)};
  svg.addEventListener('click',e=>pick(e.target.closest('.rg')));
  svg.addEventListener('keydown',e=>{if(e.key=='Enter'||e.key==' '){const q=e.target.closest('.rg');if(q){e.preventDefault();pick(q)}}});
  select(cur);
  return{select,refresh,get current(){return cur}};
}
window.KMap={mount,card,delta,regions:ORD.slice()};
})();
