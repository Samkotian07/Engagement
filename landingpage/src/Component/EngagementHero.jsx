import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import bananaLeaf from "../assets/Banana.jpeg";

gsap.registerPlugin(ScrollTrigger);

function lerp(a, b, t)  { return a + (b - a) * t; }
function easeInOut(t)   { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
function smoothStep(t)  { return t * t * (3 - 2 * t); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export default function EngagementHero() {
  const sectionRef  = useRef(null);   // the outer sticky wrapper
  const mountRef    = useRef(null);   // Three.js canvas mount
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  /* ─────────────────────────────────────────────────────────────
     SCROLL STRATEGY
     ─────────────────────────────────────────────────────────────
     The hero section is a tall div (600vh) that sits in the
     normal page flow.  Inside it there is a `position:sticky`
     panel that pins at top:0 for the full 600vh scroll distance.
     We read window.scrollY / sectionRef to get 0→1 progress.
     Once the user scrolls past the section the sticky panel
     un-sticks naturally and the next section flows below.
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect   = el.getBoundingClientRect();
      const total  = el.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const p = clamp(scrolled / total, 0, 1);
      progressRef.current = p;
      setProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Three.js setup ── */
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth;
    const H = container.clientHeight;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled   = true;
    renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.3;
    renderer.outputColorSpace    = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    /* ── Scene & Camera ── */
    const scene  = new THREE.Scene();
    const aspect = W / H;
    // Adjust FOV for mobile to ensure rings stay visible
    const baseFOV = aspect < 0.6 ? 55 : 42;
    const camera = new THREE.PerspectiveCamera(baseFOV, aspect, 0.1, 100);
    camera.position.set(0, 0.4, 8);
    camera.lookAt(0, 0, 0);

    /* ── Environment map ── */
    const pmrem   = new THREE.PMREMGenerator(renderer);
    const envSc   = new THREE.Scene();
    const skyGeo  = new THREE.SphereGeometry(50, 64, 32);
    const colArr  = [];
    const posAttr = skyGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const t = (posAttr.getY(i) + 50) / 100;
      colArr.push(lerp(0.04, 0.95, t), lerp(0.05, 0.72, t), lerp(0.10, 0.28, t));
    }
    skyGeo.setAttribute("color", new THREE.Float32BufferAttribute(colArr, 3));
    envSc.add(new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })));
    const envMap = pmrem.fromScene(envSc).texture;
    scene.environment = envMap;
    pmrem.dispose();

    /* ── Lights ── */
    const key = new THREE.DirectionalLight(0xffc060, 0.8);
    key.position.set(4, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near  = 1; key.shadow.camera.far = 30;
    key.shadow.camera.left  = key.shadow.camera.bottom = -4;
    key.shadow.camera.right = key.shadow.camera.top    =  4;
    key.shadow.bias = -0.0005;
    scene.add(key);

    const rim  = new THREE.DirectionalLight(0x6080ff, 2.0);
    rim.position.set(-7, 3, -5);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(0xff9040, 0.2);
    fill.position.set(0, -3, 7);
    scene.add(fill);

    const top  = new THREE.DirectionalLight(0xfff0c0, 0.3);
    top.position.set(0, 10, 1);
    scene.add(top);

    scene.add(new THREE.AmbientLight(0xffd080, 0.08));

    const spark  = new THREE.PointLight(0xffd060, 1.0, 6);
    const accent = new THREE.PointLight(0xffffff, 1.0, 5);
    accent.position.set(3, 2, 4);
    scene.add(spark, accent);

    /* ── Shadow plane ── */
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    shadowPlane.rotation.x    = -Math.PI / 2;
    shadowPlane.position.y    = -2.2;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    /* ── Pivots + orbit group ── */
    const pivot1     = new THREE.Group();
    const pivot2     = new THREE.Group();
    const orbitGroup = new THREE.Group();

    pivot1.position.set(0, 0, 0);
    pivot2.position.set(0, 0, 0);
    pivot1.rotation.set(-0.3, 0,        0);
    pivot2.rotation.set(-0.3, Math.PI,  0);

    orbitGroup.add(pivot1, pivot2);
    scene.add(orbitGroup);

    /* ── Material override ── */
    const enhanceMaterial = (mat) => {
      const m = mat.clone();
      const isGold = m.color ? (m.color.r > m.color.b) : true;
      if (isGold) {
        m.color           = new THREE.Color(0xffd700);
        m.metalness       = 0.75;
        m.roughness       = 0.35;
        m.envMapIntensity = 1.0;
      } else {
        m.color           = new THREE.Color(0xffffff);
        m.metalness       = 0.8;
        m.roughness       = 0.15;
        m.envMapIntensity = 2.5;
        m.transmission    = 0;
        m.opacity         = 1;
      }
      m.envMap      = envMap;
      m.needsUpdate = true;
      return m;
    };

    /* ── GLB Loader ── */
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // Scale ring based on screen width for mobile responsiveness
    const RING_SCALE  = W < 768 ? 0.45 : W < 1024 ? 0.65 : 0.85;
    let ring1Loaded   = false;
    let ring2Loaded   = false;
    let scrollCleanup = null;

    const gsapFinalY1 = 0.18;
    const gsapFinalY2 = Math.PI - 0.18;
    
    // Mobile-aware position scaling
    const isMobile = W < 768;
    const posScale = isMobile ? 0.55 : 1.0;
    const xOffset = isMobile ? 0.88 : 1.6;
    const finalXOffset = isMobile ? 0.48 : 0.88;

    const setupGSAP = () => {
      if (!ring1Loaded || !ring2Loaded) return;

      const tl = gsap.timeline({ paused: true });

      /* Act 1: drift apart */
      tl
        .to(pivot1.position, { x: -xOffset * posScale, y:  0.15, z:  0.3,  ease: "power2.inOut", duration: 0.35 }, 0)
        .to(pivot2.position, { x:  xOffset * posScale, y:  0.15, z: -0.3,  ease: "power2.inOut", duration: 0.35 }, 0)
        .to(pivot1.rotation, { x: -0.65, y:  0.3,             z:  0.08, ease: "power2.inOut", duration: 0.35 }, 0)
        .to(pivot2.rotation, { x: -0.65, y: Math.PI - 0.3,    z: -0.08, ease: "power2.inOut", duration: 0.35 }, 0)
      /* Act 2: face-on */
        .to(pivot1.rotation, { x: -Math.PI / 2, y:  0,        z:  0.2,  ease: "power1.inOut", duration: 0.30 }, 0.35)
        .to(pivot2.rotation, { x: -Math.PI / 2, y:  Math.PI,  z: -0.2,  ease: "power1.inOut", duration: 0.30 }, 0.35)
      /* Act 3: interlock */
        .to(pivot1.position, { x: -finalXOffset * posScale, y: -0.05, z:  0.50, ease: "power3.inOut", duration: 0.35 }, 0.65)
        .to(pivot2.position, { x:  finalXOffset * posScale, y: -0.05, z: -0.50, ease: "power3.inOut", duration: 0.35 }, 0.65)
        .to(pivot1.rotation, { x: -Math.PI / 2, y: gsapFinalY1, z: 0, ease: "power3.inOut", duration: 0.35 }, 0.65)
        .to(pivot2.rotation, { x: -Math.PI / 2, y: gsapFinalY2, z: 0, ease: "power3.inOut", duration: 0.35 }, 0.65)
        .to(camera.position, { z: 6.5, ease: "power2.inOut", duration: 0.35 }, 0.72);

      // Drive timeline from window scroll progress
      const updateTl = () => tl.progress(progressRef.current);
      window.addEventListener("scroll", updateTl, { passive: true });
      scrollCleanup = () => window.removeEventListener("scroll", updateTl);
    };

    const loadRing = (pivotGroup, cb) => {
      gltfLoader.load(
        "/the_ring_1_carat.glb",
        (gltf) => {
          const model = gltf.scene;
          model.scale.setScalar(RING_SCALE);
          const box    = new THREE.Box3().setFromObject(model);
          const centre = new THREE.Vector3();
          box.getCenter(centre);
          model.position.sub(centre);
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow    = true;
              child.receiveShadow = true;
              child.material = Array.isArray(child.material)
                ? child.material.map(enhanceMaterial)
                : enhanceMaterial(child.material);
            }
          });
          pivotGroup.add(model);
          cb();
        },
        undefined,
        (err) => console.error("GLB load error:", err)
      );
    };

    loadRing(pivot1, () => { ring1Loaded = true; setupGSAP(); });
    loadRing(pivot2, () => { ring2Loaded = true; setupGSAP(); });

    /* ── Auto-rotation state ── */
    let autoAngle = 0;
    let autoBlend = 0;
    let camBob    = 0;

    /* ── Render loop ── */
    let raf;
    const clock = new THREE.Clock();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = clock.getDelta();
      const t  = clock.getElapsedTime();
      const p  = progressRef.current;

      /* Auto-rotation blend */
      const targetBlend = smoothStep(clamp((p - 0.90) / 0.10, 0, 1));
      autoBlend += (targetBlend - autoBlend) * 0.04;

      if (autoBlend > 0.001) {
        autoAngle += dt * 0.55;
        camBob    += dt * 0.28;
        orbitGroup.rotation.y = autoAngle * autoBlend;
        camera.position.y = 0.4 + Math.sin(camBob) * 0.18 * autoBlend;
        camera.lookAt(0, 0, 0);
        if (autoBlend > 0.95) {
          pivot1.rotation.z = 0;
          pivot2.rotation.z = 0;
        }
      } else {
        camera.position.y += (0.4 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
        if (p > 0.85 && p < 0.92) {
          const sw   = smoothStep(clamp((p - 0.85) / 0.07, 0, 1));
          const sway = Math.sin(t * 0.55) * 0.016 * sw;
          pivot1.rotation.z =  sway;
          pivot2.rotation.z = -sway;
        }
      }

      /* Sparkle */
      spark.intensity = 4.0 + Math.sin(t * 3.1) * 1.8 + Math.cos(t * 7.3) * 0.8;
      const gemWorld = new THREE.Vector3();
      pivot1.localToWorld(gemWorld.set(0, 1.5, 0));
      spark.position.set(
        gemWorld.x + Math.sin(t * 1.2) * 0.3,
        gemWorld.y + Math.cos(t * 0.9) * 0.2,
        gemWorld.z + 1.8,
      );

      /* Accent orbit */
      accent.position.x = Math.cos(t * 0.5) * 4;
      accent.position.y = 2 + Math.sin(t * 0.4);
      accent.position.z = 3 + Math.sin(t * 0.3) * 2;

      renderer.render(scene, camera);
    };
    tick();

    /* ── Resize ── */
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    /* ── Cleanup ── */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (scrollCleanup) scrollCleanup();
      ScrollTrigger.getAll().forEach(t => t.kill());
      renderer.dispose();
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
    };
  }, []);

  /* ── Derived UI values ── */
  const ep             = easeInOut(progress);
  const darkOverlay    = lerp(0.80, 0.08, ep);
  const introOpacity   = Math.max(0, 1 - progress * 5);
  const finalOpacity   = Math.max(0, (progress - 0.85) * 7);
  const finalTranslate = Math.max(0, (1 - (progress - 0.85) * 7) * 30);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        canvas { display: block; width: 100% !important; height: 100% !important; }

        .gold-shimmer {
          background: linear-gradient(90deg,#b8762a,#f5d060,#e8a830,#fff0a0,#d4952a,#f5d060,#b8762a);
          background-size: 400%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: shim 5s linear infinite;
        }
        .silver-shimmer {
          background: linear-gradient(90deg,#a8a8b8,#eeeef8,#c4c4d4,#ffffff,#b8b8c8,#eeeef8,#a8a8b8);
          background-size: 400%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: shim 3.5s linear infinite;
        }
        @keyframes shim { to { background-position: 400%; } }

        .fade-up { animation: fu 1.4s cubic-bezier(.16,1,.3,1) forwards; }
        @keyframes fu {
          from { opacity:0; transform:translateY(26px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .bounce { animation: bnc 2.2s ease-in-out infinite; }
        @keyframes bnc {
          0%,100% { transform:translateY(0);  opacity:.55; }
          50%     { transform:translateY(9px); opacity:1;  }
        }
      `}</style>

      {/*
        ── OUTER: tall div that occupies 600vh in page flow ──
        Other sections stack naturally below this.
      */}
      <div ref={sectionRef} style={{ position: "relative", height: "600vh" }}>

        {/*
          ── STICKY PANEL: pins to viewport for the full 600vh ──
          This is what the user actually sees while scrolling through hero.
        */}
        <div style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          background: "#06090a",
          willChange: "transform",
          contain: "layout style paint",
        }}>

          {/* 1. Banana leaf background */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <img
              src={bananaLeaf} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
            />
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "repeating-linear-gradient(90deg,transparent 0px,rgba(255,255,255,.012) 1px,transparent 2px,transparent 20px)",
            }} />
            <div style={{
              position: "absolute", left: "50%", top: 0, bottom: 0, width: "3px",
              background: "linear-gradient(180deg,transparent,rgba(180,220,80,.2) 30%,rgba(210,250,110,.28) 50%,rgba(180,220,80,.2) 70%,transparent)",
              transform: "translateX(-50%)", pointerEvents: "none",
            }} />
          </div>

          {/* 2. Dark overlay */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 1,
            background: "#04080a", opacity: darkOverlay, pointerEvents: "none",
          }} />

          {/* 3. Vignette */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
            background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,.75) 100%)",
          }} />

          {/* 4. Three.js canvas */}
          <div
            ref={mountRef}
            style={{ 
              position: "absolute", 
              inset: 0, 
              zIndex: 8, 
              pointerEvents: "none",
              overflow: "hidden",
              contain: "strict",
            }}
          />

          {/* 5. UI Text */}
          <div style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none", color: "#f0e8d8" }}>

            {/* Top label */}
            <div style={{
              position: "absolute", top: "5.5%", left: 0, right: 0,
              textAlign: "center", opacity: introOpacity,
            }}>
              <p style={{
                fontFamily: "'Cinzel',serif",
                fontSize: "clamp(9px,1.4vw,13px)",
                letterSpacing: "0.42em", textTransform: "uppercase", color: "#c9956c",
              }}>
                An Auspicious Union
              </p>
            </div>

            {/* Intro headline */}
            <div style={{
              position: "absolute", top: "50%", left: 0, right: 0,
              padding: "0 28px", transform: "translateY(-50%)",
              textAlign: "center", opacity: introOpacity,
            }}>
              <h1 className="fade-up gold-shimmer" style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(44px,8.5vw,100px)",
                fontWeight: 300, lineHeight: 1.08,
                letterSpacing: "0.04em", marginBottom: "14px",
              }}>
                We're Getting Engaged
              </h1>
              <p style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: "italic",
                fontSize: "clamp(15px,2.2vw,21px)",
                color: "#b8906a", letterSpacing: "0.14em",
              }}>
                Scroll to reveal our story
              </p>
            </div>

            {/* Scroll hint 
            <div className="bounce" style={{
              position: "absolute", bottom: "6.5%", left: 0, right: 0,
              textAlign: "center", opacity: Math.max(0, 1 - progress * 6),
            }}>
              <svg width="26" height="42" viewBox="0 0 26 42" fill="none">
                <rect x="1" y="1" width="24" height="40" rx="12" stroke="#c9956c" strokeWidth="1.4"/>
                <rect x="11.5" y="7" width="3" height="8" rx="1.5" fill="#c9956c">
                  <animate attributeName="y" values="7;15;7" dur="1.9s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="1;0;1" dur="1.9s" repeatCount="indefinite"/>
                </rect>
              </svg>
            </div>
*/}
            {/* Mid tagline */}
            {progress > 0.22 && progress < 0.84 && (
              <div style={{
                position: "absolute", bottom: "7%", left: 0, right: 0,
                textAlign: "center",
                opacity: Math.min(1, (progress - .22) * 4) * Math.min(1, (.84 - progress) * 8),
              }}>
                <p style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: "clamp(10px,1.6vw,14px)",
                  letterSpacing: "0.32em", textTransform: "uppercase", color: "#c0a880",
                }}>
                  Two souls &nbsp;·&nbsp; One promise
                </p>
              </div>
            )}

            {/* Final reveal */}
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "flex-end",
              paddingBottom: "7%",
              opacity: finalOpacity,
              transform: `translateY(${finalTranslate}px)`,
            }}>
              <div style={{ textAlign: "center" }}>
                <p style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: "clamp(9px,1.3vw,12px)",
                  letterSpacing: "0.44em", textTransform: "uppercase",
                  color: "#a8c860", marginBottom: "10px",
                }}>
                  Engagement Ceremony
                </p>
                <h2 className="silver-shimmer" style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "clamp(38px,7.5vw,88px)",
                  fontWeight: 300, lineHeight: 1.04, letterSpacing: "0.05em",
                }}>
                  Kavyashree &amp; Thilak Rai
                </h2>
                <div style={{
                  width: "48px", height: "1px", margin: "14px auto",
                  background: "linear-gradient(90deg,transparent,#c9956c,transparent)",
                }} />
                <p style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: "italic",
                  fontSize: "clamp(13px,1.9vw,18px)",
                  color: "#c0aa80", letterSpacing: "0.2em",
                }}>
                  10th May · 2026
                </p>
              </div>
            </div>

          </div>
        </div>{/* end sticky panel */}
      </div>{/* end 600vh outer */}
    </>
  );
}