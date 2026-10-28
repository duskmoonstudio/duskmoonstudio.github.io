/* Live stats for Dusk Moon Studio pages. Any element with data-dm-stat="game.metric" shows a number;
   any .dm-stats[data-game] strip is revealed once at least one of its numbers exists. No libraries. */
(function(){
  var C = window.DM_STATS_CONFIG || {};
  var demo = /[?&]demo=1/.test(location.search);
  var DEMO = {updated:new Date().toISOString(),games:{
    moonrope:{installs:1840,rating:4.7,runs:96420,topRing:412,online:9},
    feltflight:{installs:620,rating:4.8,flights:18350,badges:5210,online:4},
    voidbrawl:{testers:14,matches:2310,online:0}}};
  var fmt = function(n){ if(n==null||isNaN(n)) return null; n=+n; return n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e4?(n/1e3).toFixed(1)+"k":n.toLocaleString("en-IN"); };
  function parseDoc(doc){ var o={}, f=(doc&&doc.fields)||{}; for(var k in f){ var v=f[k]; o[k]=v.integerValue!=null?+v.integerValue:v.doubleValue!=null?+v.doubleValue:null; } return o; }
  function getJSON(u){ return fetch(u,{cache:"no-store"}).then(function(r){ if(!r.ok) throw 0; return r.json(); }); }
  function load(){
    if(demo) return Promise.resolve({data:DEMO,live:true});
    var fs = C.firestoreProjectId ? Promise.all(["moonrope","feltflight","voidbrawl"].map(function(g){
      var u="https://firestore.googleapis.com/v1/projects/"+C.firestoreProjectId+"/databases/(default)/documents/"+(C.firestoreCollection||"stats")+"/"+g;
      return getJSON(u).then(parseDoc).catch(function(){return null;});
    })).then(function(a){ var d={games:{moonrope:a[0],feltflight:a[1],voidbrawl:a[2]},updated:new Date().toISOString()}; return (a[0]||a[1]||a[2])?{data:d,live:true}:null; }).catch(function(){return null;}) : Promise.resolve(null);
    return fs.then(function(r){ if(r) return r;
      return getJSON(C.jsonUrl||"/stats.json").then(function(d){return {data:d,live:false};}).catch(function(){return null;}); });
  }
  function countUp(el,to,isFloat){
    if(isFloat||window.matchMedia("(prefers-reduced-motion:reduce)").matches){ el.textContent=isFloat?to.toFixed(1):fmt(to); return; }
    var from=+(el.getAttribute("data-v")||0), t0=performance.now(), dur=900;
    (function step(t){ var p=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-p,3); el.textContent=fmt(Math.round(from+(to-from)*e)); if(p<1) requestAnimationFrame(step); })(t0);
    el.setAttribute("data-v",to);
  }
  function paint(res){
    if(!res||!res.data) return;
    var g=res.data.games||{};
    document.querySelectorAll("[data-dm-stat]").forEach(function(el){
      var p=el.getAttribute("data-dm-stat").split("."), v=g[p[0]]&&g[p[0]][p[1]];
      var tile=el.closest(".dm-tile");
      if(v==null||isNaN(v)){ if(tile) tile.hidden=true; return; }
      if(tile) tile.hidden=false;
      countUp(el,+v,p[1]==="rating");
    });
    document.querySelectorAll(".dm-stats").forEach(function(s){
      var any=!!s.querySelector(".dm-tile:not([hidden])");
      s.hidden=!any;
      var badge=s.querySelector(".dm-live"); if(badge){ badge.classList.toggle("off",!res.live); badge.lastChild.textContent=res.live?"Live":"Updated "+new Date(res.data.updated).toLocaleDateString("en-GB",{day:"numeric",month:"short"}); }
    });
    var on=document.querySelectorAll("[data-dm-online]");
    on.forEach(function(el){ var gm=el.getAttribute("data-dm-online"), n=g[gm]&&g[gm].online; el.hidden = !(n>0); var b=el.querySelector("b"); if(b&&n>0) b.textContent=n; });
  }
  function tick(){ load().then(paint); }
  document.documentElement.classList.remove("no-js");
  tick(); if(!demo && (C.refreshSeconds||0)>0) setInterval(tick,C.refreshSeconds*1000);
})();
