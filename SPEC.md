# MENU-SCREEN — Specification & Architecture Document

> **"A tiny persistent history becomes architecture."**  
> *A home for the music of m0rvidd / Sub-Surface, rendered through the spatial, tactile, and aesthetic language of late-90s and early-2000s console menus.*

---

## 1. Executive Summary & Vision

`menu-screen` is an interactive browser experience and music showcase deployed at `menu.subsurfaces.net`. 

During the sixth generation of consoles (notably the Sony PlayStation 2, late 90s Namco/Psygnosis/Konami arcade titles, and Dreamcast), game menus were rarely utilitarian lists. They were **spaces**: physical, ambient, tactile architectures with their own internal weather, geometry, and acoustic presence. The memory card screen was an obsidian ocean where saved experiences materialized as monolithic pillars; racing games like *WipEout 3* and *Ridge Racer V* framed music selection as technical vehicle telemetry; espionage titles like *Metal Gear Solid 2* treated sound playback as an encrypted tactical radio channel.

`menu-screen` translates this design philosophy into a high-performance, browser-native audiovisual instrument:
- Built with **Three.js**, **WebGL2**, and the **Web Audio API**.
- Packaged as a zero-bloat static application served via **Cloudflare Workers** on the `subsurfaces.net` infrastructure.
- Designed to showcase **m0rvidd**'s ambient jungle, atmospheric drum & bass, and nostalgic lo-fi catalog.
- Fully controllable via **DualShock/Gamepad API**, **Keyboard**, or **Mouse/Touch**.

---

## 2. Aesthetic Pillars & Scene Taxonomies

To capture the diverse visual languages of the 1998–2004 console era, `menu-screen` implements four distinct, switchable scene environments:

### Scene 1: `TOWERS_OF_MEMORY` — The BIOS / Memory Void
*Inspired by: PS2 BIOS Browser, Sony Computer Entertainment system menus, Memory Card screens.*
- **Visuals:** An infinite mist-shrouded dark void. Monolithic obsidian glass towers rise from the ground plane. Each tower's height, opacity, and internal glow reflect track data, playtime, and audio frequencies. Floating crystal dust particles drift through the camera frustum.
- **3D Centerpiece:** A floating, translucent 3D Memory Card save icon / jewel prism that rotates and wobbles with low-poly inertia.
- **UI Treatment:** Floating bracketed labels (`[ MEMORY_CARD_01 ]`, `[ FREE: 7,420 KB ]`), minimalist Japanese-techno typography, subtle coordinate telemetry.
- **Audio Vibe:** Deep resonant low-frequency sub drone, crystal harmonic chime confirms, soft ocean-like noise floor.

### Scene 2: `AG_TELEMETRY` — Anti-Gravity Circuit
*Inspired by: WipEout 3 (The Designers Republic), WipEout Fusion, Rollcage, Extreme-G.*
- **Visuals:** High-contrast vector grid, racing horizon, neon cyan / safety orange / pure white color scheme. Diagonal caution stripes, technical barcodes, fictional racing team marques (FEISAR / AG Systems / AURICOM style).
- **3D Centerpiece:** A rotating low-poly Anti-Gravity racing craft chassis with pulsing engine exhausts and aerodynamic vector stabilizers.
- **UI Treatment:** Dynamic track selection cards framed as vehicle performance telemetry:
  - `BPM: 174` · `ENERGY: HIGH` · `SECTOR: 04` · `CHASSIS_LOAD: 98%`
  - Angled bounding boxes, chevron pagination (`<< TRACK 02 / 08 >>`).
- **Audio Vibe:** Snappy digital mechanical clicks, resonant low-pass filter sweeps, high-energy drum & bass / jungle breakbeat synergy.

### Scene 3: `SPEC_LOUNGE` — A-Spec Luxury Showroom
*Inspired by: Gran Turismo 3: A-Spec, Gran Turismo 4, R:Racing Evolution.*
- **Visuals:** Sleek automotive design studio. Polished reflective floor with dynamic Fresnel falloff. Deep cobalt blue and platinum silver gradients. Soft studio spotlights catching chamfered polygon edges.
- **3D Centerpiece:** A floating, rotating CD Jewel Case and vinyl disc with customizable cover art, track indexing, and turntable spin physics.
- **UI Treatment:** Precision technical layout. Smooth spring-damped list animations, horsepower/torque-style frequency curve graphs, pristine clean sans-serif typography (Eurostile / Microgramma styling).
- **Audio Vibe:** Warm Rhodes chords, subtle metallic tick cursor haptics, lounge / atmospheric breakbeat elegance.

### Scene 4: `CODEC_VR` — Tactical Espionage Grid
*Inspired by: Metal Gear Solid 2: Sons of Liberty (VR Missions), Armored Core, Ghost in the Shell PS1.*
- **Visuals:** Phosphor green and amber infinite wireframe grid horizon. Hexagonal tactical radar rings, digitized signal interference, wireframe geometry.
- **3D Centerpiece:** A floating tactical data cube / polyhedral core surrounded by rotating orbital HUD rings.
- **UI Treatment:** Sound selection styled as a Codec radio transceiver:
  - Frequency tuner dial (e.g. `140.85 MHz - 174.00 MHz`).
  - Real-time digital oscilloscope, FFT spectrum readout, transmission diagnostic log.
- **Audio Vibe:** Digital tactical chirps, low hum, frequency squeal during track tuning, crisp confirmation tone.

---

## 3. Technical Architecture & Rendering Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                              BROWSER DOM                               │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │   Canvas 2D / HTML     │  │          WebGL2 / Three.js           │  │
│  │   Retro HUD & Overlays │  │          Low-Poly 3D Scenes          │  │
│  └───────────┬────────────┘  └──────────────────┬───────────────────┘  │
│              │                                  │                      │
│              ▼                                  ▼                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     CRT Post-Processing Quad                     │  │
│  │   • 480i Interlace Scanlines     • Phosphor RGB Aperture Mask   │  │
│  │   • Bayer 4x4 / 8x8 Dithering    • Subtle Barrel & Bloom        │  │
│  │   • 4:3 Pillarbox / 16:9 Switch  • 16-Bit Color Quantization    │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           WEB AUDIO API ENGINE                         │
│  ┌─────────────────────────┐         ┌──────────────────────────────┐  │
│  │ Procedural SFX Synth    │         │ Music Player & Stem Deck     │  │
│  │ (Clicks, Chimes, Boots) │         │ (Leon/m0rvidd Music Stems)   │  │
│  └────────────┬────────────┘         └──────────────┬───────────────┘  │
│               │                                     │                  │
│               └──────────────────┬──────────────────┘                  │
│                                  ▼                                     │
│                     ┌─────────────────────────┐                        │
│                     │ AnalyserNode (FFT/Wave) │                        │
│                     └────────────┬────────────┘                        │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │
              Reactive Visual Feedback to 3D Scene Nodes
```

### 3.1. Rendering & Shader Architecture
1. **Low-Poly Fidelity**:
   - Geometries are kept intentionally low-to-medium poly count (~200 to 2,500 vertices per object) to preserve authentic PS2 GS (Graphics Synthesizer) silhouette economics.
   - Per-vertex lighting (Gouraud shading) combined with flat faceted normals for that iconic turn-of-the-century polygonal crispness.
2. **Retro Post-Processing Stack (`crt-pass.js`)**:
   - **480i Interlacing**: Alternates odd and even scanlines every frame with a subtle sub-pixel vertical crawl, capturing authentic NTSC/PAL CRT television behavior.
   - **Color Depth Quantization & Dithering**: Configurable Bayer matrix dithering (simulating 16-bit RGB 5:5:5:1 or 8-bit paletted textures).
   - **Phosphor Aperture Mask**: Subtle RGB subpixel triad mask providing tangible phosphor glow without obscuring text legibility.
   - **Aspect Ratio Control**: Hotkey or menu toggle between authentic **4:3 Vintage Letterbox** (with rounded bezel and corner shadow) and modern **16:9 Fullscreen**.

### 3.2. Procedural Audio & Sound Design (`sfx.js` & `player.js`)
- **Zero Asset Dependency for UI Sounds**: All menu clicks, cursor movements, confirmation chimes, cancel buzzes, and the iconic PS2-style startup boot chord are synthesized on the fly via the Web Audio API (oscillators, noise generators, biquad resonant filters, and gain envelopes).
- **Music Player Engine**:
  - Supports streaming `.mp3`, `.wav`, and `.ogg` files with metadata (title, artist, BPM, key, release year, save block size).
  - Includes an integrated **generative atmospheric jungle / ambient drone engine** that synthesizes pads, sub bass, and rhythmic break pulses directly in the browser so the experience is immediately sonically alive upon first click without requiring heavy remote asset downloads.
  - Real-time `AnalyserNode` frequency spectrum and time-domain waveform data drive the scene's monolith heights, pulse rings, and wireframe oscillations.

### 3.3. Input Architecture (`gamepad.js`)
- **Gamepad API First**: Native plug-and-play support for DualShock 4, DualSense, Xbox, and standard HID controllers.
  - D-Pad / Left Stick: Navigate menu cards and tracks.
  - Cross / A / Space: Confirm / Play track.
  - Circle / B / Esc: Back / Cancel.
  - L1 / R1 or LB / RB: Fast-switch scenes / eras.
  - Triangle / Y: Toggle CRT shader mode (Clean / Authentic 480i / Intense).
  - Square / X: Toggle Aspect Ratio (4:3 Pillarbox / 16:9 Full).
- **Keyboard Mappings**:
  - `↑` / `↓` / `←` / `→`: Navigation
  - `Enter` / `Space`: Select / Play / Pause
  - `Esc` / `Backspace`: Back
  - `1`, `2`, `3`, `4`: Instant scene selection
  - `C`: Toggle CRT filter mode
  - `R`: Toggle Aspect Ratio (4:3 vs 16:9)
- **Mouse / Touch**: Direct element picking via Three.js Raycaster + intuitive retro touch button bar.

---

## 4. Tracklist & Catalog Integration

The initial catalog structure models Leon's *m0rvidd* ambient jungle / breakbeat productions:

| ID | Title | Artist | BPM | Key | Vibe / Notes | Sector / Save Blocks |
|---|---|---|---|---|---|---|
| `TRK_01` | **Afterimage** | m0rvidd | 168 | F minor | Lush ambient pads, resonant sub, rolling nostalgic breaks | Block 01 · 64 KB |
| `TRK_02` | **Aliasing** | m0rvidd | 172 | D minor | Bitcrushed vocal cuts, 90s anime dialogue, frenetic amen chop | Block 02 · 128 KB |
| `TRK_03` | **Meridian** | m0rvidd | 164 | Ab major | Dreamy atmospheric drift, oceanic reverb, Bukem-style progression | Block 03 · 96 KB |
| `TRK_04` | **Substrata** | m0rvidd | 174 | C minor | Heavy sub pressure, metallic percussion, dystopian corridor feel | Block 04 · 80 KB |
| `TRK_05` | **Memory Card 2001** | m0rvidd | 160 | G minor | Ethereal PS2 BIOS boot chords woven into ambient breakbeat | Block 05 · 112 KB |

Users can drop custom audio files (`.mp3`, `.wav`) directly onto the viewport to load and visualize them in any of the four retro eras.

---

## 5. Deployment & Psychograph Fleet Integration

- **Target Route**: `menu.subsurfaces.net`
- **Wrangler Configuration**: Static single-page application assets mapped via `wrangler.jsonc`.
- **Fleet Discovery**: Registered in `subsurfaces-cli/core/discover.mjs` and tracked in `AGENTS.md`.
- **Repository**: Hosted at `https://github.com/sub-surface/menu-screen`.
