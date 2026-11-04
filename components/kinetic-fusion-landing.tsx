"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  ArrowDown,
  Eye,
  Layers,
  Sparkles,
  Zap,
  ChevronRight,
  Code2,
  Cpu,
  Compass,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Sliders,
} from "lucide-react";
import { SmoothCursor } from "./smooth-cursor";
import { NoiseGrain } from "./noise-grain";

// ============================================================================
// 1. DADOS DAS CARTAS NA ESPIRAL 3D (ASSETS DE ALTA RESOLUÇÃO)
// ============================================================================

const SPIRAL_ITEMS = [
  {
    id: "portal-1",
    title: "Aethoria Spire",
    category: "Genesis Node",
    texture: "/assets/dive/hero.jpg",
    desc: "Nexus primordial de transição dimensional.",
  },
  {
    id: "portal-2",
    title: "Omniversal Fulcrum",
    category: "Equilibrium",
    texture: "/assets/dive/about.jpg",
    desc: "Ponto de ancoragem com curvatura de espaço-tempo.",
  },
  {
    id: "portal-3",
    title: "Veiled Depths",
    category: "Singularity Outer",
    texture: "/assets/dive/img-1.jpg",
    desc: "A camada visível inicial antes do mergulho.",
  },
  {
    id: "portal-4",
    title: "Quantum Threshold",
    category: "Sub-Layer 02",
    texture: "/assets/dive/img-2.jpg",
    desc: "Portal poligonal intermediário revelado no zoom.",
  },
  {
    id: "portal-5",
    title: "Infinite Cosmos",
    category: "Core 2.9x",
    texture: "/assets/dive/img-3.jpg",
    desc: "O clímax do mergulho macro em escala máxima.",
  },
  {
    id: "portal-6",
    title: "Chronos Horizon",
    category: "Inertial Flow",
    texture: "/assets/dive/hero.jpg",
    desc: "Ondulações gravitacionais ativadas por velocidade.",
  },
  {
    id: "portal-7",
    title: "Sub-Quantum Axis",
    category: "Resonance",
    texture: "/assets/dive/about.jpg",
    desc: "Alinhamento de vórtice contínuo em 60 FPS.",
  },
  {
    id: "portal-8",
    title: "Multiverse Matrix",
    category: "Hyper-Structure",
    texture: "/assets/dive/img-1.jpg",
    desc: "Estrutura final conectando o espaço helicoidal.",
  },
];

// ============================================================================
// 2. FUNÇÃO 1: WOBBLE INERTIA SCROLL (HANK-D-TANK - THREE.JS GLSL VERTEX DEFORM)
// ============================================================================

const WOBBLE_VERTEX_SHADER = `
  uniform float uWobble;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    // Deformação elástica senoidal autêntica do Hank-D-Tank
    viewPosition.x += sin(uv.y * 3.14159) * uWobble;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const WOBBLE_FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform float uHover;
  varying vec2 vUv;
  void main() {
    vec4 color = texture2D(uTexture, vUv);
    if (!gl_FrontFacing) {
      color.rgb = mix(color.rgb, vec3(0.03, 0.06, 0.10), 0.88);
    }
    // Vinheta e brilho nas bordas em alta precisão
    float edgeX = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
    float edgeY = smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
    float border = edgeX * edgeY;
    color.rgb += vec3(0.15, 0.80, 1.0) * (1.0 - border) * 0.38;
    
    if (uHover > 0.0) {
      color.rgb = mix(color.rgb, color.rgb * 1.25 + vec3(0.05, 0.18, 0.28), uHover);
    }
    gl_FragColor = color;
  }
`;

interface WobbleHelixCanvasProps {
  onHoverItem?: (title: string, category: string) => void;
  isFullscreen?: boolean;
}

function WobbleHelixCanvas({ onHoverItem, isFullscreen }: WobbleHelixCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Configurações com precisão e fluidez de 60fps
    const settings = {
      radius: 1.88,
      verticalGap: 0.95,
      angleGap: 0.78,
      cardWidth: 1.35,
      cardHeight: 1.85,
      idleSpin: 0.0035,
      scrollSensitivity: 0.0035,
      smoothing: 0.09,
      wobbleStrength: 0.40,
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.z = 8.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(settings.cardWidth, settings.cardHeight, 18, 26);
    const textureLoader = new THREE.TextureLoader();
    const wobble = { value: 0 };

    const items = [...SPIRAL_ITEMS, ...SPIRAL_ITEMS];
    const cardCount = items.length;

    const cards = items.map((item) => {
      const hoverVal = { value: 0 };
      const tex = textureLoader.load(item.texture);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;

      const card = new THREE.Mesh(
        geometry,
        new THREE.ShaderMaterial({
          vertexShader: WOBBLE_VERTEX_SHADER,
          fragmentShader: WOBBLE_FRAGMENT_SHADER,
          side: THREE.DoubleSide,
          uniforms: {
            uTexture: { value: tex },
            uWobble: wobble,
            uHover: hoverVal,
          },
        })
      );
      scene.add(card);
      return { mesh: card, item, hoverVal };
    });

    const state = {
      rotation: 0,
      rotationTarget: 0,
      isDragging: false,
      lastY: 0,
      autoSpin: true,
    };

    const handleWindowWheel = (e: WheelEvent) => {
      if (isFullscreen) return;
      state.rotationTarget += e.deltaY * settings.scrollSensitivity * 0.75;
      state.autoSpin = false;
    };

    const handleContainerWheel = (e: WheelEvent) => {
      e.preventDefault();
      state.rotationTarget += e.deltaY * settings.scrollSensitivity * 1.2;
      state.autoSpin = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      state.isDragging = true;
      state.lastY = e.clientY;
      state.autoSpin = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (state.isDragging) {
        const delta = e.clientY - state.lastY;
        state.rotationTarget -= delta * settings.scrollSensitivity * 1.6;
        state.lastY = e.clientY;
      }

      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const hits = raycaster.intersectObjects(cards.map((c) => c.mesh));
      if (hits.length > 0) {
        const hit = hits[0].object;
        const found = cards.find((c) => c.mesh === hit);
        if (found) {
          found.hoverVal.value = 1.0;
          onHoverItem?.(found.item.title, found.item.category);
        }
      } else {
        cards.forEach((c) => (c.hoverVal.value = 0.0));
      }
    };

    const handleMouseUp = () => {
      state.isDragging = false;
      setTimeout(() => {
        state.autoSpin = true;
      }, 3500);
    };

    // Touch support para mobile/tablets
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        state.isDragging = true;
        state.lastY = e.touches[0].clientY;
        state.autoSpin = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (state.isDragging && e.touches.length === 1) {
        const delta = e.touches[0].clientY - state.lastY;
        state.rotationTarget -= delta * settings.scrollSensitivity * 1.8;
        state.lastY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      state.isDragging = false;
      setTimeout(() => {
        state.autoSpin = true;
      }, 3500);
    };

    const raycaster = new THREE.Raycaster();

    container.addEventListener("wheel", handleContainerWheel, { passive: false });
    window.addEventListener("wheel", handleWindowWheel, { passive: true });
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (state.autoSpin) {
        state.rotationTarget += settings.idleSpin;
      }

      state.rotation += (state.rotationTarget - state.rotation) * settings.smoothing;

      const lag = Math.max(-1.25, Math.min(1.25, state.rotationTarget - state.rotation));
      wobble.value += (lag * settings.wobbleStrength - wobble.value) * settings.smoothing;

      cards.forEach((c, index) => {
        const raw = index - state.rotation;
        const slot = (((raw % cardCount) + cardCount) % cardCount) - cardCount / 2;
        const angle = slot * settings.angleGap + Math.PI / 2;

        c.mesh.position.set(
          Math.cos(angle) * settings.radius,
          slot * settings.verticalGap,
          Math.sin(angle) * settings.radius
        );
        c.mesh.rotation.y = Math.PI / 2 - angle;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      container.removeEventListener("wheel", handleContainerWheel);
      window.removeEventListener("wheel", handleWindowWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
    };
  }, [isFullscreen]);

  return <div ref={mountRef} className="w-full h-full relative cursor-grab active:cursor-grabbing" />;
}

// ============================================================================
// 3. FUNÇÃO 2: INFINITE DIVE-IN ZOOM (ANIMMASTER - SCROLL CLIP-PATH & 2.9X ZOOM)
// ============================================================================

interface InfiniteDiveInProps {
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

function InfiniteDiveInScrollytelling({ onToggleFullscreen, isFullscreen }: InfiniteDiveInProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [diveProgress, setDiveProgress] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    if (isFullscreen) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.min(1, Math.max(0, currentScroll / totalScrollable));
      setDiveProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFullscreen]);

  // Modo autoplay em tela cheia
  useEffect(() => {
    if (!autoPlay) return;
    let animId: number;
    let dir = 0.0035;

    const tick = () => {
      setDiveProgress((prev) => {
        let next = prev + dir;
        if (next >= 1) {
          next = 1;
          dir = -0.0035;
        } else if (next <= 0) {
          next = 0;
          dir = 0.0035;
        }
        return next;
      });
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [autoPlay]);

  // Matemática precisa do repositório Animmaster:
  // Img 1: Escala 1.0x -> 1.15x
  const scaleImg1 = 1 + diveProgress * 0.15;

  // Img 2: clip-path abre de polygon(40% 25%, 60% 25%, 60% 75%, 40% 75%) até polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)
  const pImg2 = Math.min(1, Math.max(0, diveProgress / 0.5));
  const img2Left = 40 * (1 - pImg2);
  const img2Top = 25 * (1 - pImg2);
  const img2Right = 60 + 40 * pImg2;
  const img2Bottom = 75 + 25 * pImg2;
  const clipPathImg2 = `polygon(${img2Left}% ${img2Top}%, ${img2Right}% ${img2Top}%, ${img2Right}% ${img2Bottom}%, ${img2Left}% ${img2Bottom}%)`;
  const scaleImg2 = 1.125 + pImg2 * 0.25;

  // Img 3: clip-path abre do centro (50% 35%) até tela cheia e zoom contínuo vai até 2.9x
  const pImg3 = Math.min(1, Math.max(0, (diveProgress - 0.35) / 0.65));
  const img3Left = 50 * (1 - pImg3);
  const img3Top = 35 * (1 - pImg3);
  const img3Right = 50 + 50 * pImg3;
  const img3Bottom = 65 + 35 * pImg3;
  const clipPathImg3 = `polygon(${img3Left}% ${img3Top}%, ${img3Right}% ${img3Top}%, ${img3Right}% ${img3Bottom}%, ${img3Left}% ${img3Bottom}%)`;
  const scaleImg3 = 1.0 + pImg3 * 1.9; // 1.0 -> 2.9x macro zoom!

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isFullscreen ? "h-screen" : "h-[380vh]"} bg-black`}
    >
      {/* Viewport Pinned (Sticky) */}
      <div
        className={`${
          isFullscreen ? "fixed inset-0 z-[100]" : "sticky top-0 left-0"
        } w-full h-screen overflow-hidden flex items-center justify-center`}
        onWheel={(e) => {
          if (isFullscreen) {
            e.preventDefault();
            setAutoPlay(false);
            setDiveProgress((prev) => Math.min(1, Math.max(0, prev + e.deltaY * 0.0015)));
          }
        }}
      >
        {/* Camada 1: Realidade Exterior (img-1) */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/assets/dive/img-1.jpg"
            alt="Outer Dimension"
            className="w-full h-full object-cover transition-transform duration-75 ease-out"
            style={{ transform: `scale(${scaleImg1})`, willChange: "transform" }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Camada 2: Portal Intermediário (img-2 com clip-path) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none transition-all duration-75 ease-out"
          style={{ clipPath: clipPathImg2, willChange: "clip-path, transform" }}
        >
          <img
            src="/assets/dive/img-2.jpg"
            alt="Middle Dimension"
            className="w-full h-full object-cover"
            style={{ transform: `scale(${scaleImg2})` }}
          />
          <div className="absolute inset-0 border-2 border-cyan-400/50 shadow-[inset_0_0_50px_rgba(34,211,238,0.4)]" />
        </div>

        {/* Camada 3: Núcleo Cósmico Macro (img-3 com zoom 2.9x) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none transition-all duration-75 ease-out"
          style={{
            clipPath: clipPathImg3,
            opacity: pImg3 > 0.02 ? 1 : 0,
            willChange: "clip-path, transform, opacity",
          }}
        >
          <img
            src="/assets/dive/img-3.jpg"
            alt="Core Singularity"
            className="w-full h-full object-cover origin-center"
            style={{ transform: `scale(${scaleImg3})` }}
          />
          <div className="absolute inset-0 bg-radial from-transparent via-cyan-950/25 to-black/75" />
        </div>

        {/* HUD Cinematográfico Flutuante sobre o Mergulho */}
        <div className="absolute inset-0 p-6 sm:p-10 md:p-14 flex flex-col justify-between pointer-events-none z-30">
          {/* Top Bar do Mergulho com Botão de Tela Cheia */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <div>
                <span className="text-xs font-mono text-cyan-300 font-bold tracking-widest uppercase">
                  INFINITE DIVE-IN PROTOCOL // 8K RESOLUTION
                </span>
                <p className="text-[10px] font-mono text-neutral-400">
                  {isFullscreen
                    ? "Gire a roda do mouse ou use o controlador abaixo para mergulhar"
                    : "Role a página para aprofundar a escala através das camadas"}
                </p>
              </div>
            </div>

            {/* Controles de Topo: Magnificação + Botão de Tela Cheia */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="px-3.5 py-1.5 rounded-full bg-black/75 border border-cyan-400/30 text-cyan-300 font-mono text-xs backdrop-blur-md">
                MAGNIFICAÇÃO: {(1 + diveProgress * 1.9).toFixed(2)}x
              </div>

              {/* BOTÃO TELA CHEIA DA SEÇÃO 2 */}
              <button
                onClick={onToggleFullscreen}
                className="px-3 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-mono text-xs flex items-center gap-1.5 backdrop-blur-md transition cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                title={isFullscreen ? "Sair da Tela Cheia" : "Modo Tela Cheia Imersivo 8K"}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isFullscreen ? "SAIR" : "TELA CHEIA"}</span>
              </button>
            </div>
          </div>

          {/* Centro: Monólito com rotação em perspectiva 3D */}
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2
              className="text-2xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter uppercase transition-transform duration-200 drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]"
              style={{
                transform: `perspective(1000px) rotateX(${Math.max(0, 35 - diveProgress * 35)}deg) scale(${
                  0.92 + diveProgress * 0.12
                })`,
              }}
            >
              The Cosmic Keystone Unlocks Multiversal Transformation
            </h2>

            <p className="text-xs sm:text-sm font-mono text-cyan-200 tracking-widest uppercase opacity-90">
              VEILED DEPTHS OF ETERNITY // CURRENTS OF COSMIC WISDOM
            </p>
          </div>

          {/* Bottom Bar: Indicador e Controles Interativos */}
          <div className="pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs text-neutral-400 bg-black/75 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/15 max-w-2xl mx-auto w-full shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>
                ESTÁGIO:{" "}
                <strong className="text-cyan-400 font-bold">
                  {diveProgress < 0.3
                    ? "01. EXTERIOR (1.0x)"
                    : diveProgress < 0.7
                    ? "02. PORTAL (1.35x)"
                    : "03. SINGULARIDADE (2.9x)"}
                </strong>
              </span>
            </div>

            {/* Slider interativo em tela cheia */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="range"
                min="0"
                max="1"
                step="0.005"
                value={diveProgress}
                onChange={(e) => {
                  setAutoPlay(false);
                  setDiveProgress(parseFloat(e.target.value));
                }}
                className="w-32 accent-cyan-400 cursor-pointer"
              />
              <span className="text-cyan-300 font-bold w-10 text-right">
                {(diveProgress * 100).toFixed(0)}%
              </span>

              {isFullscreen && (
                <button
                  onClick={() => setAutoPlay((p) => !p)}
                  className={`p-1.5 rounded-lg border transition ${
                    autoPlay
                      ? "bg-cyan-500 text-black border-cyan-400"
                      : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  }`}
                  title={autoPlay ? "Pausar Mergulho Automático" : "Iniciar Mergulho Automático"}
                >
                  {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. A LANDING PAGE UNIFICADA COMPLETA
// ============================================================================

export function KineticFusionLanding() {
  const [hoveredCard, setHoveredCard] = useState({
    title: "Aethoria Spire",
    category: "Genesis Node",
  });

  const [helixFullscreen, setHelixFullscreen] = useState(false);
  const [diveFullscreen, setDiveFullscreen] = useState(false);
  const helixContainerRef = useRef<HTMLDivElement>(null);

  // Toggle do modo tela cheia para a Seção 1 (Helix 3D)
  const toggleHelixFullscreen = useCallback(() => {
    setHelixFullscreen((prev) => !prev);
    if (!helixFullscreen && helixContainerRef.current) {
      if (helixContainerRef.current.requestFullscreen) {
        helixContainerRef.current.requestFullscreen().catch(() => {});
      }
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [helixFullscreen]);

  // Toggle do modo tela cheia para a Seção 2 (Dive-In Zoom)
  const toggleDiveFullscreen = useCallback(() => {
    setDiveFullscreen((prev) => !prev);
    if (!diveFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [diveFullscreen]);

  // Listener para tecla ESC sincronizar estado
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setHelixFullscreen(false);
        setDiveFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#030306] text-neutral-100 font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      <SmoothCursor color="#22d3ee" glowColor="rgba(34, 211, 238, 0.45)" />
      <NoiseGrain opacity={0.03} />

      {/* ==================================================================== */}
      {/* NAV MINIMALISTA DE ALTO PADRÃO                                       */}
      {/* ==================================================================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-mono font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            ⚡
          </div>
          <span className="text-sm font-black tracking-widest text-white uppercase font-mono">
            KINETIC // REALM
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-mono text-neutral-400">
          <a href="#helix" className="hover:text-cyan-400 transition">
            01. WOBBLE HELIX
          </a>
          <a href="#dive" className="hover:text-cyan-400 transition">
            02. DIVE-IN ZOOM (2.9X)
          </a>
          <a href="#engineering" className="hover:text-cyan-400 transition">
            03. ENGENHARIA
          </a>
        </div>

        <button
          onClick={() => {
            const el = document.getElementById("dive");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs tracking-wider transition shadow-[0_0_15px_#22d3ee] cursor-pointer"
        >
          EXPERIMENTAR MERGULHO
        </button>
      </nav>

      {/* ==================================================================== */}
      {/* 1. HERO SECTION                                                      */}
      {/* ==================================================================== */}
      <section className="pt-32 pb-16 px-6 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 font-mono text-xs tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>FUSÃO EXECUTIVA DE DUAS FÍSICAS DE VANGUARDA</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase leading-[0.95] max-w-5xl mx-auto">
          INERTIA WOBBLE SCROLL <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
            × INFINITE DIVE-IN ZOOM
          </span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl mx-auto font-sans leading-relaxed">
          Uma única experiência contínua: role a página para sentir a inércia da hélice 3D com deformação vertex senoidal e mergulhe sem cortes através de máscaras poligonais até a escala cósmica de 2.9x.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <a
            href="#helix"
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs tracking-wider transition shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center gap-2"
          >
            <span>INICIAR EXPERIÊNCIA</span>
            <ArrowDown className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. SEÇÃO 1: WOBBLE INERTIA SCROLL (HANK-D-TANK)                      */}
      {/* ==================================================================== */}
      <section id="helix" className="py-12 px-6 max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>FUNÇÃO 01 // HANK-D-TANK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-mono mt-1">
              ESPIRAL HELICOIDAL COM INÉRCIA DE ROLAGEM
            </h2>
          </div>

          {/* Controles de Foco e BOTÃO DE TELA CHEIA DA SEÇÃO 1 */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right text-xs font-mono text-neutral-400">
              <span>CARTA EM FOCO: </span>
              <strong className="text-cyan-300 font-bold">{hoveredCard.title}</strong>
              <span className="text-neutral-500"> ({hoveredCard.category})</span>
            </div>

            {/* BOTÃO TELA CHEIA DA SEÇÃO 1 */}
            <button
              onClick={toggleHelixFullscreen}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-mono text-xs flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.25)]"
              title="Abrir Hélice 3D em Tela Cheia 8K"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="font-bold">TELA CHEIA 8K</span>
            </button>
          </div>
        </div>

        {/* Palco 3D WebGL Padrão ou Fullscreen */}
        <div
          ref={helixContainerRef}
          className={`${
            helixFullscreen
              ? "fixed inset-0 z-[100] w-screen h-screen rounded-none bg-black"
              : "h-[600px] md:h-[680px] rounded-3xl border border-white/10 bg-[#06060c] relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          }`}
        >
          <WobbleHelixCanvas
            onHoverItem={(title, category) => setHoveredCard({ title, category })}
            isFullscreen={helixFullscreen}
          />

          {/* Dica de Interação no Centro Inferior */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/75 border border-white/15 backdrop-blur-md text-[11px] font-mono text-cyan-300 pointer-events-none flex items-center gap-2 z-20">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>ARRASTE COM O MOUSE OU USE A RODA DO SCROLL PARA ACELERAR A HÉLICE</span>
          </div>

          {/* Botão de Fechar Tela Cheia (Quando em Fullscreen) */}
          {helixFullscreen && (
            <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-mono text-xs">
                HÉLICE 3D EM TELA CHEIA 8K
              </span>
              <button
                onClick={toggleHelixFullscreen}
                className="px-4 py-2 rounded-full bg-black/80 hover:bg-black border border-white/20 text-white font-mono text-xs flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.8)]"
              >
                <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>SAIR DA TELA CHEIA (ESC)</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. SEÇÃO 2: INFINITE DIVE-IN ZOOM (ANIMMASTER)                        */}
      {/* ==================================================================== */}
      <section id="dive" className="pt-16">
        <div className="max-w-7xl mx-auto px-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 font-mono text-xs tracking-widest uppercase">
              <Compass className="w-3.5 h-3.5" />
              <span>FUNÇÃO 02 // ANIMMASTER</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase font-mono">
              INFINITE DIVE-IN ZOOM (SCROLL-PINNED)
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-mono max-w-xl">
              Role a página para mergulhar através de 3 camadas de clip-path até o zoom macro 2.9x, ou teste em tela cheia isolada.
            </p>
          </div>

          {/* BOTÃO TELA CHEIA DA SEÇÃO 2 */}
          <button
            onClick={toggleDiveFullscreen}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-mono text-xs flex items-center gap-2 transition cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.25)] shrink-0"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="font-bold">MERGULHO EM TELA CHEIA 8K</span>
          </button>
        </div>

        {/* O Palco Scrollytelling Pinned de 380vh com suporte a Fullscreen */}
        <InfiniteDiveInScrollytelling
          onToggleFullscreen={toggleDiveFullscreen}
          isFullscreen={diveFullscreen}
        />
      </section>

      {/* ==================================================================== */}
      {/* 4. SEÇÃO 3: BENTO DE ENGENHARIA                                      */}
      {/* ==================================================================== */}
      <section id="engineering" className="py-24 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-400 uppercase tracking-widest">
            ARQUITETURA DAS DUAS FUNÇÕES
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            COMO A FUSÃO FUNCIONA EM CÓDIGO
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Deformação Vertex */}
          <div className="p-8 rounded-3xl bg-[#090910] border border-white/10 space-y-4 hover:border-cyan-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase font-mono">
              1. Vertex Shader Senoidal (Hank-D-Tank)
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              As cartas na hélice não giram de forma rígida: a velocidade de scroll gera uma variável de lag que deforma a geometria diretamente na placa de vídeo:
            </p>
            <pre className="p-3.5 rounded-xl bg-black/70 border border-white/5 text-xs font-mono text-cyan-300 overflow-x-auto">
              <code>{`viewPosition.x += sin(uv.y * 3.14159) * uWobble;`}</code>
            </pre>
          </div>

          {/* Card 2: Máscara Poligonal */}
          <div className="p-8 rounded-3xl bg-[#090910] border border-white/10 space-y-4 hover:border-cyan-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase font-mono">
              2. Máscara Poligonal Aninhada (Animmaster)
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              O mergulho é orquestrado por 3 imagens sobrepostas com cortes poligonais dinâmicos e escala acelerada até 2.9x:
            </p>
            <pre className="p-3.5 rounded-xl bg-black/70 border border-white/5 text-xs font-mono text-sky-300 overflow-x-auto">
              <code>{`clipPath: polygon(40% 25%, 60% 25%, 60% 75%, 40% 75%)
-> polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)
scale: 1.0 -> 2.9x`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. CTA FINAL & FOOTER                                                */}
      {/* ==================================================================== */}
      <footer className="border-t border-white/10 bg-black/90 py-16 px-6 text-center space-y-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-mono tracking-tight">
            PRONTO PARA APLICAR ESSAS DUAS FUNÇÕES?
          </h2>
          <p className="text-xs text-neutral-400 font-mono">
            Código 100% limpo, sem dependências externas inúteis e pronto para produção.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs tracking-wider transition shadow-[0_0_20px_#22d3ee] cursor-pointer"
            >
              VOLTAR AO TOPO
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-neutral-600 max-w-6xl mx-auto">
          <span>KINETIC REALM // WOBBLE SCROLL × INFINITE DIVE-IN</span>
          <span>© 2026. Zero placeholders.</span>
        </div>
      </footer>
    </div>
  );
}
