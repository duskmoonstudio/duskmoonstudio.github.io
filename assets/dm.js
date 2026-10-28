(function(){
  /* auto-reveal for pages that did not mark their blocks */
  document.querySelectorAll("main .card:not(.dm-reveal),main .patch:not(.dm-reveal),.tline li:not(.dm-reveal)").forEach(function(e,i){ e.classList.add("dm-reveal"); if(e.matches(".tline li")) e.setAttribute("data-d",String(i%3)); });
  /* inner-page hero starfield */
  var h=document.querySelector(".page-hero"); if(h && !matchMedia("(prefers-reduced-motion:reduce)").matches){
    var c=document.createElement("canvas"); c.className="dm-stars"; h.insertBefore(c,h.firstChild); var x=c.getContext("2d"),S=[],W,H;
    function sz(){ W=c.width=h.clientWidth; H=c.height=h.clientHeight; S=[]; for(var i=0;i<Math.round(W*H/4500);i++) S.push({x:Math.random()*W,y:Math.random()*H,r:.5+Math.random()*1.5,p:Math.random()*6.28,s:.6+Math.random()*1.6}); }
    sz(); addEventListener("resize",sz);
    (function d(t){ t/=1000; x.clearRect(0,0,W,H); S.forEach(function(s){ x.globalAlpha=.25+.6*(.5+.5*Math.sin(t*s.s+s.p)); x.fillStyle="#fff3d6"; x.beginPath(); x.arc(s.x,s.y,s.r,0,6.283); x.fill(); }); requestAnimationFrame(d); })(0);
  }
  /* click a colour swatch to copy its hex */
  var toast=document.createElement("div"); toast.className="dm-toast"; document.body.appendChild(toast);
  document.addEventListener("click",function(e){ var sw=e.target.closest(".swatch"); if(!sw) return; var m=(sw.textContent.match(/#[0-9a-f]{6}/i)||[])[0]; if(!m) return;
    try{ navigator.clipboard.writeText(m); }catch(err){} toast.textContent="Copied "+m; toast.classList.add("on"); setTimeout(function(){toast.classList.remove("on");},1400); });
  /* quick filter for FAQ-style pages */
  var det=document.querySelectorAll("main details"); if(det.length>=4){ var f=document.createElement("input"); f.type="search"; f.className="dm-find"; f.placeholder="Search the questions…"; f.setAttribute("aria-label","Search questions");
    det[0].parentNode.insertBefore(f,det[0]); f.addEventListener("input",function(){ var q=f.value.toLowerCase(); det.forEach(function(d){ var hit=!q||d.textContent.toLowerCase().indexOf(q)>-1; d.style.display=hit?"":"none"; if(q&&hit) d.open=true; }); }); }
})();
/* Dusk Moon Studio – shared interactions: scroll reveal, tilt cards, lightbox. */
(function(){
  var reduce=window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var els=document.querySelectorAll(".dm-reveal");
  if("IntersectionObserver" in window && !reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);} });},{threshold:.12});
    els.forEach(function(e){io.observe(e);});
  } else els.forEach(function(e){e.classList.add("in");});
  if(!reduce && matchMedia("(hover:hover)").matches){
    document.querySelectorAll("[data-tilt]").forEach(function(c){
      c.addEventListener("pointermove",function(ev){var r=c.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width-.5,y=(ev.clientY-r.top)/r.height-.5;
        c.style.transform="perspective(900px) rotateY("+(x*8)+"deg) rotateX("+(-y*8)+"deg) translateZ(0)";});
      c.addEventListener("pointerleave",function(){c.style.transform="";});
    });
  }
  var lb=document.createElement("div");lb.className="dm-lb";lb.innerHTML='<button aria-label="Close">×</button><img alt="">';document.body.appendChild(lb);
  function close(){lb.classList.remove("on");}
  lb.addEventListener("click",close);document.addEventListener("keydown",function(e){if(e.key==="Escape")close();});
  document.addEventListener("click",function(e){var a=e.target.closest("a[data-lightbox],.shots a,[data-shots] a");
    if(!a||!/\.(webp|png|jpe?g)$/i.test(a.getAttribute("href")||""))return; e.preventDefault();
    var im=lb.querySelector("img");im.src=a.getAttribute("href");im.alt=(a.querySelector("img")||{}).alt||"";lb.classList.add("on");});
})();

/* gameplay clips: load when near the screen, play only while visible; missing files simply keep the poster image */
(function(){var v=document.querySelectorAll("video.vid[data-src]");if(!v.length)return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){var el=e.target;
    if(e.isIntersecting){ if(!el.getAttribute("src")&&el.dataset.src) el.src=el.dataset.src; var p=el.play(); if(p&&p.catch)p.catch(function(){}); } else el.pause(); });},{threshold:.25});
  v.forEach(function(el){io.observe(el); el.addEventListener("click",function(){ el.controls=true; el.muted=false; });});
})();
