// ══════════════════════════════════════════════════════════════════
// v08.50 — RACE LEG REVIEW + ACTIONABLE COURSE TEXT
// Race mode now mirrors Plan leg-review language: active leg highlighted,
// next leg previewed, and the bottom panel says what to do rather than just
// dumping mark/heading numbers.
// ══════════════════════════════════════════════════════════════════
(function(){
  if(typeof RACE==='object'){
    RACE.reviewSeg = null;
    RACE.reviewTimer = null;
  }

  function segPath(){
    const path=(ACTIVE_RACE_SOLUTION&&ACTIVE_RACE_SOLUTION.path&&ACTIVE_RACE_SOLUTION.path.length>1)?ACTIVE_RACE_SOLUTION.path:optPath;
    return (path&&path.length>1)?path:null;
  }
  function routeSegs(maxRows){
    const path=segPath();
    if(!path)return [];
    const out=[];
    for(let i=0;i<path.length-1;i++){
      const a=path[i],b=path[i+1];
      if(!a||!b||a.lat==null||b.lat==null)continue;
      const d=haversine(a.lat,a.lon,b.lat,b.lon);
      if(d<5)continue;
      const hdg=brng(a.lat,a.lon,b.lat,b.lon);
      const side=sideFromHdg(hdg);
      const action=side==='reach'?'REACH':(side==='stbd'?'STARBOARD TACK':'PORT TACK');
      const short=side==='reach'?'REACH':(side==='stbd'?'STBD':'PORT');
      const to=(b.label||b.kind||b.type||(i===path.length-2?'FIN':''))||'';
      out.push({idx:i,a,b,dist:d,hdg,side,action,short,to});
      if(maxRows&&out.length>=maxRows)break;
    }
    return out;
  }
  function activeSegIndex(){
    const segs=routeSegs();
    if(!segs.length)return 0;
    if(typeof RACE==='object' && RACE.reviewSeg!=null){
      return Math.max(0,Math.min(segs.length-1,RACE.reviewSeg));
    }
    return 0;
  }
  window.setRaceReviewSeg=function(i){
    if(typeof RACE!=='object')return;
    const segs=routeSegs();
    if(i==null||i<0||i>=segs.length)RACE.reviewSeg=null;
    else RACE.reviewSeg=(RACE.reviewSeg===i?null:i);
    clearTimeout(RACE.reviewTimer);
    if(RACE.reviewSeg!=null){RACE.reviewTimer=setTimeout(()=>{RACE.reviewSeg=null;dirty=true;},10000);}
    dirty=true;
    updateDirectionsPanel();
    if(appMode==='race')renderChart();
  };
  window.clearRaceReviewSeg=function(){
    if(typeof RACE==='object')RACE.reviewSeg=null;
    dirty=true; updateDirectionsPanel(); if(appMode==='race')renderChart();
  };
  function fmtLegNm(m){return isFinite(m)?(m/1852).toFixed((m/1852)<1?'2':'1')+'nm':'--';}
  function legVerb(seg){
    if(!seg)return 'Set course and wind.';
    const h=Math.round(seg.hdg)+'°';
    if(seg.side==='reach')return 'Steer '+h+' on a reach';
    return 'Steer '+h+' on '+(seg.side==='stbd'?'starboard tack':'port tack');
  }
  function nextText(seg){
    if(!seg)return 'Next: set course.';
    return 'Next: '+legVerb(seg)+' for '+fmtLegNm(seg.dist)+(seg.to?' → '+seg.to:'');
  }

  // Replace v08.44 compact numeric rows with a skipper-readable active-leg card.
  window.updateDirectionsPanel=function(){
    const panel=G('modelPanel'),list=G('dirList'),now=G('dirNow'),sum=G('dirSummary'),dirPanel=G('dirPanel');
    if(!panel||!list||!now||!sum)return;
    const segs=routeSegs();
    if(!segs.length){panel.classList.remove('vis');return;}
    if(dirPanel)dirPanel.classList.add('v0850');
    const idx=activeSegIndex();
    const cur=segs[idx]||segs[0];
    const next=segs[idx+1]||null;
    now.textContent=Math.round(cur.hdg)+'°';
    now.style.color=cur.side==='stbd'?'var(--green)':cur.side==='port'?'var(--red)':'var(--blue)';
    const sol=ACTIVE_RACE_SOLUTION;
    const review=(typeof RACE==='object'&&RACE.reviewSeg!=null);
    sum.textContent=(review?'REVIEW':'ACTIVE')+' · '+fmtLegNm(cur.dist)+(sol?' · SOL '+sol.id:'');
    list.innerHTML='';
    const card=document.createElement('div');
    card.className='race-leg-card';
    const colorClass=cur.side==='stbd'?'stbd':cur.side==='port'?'port':'reach';
    const target=cur.to?(' → '+cur.to):'';
    card.innerHTML=
      '<div class="race-leg-title">'+(review?'REVIEW LEG ':'CURRENT LEG ')+(idx+1)+target+'</div>'+ 
      '<div class="race-leg-main"><span class="'+colorClass+'">'+legVerb(cur)+'</span></div>'+ 
      '<div class="race-leg-sub">Hold for '+fmtLegNm(cur.dist)+' · '+(cur.to?'to '+cur.to:'follow route')+'</div>'+ 
      '<div class="race-leg-next">'+(next?nextText(next):'Then: finish / advance mark')+'</div>';
    const mini=document.createElement('div');
    mini.className='race-leg-mini';
    segs.slice(0,5).forEach((s,j)=>{
      const b=document.createElement('button');
      b.textContent=(j+1)+' '+Math.round(s.hdg)+'°';
      b.className=(j===idx?'on':'');
      b.onclick=(ev)=>{ev.stopPropagation();setRaceReviewSeg(j);};
      mini.appendChild(b);
    });
    if(review){
      const b=document.createElement('button');b.textContent='ACTIVE';b.onclick=(ev)=>{ev.stopPropagation();clearRaceReviewSeg();};mini.appendChild(b);
    }
    card.appendChild(mini);
    list.appendChild(card);
    panel.classList.add('vis');
  };

  // More actionable hero subtitle; keep the big steer number.
  const _updateRaceUI_v0850 = updateRaceUI;
  window.updateRaceUI=function(){
    _updateRaceUI_v0850.apply(this,arguments);
    if(appMode!=='race')return;
    const segs=routeSegs(); if(!segs.length)return;
    const cur=segs[activeSegIndex()]||segs[0];
    const hn=G('heroNum'),hs=G('heroSub');
    if(hn){hn.textContent=Math.round(cur.hdg)+'°';hn.className='hero-num '+(cur.side||'none');}
    if(hs){
      hs.textContent=(cur.side==='reach'?'REACH':(cur.side==='stbd'?'STARBOARD TACK':'PORT TACK'))+' · HOLD '+fmtLegNm(cur.dist)+(cur.to?' · TO '+cur.to:'');
      hs.className='hero-sub '+(cur.side||'none');
    }
    // CLEANUP: updateModelPanel (set above in the base render chain) is still
    // frozen to the pre-v08.50 panel renderer. Re-assert the leg-review card
    // last so it isn't reverted on this same frame.
    updateDirectionsPanel();
  };

  // Overlay active/reviewed and next segments after the normal Race map renders.
  const _renderChartCore_v0850 = renderChartCore;
  window.renderChartCore=function(){
    _renderChartCore_v0850.apply(this,arguments);
    try{
      if(appMode!=='race')return;
      const path=segPath(); if(!path||path.length<2)return;
      const b=getBounds(); if(!b)return;
      const W=cvM.width/devicePixelRatio,H=cvM.height/devicePixelRatio;
      const pp=(la,lo)=>proj(la,lo,b,W,H);
      const idx=activeSegIndex();
      ctxM.save();ctxM.scale(devicePixelRatio,devicePixelRatio);
      function drawSeg(i,stroke,width,alpha,dash,label){
        const a=path[i],c=path[i+1]; if(!a||!c)return;
        const pa=pp(a.lat,a.lon),pb=pp(c.lat,c.lon);
        ctxM.save();ctxM.globalAlpha=alpha;ctxM.strokeStyle=stroke;ctxM.lineWidth=width;ctxM.setLineDash(dash||[]);
        ctxM.beginPath();ctxM.moveTo(pa.x,pa.y);ctxM.lineTo(pb.x,pb.y);ctxM.stroke();ctxM.setLineDash([]);
        const mx=(pa.x+pb.x)/2,my=(pa.y+pb.y)/2;
        ctxM.fillStyle='#03080f';ctxM.strokeStyle=stroke;ctxM.lineWidth=1.5;
        ctxM.beginPath();ctxM.arc(mx,my,width+4,0,Math.PI*2);ctxM.fill();ctxM.stroke();
        ctxM.fillStyle=stroke;ctxM.font='bold 8px var(--mono)';ctxM.textAlign='center';ctxM.textBaseline='middle';ctxM.fillText(label||String(i+1),mx,my+0.5);
        ctxM.restore();
      }
      for(let i=0;i<path.length-1;i++){
        if(i!==idx && i!==idx+1)drawSeg(i,'rgba(204,224,240,0.45)',1.2,0.18,[3,8],String(i+1));
      }
      if(idx+1<path.length-1)drawSeg(idx+1,'#f5a623',2.6,0.55,[6,5],'N');
      const curSeg=routeSegs()[idx];
      const col=curSeg&&curSeg.side==='stbd'?'#3ddc84':curSeg&&curSeg.side==='port'?'#e84040':'#4a9eff';
      drawSeg(idx,col,5.2,0.98,[12,4],String(idx+1));
      ctxM.restore();
    }catch(e){console.warn('race leg overlay failed',e);}
  };

  // Update share brief footer version if used.
  window.TACTICIAN_RACE_LEG_REVIEW=true;
})();
