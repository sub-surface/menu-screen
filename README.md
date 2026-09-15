# MENU-SCREEN

*A spatial home for the music of m0rvidd, built in the spirit of late-90s and PS2-era console menus.*

Live deployment: **[menu.subsurfaces.net](https://menu.subsurfaces.net)**  
Specification: [SPEC.md](./SPEC.md)

---

## What It Is

`menu-screen` is an interactive audiovisual music player inspired by the golden era of console menu interfaces: the mist-shrouded monoliths of the PlayStation 2 system browser, the high-octane graphic design of *WipEout 3* and *The Designers Republic*, the clean luxury engineering of *Gran Turismo 3: A-Spec*, and the tactical wireframe displays of *Metal Gear Solid 2*.

It renders low-poly WebGL worlds coupled with razor-sharp retro HUD interfaces, procedural Web Audio sound synthesis, real-time frequency-reactive 3D scenes, and authentic CRT post-processing.

## Features

- **4 Switchable Era Scenes**:
  - `TOWERS_OF_MEMORY` — PS2 BIOS Seven Towers void, crystal dust, rotating memory card saves.
  - `AG_TELEMETRY` — WipEout / Y2K racing telemetry, wireframe anti-grav craft, neon HUD.
  - `SPEC_LOUNGE` — Gran Turismo A-Spec showroom, rotating turntable CD jewel case, technical graphs.
  - `CODEC_VR` — Tactical VR phosphor grid, frequency tuner dial, digital oscilloscope.
- **Retro Post-Processing**:
  - Authentic 480i interlacing with frame-alternating scanline crawl.
  - Bayer matrix color dithering and 16-bit color quantization.
  - Phosphor aperture grille mask and subtle bloom.
  - Switchable **4:3 Vintage CRT** letterbox / bezel or **16:9 Modern Widescreen**.
- **Procedural Sound Design & Audio Player**:
  - Zero-latency synthesized menu clicks, confirms, buzzes, and PS2 boot chord via the Web Audio API.
  - Interactive track player with playlist management, seeking, volume, and live FFT audio reactive visualizers.
  - Built-in generative atmospheric jungle synth generator for instant out-of-the-box playback.
  - Drag-and-drop support for local audio files (`.mp3`, `.wav`, `.ogg`).
- **Deep Controller Support**:
  - Full Gamepad API integration (D-Pad, buttons, bumpers, triggers, and haptic vibration).
  - Comprehensive keyboard controls (`↑/↓/←/→`, `Enter`, `Space`, `Esc`, `1-4`, `C`, `R`).
  - Seamless mouse and touch interaction.

## Controls

| Action | Gamepad | Keyboard | Mouse / Touch |
|---|---|---|---|
| **Navigate Tracks** | D-Pad `↑/↓` / Left Stick | `↑ / ↓` or `W / S` | Click track card |
| **Play / Select** | Cross / `A` | `Enter` / `Space` | Click `[ PLAY ]` / Track |
| **Back / Cancel** | Circle / `B` | `Esc` / `Backspace` | Click `[ BACK ]` |
| **Switch Scene / Era** | `L1 / R1` | `1`, `2`, `3`, `4` | Click Scene tabs |
| **Toggle CRT Shader** | Triangle / `Y` | `C` | Click `[ CRT: ON/OFF ]` |
| **Toggle Aspect Ratio**| Square / `X` | `R` | Click `[ 4:3 / 16:9 ]` |

## Develop & Deploy

```bash
npm install
npm run dev       # Vite local dev server (http://localhost:5173)
npm run build     # Compile bundle to dist/
npm run preview   # Preview production build
npm run deploy    # Build and deploy to Cloudflare Workers (menu.subsurfaces.net)
```

## Stack

- **Three.js** (WebGL2 renderer, low-poly geometries, custom shader passes)
- **Web Audio API** (procedural SFX synthesizer, FFT audio analyzer, ambient jungle engine)
- **Vite 6** (lightning-fast ES module bundler)
- **Cloudflare Workers** (static single-page application assets on `subsurfaces.net`)
