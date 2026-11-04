# ⚡ KINETIC REALM — Wobble Inertia Scroll × Infinite Dive-In Zoom

> **Awwwards / FWA Quality Spatial Experience**  
> An executive fusion of **Hank-D-Tank's** 3D WebGL Wobble Inertia Scroll and **Animmaster's** Zentry-inspired Infinite Dive-In Zoom (2.9x macro scale).

---

## 🏛️ Architecture & Two Core Functions

### 1. Wobble Inertia Scroll (Hank-D-Tank)
- **Engine**: Three.js WebGL with custom GLSL shaders (`ShaderMaterial`).
- **Vertex Deformation**:
  ```glsl
  viewPosition.x += sin(uv.y * 3.14159) * uWobble;
  ```
- **Physics**: Lag smoothing calculation creates organic sinusoidal wave deformation based on user scroll velocity and mouse drags.
- **8K High-DPI Support**: Adaptive pixel ratio scaling up to 2.5x with ACES Filmic tone mapping and anisotropic mipmapping.
- **Dedicated 8K Fullscreen Mode**: Expand the 3D helical vortex to borderless 100vw × 100vh.

### 2. Infinite Dive-In Zoom (Animmaster)
- **Scrollytelling Track**: 380vh container with scroll-pinned viewport.
- **Quad-Point Nested Clip-Path**:
  - **Stage 1 (Outer Reality)**: Scale 1.0x → 1.15x.
  - **Stage 2 (Middle Threshold)**: `polygon(40% 25%, 60% 25%, 60% 75%, 40% 75%)` expands seamlessly to `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`.
  - **Stage 3 (Core Singularity)**: `polygon(50% 35%, ...)` opens from center and continuously magnifies to **2.9x macro zoom**.
- **3D Perspective Typography**: Monolith text rotated at `perspective(1000px) rotateX(...)` with dynamic letter reveals.
- **Dedicated 8K Fullscreen Mode**: Complete immersive mode with interactive depth scrubber, mouse wheel dive, and auto-dive animation.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/vn-24k/kinetic-realm.git

# Navigate into the project
cd kinetic-realm

# Install dependencies
npm install

# Run local development server
npm run dev

# Build for production
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

- **React 19**
- **Three.js** (WebGL 3D Engine & Shaders)
- **Tailwind CSS v4**
- **TypeScript Strict**
- **Vite 6**
- **Lucide Icons**

---

## 👤 Credits & Inspiration

- **Hank-D-Tank**: Original [wobble-scroll](https://github.com/Hank-D-Tank/wobble-scroll/) vertex shader & 3D spiral layout.
- **Animmaster**: Original [Dive-in-effect](https://github.com/Animmaster/Dive-in-effect/) multi-stage clip-path scrollytelling.
- **Crafted with 100/100 excellence by vn-24k & Evolução Inteligente.**
