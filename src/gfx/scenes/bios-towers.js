// Scene 1: TOWERS_OF_MEMORY (PS2 BIOS / Memory Card Void)
// Monolithic obsidian towers, crystal dust particles, rotating save cube

import * as THREE from 'three';

export class BiosTowersScene {
  constructor(scene) {
    this.root = new THREE.Group();
    scene.add(this.root);

    this.towers = [];
    this.particles = null;
    this.saveCube = null;
    this.ground = null;

    this.init();
  }

  init() {
    // 1. Dark reflective floor grid
    const floorGeo = new THREE.PlaneGeometry(120, 120, 24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x030610,
      roughness: 0.15,
      metalness: 0.85,
      wireframe: false
    });
    this.ground = new THREE.Mesh(floorGeo, floorMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = -2;
    this.root.add(this.ground);

    // Subtle floor wireframe grid overlay
    const gridHelper = new THREE.GridHelper(100, 30, 0x1a3366, 0x0a1428);
    gridHelper.position.y = -1.98;
    this.root.add(gridHelper);

    // 2. Monolithic Obsidian Towers (7 towers, representing PS2 BIOS architecture)
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x0a1630,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x0d2250,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.88
    });

    const towerWireMat = new THREE.MeshBasicMaterial({
      color: 0x3377dd,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });

    const towerConfigs = [
      { x: -9, z: -14, w: 2.2, d: 2.2, baseH: 9 },
      { x: -5, z: -18, w: 2.8, d: 2.8, baseH: 14 },
      { x: -1, z: -22, w: 3.2, d: 3.2, baseH: 19 },
      { x: 4, z: -19, w: 2.6, d: 2.6, baseH: 13 },
      { x: 8, z: -15, w: 2.0, d: 2.0, baseH: 10 },
      { x: -14, z: -10, w: 1.8, d: 1.8, baseH: 7 },
      { x: 13, z: -11, w: 1.8, d: 1.8, baseH: 8 }
    ];

    towerConfigs.forEach((cfg, idx) => {
      const geo = new THREE.BoxGeometry(cfg.w, cfg.baseH, cfg.d);
      const mesh = new THREE.Mesh(geo, towerMat);
      mesh.position.set(cfg.x, -2 + cfg.baseH / 2, cfg.z);

      const wireMesh = new THREE.Mesh(geo, towerWireMat);
      mesh.add(wireMesh);

      mesh.userData = {
        baseH: cfg.baseH,
        baseY: -2 + cfg.baseH / 2,
        w: cfg.w,
        d: cfg.d,
        bandIndex: idx % 7
      };

      this.towers.push(mesh);
      this.root.add(mesh);
    });

    // 3. Central floating 3D Memory Card Save Cube
    const cubeGroup = new THREE.Group();
    cubeGroup.position.set(0, 1.8, -4.5);

    // Inner glowing core
    const coreGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x2266ff,
      roughness: 0.1,
      metalness: 0.5,
      emissive: 0x113399,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.85
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    cubeGroup.add(coreMesh);

    // Outer wireframe cage
    const cageGeo = new THREE.BoxGeometry(2.1, 2.1, 2.1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x88bbff,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    cubeGroup.add(cageMesh);

    // Little satellite prisms (representing save blocks)
    for (let i = 0; i < 4; i++) {
      const satGeo = new THREE.OctahedronGeometry(0.25, 0);
      const satMat = new THREE.MeshStandardMaterial({
        color: 0x44aaff,
        emissive: 0x1155cc,
        roughness: 0.3
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      sat.userData = { angle: (i * Math.PI) / 2, radius: 2.2, speed: 1.2 + i * 0.2 };
      cubeGroup.add(sat);
    }

    this.saveCube = cubeGroup;
    this.root.add(this.saveCube);

    // 4. Floating Crystal Dust Particles
    const particleCount = 700;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3 + 0] = (Math.random() - 0.5) * 50;
      pPositions[i * 3 + 1] = Math.random() * 25 - 2;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;

      pColors[i * 3 + 0] = 0.3 + Math.random() * 0.4;
      pColors[i * 3 + 1] = 0.5 + Math.random() * 0.4;
      pColors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(pGeo, pMat);
    this.root.add(this.particles);

    // Scene lighting
    const blueLight = new THREE.PointLight(0x3388ff, 2.5, 30);
    blueLight.position.set(0, 8, -6);
    this.root.add(blueLight);

    const purpleLight = new THREE.PointLight(0x7722cc, 1.8, 40);
    purpleLight.position.set(-10, 5, -15);
    this.root.add(purpleLight);
  }

  update(time, analysis) {
    const { bass, mid, treble, energy } = analysis;

    // Pulse monolith towers based on audio frequency bands
    this.towers.forEach((tower, i) => {
      const modFactor = (i % 2 === 0 ? bass : mid) * 0.8;
      const targetScaleY = 1.0 + modFactor * 0.45;
      tower.scale.y = THREE.MathUtils.lerp(tower.scale.y, targetScaleY, 0.15);
      tower.position.y = -2 + (tower.userData.baseH * tower.scale.y) / 2;

      // Emissive pulse on snare/high hits
      const mat = tower.material;
      mat.emissiveIntensity = 0.3 + modFactor * 0.8;
    });

    // Rotate and wobble central save cube
    if (this.saveCube) {
      this.saveCube.rotation.y = time * 0.6;
      this.saveCube.rotation.x = Math.sin(time * 0.8) * 0.15;
      this.saveCube.rotation.z = Math.cos(time * 0.7) * 0.1;
      this.saveCube.position.y = 1.8 + Math.sin(time * 1.5) * 0.25 + bass * 0.4;

      // Pulse satellites
      this.saveCube.children.forEach((child) => {
        if (child.userData.radius) {
          const a = child.userData.angle + time * child.userData.speed;
          const r = child.userData.radius + treble * 0.5;
          child.position.x = Math.cos(a) * r;
          child.position.z = Math.sin(a) * r;
          child.position.y = Math.sin(a * 2) * 0.4;
          child.rotation.x += 0.03;
          child.rotation.y += 0.04;
        }
      });
    }

    // Drift crystal particles upward and rotate slowly
    if (this.particles) {
      const pos = this.particles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + 0.02 + energy * 0.03;
        if (y > 22) y = -2;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      this.particles.rotation.y = time * 0.03;
    }
  }

  setVisible(visible) {
    this.root.visible = visible;
  }
}
