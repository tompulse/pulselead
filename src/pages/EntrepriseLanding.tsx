import { useEffect } from "react";

// ─── Styles injectés directement dans le composant ───────────────────────────
// On injecte le CSS via une balise <style> dans le rendu React.
// Cela évite d'avoir à configurer Tailwind pour cette page spécifique.
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

.pe-root *, .pe-root *::before, .pe-root *::after { box-sizing: border-box; }
.pe-root {
  --bg:#060d1a;--bg2:#091224;
  --cyan:#2dd9ff;--cyan2:#00ffcc;
  --cdim:rgba(45,217,255,0.1);
  --bdr:rgba(45,217,255,0.18);--bdr2:rgba(255,255,255,0.07);
  --w:#eef4ff;--w2:rgba(238,244,255,0.78);--w3:rgba(238,244,255,0.44);
  --syne:'Syne',sans-serif;--inter:'Inter',sans-serif;
  font-family: var(--inter);
  background: var(--bg);
  color: var(--w);
  overflow-x: hidden;
  line-height: 1.6;
  min-height: 100vh;
}

/* SCROLL ANIM */
.pe-root .rv{opacity:0;transform:translateY(34px);transition:opacity .72s cubic-bezier(.22,1,.36,1),transform .72s cubic-bezier(.22,1,.36,1)}
.pe-root .rvr{opacity:0;transform:translateX(34px);transition:opacity .72s cubic-bezier(.22,1,.36,1),transform .72s cubic-bezier(.22,1,.36,1)}
.pe-root .rv.on,.pe-root .rvr.on{opacity:1;transform:none}
.pe-root .d1{transition-delay:.08s}.pe-root .d2{transition-delay:.16s}.pe-root .d3{transition-delay:.24s}
.pe-root .d4{transition-delay:.32s}.pe-root .d5{transition-delay:.4s}

/* NAV */
.pe-nav{position:fixed;top:0;width:100%;z-index:200;padding:16px 64px;display:flex;justify-content:space-between;align-items:center;background:rgba(6,13,26,.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--bdr2);transition:background .3s}
.pe-nl{font-family:var(--syne);font-size:1.2rem;font-weight:700;color:var(--w);letter-spacing:0;text-decoration:none;display:flex;align-items:center;gap:10px}
.pe-nl span{color:var(--cyan)}
.pe-nr{display:flex;gap:24px;align-items:center}
.pe-nr a{font-size:.84rem;color:var(--w3);text-decoration:none;transition:color .2s}
.pe-nr a:hover{color:var(--w)}
.pe-nc{background:var(--cyan)!important;color:var(--bg)!important;padding:10px 22px!important;border-radius:6px;font-weight:700!important;font-family:var(--syne);font-size:.8rem!important;transition:opacity .2s!important}
.pe-nc:hover{opacity:.85!important}
.pe-solo-nav{font-size:.72rem!important;color:rgba(238,244,255,0.28)!important;border:1px solid rgba(255,255,255,.07);padding:6px 12px;border-radius:20px;transition:all .2s!important;white-space:nowrap}
.pe-solo-nav:hover{color:var(--w3)!important;border-color:var(--bdr)!important}

/* HERO */
.pe-hero{min-height:100vh;display:flex;align-items:center;padding:140px 64px 100px;position:relative;overflow:hidden}
.pe-orb1{position:absolute;right:-180px;top:-80px;width:680px;height:680px;background:radial-gradient(ellipse,rgba(45,217,255,.11) 0%,transparent 65%);pointer-events:none;animation:pe-flt 9s ease-in-out infinite}
.pe-orb2{position:absolute;left:-150px;bottom:-80px;width:500px;height:500px;background:radial-gradient(ellipse,rgba(0,255,204,.07) 0%,transparent 65%);pointer-events:none;animation:pe-flt 13s ease-in-out infinite reverse}
@keyframes pe-flt{0%,100%{transform:translateY(0)}50%{transform:translateY(-26px)}}
.pe-gbg{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(45,217,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(45,217,255,.04) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)}
.pe-hi{max-width:1200px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center;position:relative;z-index:1}
.pe-chip{display:inline-flex;align-items:center;gap:8px;background:var(--cdim);border:1px solid var(--bdr);color:var(--cyan);font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.14em;padding:6px 14px;border-radius:20px;margin-bottom:28px;font-family:var(--syne)}
.pe-chip::before{content:'';width:6px;height:6px;background:var(--cyan);border-radius:50%;animation:pe-pdot 2s infinite}
@keyframes pe-pdot{0%,100%{opacity:1}50%{opacity:.3}}
.pe-hh{font-family:var(--syne);font-size:clamp(1.9rem,2.8vw,2.6rem);font-weight:700;line-height:1.22;letter-spacing:-.01em;color:var(--w);margin-bottom:22px}
.pe-hh .ac{color:var(--cyan);text-shadow:0 0 40px rgba(45,217,255,.35)}
.pe-hs{font-size:1.05rem;color:var(--w2);line-height:1.8;font-weight:300;margin-bottom:38px;max-width:490px}
.pe-ctas{display:flex;gap:14px;flex-wrap:wrap}
.pe-bp{background:var(--cyan);color:var(--bg);padding:16px 30px;border-radius:8px;font-weight:700;font-size:.95rem;text-decoration:none;font-family:var(--syne);display:inline-block;transition:all .2s;box-shadow:0 0 28px rgba(45,217,255,.22);white-space:nowrap}
.pe-bp:hover{opacity:.88;transform:translateY(-2px);box-shadow:0 6px 40px rgba(45,217,255,.35)}
.pe-bo{border:1.5px solid rgba(45,217,255,.3);color:var(--w2);padding:15px 26px;border-radius:8px;font-size:.92rem;text-decoration:none;display:inline-block;transition:all .2s}
.pe-bo:hover{border-color:var(--cyan);color:var(--w)}
.pe-badges{display:flex;gap:22px;margin-top:34px;flex-wrap:wrap}
.pe-badge{display:flex;align-items:center;gap:8px;font-size:.8rem;color:var(--w3)}
.pe-bd{width:6px;height:6px;background:var(--cyan2);border-radius:50%;flex-shrink:0}

/* Hero panel */
.pe-hpanel{background:rgba(9,18,36,.75);border:1px solid var(--bdr);border-radius:16px;padding:36px;backdrop-filter:blur(16px);position:relative;overflow:hidden}
.pe-hpanel::before{content:'';position:absolute;top:0;left:30px;right:30px;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
.pe-hpl{font-family:var(--syne);font-size:.7rem;text-transform:uppercase;letter-spacing:.14em;color:var(--cyan);margin-bottom:26px;font-weight:600}
.pe-hps{display:flex;flex-direction:column}
.pe-hpstep{display:flex;gap:16px;padding:16px 0;border-bottom:1px solid var(--bdr2)}
.pe-hpstep:last-child{border-bottom:none}
.pe-hpn{width:30px;height:30px;background:var(--cdim);border:1px solid var(--bdr);color:var(--cyan);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;font-family:var(--syne);flex-shrink:0;margin-top:2px}
.pe-hpstep h4{font-family:var(--syne);font-size:.9rem;font-weight:700;color:var(--w);margin-bottom:4px}
.pe-hpstep p{font-size:.82rem;color:var(--w3);line-height:1.6;margin:0}
.pe-hpf{margin-top:26px;padding-top:22px;border-top:1px solid var(--bdr2);display:flex;justify-content:space-between;align-items:center}
.pe-prh .from{font-size:.7rem;color:var(--w3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px;font-family:var(--syne)}
.pe-prh .amt{font-family:var(--syne);font-size:2.2rem;font-weight:800;color:var(--w);line-height:1}
.pe-prh .ht{font-size:.76rem;color:var(--w3);margin-left:4px}
.pe-dpill{background:var(--cdim);border:1px solid var(--bdr);color:var(--cyan);padding:8px 16px;border-radius:20px;font-size:.76rem;font-weight:700;font-family:var(--syne)}

/* STATS BANNER */
.pe-expbanner{background:var(--bg2);padding:48px 64px}
.pe-expinner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:2px}
.pe-eitem{background:rgba(45,217,255,.04);border:1px solid var(--bdr2);padding:28px 24px;text-align:center;transition:background .3s,border-color .3s}
.pe-eitem:first-child{border-radius:12px 0 0 12px}
.pe-eitem:last-child{border-radius:0 12px 12px 0}
.pe-eitem:hover{background:rgba(45,217,255,.08);border-color:var(--bdr)}
.pe-enum{font-family:var(--syne);font-size:2.2rem;font-weight:700;color:var(--cyan);line-height:1;margin-bottom:8px;text-shadow:0 0 30px rgba(45,217,255,.3)}
.pe-elabel{font-size:.84rem;color:var(--w2);line-height:1.5}

/* SECTIONS */
.pe-section{padding:100px 64px;position:relative}
.pe-wrap{max-width:1200px;margin:0 auto}
.pe-sl{font-family:var(--syne);font-size:.7rem;text-transform:uppercase;letter-spacing:.15em;color:var(--cyan);font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:10px}
.pe-sl::before{content:'';display:block;width:22px;height:1px;background:var(--cyan)}
.pe-st{font-family:var(--syne);font-size:clamp(1.55rem,2.4vw,2.2rem);font-weight:700;line-height:1.22;letter-spacing:-.01em;color:var(--w);margin-bottom:18px}
.pe-st .ac{color:var(--cyan)}
.pe-ss{font-size:1rem;color:var(--w2);max-width:560px;line-height:1.8;font-weight:300}
.pe-sh{margin-bottom:56px}

/* PROBLÈME */
.pe-problem{background:var(--bg2)}
.pe-problem::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 50% 100%,rgba(45,217,255,.04) 0%,transparent 70%);pointer-events:none}
.pe-pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.pe-pcard{background:rgba(255,255,255,.025);border:1px solid var(--bdr2);border-radius:14px;padding:34px 28px;transition:border-color .3s,background .3s,transform .3s;position:relative;overflow:hidden}
.pe-pcard::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(45,217,255,.4),transparent);opacity:0;transition:opacity .3s}
.pe-pcard:hover{border-color:var(--bdr);background:rgba(45,217,255,.05);transform:translateY(-4px)}
.pe-pcard:hover::before{opacity:1}
.pe-pico{width:46px;height:46px;background:var(--cdim);border:1px solid var(--bdr);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.pe-pcard h3{font-family:var(--syne);font-size:1.02rem;font-weight:700;color:var(--w);margin-bottom:10px}
.pe-pcard p{font-size:.88rem;color:var(--w2);line-height:1.72;margin:0}

/* SOLUTION 3 STEPS */
.pe-solution{background:var(--bg);overflow:hidden}
.pe-solution::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 50% 50%,rgba(45,217,255,.04) 0%,transparent 65%);pointer-events:none}
.pe-steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;position:relative;z-index:1}
.pe-steps-grid::before{content:'';position:absolute;top:76px;left:calc(33.33% - 1px);right:calc(33.33% - 1px);height:1px;background:linear-gradient(90deg,var(--bdr),rgba(45,217,255,.4),var(--bdr));pointer-events:none;z-index:0}
.pe-step-card{background:rgba(9,18,36,.6);border:1px solid var(--bdr2);padding:40px 32px 36px;position:relative;overflow:hidden;transition:border-color .3s,background .3s,transform .3s;z-index:1}
.pe-step-card:first-child{border-radius:16px 0 0 16px}
.pe-step-card:last-child{border-radius:0 16px 16px 0}
.pe-step-card:hover{background:rgba(45,217,255,.05);border-color:var(--bdr);transform:translateY(-5px)}
.pe-step-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),transparent);opacity:0;transition:opacity .3s}
.pe-step-card:hover::after{opacity:1}
.pe-step-num{font-family:var(--syne);font-size:4.5rem;font-weight:800;line-height:1;background:linear-gradient(135deg,rgba(45,217,255,.18),rgba(45,217,255,.04));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:24px;display:block}
.pe-step-icon{width:52px;height:52px;background:var(--cdim);border:1px solid var(--bdr);border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.pe-step-card h3{font-family:var(--syne);font-size:1.1rem;font-weight:700;color:var(--w);margin-bottom:10px;line-height:1.3}
.pe-step-sub{font-size:.78rem;color:var(--cyan);font-family:var(--syne);font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px;display:flex;align-items:center;gap:6px}
.pe-step-sub::before{content:'';display:block;width:14px;height:1px;background:var(--cyan)}
.pe-step-card p{font-size:.88rem;color:var(--w2);line-height:1.78;margin-bottom:18px}
.pe-step-tags{display:flex;flex-direction:column;gap:7px}
.pe-step-tag{display:flex;align-items:center;gap:9px;font-size:.8rem;color:var(--w3);line-height:1.4}
.pe-step-tag::before{content:'';width:5px;height:5px;background:var(--cyan2);border-radius:50%;flex-shrink:0}
.pe-app-pills{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
.pe-ap{display:inline-flex;align-items:center;gap:6px;background:rgba(45,217,255,.07);border:1px solid var(--bdr);color:var(--w2);padding:6px 12px;border-radius:8px;font-size:.76rem;font-weight:500;font-family:var(--syne)}

/* PRICING */
.pe-pricing{background:var(--bg2)}
.pe-pricing::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 50% 50% at 50% 0%,rgba(45,217,255,.06) 0%,transparent 65%);pointer-events:none}
.pe-pgr{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:56px}
.pe-pc{background:rgba(255,255,255,.025);border:1.5px solid var(--bdr2);border-radius:16px;padding:36px 28px;position:relative;transition:transform .3s,box-shadow .3s,border-color .3s}
.pe-pc:hover{transform:translateY(-6px);box-shadow:0 20px 60px rgba(0,0,0,.35);border-color:var(--bdr)}
.pe-pc.rec{background:linear-gradient(155deg,rgba(45,217,255,.1),rgba(0,255,204,.04));border-color:rgba(45,217,255,.4);box-shadow:0 0 60px rgba(45,217,255,.1)}
.pe-rbdg{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(90deg,var(--cyan),var(--cyan2));color:var(--bg);font-size:.68rem;font-weight:700;padding:5px 18px;border-radius:12px;white-space:nowrap;font-family:var(--syne)}
.pe-pn{font-family:var(--syne);font-size:.7rem;text-transform:uppercase;letter-spacing:.12em;color:var(--w3);font-weight:600;margin-bottom:10px}
.pe-pc.rec .pe-pn{color:var(--cyan)}
.pe-pp{font-family:var(--syne);font-size:2.8rem;font-weight:700;color:var(--w);line-height:1;margin-bottom:4px}
.pe-pc.rec .pe-pp{color:var(--cyan);text-shadow:0 0 30px rgba(45,217,255,.3)}
.pe-pp sup{font-size:1.3rem;vertical-align:super}
.pe-pper{font-size:.81rem;color:var(--w3);margin-bottom:24px}
.pe-pdesc{font-size:.88rem;color:var(--w2);line-height:1.68;padding-bottom:20px;border-bottom:1px solid var(--bdr2);margin-bottom:20px}
.pe-pfs{display:flex;flex-direction:column;gap:11px;margin-bottom:28px}
.pe-pf{display:flex;gap:10px;font-size:.875rem;color:var(--w2);align-items:flex-start;line-height:1.5}
.pe-pfc{color:var(--cyan);flex-shrink:0;font-size:.82rem;margin-top:2px;font-weight:700}
.pe-pc.rec .pe-pfc{color:var(--cyan2)}
.pe-btp{display:block;text-align:center;padding:14px 20px;border-radius:8px;font-weight:700;font-size:.88rem;text-decoration:none;transition:all .2s;font-family:var(--syne)}
.pe-bto{border:1.5px solid var(--bdr);color:var(--w2)}
.pe-bto:hover{border-color:var(--cyan);color:var(--cyan)}
.pe-btf{background:linear-gradient(90deg,var(--cyan),var(--cyan2));color:var(--bg)}
.pe-btf:hover{opacity:.9;box-shadow:0 4px 30px rgba(45,217,255,.3)}

/* GUARANTEES */
.pe-guarantees{background:var(--bg)}
.pe-ggr{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:48px}
.pe-gc{background:rgba(255,255,255,.025);border:1px solid var(--bdr2);border-radius:14px;padding:32px 24px;text-align:center;transition:border-color .3s,background .3s}
.pe-gc:hover{border-color:var(--bdr);background:rgba(45,217,255,.04)}
.pe-gico{width:52px;height:52px;background:var(--cdim);border:1px solid var(--bdr);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.pe-gc h4{font-family:var(--syne);font-size:.95rem;font-weight:700;color:var(--w);margin-bottom:8px}
.pe-gc p{font-size:.86rem;color:var(--w2);line-height:1.68;margin:0}

/* FAQ */
.pe-faq{background:var(--bg2)}
.pe-fqgr{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:48px}
.pe-fi{background:rgba(255,255,255,.025);border:1px solid var(--bdr2);border-radius:12px;overflow:hidden;transition:border-color .2s}
.pe-fi:hover{border-color:var(--bdr)}
.pe-fq{padding:20px 22px;font-family:var(--syne);font-size:.895rem;font-weight:600;color:var(--w);cursor:pointer;display:flex;justify-content:space-between;align-items:center;user-select:none;gap:14px}
.pe-fqi{width:24px;height:24px;background:var(--cdim);border:1px solid var(--bdr);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--cyan);font-size:.88rem;flex-shrink:0;transition:transform .3s}
.pe-fa{max-height:0;overflow:hidden;transition:max-height .4s cubic-bezier(.22,1,.36,1),padding .3s;padding:0 22px}
.pe-fa.open{max-height:300px;padding:0 22px 18px}
.pe-fa p{font-size:.875rem;color:var(--w2);line-height:1.75;margin:0}
.pe-fi.active .pe-fqi{transform:rotate(45deg)}

/* CTA FINAL */
.pe-ctafin{background:var(--bg);text-align:center;position:relative;overflow:hidden;padding:100px 64px}
.pe-ctafin::before{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:800px;height:600px;background:radial-gradient(ellipse,rgba(45,217,255,.1) 0%,transparent 65%);pointer-events:none}
.pe-cr{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none}
.pe-cr1{width:600px;height:600px;border:1px solid rgba(45,217,255,.05);animation:pe-rp 4s ease-in-out infinite}
.pe-cr2{width:900px;height:900px;border:1px solid rgba(45,217,255,.03);animation:pe-rp 4s ease-in-out infinite .5s}
@keyframes pe-rp{0%,100%{opacity:.5}50%{opacity:1}}
.pe-cin{position:relative;z-index:1}
.pe-cdesc{font-size:1rem;color:var(--w2);max-width:500px;margin:0 auto 40px;line-height:1.8;font-weight:300}
.pe-ctabtns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.pe-cnote{margin-top:22px;font-size:.8rem;color:var(--w3);display:flex;gap:22px;justify-content:center;flex-wrap:wrap}
.pe-cnote span{display:flex;align-items:center;gap:6px}
.pe-cnote span::before{content:'';width:5px;height:5px;background:var(--cyan2);border-radius:50%;display:block}

/* FOOTER */
.pe-footer{background:var(--bg2);padding:40px 64px;border-top:1px solid var(--bdr2)}
.pe-footer-inner{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px}
.pe-flogo{font-family:var(--syne);font-size:1.1rem;font-weight:800;color:var(--w)}
.pe-flogo span{color:var(--cyan)}
.pe-flinks{display:flex;gap:24px;align-items:center;flex-wrap:wrap}
.pe-flinks a{font-size:.79rem;color:var(--w3);text-decoration:none;transition:color .2s}
.pe-flinks a:hover{color:var(--w)}
.pe-footer-solo{display:flex;align-items:center;gap:7px;font-size:.75rem;color:rgba(238,244,255,.25);text-decoration:none;transition:color .2s;border:1px solid rgba(255,255,255,.06);padding:6px 12px;border-radius:16px}
.pe-footer-solo:hover{color:var(--w3);border-color:var(--bdr2)}
.pe-footer-solo::before{content:'→';font-size:.68rem;color:var(--cyan)}
.pe-fcopy{font-size:.75rem;color:rgba(238,244,255,.18)}

/* RESPONSIVE */
@media(max-width:960px){
  .pe-nav{padding:14px 20px}
  .pe-nr .pe-solo-nav{display:none}
  .pe-nr a:not(.pe-nc):not(.pe-solo-nav){display:none}
  .pe-hero,.pe-section{padding:60px 20px}
  .pe-hero{padding-top:110px}
  .pe-hi{grid-template-columns:1fr;gap:40px}
  .pe-hpanel{display:none}
  .pe-steps-grid,.pe-pgrid,.pe-pgr,.pe-ggr,.pe-fqgr{grid-template-columns:1fr}
  .pe-steps-grid::before{display:none}
  .pe-step-card:first-child{border-radius:12px 12px 0 0}
  .pe-step-card:last-child{border-radius:0 0 12px 12px}
  .pe-expbanner{padding:40px 20px}
  .pe-expinner{grid-template-columns:1fr 1fr;gap:10px}
  .pe-eitem:first-child,.pe-eitem:last-child{border-radius:10px}
  .pe-ctafin{padding:60px 20px}
  .pe-footer{padding:32px 20px}
  .pe-footer-inner{flex-direction:column;text-align:center}
  .pe-flinks{justify-content:center}
  .pe-cr1,.pe-cr2{display:none}
}
`;

export default function EntrepriseLanding() {
  // ─── Inject styles & run JS effects ────────────────────────────────────────
  useEffect(() => {
    // Injection du CSS dans le <head>
    const styleTag = document.createElement("style");
    styleTag.id = "pe-landing-styles";
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);

    // Scroll reveal — anime les éléments quand ils entrent dans le viewport
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((x) => {
          if (x.isIntersecting) {
            x.target.classList.add("on");
            io.unobserve(x.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll(".pe-root .rv, .pe-root .rvr").forEach((el) =>
      io.observe(el)
    );

    // FAQ accordion
    const fqItems = document.querySelectorAll(".pe-fq");
    fqItems.forEach((q) => {
      q.addEventListener("click", () => {
        const item = q.parentElement as HTMLElement;
        const ans = item?.querySelector(".pe-fa") as HTMLElement;
        const open = item?.classList.contains("active");
        document.querySelectorAll(".pe-fi").forEach((i) => {
          i.classList.remove("active");
          (i.querySelector(".pe-fa") as HTMLElement)?.classList.remove("open");
        });
        if (!open) {
          item?.classList.add("active");
          ans?.classList.add("open");
        }
      });
    });

    // Nav scroll effect
    const nav = document.querySelector(".pe-nav") as HTMLElement;
    const handleScroll = () => {
      if (nav)
        nav.style.background =
          window.scrollY > 50
            ? "rgba(6,13,26,.97)"
            : "rgba(6,13,26,.88)";
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup au démontage du composant
    return () => {
      document.getElementById("pe-landing-styles")?.remove();
      window.removeEventListener("scroll", handleScroll);
      io.disconnect();
    };
  }, []);

  return (
    <div className="pe-root">

      {/* ── NAV ── */}
      <nav className="pe-nav">
        <a href="/" className="pe-nl">Pulse <span>Entreprise</span></a>
        <div className="pe-nr">
          <a href="#methode">Méthode</a>
          <a href="#pricing">Tarifs</a>
          <a href="#faq">FAQ</a>
          <a href="https://pulse-lead.com/commercial" target="_blank" rel="noreferrer" className="pe-solo-nav">↗ Version Solo</a>
          <a href="https://calendly.com/tomiolovpro/pulse" target="_blank" rel="noreferrer" className="pe-nc">Réserver un appel</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pe-hero">
        <div className="pe-orb1" /><div className="pe-orb2" /><div className="pe-gbg" />
        <div className="pe-hi">
          <div>
            <div className="pe-chip rv">Pour les directeurs et managers commerciaux B2B</div>
            <h1 className="pe-hh rv d1">Vos commerciaux terrain visitent plus de <span className="ac">clients qualifiés</span> — dès cette semaine</h1>
            <p className="pe-hs rv d2">Base de prospects sur mesure, tournées optimisées et tableau de bord manager. Livré clé en main en 72h, configuré selon votre brief.</p>
            <div className="pe-ctas rv d3">
              <a href="https://calendly.com/tomiolovpro/pulse" target="_blank" rel="noreferrer" className="pe-bp">Réserver un appel de brief (1h gratuite)</a>
              <a href="#pricing" className="pe-bo">Voir les formules</a>
            </div>
            <div className="pe-badges rv d4">
              <div className="pe-badge"><div className="pe-bd" />Livraison 72h</div>
              <div className="pe-badge"><div className="pe-bd" />Sans engagement</div>
              <div className="pe-badge"><div className="pe-bd" />Prospects remplacés si insatisfait</div>
            </div>
          </div>
          <div className="pe-hpanel rvr d2">
            <div className="pe-hpl">Comment ça fonctionne</div>
            <div className="pe-hps">
              <div className="pe-hpstep">
                <div className="pe-hpn">1</div>
                <div><h4>Votre brief — 1h</h4><p>Secteur cible, zones géographiques, taille d'équipe, critères de qualification. Nous écoutons, vous décidez.</p></div>
              </div>
              <div className="pe-hpstep">
                <div className="pe-hpn">2</div>
                <div><h4>Livraison sur mesure — 72h</h4><p>Base prospects enrichie, tournées optimisées, tableau de bord manager activé. Rien n'est générique.</p></div>
              </div>
              <div className="pe-hpstep">
                <div className="pe-hpn">3</div>
                <div><h4>Formation de votre équipe — 1h</h4><p>Vos commerciaux et vous maîtrisez l'app (mobile + PC) dès la première session.</p></div>
              </div>
            </div>
            <div className="pe-hpf">
              <div className="pe-prh">
                <div className="from">À partir de</div>
                <div className="amt">490€ <span className="ht">HT</span></div>
              </div>
              <div className="pe-dpill">72h chrono</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ── */}
      <div className="pe-expbanner">
        <div className="pe-expinner">
          <div className="pe-eitem rv d1"><div className="pe-enum">+40<sup>%</sup></div><div className="pe-elabel">de visites qualifiées par journée terrain</div></div>
          <div className="pe-eitem rv d2"><div className="pe-enum">72h</div><div className="pe-elabel">délai de livraison garanti, brief inclus</div></div>
          <div className="pe-eitem rv d3"><div className="pe-enum">100<sup>%</sup></div><div className="pe-elabel">sur mesure — zéro template générique</div></div>
          <div className="pe-eitem rv d4"><div className="pe-enum">🇫🇷 🇨🇭</div><div className="pe-elabel">France & Suisse — IDF, PACA, Suisse romande</div></div>
        </div>
      </div>

      {/* ── PROBLÈME ── */}
      <section className="pe-section pe-problem">
        <div className="pe-wrap">
          <div className="pe-sh">
            <div className="pe-sl rv">Le constat</div>
            <h2 className="pe-st rv d1">Ce qui freine votre équipe<br />en ce moment même</h2>
          </div>
          <div className="pe-pgrid">
            <div className="pe-pcard rv d1">
              <div className="pe-pico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2dd9ff" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
              <h3>Trop de temps à chercher à qui parler</h3>
              <p>Sans base ciblée, vos commerciaux prospectent au hasard — là où ils devraient être en face d'un décideur qualifié.</p>
            </div>
            <div className="pe-pcard rv d2">
              <div className="pe-pico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2dd9ff" strokeWidth="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg></div>
              <h3>Des tournées inefficaces qui épuisent</h3>
              <p>Kilomètres inutiles, visites mal séquencées. Vos commerciaux travaillent fort pour un pipeline qui devrait être plus plein.</p>
            </div>
            <div className="pe-pcard rv d3">
              <div className="pe-pico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2dd9ff" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
              <h3>Aucune visibilité sur l'activité réelle</h3>
              <p>Qui a visité quoi ? Quelles opportunités en attente ? Sans outil de pilotage, vous gérez à vue et les relances tombent dans l'oubli.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOLUTION 3 STEPS ── */}
      <section className="pe-section pe-solution" id="methode">
        <div className="pe-wrap">
          <div className="pe-sh" style={{textAlign:"center",maxWidth:"600px",margin:"0 auto 64px"}}>
            <div className="pe-sl rv" style={{justifyContent:"center"}}>Notre méthode</div>
            <h2 className="pe-st rv d1">Trois étapes, livré<br /><span className="ac">clé en main en 72h</span></h2>
            <p className="pe-ss rv d2" style={{margin:"0 auto"}}>Tout part de votre brief. Chaque livraison est construite depuis zéro — pour votre secteur, vos zones, votre équipe.</p>
          </div>
          <div className="pe-steps-grid">
            <div className="pe-step-card rv d1">
              <span className="pe-step-num">01</span>
              <div className="pe-step-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2dd9ff" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
              <div className="pe-step-sub">Appel de brief · 1h</div>
              <h3>On apprend à connaître votre terrain</h3>
              <p>Vous décrivez votre activité, votre cible, vos zones et votre organisation actuelle. Nous posons les bonnes questions — vous n'avez rien à préparer.</p>
              <div className="pe-step-tags">
                <div className="pe-step-tag">Secteur, typologies de clients, décideurs visés</div>
                <div className="pe-step-tag">Zones géographiques prioritaires</div>
                <div className="pe-step-tag">Taille d'équipe et critères de qualification</div>
              </div>
            </div>
            <div className="pe-step-card rv d2">
              <span className="pe-step-num">02</span>
              <div className="pe-step-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2dd9ff" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
              <div className="pe-step-sub">Livraison · 72h chrono</div>
              <h3>Votre espace est prêt à l'emploi</h3>
              <p>Prospects enrichis selon vos critères exacts, tournées calculées, dashboard manager activé et paramétré. Zéro travail de votre côté.</p>
              <div className="pe-step-tags">
                <div className="pe-step-tag">Prospects filtrés et enrichis (téléphone, adresse, contact nominatif)</div>
                <div className="pe-step-tag">Itinéraires multi-zones optimisés par commercial</div>
                <div className="pe-step-tag">Dashboard manager activé avec vos KPIs</div>
              </div>
            </div>
            <div className="pe-step-card rv d3">
              <span className="pe-step-num">03</span>
              <div className="pe-step-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2dd9ff" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round"/></svg></div>
              <div className="pe-step-sub">Formation · 1h visio</div>
              <h3>Opérationnel dès la première journée</h3>
              <p>Une session visio pour que tout le monde maîtrise l'outil — commerciaux sur le terrain comme manager au bureau.</p>
              <div className="pe-step-tags">
                <div className="pe-step-tag">Commerciaux : app mobile — tournée en 2 clics, GPS, notes, rappels</div>
                <div className="pe-step-tag">Manager : app PC — dashboard, KPIs, suivi en temps réel</div>
              </div>
              <div className="pe-app-pills">
                <div className="pe-ap"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2dd9ff" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round"/></svg>App mobile</div>
                <div className="pe-ap"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2dd9ff" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>App PC</div>
                <div className="pe-ap"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00ffcc" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>Dashboard manager</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="pe-section pe-pricing" id="pricing">
        <div className="pe-wrap">
          <div className="pe-sh">
            <div className="pe-sl rv">Formules</div>
            <h2 className="pe-st rv d1">Adapté à la taille de votre<br /><span className="ac">équipe terrain</span></h2>
            <p className="pe-ss rv d2">Paiement unique, sans engagement. Vous choisissez, nous livrons sous 72h.</p>
          </div>
          <div className="pe-pgr">
            {/* STARTER */}
            <div className="pe-pc rv d1">
              <div className="pe-pn">Starter</div>
              <div className="pe-pp"><sup>€</sup>490</div>
              <div className="pe-pper">HT · paiement unique</div>
              <p className="pe-pdesc">1 à 2 commerciaux terrain. Pour structurer une première zone et valider la méthode.</p>
              <div className="pe-pfs">
                {["300 prospects qualifiés et enrichis","1 à 2 commerciaux terrain","Tournées multi-zones optimisées","Accès à l'app (mobile + PC)","Dashboard manager avancé","Formation 1h visio","Support WhatsApp inclus"].map(f => (
                  <div className="pe-pf" key={f}><span className="pe-pfc">✓</span>{f}</div>
                ))}
              </div>
              <a href="https://calendly.com/tomiolovpro/pulse" target="_blank" rel="noreferrer" className="pe-btp pe-bto">Réserver un appel</a>
            </div>
            {/* PRO */}
            <div className="pe-pc rec rv d2">
              <div className="pe-rbdg">Le plus choisi</div>
              <div className="pe-pn">Pro</div>
              <div className="pe-pp"><sup>€</sup>890</div>
              <div className="pe-pper">HT · paiement unique</div>
              <p className="pe-pdesc">3 à 5 commerciaux avec plusieurs zones actives à couvrir simultanément.</p>
              <div className="pe-pfs">
                {["600 prospects qualifiés et enrichis","3 à 5 commerciaux terrain","Tournées multi-zones optimisées","Accès à l'app (mobile + PC)","Dashboard manager avancé","Formation 1h visio","Support WhatsApp inclus"].map(f => (
                  <div className="pe-pf" key={f}><span className="pe-pfc">✓</span>{f}</div>
                ))}
              </div>
              <a href="https://calendly.com/tomiolovpro/pulse" target="_blank" rel="noreferrer" className="pe-btp pe-btf">Réserver un appel</a>
            </div>
            {/* SCALE */}
            <div className="pe-pc rv d3">
              <div className="pe-pn">Scale</div>
              <div className="pe-pp"><sup>€</sup>1490</div>
              <div className="pe-pper">HT · paiement unique</div>
              <p className="pe-pdesc">6 à 10 commerciaux avec couverture régionale étendue ou multi-zones.</p>
              <div className="pe-pfs">
                {["1000+ prospects qualifiés et enrichis","6 à 10 commerciaux terrain","Tournées multi-zones optimisées","Accès à l'app (mobile + PC)","Dashboard manager avancé","Formation 1h visio","Support WhatsApp inclus"].map(f => (
                  <div className="pe-pf" key={f}><span className="pe-pfc">✓</span>{f}</div>
                ))}
              </div>
              <a href="https://calendly.com/tomiolovpro/pulse" target="_blank" rel="noreferrer" className="pe-btp pe-bto">Réserver un appel</a>
            </div>
          </div>
          <p className="rv" style={{textAlign:"center",color:"var(--w3)",fontSize:".86rem",marginTop:"26px"}}>
            Volume plus important ? <a href="https://calendly.com/tomiolovpro/pulse" target="_blank" rel="noreferrer" style={{color:"var(--cyan)",textDecoration:"none",fontWeight:600}}>Contactez-nous.</a>
          </p>
        </div>
      </section>

      {/* ── GUARANTEES ── */}
      <section className="pe-section pe-guarantees">
        <div className="pe-wrap">
          <div className="pe-sh">
            <div className="pe-sl rv">Nos engagements</div>
            <h2 className="pe-st rv d1">Trois garanties<br /><span className="ac">sans condition</span></h2>
          </div>
          <div className="pe-ggr">
            <div className="pe-gc rv d1">
              <div className="pe-gico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2dd9ff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
              <h4>Livraison garantie en 72h</h4>
              <p>Votre base et votre accès à l'app sont livrés dans les 72 heures ouvrées suivant la validation du brief.</p>
            </div>
            <div className="pe-gc rv d2">
              <div className="pe-gico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2dd9ff" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
              <h4>Paiement sécurisé Stripe</h4>
              <p>Toutes les transactions sont traitées via Stripe. Vos données bancaires protégées à chaque étape.</p>
            </div>
            <div className="pe-gc rv d3">
              <div className="pe-gico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2dd9ff" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <h4>Remplacement des prospects — 30 jours</h4>
              <p>Si les prospects livrés ne correspondent pas au brief validé, nous les remplaçons intégralement dans les 30 jours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="pe-section pe-faq" id="faq">
        <div className="pe-wrap">
          <div className="pe-sh">
            <div className="pe-sl rv">Questions fréquentes</div>
            <h2 className="pe-st rv d1">Ce qu'on nous pose<br /><span className="ac">le plus souvent</span></h2>
          </div>
          <div className="pe-fqgr">
            {[
              {q:"Comment sont sélectionnés les prospects ?", a:"À partir de votre brief, nous extrayons les données depuis des bases professionnelles légales (Pappers, Infogreffe, LinkedIn) enrichies via APIs spécialisées. Chaque prospect est filtré selon vos critères exacts — secteur, zone, taille d'entreprise, type de décideur. La base est conforme au RGPD."},
              {q:"Que se passe-t-il si les prospects ne correspondent pas ?", a:"Nous remplaçons les prospects non conformes au brief validé, dans les 30 jours suivant la livraison. Pas de remboursement — nous corrigeons jusqu'à ce que vous ayez exactement ce qui a été convenu."},
              {q:"Comment fonctionne l'app pour mes commerciaux ?", a:"Vos commerciaux accèdent à leur liste depuis l'app mobile. En 2 clics, ils génèrent leur tournée du jour optimisée géographiquement. Depuis chaque fiche : appel direct, navigation GPS, prise de notes, programmation d'un rappel. La formation d'1h suffit."},
              {q:"Je pilote comment mon équipe depuis le dashboard ?", a:"Depuis l'app PC, vous voyez en temps réel l'activité de chaque commercial : prospects visités, en attente de relance, à planifier. KPIs hebdomadaires et suivi par zone. Vous savez exactement où en est chaque commercial sans avoir à lui demander."},
              {q:"Quelle différence avec un CRM ?", a:"Nous ne remplaçons pas votre CRM. Pulse est un outil dédié à l'organisation de la prospection terrain : ciblage, tournées, pilotage. Si vous avez un CRM, les données peuvent y être importées."},
              {q:"Vous intervenez en France et en Suisse ?", a:"Oui — principalement en Île-de-France, PACA et Suisse romande. Pour d'autres zones, contactez-nous pour valider la faisabilité avant tout engagement."},
            ].map(({q, a}, i) => (
              <div className={`pe-fi rv ${i % 2 === 0 ? "d1" : "d2"}`} key={q}>
                <div className="pe-fq">{q}<div className="pe-fqi">+</div></div>
                <div className="pe-fa"><p>{a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <div className="pe-ctafin">
        <div className="pe-cr pe-cr1" /><div className="pe-cr pe-cr2" />
        <div className="pe-wrap pe-cin">
          <div className="pe-sl rv" style={{justifyContent:"center"}}>Passer à l'action</div>
          <h2 className="pe-st rv d1" style={{textAlign:"center"}}>Prêt à structurer la prospection<br /><span className="ac">de votre équipe terrain ?</span></h2>
          <p className="pe-cdesc rv d2">Réservez votre appel d'une heure. Vous décrivez votre équipe, votre cible, vos zones. Nous construisons la configuration adaptée. Sans engagement.</p>
          <div className="pe-ctabtns rv d3">
            <a href="https://calendly.com/tomiolovpro/pulse" target="_blank" rel="noreferrer" className="pe-bp">Réserver mon appel de brief (1h gratuite)</a>
          </div>
          <div className="pe-cnote rv d4">
            <span>Aucun engagement</span>
            <span>Livraison 72h</span>
            <span>Prospects remplacés si insatisfait</span>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="pe-footer">
        <div className="pe-footer-inner">
          <div className="pe-flogo">Pulse <span>Entreprise</span></div>
          <div className="pe-flinks">
            <a href="/mentions-legales">Mentions légales</a>
            <a href="/cgv">CGV</a>
            <a href="/confidentialite">Confidentialité</a>
            <a href="https://calendly.com/tomiolovpro/pulse" target="_blank" rel="noreferrer">Contact</a>
          </div>
          <a href="https://pulse-lead.com/commercial" target="_blank" rel="noreferrer" className="pe-footer-solo">Vous êtes commercial solo ? Pulse Solo</a>
          <div className="pe-fcopy">© 2025 Pulse Entreprise · Tous droits réservés</div>
        </div>
      </footer>

    </div>
  );
}
