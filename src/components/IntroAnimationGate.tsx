/**
 * IntroAnimationGate — cinematic portfolio intro
 *
 * Exit: clean camera-rush zoom → iris-black curtain → children reveal
 * No wormhole, no white flash, no blendMode blowout.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass }     from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass }     from "three/examples/jsm/postprocessing/OutputPass.js";

/* ─── Constants ──────────────────────────────────────────────────────────── */

type IntroPhase = "idle" | "exiting" | "done";

type IntroAnimationGateProps = {
  children:  ReactNode;
  title?:    string;
  subtitle?: string;
  name?:     string;
};

const STORAGE_KEY  = "portfolio_intro_skip";
const EXIT_MS      = 900;   // camera-rush duration (matches wE animation)
const CURTAIN_MS   = 620;   // black iris after rush (slow cinematic close)
const UI_DELAY_MS  = 900;
const FPS_CAP      = 1000 / 60;

/* ─── GLSL ───────────────────────────────────────────────────────────────── */

const VERT = `
varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}
`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform float uProjectionIntensity;
uniform float uReflectionGain;
uniform float uHighlightBoost;
uniform float uLumaThreshold;
uniform float uHalftone;

vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}

float snoise(vec2 v){
  const vec4 C=vec4(.211324865,.366025403,-.577350269,.024390243);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m*m*m;
  vec3 x=2.*fract(p*C.www)-1.;
  vec3 h=abs(x)-.5;
  vec3 a0=x-floor(x+.5);
  m*=1.79284291-.85373472*(a0*a0+h*h);
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}

float fbm(vec2 p){
  float v=0.,a=.5;
  for(int i=0;i<4;i++){v+=a*snoise(p);p=p*2.1+vec2(17.3,31.7);a*=.48;}
  return v;
}

void main(){
  vec2 uv=vUv;
  vec2 p=uv*2.-1.;
  float t=uTime*.72;
  vec2 flow=vec2(t*.14,t*.09);
  vec2 q=vec2(fbm(p*.9+flow),fbm(p*.9+vec2(-flow.y*1.2,flow.x*.85)));
  vec2 w=p+q*.7;
  float nA=.5+.5*fbm(w*1.9+flow*.6);
  float nB=.5+.5*fbm(w*4.2+vec2(-flow.x*.4,flow.y*.3));
  float ridge=1.-abs(2.*nB-1.);
  float mask=clamp(.15+1.18*(.55*nA+.45*ridge),0.,1.);
  float edgeFade=1.-clamp(length(p)*.65,0.,1.);
  float intensity=pow(clamp(mask*(.68+edgeFade*.5),0.,1.),1.1);
  float base=nA*.78+ridge*.22;
  vec3 col=vec3(
    .04+.72*(.5+.5*cos(6.28318*(base+.60+t*.05))),
    .18+.82*(.5+.5*cos(6.28318*(base+.28+t*.045))),
    .28+.88*(.5+.5*cos(6.28318*(base+.00+t*.055)))
  );
  col*=intensity;
  float highlight=pow(clamp((nA*1.2+ridge*.6)-1.08,0.,1.),2.);
  col=mix(col,vec3(.95,.35,.88),highlight*.28);
  col+=vec3(.04,.12,.22)*exp(-dot(p,p)*2.2)*.4;
  vec3 tex=clamp(col,0.,1.);
  float lum=dot(tex,vec3(.2126,.7152,.0722));
  float lumaS=clamp(uLumaThreshold,0.,1.);
  float darkMask=(lumaS>1e-4)?smoothstep(lumaS,min(1.,lumaS+.1),lum):1.;
  if(uHalftone>.5){
    vec2 hUv=vUv*vec2(200.,130.);
    vec2 hCell=fract(hUv)-.5;
    float dotR=mix(.02,.44,clamp(lum,0.,1.));
    tex*=(1.-smoothstep(dotR,dotR+.03,length(hCell)))*darkMask;
  } else {
    tex*=darkMask;
  }
  tex*=mix(1.,uHighlightBoost,smoothstep(.5,1.,lum));
  tex*=max(0.,uProjectionIntensity)*max(0.,uReflectionGain);
  gl_FragColor=vec4(tex,1.);
}
`;

/* ─── Render source ──────────────────────────────────────────────────────── */

function createRenderSource(w = 512, h = 288) {
  const scene    = new THREE.Scene();
  const cam      = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uTime:                { value: 0 },
    uProjectionIntensity: { value: 1 },
    uReflectionGain:      { value: 1 },
    uHighlightBoost:      { value: 1.65 },
    uLumaThreshold:       { value: 0.10 },
    uHalftone:            { value: 1 },
  };
  const mat  = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  scene.add(quad);
  const rt = new THREE.WebGLRenderTarget(Math.max(2, w), Math.max(2, h), {
    minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat, type: THREE.UnsignedByteType,
    colorSpace: THREE.SRGBColorSpace, depthBuffer: false, stencilBuffer: false,
  });
  return {
    texture: rt.texture,
    tick(renderer: THREE.WebGLRenderer, t: number) {
      uniforms.uTime.value = t;
      const prev = renderer.getRenderTarget();
      const prevXr = renderer.xr.enabled;
      renderer.xr.enabled = false;
      renderer.setRenderTarget(rt);
      renderer.clear();
      renderer.render(scene, cam);
      renderer.setRenderTarget(prev);
      renderer.xr.enabled = prevXr;
    },
    dispose() { quad.geometry.dispose(); mat.dispose(); rt.dispose(); },
  };
}

/* ─── Scene helpers ──────────────────────────────────────────────────────── */

function buildFloor(mat: THREE.Material) {
  const geo = new THREE.PlaneGeometry(100, 100, 4, 4);
  geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, mat);
  m.receiveShadow = true;
  return m;
}

function buildKeyboard(mat: THREE.Material) {
  const group = new THREE.Group();
  const base  = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.045, 0.42), mat);
  base.position.y = 0.0225;
  base.receiveShadow = base.castShadow = true;
  group.add(base);
  const COLS = 10, ROWS = 3;
  const kW = 0.09, kH = 0.072, kD = 0.07, gX = 0.012, gZ = 0.01;
  const startX = -((COLS - 1) * (kW + gX)) / 2;
  const startZ = -((ROWS - 1) * (kD + gZ)) / 2;
  const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(kW, kH, kD), mat, COLS * ROWS);
  keys.castShadow = keys.receiveShadow = true;
  const dummy = new THREE.Object3D();
  let idx = 0;
  for (let rz = 0; rz < ROWS; rz++)
    for (let cx = 0; cx < COLS; cx++) {
      dummy.position.set(startX + cx * (kW + gX), 0.045 + kH * 0.5 + 0.002, startZ + rz * (kD + gZ));
      dummy.updateMatrix();
      keys.setMatrixAt(idx++, dummy.matrix);
    }
  group.add(keys);
  group.position.set(0, 0, 1.28);
  return group;
}

function getLayout(w: number) {
  if (w <= 420) return { screenScale: 0.78, screenY: 0.88, screenZ: 0.46, bloomR: 0.38 };
  if (w <= 768) return { screenScale: 0.86, screenY: 0.94, screenZ: 0.48, bloomR: 0.44 };
  return            { screenScale: 1.00, screenY: 1.00, screenZ: 0.50, bloomR: 0.52 };
}

/* ─── Global CSS ─────────────────────────────────────────────────────────── */

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;600&display=swap');

@keyframes _ig_letterReveal{
  from{opacity:0;transform:translateY(14px) skewX(-5deg);filter:blur(7px)}
  to  {opacity:1;transform:none;filter:none}
}
@keyframes _ig_fadeUp{
  from{opacity:0;transform:translateY(16px)}
  to  {opacity:1;transform:none}
}
@keyframes _ig_shimmer{
  0%{filter:drop-shadow(0 0 0 rgba(255,140,32,0))}
  50%{filter:drop-shadow(0 0 8px rgba(255,140,32,.4))}
  100%{filter:drop-shadow(0 0 0 rgba(255,140,32,0))}
}
@keyframes _ig_borderGlow{
  0%{box-shadow:0 8px 32px rgba(255,100,20,.2), inset 0 1px 1px rgba(255,255,255,.2)}
  50%{box-shadow:0 8px 32px rgba(255,100,20,.2), inset 0 1px 1px rgba(255,255,255,.2), 0 0 16px rgba(255,140,32,.3)}
  100%{box-shadow:0 8px 32px rgba(255,100,20,.2), inset 0 1px 1px rgba(255,255,255,.2)}
}
@keyframes _ig_lineSlide{
  from{width:0;opacity:0}
  to  {width:100%;opacity:1}
}
@keyframes _ig_scan{
  from{transform:translateY(-100%)}
  to  {transform:translateY(100vh)}
}
@keyframes _ig_grain{
  0%,100%{transform:translate(0,0)}   10%{transform:translate(-1%,-1%)}
  20%    {transform:translate(1%,-2%)} 30%{transform:translate(-2%,1%)}
  40%    {transform:translate(2%,2%)}  50%{transform:translate(-1%,1%)}
  60%    {transform:translate(1%,-1%)} 70%{transform:translate(-2%,-2%)}
  80%    {transform:translate(2%,1%)}  90%{transform:translate(-1%,2%)}
}
@keyframes _ig_arcFill{
  from{stroke-dashoffset:283}
  to  {stroke-dashoffset:0}
}
@keyframes _ig_pulse{
  from{transform:scale(.95);opacity:.7}
  to  {transform:scale(1.18);opacity:0}
}
@keyframes _ig_lightLeak{
  0%,100%{opacity:0} 50%{opacity:.1}
}
@keyframes _ig_glitch{
  0%,88%,100%{clip-path:none;transform:none}
  90%{clip-path:inset(20% 0 40% 0);transform:translateX(-3px)}
  93%{clip-path:inset(58% 0 12% 0);transform:translateX(3px)}
  96%{clip-path:inset(38% 0 32% 0);transform:translateX(-2px)}
}
@keyframes _ig_dustRise{
  0%    {opacity:0;transform:translateY(0)}
  20%   {opacity:1}
  80%   {opacity:.4}
  100%  {opacity:0;transform:translateY(-55px)}
}
/* Exit: curtain slides in from edges (iris close) — multi-layer stagger */
@keyframes _ig_curtainTop{
  from{transform:scaleY(0);transform-origin:top center}
  to  {transform:scaleY(1);transform-origin:top center}
}
@keyframes _ig_curtainTop2{
  from{transform:scaleY(0);transform-origin:top center;filter:blur(0px)}
  to  {transform:scaleY(1);transform-origin:top center;filter:blur(10px)}
}
@keyframes _ig_curtainTop3{
  from{transform:scaleY(0);transform-origin:top center}
  to  {transform:scaleY(1);transform-origin:top center}
}
@keyframes _ig_curtainBot{
  from{transform:scaleY(0);transform-origin:bottom center}
  to  {transform:scaleY(1);transform-origin:bottom center}
}
@keyframes _ig_curtainBot2{
  from{transform:scaleY(0);transform-origin:bottom center;filter:blur(0px)}
  to  {transform:scaleY(1);transform-origin:bottom center;filter:blur(10px)}
}
@keyframes _ig_curtainBot3{
  from{transform:scaleY(0);transform-origin:bottom center}
  to  {transform:scaleY(1);transform-origin:bottom center}
}
/* Children reveal */
@keyframes _ig_mainReveal{
  from{opacity:0}
  to  {opacity:1}
}
`;

function injectStyles() {
  if (document.getElementById("_ig_styles")) return;
  const el = document.createElement("style");
  el.id = "_ig_styles";
  el.textContent = GLOBAL_CSS;
  document.head.appendChild(el);
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function AnimatedTitle({ text, delay }: { text: string; delay: number }) {
  return (
    <span style={{ display: "inline-block" }}>
      {text.split("").map((ch, i) => (
        <span key={i} style={{
          display: "inline-block", opacity: 0,
          whiteSpace: ch === " " ? "pre" : undefined,
          animation: `_ig_letterReveal .55s cubic-bezier(.16,1,.3,1) ${delay + i * 0.042}s forwards`,
        }}>
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

function ArcProgress({ dur, del }: { dur: number; del: number }) {
  const r = 45, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" width="90" height="90"
      style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,140,32,.07)" strokeWidth="1.5" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,140,32,.75)" strokeWidth="1.5"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c}
        style={{ animation: `_ig_arcFill ${dur}s ${del}s linear forwards` }} />
    </svg>
  );
}

const DUST = Array.from({ length: 14 }, (_, i) => ({
  id:   i,
  left: `${(i / 14) * 100 + Math.sin(i * 2.3) * 6}%`,
  size: `${1.2 + (i % 3) * 0.6}px`,
  dur:  `${11 + (i % 5) * 2.8}s`,
  del:  `${(i * 0.7) % 8}s`,
  op:    0.09 + (i % 4) * 0.04,
}));

function DustParticles() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {DUST.map(p => (
        <div key={p.id} style={{
          position: "absolute", bottom: "-4px", left: p.left,
          width: p.size, height: p.size, borderRadius: "50%",
          background: "rgba(255,140,32,.7)", boxShadow: "0 0 4px rgba(255,140,32,.8)",
          opacity: p.op, animation: `_ig_dustRise ${p.dur} ${p.del} infinite linear`,
        }} />
      ))}
    </div>
  );
}

function GrainCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, []);
  return (
    <canvas ref={ref} style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", opacity: 0.02, mixBlendMode: "screen",
      animation: "_ig_grain .18s steps(1) infinite",
    }} />
  );
}

/* ─── Exit curtain — pure black, no blend modes ──────────────────────────── */

function ExitCurtain({ active }: { active: boolean }) {
  if (!active) return null;
  const dur1 = `${CURTAIN_MS}ms`;
  const dur2 = `${CURTAIN_MS + 20}ms`;
  const dur3 = `${CURTAIN_MS + 40}ms`;
  const ease = "cubic-bezier(.7,0,.85,1)";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, pointerEvents: "none" }}>
      {/* Top layer 1: fast close */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "50%",
        background: "#080810",
        transform: "scaleY(0)", transformOrigin: "top center",
        animation: `_ig_curtainTop ${dur1} ${ease} forwards`,
        filter: "drop-shadow(3px 0 0 #ff8c20)",
      }} />
      {/* Top layer 2: medium close with blur */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "50%",
        background: "#080810",
        transform: "scaleY(0)", transformOrigin: "top center",
        animation: `_ig_curtainTop2 ${dur2} ${ease} forwards`,
      }} />
      {/* Top layer 3: slower close with vignette */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "50%",
        background: "linear-gradient(180deg, rgba(8,8,16,0.6) 0%, rgba(8,8,16,1) 100%)",
        transform: "scaleY(0)", transformOrigin: "top center",
        animation: `_ig_curtainTop3 ${dur3} ${ease} forwards`,
      }} />
      {/* Bottom layer 1: fast close */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
        background: "#080810",
        transform: "scaleY(0)", transformOrigin: "bottom center",
        animation: `_ig_curtainBot ${dur1} ${ease} forwards`,
        filter: "drop-shadow(-3px 0 0 #ff4500)",
      }} />
      {/* Bottom layer 2: medium close with blur */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
        background: "#080810",
        transform: "scaleY(0)", transformOrigin: "bottom center",
        animation: `_ig_curtainBot2 ${dur2} ${ease} forwards`,
      }} />
      {/* Bottom layer 3: slower close with vignette */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
        background: "linear-gradient(0deg, rgba(8,8,16,0.6) 0%, rgba(8,8,16,1) 100%)",
        transform: "scaleY(0)", transformOrigin: "bottom center",
        animation: `_ig_curtainBot3 ${dur3} ${ease} forwards`,
      }} />
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

export default function IntroAnimationGate({
  children,
  title    = "PORTFOLIO",
  subtitle = "Design · Code · Motion",
  name     = "Hari Krishna",
}: IntroAnimationGateProps) {
  const [phase,   setPhase]   = useState<IntroPhase>("idle");
  const [showUI,  setShowUI]  = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const timersRef = useRef<number[]>([]);

  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.innerWidth < 768, []
  );
  const shouldSkip = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.localStorage.getItem(STORAGE_KEY) === "1"
    );
  }, []);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    if (shouldSkip || phase !== "idle") return;
    const t = window.setTimeout(() => setShowUI(true), UI_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [shouldSkip, phase]);

  useEffect(() => {
    return () => { timersRef.current.forEach(id => window.clearTimeout(id)); };
  }, []);

  /* ── Three.js scene ── */
  useEffect(() => {
    if (shouldSkip) { setPhase("done"); return; }

    const mountNode = document.getElementById("_ig_mount");
    if (!mountNode) return;

    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) {
      setWebglOk(false); setPhase("done"); return;
    }

    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.3));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace    = THREE.SRGBColorSpace;
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.72;
    if (!isMobile) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type    = THREE.BasicShadowMap;
    }
    mountNode.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080810);
    scene.fog = new THREE.Fog(0x080810, 6, 22);
    const fog = scene.fog as THREE.Fog;

    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    const CAM0 = { x: 0, y: 1.35, z: 5.8 };
    camera.position.set(CAM0.x, CAM0.y, CAM0.z);
    camera.lookAt(0, 0.75, 0);

    const src = createRenderSource(512, 288);

    const screenGeo = new THREE.PlaneGeometry(2, 1.3);
    const screenMat = new THREE.MeshBasicMaterial({ map: src.texture, toneMapped: false, side: THREE.DoubleSide });
    const screen    = new THREE.Mesh(screenGeo, screenMat);
    const layout0   = getLayout(window.innerWidth);
    let   curLayout = layout0;
    screen.scale.setScalar(layout0.screenScale);
    screen.position.set(0, layout0.screenY, layout0.screenZ);

    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0d0d18, roughness: 0.92, metalness: 0.18 });
    scene.add(screen, buildFloor(floorMat), buildKeyboard(floorMat));

    const spot = new THREE.SpotLight(0xFF8C20, 260);
    spot.decay = 5.5; spot.distance = 38;
    spot.angle = Math.PI / 3; spot.penumbra = 0.65;
    spot.map   = src.texture;
    if (!isMobile) {
      spot.castShadow = true;
      spot.shadow.mapSize.set(512, 512);
      spot.shadow.bias = -0.0002; spot.shadow.normalBias = 0.02;
    }
    spot.position.set(0, 1.0, 0.52);
    spot.target.position.set(0, 0.02, 1.15);
    scene.add(spot, spot.target);

    const rim1 = new THREE.PointLight(0xff8844, 8, 4.5); rim1.position.set(1.8, 1.2, 0.8);
    const rim2 = new THREE.PointLight(0xffaa44, 6, 5.0); rim2.position.set(-2.0, 0.9, 0.6);
    scene.add(new THREE.HemisphereLight(0x1a2040, 0x04040a, 0.06), rim1, rim2);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.35, layout0.bloomR, 0.68
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    let cancelled = false;
    let lastFrame = 0;
    let paused    = false;
    let exitStart = -1;

    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    const onExitBegin = () => { exitStart = performance.now(); };
    window.addEventListener("_ig_exitbegin", onExitBegin);

    function tick(now: number) {
      if (cancelled) return;
      rafId = requestAnimationFrame(tick);
      if (paused || now - lastFrame < FPS_CAP) return;
      lastFrame = now;

      const t  = now * 0.001;
      // Exit progress 0→1 over EXIT_MS
      const eT = exitStart < 0 ? 0 : Math.min(1, (now - exitStart) / EXIT_MS);
      const eE = 1 - Math.pow(1 - eT, 4); // ease-out-quart
      const eS = eE * eE;                  // shake envelope

      // Ambient drift
      camera.position.x = CAM0.x + Math.sin(t * 0.18) * 0.06 + Math.sin(t * 30) * 0.008 * eS;
      camera.position.y = CAM0.y + Math.sin(t * 0.11) * 0.04 - eE * 0.15 + Math.cos(t * 26) * 0.006 * eS;
      // Camera rushes FORWARD into the screen
      camera.position.z = CAM0.z - eE * 5.2;
      // Subtle roll shake during rush
      camera.rotation.z = Math.sin(t * 22 + eE * 6) * 0.008 * eS;
      // FOV narrows (telephoto compression = speed feel)
      camera.fov = 42 - eE * 20;
      camera.updateProjectionMatrix();
      camera.lookAt(0, 0.75, 0);

      // Fog closes in
      fog.near = THREE.MathUtils.lerp(6, 2.0, eE);
      fog.far  = THREE.MathUtils.lerp(22, 8, eE);

      // Lights intensify then bloom crushes
      rim1.intensity = (8 + Math.sin(t * 1.1) * 1.5) * (1 + eE * 0.8);
      rim2.intensity = (6 + Math.sin(t * 0.8) * 1.0) * (1 + eE * 0.7);
      spot.intensity = 260 * (1 + eE * 1.2);

      // Bloom swells on exit
      bloom.radius    = THREE.MathUtils.clamp(curLayout.bloomR + eE * 0.45, 0, 1);
      bloom.strength  = 0.35 * (1 + eE * 1.8);
      bloom.threshold = THREE.MathUtils.clamp(0.10 - eE * 0.08, 0, 1);

      // Screen briefly scales up with camera
      screen.scale.setScalar(curLayout.screenScale * (1 + eE * 0.22));

      src.tick(renderer, t);
      composer.render();
    }

    let rafId = requestAnimationFrame(tick);

    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      curLayout = getLayout(w);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.3));
      composer.setSize(w, h);
      bloom.resolution.set(w, h);
      bloom.radius = curLayout.bloomR;
      screen.scale.setScalar(curLayout.screenScale);
      screen.position.set(0, curLayout.screenY, curLayout.screenZ);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize",        onResize);
      window.removeEventListener("_ig_exitbegin", onExitBegin);
      document.removeEventListener("visibilitychange", onVisibility);
      src.dispose();
      screenGeo.dispose(); screenMat.dispose();
      floorMat.dispose();
      renderer.dispose();
      try {
        const ext = (renderer.getContext() as WebGLRenderingContext)
          .getExtension("WEBGL_lose_context");
        ext?.loseContext();
      } catch { /* safe to ignore */ }
      renderer.domElement.remove();
    };
  }, [shouldSkip, isMobile]);

  /* ── Exit handler ── */
  const enterPortfolio = useCallback((skip: boolean) => {
    if (phase !== "idle") return;
    if (skip) window.localStorage.setItem(STORAGE_KEY, "1");

    setShowUI(false);
    setPhase("exiting");
    window.dispatchEvent(new Event("_ig_exitbegin")); // trigger camera rush

    // After camera rush + curtain close → show children
    const t1 = window.setTimeout(() => setPhase("done"), EXIT_MS + CURTAIN_MS);
    timersRef.current.push(t1);
  }, [phase]);

  /* ── Render ── */
  if (shouldSkip || !webglOk) {
    return <>{children}</>;
  }

  if (phase === "done") {
    return (
      <div style={{
        animation: "_ig_mainReveal 420ms cubic-bezier(.16,1,.3,1) both",
      }}>
        {children}
      </div>
    );
  }

  const ARC_D = 0.8, ARC_T = 2.2, TTL_D = 1.2, SUB_D = 1.8;
  const CTA_D = ARC_D + ARC_T + 0.3;

  return (
    <>
      {/* Black iris curtain — no blend modes, no white, pure opaque */}
      <ExitCurtain active={phase === "exiting"} />

      {/* Intro wrapper */}
      <div style={{
        position: "fixed", inset: 0,
        background: "#080810", zIndex: 999, overflow: "hidden",
        fontFamily: "'Rajdhani', sans-serif",
        // Fade out wrapper after curtain has already closed
        opacity:    phase === "exiting" ? 0 : 1,
        transition: phase === "exiting"
          ? `opacity ${CURTAIN_MS}ms ease ${EXIT_MS * 0.7}ms`
          : "none",
      }}>
        {/* 3D canvas */}
        <div id="_ig_mount" style={{ position: "absolute", inset: 0 }} />

        {/* Film grain */}
        <GrainCanvas />

        {/* Scanline grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
          background: "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,.022) 4px, rgba(0,0,0,.022) 5px)",
        }} />

        {/* Travelling scanline */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "70px",
          pointerEvents: "none", zIndex: 3,
          background: "linear-gradient(180deg, transparent 0%, rgba(255,140,32,.01) 50%, transparent 100%)",
          animation: "_ig_scan 8s linear infinite",
        }} />

        {/* Corner light leak */}
        <div style={{
          position: "absolute", top: "-60px", left: "-60px",
          width: "300px", height: "300px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,140,32,.14) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 2,
          animation: "_ig_lightLeak 9s ease-in-out infinite",
        }} />

        <DustParticles />

        {/* Bottom vignette */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4,
          background: "radial-gradient(ellipse 100% 70% at 50% 110%, rgba(8,8,16,.95) 0%, rgba(8,8,16,.5) 55%, transparent 100%)",
        }} />

        {/* Letterbox bars — collapse when exiting */}
        {(["top", "bottom"] as const).map(pos => (
          <div key={pos} style={{
            position: "absolute", left: 0, right: 0, [pos]: 0,
            height: "10vh", background: "#000", zIndex: 10,
            transformOrigin: pos === "top" ? "top center" : "bottom center",
            transform:  phase !== "idle" ? "scaleY(0)" : "scaleY(1)",
            transition: phase !== "idle" ? "transform .5s cubic-bezier(.7,0,1,1)" : "none",
          }} />
        ))}

        {/* Top bar: name + arc */}
        {showUI && (
          <div style={{ position: "absolute", inset: 0, zIndex: 8, pointerEvents: "none" }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: isMobile ? "clamp(52px,15vh,100px) clamp(24px,4vw,52px) 0" : "clamp(52px,10vh,90px) clamp(24px,4vw,52px) 0",
              opacity: isMobile ? 0.42 : 1,
            }}>
              <div style={{ animation: `_ig_fadeUp .6s ${ARC_D}s ease both`, opacity: 0 }}>
                <div style={{
                  fontSize: "clamp(9px,1.5vw,11px)", letterSpacing: ".25em",
                  color: "rgba(255,140,32,.7)", textTransform: "uppercase", marginBottom: "2px",
                }}>PORTFOLIO OF</div>
                <div style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "clamp(18px,3vw,26px)", letterSpacing: ".1em", color: "#fff",
                }}>{name}</div>
              </div>

              <div style={{
                position: "relative", width: "90px", height: "90px",
                animation: `_ig_fadeUp .6s ${ARC_D - .1}s ease both`, opacity: 0,
              }}>
                <ArcProgress dur={ARC_T} del={ARC_D} />
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: "13px", height: "13px", borderRadius: "50%",
                    background: "rgba(255,140,32,.9)", boxShadow: "0 0 9px rgba(255,140,32,.8)",
                    animation: "_ig_pulse 1.9s ease-out infinite",
                  }} />
                </div>
              </div>
            </div>

            {/* Divider line */}
            <div style={{
              position: "absolute", top: "50%",
              left: "clamp(20px,6vw,80px)", right: "clamp(20px,6vw,80px)",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255,140,32,.2) 30%, rgba(255,100,20,.2) 70%, transparent)",
              transform: "translateY(-50%)",
              animation: `_ig_lineSlide 1s ${TTL_D - .35}s ease both`,
            }} />
          </div>
        )}

        {/* Main title */}
        {showUI && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 9, pointerEvents: "none",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", paddingBottom: "6vh",
          }}>
            <div style={{
              fontSize: "clamp(9px,1.4vw,11px)", letterSpacing: ".3em",
              color: "rgba(255,140,32,.6)", textTransform: "uppercase", marginBottom: "12px",
              animation: `_ig_fadeUp .6s ${TTL_D - .3}s ease both`,
              opacity: 0, animationFillMode: "both",
            }}>
              CREATIVE DEVELOPER
            </div>

            <h1 style={{
              margin: 0, fontFamily: "'Bebas Neue', cursive",
              fontSize: "clamp(52px,11vw,120px)",
              letterSpacing: ".06em", lineHeight: 0.9, textAlign: "center", color: "#fff",
              textShadow: "0 0 40px rgba(255,140,32,.28)",
              animation: isMobile ? "none" : `_ig_glitch 13s ${TTL_D + 3}s ease infinite`,
            }}>
              <AnimatedTitle text={title} delay={TTL_D} />
            </h1>

            <p style={{
              margin: "14px 0 0", fontFamily: "'Rajdhani', sans-serif", fontWeight: 300,
              fontSize: "clamp(13px,2.2vw,18px)", letterSpacing: ".14em",
              color: "rgba(255,170,90,.65)", textTransform: "uppercase",
              animation: `_ig_fadeUp .8s ${SUB_D}s ease both`,
              opacity: 0, animationFillMode: "both",
            }}>{subtitle}</p>

            <div style={{
              marginTop: "20px", width: "clamp(40px,8vw,80px)", height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255,140,32,.75), transparent)",
              animation: `_ig_fadeUp .6s ${SUB_D + .3}s ease both`,
              opacity: 0, animationFillMode: "both",
            }} />
          </div>
        )}

        {/* CTA */}
        {showUI && (
          <div style={{
            position: "absolute", bottom: "clamp(28px,5vh,56px)", left: 0, right: 0,
            display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
            zIndex: 10, pointerEvents: "auto",
            animation: `_ig_fadeUp .7s ${CTA_D}s ease both`,
            opacity: 0, animationFillMode: "both",
          }}>
            <button type="button" onClick={() => enterPortfolio(false)} style={{
              position: "relative",
              border: "2px solid rgba(255,140,32,.8)",
              borderRadius: "24px",
              padding: "18px 56px", 
              minWidth: "clamp(240px,28vw,300px)",
              background: "rgba(255,140,32,.08)",
              color: "#fff", 
              fontFamily: "'Rajdhani', sans-serif", 
              fontWeight: 700,
              fontSize: "clamp(13px,2vw,15px)", 
              letterSpacing: ".2em", 
              textTransform: "uppercase",
              backdropFilter: "blur(20px)", 
              WebkitBackdropFilter: "blur(20px)",
              transition: "all 400ms cubic-bezier(.25,1,.5,1)",
              boxShadow: "0 8px 32px rgba(255,100,20,.2), inset 0 1px 1px rgba(255,255,255,.2)",
              textShadow: "0 2px 12px rgba(255,140,32,.4)",
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "rgba(255,140,32,.15)";
                el.style.borderColor = "rgba(255,160,60,.95)";
                el.style.boxShadow = "0 12px 48px rgba(255,100,20,.3), inset 0 1px 1px rgba(255,255,255,.25), 0 0 24px rgba(255,140,32,.2)";
                el.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "rgba(255,140,32,.08)";
                el.style.borderColor = "rgba(255,140,32,.8)";
                el.style.boxShadow = "0 8px 32px rgba(255,100,20,.2), inset 0 1px 1px rgba(255,255,255,.2)";
                el.style.transform = "translateY(0)";
              }}
            >
              ENTER PORTFOLIO
            </button>

            <button type="button" onClick={() => enterPortfolio(true)} style={{
              border: "none", background: "transparent", 
              color: "rgba(255,255,255,.35)", fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 400, fontSize: "clamp(10px,1.6vw,12px)",
              letterSpacing: ".12em", textTransform: "uppercase",
              transition: "color .2s ease", padding: "4px 8px",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,.62)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,.35)"; }}
            >
              Skip · Don't show again
            </button>
          </div>
        )}
      </div>
    </>
  );
}
