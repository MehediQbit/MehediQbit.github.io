/* script.js — language toggle + rendering from config.js.
   All visible text comes from I18N / CONTENT in config.js, per language. */
(function(){
  var C=window.SITE_CONFIG||{}, T=window.I18N||{}, CT=window.CONTENT||{};
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function pickLang(){
    try{var s=localStorage.getItem("mq-lang"); if(s==="bn"||s==="en") return s;}catch(e){}
    return (navigator.language||"en").toLowerCase().indexOf("bn")===0 ? "bn" : "en";
  }
  var lang=pickLang(), typeTimer=null, typedState={li:0,ci:0,del:false};

  function dict(){ return T[lang]||T.en; }

  function renderStatic(){
    var d=dict();
    document.querySelectorAll("[data-i18n]").forEach(function(el){
      var k=el.getAttribute("data-i18n"); if(d[k]!=null) el.textContent=d[k];
    });
    document.title=d.docTitle;
    var m=document.querySelector('meta[name="description"]'); if(m) m.setAttribute("content",d.metaDesc);
    var mt=document.getElementById("marquee-track");
    if(mt) mt.textContent=d.marquee+d.marquee;
  }
  function renderSkills(){
    var d=dict(), g=document.getElementById("skills-grid"); if(!g||!CT.skills) return;
    g.innerHTML=CT.skills.map(function(s){
      var c=s[lang]||s.en;
      return '<article class="skill"><div class="skill-head"><b><i class="'+esc(s.icon)+'" style="color:'+esc(s.color)+'"></i> '+esc(s.name)+'</b>'+
      '<span class="tag '+(s.status==="now"?"tag-now":"tag-next")+'">'+esc(s.status==="now"?d.tagNow:d.tagNext)+'</span></div>'+
      '<p>'+esc(c.desc)+'</p><div class="bar"><i style="width:'+Number(s.level||0)+'%"></i></div><div class="bar-label">'+esc(c.note)+'</div></article>';
    }).join("");
  }
  function renderRoad(){
    var d=dict(), g=document.getElementById("roadmap-list"); if(!g||!CT.roadmap) return;
    var nums={en:["01","02","03","04"],bn:["০১","০২","০৩","০৪"]};
    g.innerHTML=CT.roadmap.map(function(r,i){
      var c=r[lang]||r.en;
      return '<div class="step'+(r.status==="now"?" active":"")+'"><div class="step-num">'+(nums[lang]||nums.en)[i]+'</div>'+
      '<div class="step-body"><h3>'+esc(c.t)+(r.status==="now"?' <span class="tag tag-now">'+esc(d.tagCurrent)+'</span>':"")+'</h3><p>'+esc(c.d)+'</p></div></div>';
    }).join("");
  }
  function renderProjects(){
    var d=dict(), g=document.getElementById("projects-grid"); if(!g||!CT.projects) return;
    var pl={live:d.pillLive,progress:d.pillProg,next:d.pillNext};
    var pc={live:"pill-live",progress:"pill-prog",next:"pill-next"};
    g.innerHTML=CT.projects.map(function(p){
      var c=p[lang]||p.en;
      return '<article class="project"><div class="icon" style="color:'+esc(p.color)+'"><i class="'+esc(p.icon)+'"></i></div>'+
      '<span class="pill '+(pc[p.status]||"pill-next")+'">'+esc(pl[p.status]||d.pillNext)+'</span>'+
      '<h3>'+esc(c.t)+'</h3><p>'+esc(c.d)+'</p>'+
      (p.link?'<a class="plink" href="'+esc(p.link)+'" target="_blank" rel="noopener noreferrer">'+esc(c.l||d.projOpen)+' →</a>':"")+
      '<span class="stack">'+esc(c.s)+'</span></article>';
    }).join("");
  }
  function renderSocials(){
    var g=document.getElementById("social-grid"); if(!g||!C.socials) return;
    g.innerHTML=C.socials.map(function(s){
      var detail=(lang==="bn"?s.bn:s.en)||s.en;
      var ext=s.url.indexOf("mailto:")===0?"":' target="_blank" rel="noopener noreferrer"';
      return '<a class="social" href="'+esc(s.url)+'"'+ext+' aria-label="'+esc(s.name)+'">'+
      '<span class="sicon" style="color:'+esc(s.color)+'"><i class="'+esc(s.icon)+'"></i></span>'+
      '<span><b>'+esc(s.name)+'</b><small>'+esc(detail)+' · @MehediQbit</small></span><i class="fa-solid fa-arrow-up-right-from-square arrow"></i></a>';
    }).join("");
  }
  function startTypewriter(){
    var el=document.getElementById("typed"); if(!el) return;
    if(typeTimer){clearTimeout(typeTimer); typeTimer=null;}
    typedState={li:0,ci:0,del:false};
    var lines=dict().typed||[];
    var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduce||!lines.length){ el.textContent=lines[0]||""; return; }
    (function tick(){
      var line=lines[typedState.li];
      if(!typedState.del){ typedState.ci++; el.textContent=line.slice(0,typedState.ci);
        if(typedState.ci===line.length){ typedState.del=true; typeTimer=setTimeout(tick,1900); return; }
        typeTimer=setTimeout(tick,62); return; }
      typedState.ci--; el.textContent=line.slice(0,typedState.ci);
      if(typedState.ci===0){ typedState.del=false; typedState.li=(typedState.li+1)%lines.length; typeTimer=setTimeout(tick,350); return; }
      typeTimer=setTimeout(tick,32);
    })();
  }
  var revealObserver=null;
  function setupReveal(){
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if(!("IntersectionObserver" in window)) return;
    if(!revealObserver){
      revealObserver=new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); revealObserver.unobserve(en.target); } });
      },{threshold:0.12,rootMargin:"0px 0px -6% 0px"});
    }
    document.querySelectorAll(".sec,.panel,.skill,.project,.social,.step-body,.contact").forEach(function(el){
      if(el.classList.contains("in")||el.dataset.revealBound) return;
      el.dataset.revealBound="1"; el.classList.add("reveal"); revealObserver.observe(el);
    });
  }
  function applyLang(next,save){
    lang=(next==="bn"?"bn":"en");
    document.documentElement.lang=(lang==="bn"?"bn":"en");
    document.documentElement.setAttribute("data-lang",lang);
    document.getElementById("btn-bn").classList.toggle("active",lang==="bn");
    document.getElementById("btn-en").classList.toggle("active",lang==="en");
    document.getElementById("btn-bn").setAttribute("aria-pressed",lang==="bn");
    document.getElementById("btn-en").setAttribute("aria-pressed",lang==="en");
    if(save){ try{localStorage.setItem("mq-lang",lang);}catch(e){} }
    renderStatic(); renderSkills(); renderRoad(); renderProjects(); renderSocials(); startTypewriter(); setupReveal();
    var cl=document.getElementById("copyLabel"); if(cl) cl.textContent=dict().copy;
  }
  document.querySelectorAll("[data-setlang]").forEach(function(b){
    b.addEventListener("click",function(){ applyLang(b.getAttribute("data-setlang"),true); });
  });
  applyLang(lang,false);

  // Gentle tilt, desktop fine-pointer only
  var card=document.getElementById("tilt-card");
  var reduce2=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(card&&window.matchMedia("(pointer:fine)").matches&&!reduce2){
    document.addEventListener("mousemove",function(e){
      var r=card.getBoundingClientRect();
      if(e.clientY>r.bottom+120||e.clientY<r.top-120){card.style.transform="";return;}
      card.style.transform="rotateY("+((window.innerWidth/2-e.pageX)/110)+"deg) rotateX("+((window.innerHeight/2-e.pageY)/110)+"deg)";
    });
    document.addEventListener("mouseleave",function(){card.style.transform="";});
  }
  // Compact header on scroll
  var topbar=document.querySelector(".topbar");
  if(topbar){
    var onScroll=function(){ topbar.classList.toggle("scrolled",window.scrollY>40); };
    window.addEventListener("scroll",onScroll,{passive:true}); onScroll();
  }
  // Copy email
  var btn=document.getElementById("copyBtn");
  if(btn) btn.addEventListener("click",function(){
    var email=C.email||"hello@devmehedi.pro.bd", label=document.getElementById("copyLabel");
    function done(){ if(label) label.textContent=dict().copied; setTimeout(function(){ if(label) label.textContent=dict().copy; },2200); }
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(done).catch(done); else done();
  });
})();
