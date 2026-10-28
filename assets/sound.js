/* Dusk Moon Studio sound: everything is synthesised with Web Audio, no audio files. Off by default; the visitor opts in. */
(function(){
  var KEY="dm_sound", ctx, master, sfxBus, musBus, delay, on=false, timer=null, step=0, noiseBuf;
  try{ on = localStorage.getItem(KEY)==="1"; }catch(e){}
  var SC=[261.63,293.66,329.63,392.0,440.0];                  // C major pentatonic
  var note=function(i){ return SC[((i%5)+5)%5]*Math.pow(2,Math.floor(i/5)); };
  function ensure(){
    if(!ctx){ var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return false; ctx=new AC();
      master=ctx.createGain(); master.gain.value=.7; master.connect(ctx.destination);
      sfxBus=ctx.createGain(); sfxBus.gain.value=.9; sfxBus.connect(master);
      musBus=ctx.createGain(); musBus.gain.value=.5; musBus.connect(master);
      delay=ctx.createDelay(1); delay.delayTime.value=.42; var fb=ctx.createGain(); fb.gain.value=.38; delay.connect(fb); fb.connect(delay); delay.connect(musBus);
      var n=ctx.sampleRate; noiseBuf=ctx.createBuffer(1,n,ctx.sampleRate); var d=noiseBuf.getChannelData(0); for(var i=0;i<n;i++) d[i]=Math.random()*2-1; }
    if(ctx.state==="suspended") ctx.resume(); return true;
  }
  function tone(f,t0,dur,type,vol,dest,f2){
    var o=ctx.createOscillator(), g=ctx.createGain(); o.type=type||"sine"; o.frequency.setValueAtTime(f,t0);
    if(f2) o.frequency.exponentialRampToValueAtTime(f2,t0+dur);
    g.gain.setValueAtTime(0.0001,t0); g.gain.linearRampToValueAtTime(vol,t0+.012); g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    o.connect(g); g.connect(dest||sfxBus); o.start(t0); o.stop(t0+dur+.05); return g;
  }
  function noise(t0,dur,vol,type,f1,f2){
    var s=ctx.createBufferSource(); s.buffer=noiseBuf; var fl=ctx.createBiquadFilter(); fl.type=type; fl.frequency.setValueAtTime(f1,t0); fl.frequency.exponentialRampToValueAtTime(f2,t0+dur);
    var g=ctx.createGain(); g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur); s.connect(fl); fl.connect(g); g.connect(sfxBus); s.start(t0); s.stop(t0+dur+.05);
  }
  var sfx={
    chime:function(i){ var t=ctx.currentTime, f=note(5+(i||0)%8); tone(f,t,1.1,"sine",.16); tone(f*2,t,.6,"triangle",.05); },
    click:function(){ var t=ctx.currentTime; tone(620,t,.09,"sine",.08,null,880); },
    hover:function(){ var t=ctx.currentTime; tone(880,t,.05,"sine",.025); },
    whoosh:function(){ noise(ctx.currentTime,.35,.07,"bandpass",300,1800); },
    thread:function(){ var t=ctx.currentTime; tone(1200,t,.08,"triangle",.05,null,1800); },
    laser:function(){ var t=ctx.currentTime; tone(1000,t,.14,"square",.035,null,180); },
    boom:function(){ var t=ctx.currentTime; noise(t,.55,.22,"lowpass",900,60); tone(120,t,.4,"sine",.18,null,40); },
    fall:function(){ var t=ctx.currentTime; tone(420,t,.5,"sine",.09,null,90); }
  };
  /* generative music: slow pad + music-box arpeggio, new phrase each bar */
  var PROG=[[0,2,4],[ -2,0,2],[ -1,1,3],[ -3,-1,1]];          // scale-degree chords
  function schedule(){
    if(!ctx||!on) return; var t=ctx.currentTime+.05, bar=Math.floor(step/8)%PROG.length, k=step%8, ch=PROG[bar];
    if(k===0){ ch.forEach(function(d){ var g=tone(note(d+5)/2,t,3.6,"triangle",.05,musBus); }); }
    if(k%2===0||Math.random()<.3){ var d=ch[(k>>1)%3]+(Math.random()<.3?5:0)+5; var f=note(d); tone(f,t,1.4,"sine",.07,delay); tone(f,t,1.2,"sine",.03,musBus); }
    step++;
  }
  function start(){ if(timer||!ensure()) return; schedule(); timer=setInterval(schedule,420); }
  function stop(){ if(timer){ clearInterval(timer); timer=null; } }
  document.addEventListener("visibilitychange",function(){ if(document.hidden) stop(); else if(on) start(); });
  var API=window.DMSound={
    enabled:function(){ return on && !!ctx; },
    play:function(n,a){ if(!on||!ctx||document.hidden) return; try{ sfx[n](a); }catch(e){} },
    set:function(v){ on=!!v; try{ localStorage.setItem(KEY,on?"1":"0"); }catch(e){} if(on){ ensure(); start(); sfx.chime(2); } else stop(); paint(); },
    toggle:function(){ API.set(!on); }
  };
  var btn;
  function paint(){ if(!btn) return; btn.setAttribute("aria-pressed",on?"true":"false"); btn.classList.toggle("on",on);
    btn.innerHTML=on?'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg><span>Sound on</span>':'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg><span>Sound off</span>'; }
  function init(){
    btn=document.createElement("button"); btn.type="button"; btn.className="dm-snd"; btn.setAttribute("aria-label","Toggle sound and music");
    btn.addEventListener("click",function(){ API.toggle(); }); document.body.appendChild(btn); paint();
    /* UI blips */
    document.addEventListener("click",function(e){ if(e.target.closest("a.btn,.btn,.soon,summary,.dm-tile")) API.play("click"); });
    document.addEventListener("pointerover",function(e){ var a=e.target.closest("a.btn,.show,.dm-tile"); if(a&&a!==init.last){ init.last=a; API.play("hover"); } });
    /* if sound was left on, resume on first gesture (browsers block autoplay) */
    if(on){ var go=function(){ document.removeEventListener("pointerdown",go); ensure(); start(); }; document.addEventListener("pointerdown",go); }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();
