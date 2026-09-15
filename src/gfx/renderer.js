// Main 3D WebGL Graphics Engine & Post-Processing Pipeline
// Three.js, Camera Damping, Scene Director, and CRT Post-Pass

import * as THREE from 'three';
import { CRTShader } from './crt-pass.js';
import { BiosTowersScene } from './scenes/bios-towers.js';
import { WipeoutHudScene } from './scenes/wipeout-hud.js';
import { GtLoungeScene } from './scenes/gt-lounge.js';
import { CodecVrScene } from './scenes/codec-vr.js';
import { player } from '../audio/player.js';

class RetroGFXEngine {
  constructor() {
    this.container = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;

    // Post-processing
    this.renderTarget = null;
    this.postScene = null;
    this.postCamera = null;
    this.crtMaterial = null;
    this.crtMode = 1; // 1: Authentic 480i, 2: Clean, 0: Off

    // Scenes
    this.scenes = {};
    this.activeSceneId = 'bios';

    // Camera target & animation
    this.targetCameraPos = new THREE.Vector3(0, 1.2, 5.0);
    this.mouse = new THREE.Vector2();
    this.clock = new THREE.Clock();

    this.aspectMode = '16:9'; // '16:9' or '4:3'
  }

  init(container) {
    this.container = container;

    // 1. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: false, // Low-poly / retro console look loves raw pixels!
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    // 2. 3D Scene & Perspective Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x04060d);
    this.scene.fog = new THREE.FogExp2(0x04060d, 0.035);

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 200);
    this.camera.position.set(0, 1.5, 5.5);

    // Ambient lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambLight);

    // 3. Post-Processing Setup (Render-To-Texture Quad)
    const dpr = this.renderer.getPixelRatio();
    this.renderTarget = new THREE.WebGLRenderTarget(
      container.clientWidth * dpr,
      container.clientHeight * dpr,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter, // Crisp nearest neighbor upscaling!
        format: THREE.RGBAFormat
      }
    );

    this.postScene = new THREE.Scene();
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.crtMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(CRTShader.uniforms),
      vertexShader: CRTShader.vertexShader,
      fragmentShader: CRTShader.fragmentShader
    });
    this.crtMaterial.uniforms.tDiffuse.value = this.renderTarget.texture;
    this.crtMaterial.uniforms.uResolution.value.set(
      container.clientWidth * dpr,
      container.clientHeight * dpr
    );

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(quadGeo, this.crtMaterial);
    this.postScene.add(quad);

    // 4. Instantiate Era Scenes
    this.scenes.bios = new BiosTowersScene(this.scene);
    this.scenes.wipeout = new WipeoutHudScene(this.scene);
    this.scenes.gt = new GtLoungeScene(this.scene);
    this.scenes.codec = new CodecVrScene(this.scene);

    this.switchScene('bios');

    // Event Listeners
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));

    // Start render loop
    this.render();
  }

  switchScene(sceneId) {
    if (!this.scenes[sceneId]) return;
    this.activeSceneId = sceneId;

    Object.keys(this.scenes).forEach((key) => {
      this.scenes[key].setVisible(key === sceneId);
    });

    // Update scene fog / background color according to era
    if (sceneId === 'bios') {
      this.scene.background.setHex(0x04060d);
      this.scene.fog.color.setHex(0x04060d);
      this.scene.fog.density = 0.035;
      this.targetCameraPos.set(0, 1.4, 5.0);
    } else if (sceneId === 'wipeout') {
      this.scene.background.setHex(0x08080f);
      this.scene.fog.color.setHex(0x08080f);
      this.scene.fog.density = 0.025;
      this.targetCameraPos.set(0, 1.6, 4.2);
    } else if (sceneId === 'gt') {
      this.scene.background.setHex(0x070b14);
      this.scene.fog.color.setHex(0x070b14);
      this.scene.fog.density = 0.03;
      this.targetCameraPos.set(0, 1.3, 5.2);
    } else if (sceneId === 'codec') {
      this.scene.background.setHex(0x020d06);
      this.scene.fog.color.setHex(0x020d06);
      this.scene.fog.density = 0.038;
      this.targetCameraPos.set(0, 1.5, 4.8);
    }
  }

  setCRTMode(mode) {
    this.crtMode = mode;
    if (this.crtMaterial) {
      this.crtMaterial.uniforms.uMode.value = mode;
    }
  }

  toggleAspectMode() {
    this.aspectMode = this.aspectMode === '16:9' ? '4:3' : '16:9';
    this.onResize();
    return this.aspectMode;
  }

  onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  onResize() {
    if (!this.container || !this.renderer) return;

    let width = this.container.clientWidth;
    let height = this.container.clientHeight;

    // In 4:3 mode, center a 4:3 viewport inside the container
    if (this.aspectMode === '4:3') {
      const targetRatio = 4 / 3;
      const currentRatio = width / height;
      if (currentRatio > targetRatio) {
        width = Math.round(height * targetRatio);
      } else {
        height = Math.round(width / targetRatio);
      }
    }

    const dpr = this.renderer.getPixelRatio();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderTarget.setSize(width * dpr, height * dpr);

    if (this.crtMaterial) {
      this.crtMaterial.uniforms.uResolution.value.set(width * dpr, height * dpr);
    }
  }

  render() {
    requestAnimationFrame(() => this.render());

    const time = this.clock.getElapsedTime();
    const analysis = player.getAnalysis();

    // Camera inertia and subtle mouse parallax
    const targetX = this.targetCameraPos.x + this.mouse.x * 0.4;
    const targetY = this.targetCameraPos.y + this.mouse.y * 0.25;
    const targetZ = this.targetCameraPos.z;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetX, 0.05);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, 0.05);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetZ, 0.05);
    this.camera.lookAt(0, 0.8, -4.0);

    // Update active scene animations
    if (this.scenes[this.activeSceneId]) {
      this.scenes[this.activeSceneId].update(time, analysis);
    }

    // 1. Render 3D Scene into Offscreen RenderTarget
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);

    // 2. Render CRT Post-Pass Quad to Canvas
    this.renderer.setRenderTarget(null);
    if (this.crtMaterial) {
      this.crtMaterial.uniforms.uTime.value = time;
    }
    this.renderer.render(this.postScene, this.postCamera);
  }
}

export const gfx = new RetroGFXEngine();
