// Custom CRT & Retro Console Shader Pass
// Simulates 480i NTSC interlacing, Bayer color dithering, phosphor aperture grille, and bloom

import * as THREE from 'three';

export const CRTShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uMode: { value: 1 }, // 0: Off, 1: Authentic 480i CRT, 2: Subtle Clean
    uCurvature: { value: 0.08 },
    uScanlineIntensity: { value: 0.28 },
    uPhosphorIntensity: { value: 0.15 },
    uDitherIntensity: { value: 0.06 },
    uVignette: { value: 0.35 }
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform int uMode;
    uniform float uCurvature;
    uniform float uScanlineIntensity;
    uniform float uPhosphorIntensity;
    uniform float uDitherIntensity;
    uniform float uVignette;

    varying vec2 vUv;

    // 4x4 Bayer Dither Matrix
    float bayer4(vec2 coord) {
      int x = int(mod(coord.x, 4.0));
      int y = int(mod(coord.y, 4.0));
      int index = x + y * 4;
      if (index == 0) return 0.0 / 16.0;
      if (index == 1) return 8.0 / 16.0;
      if (index == 2) return 2.0 / 16.0;
      if (index == 3) return 10.0 / 16.0;
      if (index == 4) return 12.0 / 16.0;
      if (index == 5) return 4.0 / 16.0;
      if (index == 6) return 14.0 / 16.0;
      if (index == 7) return 6.0 / 16.0;
      if (index == 8) return 3.0 / 16.0;
      if (index == 9) return 11.0 / 16.0;
      if (index == 10) return 1.0 / 16.0;
      if (index == 11) return 9.0 / 16.0;
      if (index == 12) return 15.0 / 16.0;
      if (index == 13) return 7.0 / 16.0;
      if (index == 14) return 13.0 / 16.0;
      return 5.0 / 16.0;
    }

    // Subtle CRT barrel curvature
    vec2 curveUV(vec2 uv) {
      if (uMode == 0 || uCurvature <= 0.001) return uv;
      vec2 st = uv * 2.0 - 1.0;
      vec2 offset = st.yx / vec2(6.0, 4.0);
      st = st + st * offset * offset * uCurvature;
      return st * 0.5 + 0.5;
    }

    void main() {
      vec2 uv = curveUV(vUv);

      // Black bezel borders if outside screen
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.01, 0.01, 0.02, 1.0);
        return;
      }

      if (uMode == 0) {
        gl_FragColor = texture2D(tDiffuse, uv);
        return;
      }

      // Chromatic aberration (radial RGB shift)
      vec2 center = vec2(0.5);
      vec2 distFromCenter = uv - center;
      float aberrOffset = length(distFromCenter) * (uMode == 1 ? 0.0025 : 0.001);

      float r = texture2D(tDiffuse, uv + distFromCenter * aberrOffset).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - distFromCenter * aberrOffset).b;
      vec3 color = vec3(r, g, b);

      // 480i Interlace scanlines simulation
      // Target resolution 480 lines vertically
      float targetLines = (uMode == 1) ? 480.0 : 720.0;
      float lineIndex = floor(uv.y * targetLines);
      
      // Alternate fields on odd/even frames for authentic 480i crawl
      float field = mod(floor(uTime * 60.0), 2.0);
      float isCurrentField = mod(lineIndex, 2.0) == field ? 1.0 : 0.65;
      
      float scanline = sin(uv.y * targetLines * 3.14159265);
      scanline = mix(1.0, 0.5 + 0.5 * scanline * isCurrentField, uScanlineIntensity);
      color *= scanline;

      // Sony Trinitron / PVM Phosphor aperture grille
      if (uMode == 1) {
        float subpixel = mod(floor(uv.x * uResolution.x), 3.0);
        vec3 mask = vec3(0.9, 0.9, 0.9);
        if (subpixel < 1.0) mask = vec3(1.15, 0.85, 0.85);
        else if (subpixel < 2.0) mask = vec3(0.85, 1.15, 0.85);
        else mask = vec3(0.85, 0.85, 1.15);
        color = mix(color, color * mask, uPhosphorIntensity);

        // Bayer ordered dithering (simulating 16-bit 5:5:5:1 color quantization)
        vec2 screenCoord = gl_FragCoord.xy;
        float dither = (bayer4(screenCoord) - 0.5) * uDitherIntensity;
        color += vec3(dither);
      }

      // Vignette falloff towards edges
      float vig = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
      vig = clamp(pow(16.0 * vig, uVignette), 0.0, 1.0);
      color *= vig;

      // Subtle CRT phosphor lift / contrast curve
      color = pow(color, vec3(0.95));

      gl_FragColor = vec4(color, 1.0);
    }
  `
};
