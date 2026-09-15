// Scene 4: CODEC_VR (Metal Gear Solid 2 VR Training & Codec Intercept)
// Phosphor wireframe space, frequency reticle, audio waveform oscilloscope ring

import * as THREE from 'three';

export class CodecVrScene {
  constructor(scene) {
    this.root = new THREE.Group();
    scene.add(this.root);

    this.core = null;
    this.radarRings = [];
    this.waveRing = null;
    this.waveLine = null;
    this.gridFloor = null;
    this.gridCeil = null;

    this.init();
  }

  init() {
    // 1. Dual Phosphor Wireframe Grids (Floor + Ceiling)
    this.gridFloor = new THREE.GridHelper(100, 40, 0x44ff88, 0x093318);
    this.gridFloor.position.y = -2.6;
    this.root.add(this.gridFloor);

    this.gridCeil = new THREE.GridHelper(100, 40, 0x44ff88, 0x093318);
    this.gridCeil.position.y = 8.0;
    this.root.add(this.gridCeil);

    // 2. Central Tactical Polyhedral Core
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 1.2, -4.5);

    // Inner Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(1.4, 0);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x0a2b15,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x115525,
      emissiveIntensity: 0.7,
      flatShading: true
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    coreGroup.add(icoMesh);

    // Outer wireframe cage
    const cageGeo = new THREE.IcosahedronGeometry(1.8, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x66ffa0,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    coreGroup.add(cageMesh);

    this.core = coreGroup;
    this.root.add(this.core);

    // 3. Rotating Tactical Radar Rings
    for (let i = 0; i < 3; i++) {
      const radius = 2.5 + i * 0.9;
      const ringGeo = new THREE.RingGeometry(radius, radius + 0.06, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i === 1 ? 0xffcc00 : 0x44ff88,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.userData = { axis: i, speed: 0.8 - i * 0.25 };
      this.radarRings.push(ring);
      this.core.add(ring);
    }

    // 4. Physical 3D Waveform Oscilloscope Ring
    // 64 points dynamically updated from Web Audio timeData
    const pointCount = 64;
    const waveGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(pointCount * 3);
    waveGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const waveMat = new THREE.LineBasicMaterial({
      color: 0x66ffbb,
      linewidth: 2,
      transparent: true,
      opacity: 0.95
    });

    this.waveLine = new THREE.LineLoop(waveGeo, waveMat);
    this.waveLine.position.set(0, 1.2, -4.5);
    this.waveLine.rotation.x = Math.PI / 4;
    this.root.add(this.waveLine);

    // Green tactical point lighting
    const greenLight = new THREE.PointLight(0x44ff88, 2.5, 30);
    greenLight.position.set(0, 3, -4);
    this.root.add(greenLight);
  }

  update(time, analysis) {
    const { bass, energy, waveform } = analysis;

    // Grid crawl
    if (this.gridFloor) {
      this.gridFloor.position.z = (this.gridFloor.position.z + 0.15) % 2.5;
    }
    if (this.gridCeil) {
      this.gridCeil.position.z = (this.gridCeil.position.z + 0.15) % 2.5;
    }

    // Rotate core
    if (this.core) {
      this.core.rotation.y = time * 0.8;
      this.core.rotation.x = Math.sin(time * 0.9) * 0.2;
      this.core.scale.setScalar(1.0 + bass * 0.25);

      // Rotate radar gimbal rings
      this.radarRings.forEach((ring, idx) => {
        if (idx === 0) ring.rotation.x = time * ring.userData.speed;
        if (idx === 1) ring.rotation.y = time * ring.userData.speed;
        if (idx === 2) ring.rotation.z = time * ring.userData.speed;
      });
    }

    // Update 3D Waveform Oscilloscope from audio analyser
    if (this.waveLine && waveform) {
      const posAttr = this.waveLine.geometry.attributes.position;
      const count = posAttr.count;
      const baseRadius = 3.6;

      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2;
        // Waveform is 0..255, centered at 128
        const waveVal = ((waveform[i % waveform.length] || 128) - 128) / 128.0;
        const r = baseRadius + waveVal * 0.9;
        posAttr.setXYZ(i, Math.cos(theta) * r, Math.sin(theta) * r, waveVal * 0.4);
      }
      posAttr.needsUpdate = true;
      this.waveLine.rotation.z = time * 0.4;
    }
  }

  setVisible(visible) {
    this.root.visible = visible;
  }
}
