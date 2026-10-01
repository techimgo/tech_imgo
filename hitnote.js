/* hitnote.js — 적중노트 배너 + 헤더 공용 스크립트 (Web Animations API)
 * 페이지 맨 아래에 <script src="hitnote.js"></script> 한 줄이면 돼요.
 *  - 배너 전체는 https://link.inpock.co.kr/tech_imgo 로 새 창(target=_blank)에서 열려요.
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
.promo-link{display:block;color:inherit;text-decoration:none;border-radius:14px;-webkit-tap-highlight-color:transparent}
.promo-link .promo{transition:filter .15s}
.promo-link:hover .promo{filter:brightness(.97)}
.promo-link:focus-visible{outline:2px solid #1d3924;outline-offset:3px}
.promo-cta{flex:none;margin-left:auto;position:relative;display:inline-flex;align-items:center;gap:5px;padding:8px 13px;border-radius:999px;background:#1d3924;color:#fff;font-size:12.5px;font-weight:800;line-height:1;white-space:nowrap;z-index:1}
.promo-arrow{display:inline-block;font-weight:800}
.promo-ring{position:absolute;inset:-2px;border-radius:999px;border:2px solid #1d3924;opacity:0;pointer-events:none}
.promo-cursor{position:absolute;left:50%;top:50%;width:24px;height:24px;margin:-2px 0 0 -2px;pointer-events:none;opacity:0;transform-origin:0 0;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35));z-index:2}
.promo-link:hover .promo-cta{background:#0f2415}
@media(max-width:480px){.promo-cta{padding:7px 10px;font-size:11.5px}}
@media(max-width:480px){.promo{padding:12px 14px;gap:10px}.promo-mark{font-size:17px}.promo-title{font-size:13.5px}.promo-sub{font-size:11.5px}}
`;
  function injectCSS(id,css){
    if(document.getElementById(id))return;
    const st=document.createElement('style');st.id=id;st.textContent=css;document.head.appendChild(st);
  }

  /* ---------- 적중노트 배너 ---------- */
  const PROMO_URL='https://link.inpock.co.kr/tech_imgo';

  /* 배너 전체를 새 창으로 열리는 링크로 감싸요 (이미 링크 안에 있으면 그대로 둬요) */
  function linkify(p){
    if(!p||p.closest('a'))return;
    const a=document.createElement('a');
    a.className='promo-link';a.href=PROMO_URL;a.target='_blank';a.rel='noopener noreferrer';
    a.setAttribute('aria-label','적중노트 안내 페이지 열기 (새 창)');
    p.parentNode.insertBefore(a,p);a.appendChild(p);
    p.removeAttribute('role');p.removeAttribute('aria-label');
  }
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
    linkify(p);
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

    // 클릭 유도 버튼 (동작 줄이기 설정이어도 정적으로 보여줘요)
    const cta=document.createElement('span');cta.className='promo-cta';cta.setAttribute('aria-hidden','true');
    cta.innerHTML='<span>지금 보기</span><span class="promo-arrow">\u203A</span>';
    p.appendChild(cta);
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

    // 클릭 유도: 마우스 커서가 버튼으로 다가와 '톡' 누르고 물결이 퍼지는 동작을 반복
    const ring=document.createElement('i');ring.className='promo-ring';ring.setAttribute('aria-hidden','true');
    const cur=document.createElement('span');cur.className='promo-cursor';cur.setAttribute('aria-hidden','true');
    cur.innerHTML='<svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 2.5v16l4.3-3.9 3 6.9 2.9-1.3-3-6.8h6z" fill="#fff" stroke="#1d3924" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    cta.appendChild(ring);cta.appendChild(cur);
    const arrow=cta.querySelector('.promo-arrow');
    const loop={duration:5200,delay:2600,iterations:Infinity,easing:'ease-in-out'};
    const curAnim=cur.animate([
      {opacity:0,transform:'translate(40px,34px) scale(1)',offset:0},
      {opacity:1,transform:'translate(30px,24px) scale(1)',offset:.1},
      {opacity:1,transform:'translate(0,0) scale(1)',offset:.4},
      {opacity:1,transform:'translate(0,0) scale(.82)',offset:.46},
      {opacity:1,transform:'translate(0,0) scale(1)',offset:.54},
      {opacity:1,transform:'translate(0,0) scale(1)',offset:.7},
      {opacity:0,transform:'translate(14px,12px) scale(1)',offset:.84},
      {opacity:0,transform:'translate(40px,34px) scale(1)',offset:1}],loop);
    const ctaAnim=cta.animate([
      {transform:'scale(1)',offset:0},{transform:'scale(1)',offset:.43},
      {transform:'scale(.92)',offset:.47},{transform:'scale(1.06)',offset:.56},
      {transform:'scale(1)',offset:.64},{transform:'scale(1)',offset:1}],loop);
    const ringAnim=ring.animate([
      {opacity:0,transform:'scale(.9)',offset:0},{opacity:0,transform:'scale(.9)',offset:.45},
      {opacity:.7,transform:'scale(.95)',offset:.47},
      {opacity:0,transform:'scale(1.5,1.9)',offset:.68},{opacity:0,transform:'scale(1.5,1.9)',offset:1}],loop);
    arrow.animate([{transform:'translateX(0)'},{transform:'translateX(3px)'}],
      {duration:700,delay:2000,direction:'alternate',iterations:Infinity,easing:'ease-in-out',fill:'backwards'});
    // 실제로 마우스를 올리거나 키보드로 이동하면 데모 동작은 잠시 멈춰요
    const host=p.closest('a')||p,all=[curAnim,ctaAnim,ringAnim];
    const stop=()=>{all.forEach(a=>{a.pause();a.currentTime=0});cur.style.visibility='hidden'};
    const go=()=>{cur.style.visibility='';all.forEach(a=>a.play())};
    host.addEventListener('pointerenter',stop);host.addEventListener('pointerleave',go);
    host.addEventListener('focusin',stop);host.addEventListener('focusout',go);
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
