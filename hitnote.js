/* hitnote.js — 적중노트 배너 + 헤더 공용 스크립트 (Web Animations API)
 * 페이지 맨 아래에 <script src="hitnote.js"></script> 한 줄이면 돼요.
 *  - <header> 안에 적중노트 배너(.promo)가 없으면 mock.html과 같은 배너를 만들어 넣고,
 *    이미 있으면(mock.html) 그대로 두고 움직임만 입혀요.
 *  - h1[data-fit-title] : 제목이 한 줄에 딱 맞게 글자 크기를 자동 조절해요.
 *  - [data-fx-title]    : 제목에 글자 등장 + 물결 + 밑줄 효과를 넣어요.
 *  - '동작 줄이기' 설정을 켠 사용자에게는 움직임 없이 정적으로 보여줘요.
 */
(function(){
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.7,.2,1)';

  /* mock.html의 .promo 스타일 그대로 + 애니메이션용 보조 요소 */
  const PROMO_CSS = `
.promo{display:flex;align-items:center;gap:14px;margin-top:16px;padding:14px 16px;border-radius:14px;background:#eed36f;position:relative;overflow:hidden}
.promo::after{content:"";position:absolute;right:-10px;bottom:-14px;width:46px;height:46px;background:#1d3924;opacity:.12;clip-path:polygon(0 0,100% 0,0 100%)}
.promo-mark{flex:none;position:relative;font-family:Georgia,"Times New Roman",serif;font-weight:700;font-style:italic;font-size:20px;line-height:1;color:#1d3924;letter-spacing:.2px}
.promo-text{min-width:0;color:#1d3924}
.promo-title{margin:0;font-size:14.5px;font-weight:800;line-height:1.4}
.promo-title .promo-date{font-weight:800}
.promo-sub{margin:2px 0 0;font-size:12.5px;color:#33502f;line-height:1.5}
.promo-date{background:linear-gradient(transparent 60%,rgba(255,255,255,.7) 60%) no-repeat;background-size:100% 100%}
.promo-line{position:absolute;left:0;right:0;bottom:-6px;height:2px;border-radius:2px;background:#1d3924;transform-origin:left}
.promo-sheen{position:absolute;top:0;bottom:0;left:0;width:30%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:translateX(-140%) skewX(-18deg);pointer-events:none}
@media(max-width:480px){.promo{padding:12px 14px;gap:10px}.promo-mark{font-size:17px}.promo-title{font-size:13.5px}.promo-sub{font-size:11.5px}}
`;
  function injectCSS(id,css){
    if(document.getElementById(id))return;
    const st=document.createElement('style');st.id=id;st.textContent=css;document.head.appendChild(st);
  }

  /* ---------- 적중노트 배너 ---------- */
  function ensureBanner(){
    const hdr=document.querySelector('header');
    if(!hdr)return null;
    injectCSS('promo-style',PROMO_CSS);
    let p=hdr.querySelector('.promo');
    if(!p){
      p=document.createElement('div');
      p.className='promo';p.setAttribute('role','note');p.setAttribute('aria-label','적중노트 신제품 안내');
      p.innerHTML='<span class="promo-mark">Technical</span><div class="promo-text">'+
        '<p class="promo-title"><span class="promo-date">2026.10.1</span> 적중노트 출시</p>'+
        '<p class="promo-sub">변화된 초등임용 환경에 맞춰, 더 강력해진 적중노트가 찾아옵니다.</p></div>';
      hdr.appendChild(p);
    }
    return p;
  }

  function animateBanner(p){
    if(!p||p.dataset.fx)return;
    p.dataset.fx='1';
    const mark=p.querySelector('.promo-mark'),date=p.querySelector('.promo-date'),
          title=p.querySelector('.promo-title'),sub=p.querySelector('.promo-sub');
    const line=document.createElement('i');line.className='promo-line';line.setAttribute('aria-hidden','true');
    mark.appendChild(line);
    const sheen=document.createElement('span');sheen.className='promo-sheen';sheen.setAttribute('aria-hidden','true');
    p.insertBefore(sheen,p.firstChild);
    if(reduce)return;

    // 하나의 흐름: 배너 등장 → Technical 밑줄 → 제목 → 날짜 형광펜 → 설명 문구 → 이후 은은한 빛 스침
    p.animate([{opacity:0,transform:'translateX(-28px) scale(.98)'},{opacity:1,transform:'none'}],
      {duration:700,delay:200,easing:EASE,fill:'backwards'});
    mark.animate([{opacity:0,transform:'translateY(8px) rotate(-6deg)'},{opacity:1,transform:'none'}],
      {duration:600,delay:450,easing:'cubic-bezier(.3,1.5,.5,1)',fill:'backwards'});
    line.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],
      {duration:600,delay:800,easing:EASE,fill:'backwards'});
    title.animate([{opacity:0,transform:'translateX(-10px)'},{opacity:1,transform:'none'}],
      {duration:500,delay:600,easing:EASE,fill:'backwards'});
    date.animate([{backgroundSize:'0% 100%'},{backgroundSize:'100% 100%'}],
      {duration:600,delay:1050,easing:'ease-out',fill:'backwards'});
    sub.animate([{clipPath:'inset(0 100% 0 0)',opacity:.4},{clipPath:'inset(0 0 0 0)',opacity:1}],
      {duration:800,delay:850,easing:'ease-out',fill:'backwards'});
    sheen.animate([{transform:'translateX(-140%) skewX(-18deg)'},{transform:'translateX(420%) skewX(-18deg)'}],
      {duration:1300,delay:2000,endDelay:5000,iterations:Infinity,easing:'ease-in-out'});
  }

  /* ---------- 제목 한 줄 맞춤 (mock.html의 fitTitle과 동일) ---------- */
  function fit(h){
    const brand=h.closest('.brand'),logo=brand&&brand.querySelector('.logo');
    if(!brand||!logo)return;
    const run=()=>{
      const gap=parseFloat(getComputedStyle(brand).columnGap)||12;
      const avail=brand.clientWidth-logo.offsetWidth-gap-2;
      if(avail<=0)return;
      h.style.fontSize='100px';const w=h.scrollWidth;h.style.fontSize='';
      if(!w)return;
      h.style.fontSize=Math.max(12,Math.min(32,(avail/w)*100)).toFixed(2)+'px';
    };
    let pending=false;
    addEventListener('resize',()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;run()})});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(run);
    run();
  }

  /* ---------- 제목 글자 효과 (index) ---------- */
  function title(h){
    const text=h.textContent.trim();
    if(!text||h.dataset.fxDone)return;
    h.dataset.fxDone='1';
    h.setAttribute('aria-label',text);
    h.textContent='';
    h.style.position='relative';
    const spans=Array.from(text).map(ch=>{
      const s=document.createElement('span');
      s.setAttribute('aria-hidden','true');
      s.style.cssText='display:inline-block;white-space:pre';
      s.textContent=ch;h.appendChild(s);return s;
    });
    const bar=document.createElement('span');
    bar.setAttribute('aria-hidden','true');
    bar.style.cssText='position:absolute;left:0;bottom:-7px;height:3px;width:100%;border-radius:3px;'+
      'background:linear-gradient(90deg,#07e29e,#05815c,#07e29e);background-size:200% 100%;transform-origin:left';
    h.appendChild(bar);
    if(reduce)return;

    const n=spans.length,intro=120+n*55+850;
    // 1) 로고: 톡 튀어나오며 초록 파동
    const logo=document.querySelector('.logo');
    if(logo){
      logo.animate([{opacity:0,transform:'scale(.5) rotate(-20deg)'},{opacity:1,transform:'none'}],
        {duration:650,easing:'cubic-bezier(.3,1.5,.5,1)',fill:'backwards'});
      logo.animate([{boxShadow:'0 0 0 0 rgba(7,226,158,.55)'},{boxShadow:'0 0 0 16px rgba(7,226,158,0)'}],
        {duration:1400,delay:600,iterations:2,easing:'ease-out'});
    }
    // 2) 글자: 초록빛으로 넓게 퍼져 있다가 모이며 잉크색으로 식음
    spans.forEach((s,i)=>s.animate(
      [{opacity:0,letterSpacing:'.5em',filter:'blur(6px)',transform:'translateY(.35em)',color:'#07e29e'},
       {opacity:1,letterSpacing:'0em',filter:'blur(0)',transform:'none',color:'#0e1a16'}],
      {duration:850,delay:120+i*55,easing:EASE,fill:'backwards'}));
    // 3) 밑줄: 왼쪽에서 그어진 뒤 초록 빛이 계속 흐름
    bar.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],
      {duration:900,delay:300+n*40,easing:EASE,fill:'backwards'});
    bar.animate([{backgroundPosition:'0% 0'},{backgroundPosition:'200% 0'}],
      {duration:3200,delay:intro,iterations:Infinity,easing:'linear'});
    // 4) 몇 초에 한 번 색 물결
    const wave=()=>{
      if(document.hidden)return;
      spans.forEach((s,i)=>s.animate(
        [{transform:'none',color:'#0e1a16'},{transform:'translateY(-.16em) scale(1.05)',color:'#05815c',offset:.5},{transform:'none',color:'#0e1a16'}],
        {duration:700,delay:i*45,easing:'ease-in-out'}));
    };
    setTimeout(()=>{wave();setInterval(wave,6000)},intro+1200);
    // 5) 마우스를 올린 글자는 통통 튐
    spans.forEach(s=>s.addEventListener('pointerenter',()=>s.animate(
      [{transform:'none'},{transform:'translateY(-.28em) scale(1.12)',color:'#05815c'},{transform:'none'}],
      {duration:450,easing:'cubic-bezier(.3,1.6,.5,1)'})));
  }

  function init(){
    animateBanner(ensureBanner());
    document.querySelectorAll('h1[data-fit-title]').forEach(fit);
    document.querySelectorAll('[data-fx-title]').forEach(title);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
