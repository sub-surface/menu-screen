// Scene 2: AG_TELEMETRY (WipEout / Designers Republic / Y2K Racing)
// Low-poly anti-gravity craft, racing telemetry grid, vector speed rings

import * as THREE from 'three';

export class WipeoutHudScene {
  constructor(scene) {
    this.root = new THREE.Group();
    scene.add(this.root);

    this.ship = null;
    this.thrusters = [];
    this.grid = null;
    this.speedRings = [];

    this.init();
  }

  init() {
    // 1. Endless Vector Racing Grid Floor
    const gridHelper = new THREE.GridHelper(160, 40, 0xff5500, 0x1f1f2e);
    gridHelper.position.y = -2.5;
    this.grid = gridHelper;
    this.root.add(this.grid);

    // Lateral boundary laser rails
    [-12, 12].forEach((x) => {
      const railGeo = new THREE.BoxGeometry(0.2, 0.4, 160);
      const railMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(x, -2.3, 0);
      this.root.add(rail);
    });

    // 2. Low-Poly Anti-Gravity Craft (AG-Racer)
    this.ship = new THREE.Group();
    this.ship.position.set(0, 0.5, -4.0);

    // Fuselage (faceted low-poly wedge)
    const bodyGeo = new THREE.ConeGeometry(1.2, 4.2, 5);
    bodyGeo.rotateX(Math.PI / 2);
    bodyGeo.rotateZ(Math.PI);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a1c23,
      roughness: 0.3,
      metalness: 0.8,
      flatShading: true
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.ship.add(bodyMesh);

    // Cockpit canopy (neon orange / cyan glass)
    const cockpitGeo = new THREE.BoxGeometry(0.6, 0.4, 1.4);
    const cockpitMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xcc3300,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const cockpitMesh = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpitMesh.position.set(0, 0.35, -0.2);
    this.ship.add(cockpitMesh);

    // Swept delta wings
    const wingGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Left wing
      0, 0, 0.5,
      -3.2, -0.2, 2.0,
      0, 0, -1.8,
      // Right wing
      0, 0, 0.5,
      0, 0, -1.8,
      3.2, -0.2, 2.0,
    ]);
    wingGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    wingGeo.computeVertexNormals();

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x0f1118,
      roughness: 0.4,
      metalness: 0.7,
      side: THREE.DoubleSide,
      flatShading: true
    });
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    this.ship.add(wingMesh);

    // Wingtip vector fins
    [-3.2, 3.2].forEach((x, i) => {
      const finGeo = new THREE.BoxGeometry(0.1, 0.9, 1.2);
      const finMat = new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        emissive: 0x0088cc,
        emissiveIntensity: 0.6
      });
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.set(x, 0.2, 1.8);
      this.ship.add(fin);
    });

    // Dual Thrusters
    [-0.55, 0.55].forEach((x) => {
      const tGeo = new THREE.CylinderGeometry(0.22, 0.32, 0.8, 8);
      tGeo.rotateX(Math.PI / 2);
      const tMat = new THREE.MeshStandardMaterial({ color: 0x22222b, metalness: 0.9 });
      const tMesh = new THREE.Mesh(tGeo, tMat);
      tMesh.position.set(x, 0, 2.2);

      // Glowing thrust exhaust cone
      const glowGeo = new THREE.ConeGeometry(0.3, 1.4, 8);
      glowGeo.rotateX(-Math.PI / 2);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.85
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.set(0, 0, 0.9);
      tMesh.add(glowMesh);

      this.thrusters.push(glowMesh);
      this.ship.add(tMesh);
    });

    this.root.add(this.ship);

    // 3. Speed Rings / Sector Gates
    for (let i = 0; i < 6; i++) {
      const ringGeo = new THREE.RingGeometry(5.0, 5.2, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff5500 : 0x00e5ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 1.5, -15 - i * 18);
      this.speedRings.push(ring);
      this.root.add(ring);
    }

    // Spotlights
    const cyanLight = new THREE.PointLight(0x00e5ff, 2.8, 40);
    cyanLight.position.set(0, 5, 0);
    this.root.add(cyanLight);

    const orangeLight = new THREE.PointLight(0xff5500, 2.2, 35);
    orangeLight.position.set(0, 2, -15);
    this.root.add(orangeLight);
  }

  update(time, analysis) {
    const { bass, energy } = analysis;

    // Fast moving vector grid
    if (this.grid) {
      this.grid.position.z = (this.grid.position.z + 0.6 + energy * 0.4) % 8;
    }

    // Move speed rings toward camera
    this.speedRings.forEach((ring) => {
      ring.position.z += 0.7 + energy * 0.6;
      if (ring.position.z > 8) {
        ring.position.z = -95;
      }
      ring.rotation.z += 0.01;
    });

    // Ship hover physics: bank, tilt, and vertical vibration
    if (this.ship) {
      this.ship.position.y = 0.5 + Math.sin(time * 3.5) * 0.15 + bass * 0.35;
      this.ship.rotation.z = Math.sin(time * 1.8) * 0.12;
      this.ship.rotation.x = Math.sin(time * 2.2) * 0.05 + energy * 0.08;

      // Pulse thruster flare with kick drum
      this.thrusters.forEach((glow) => {
        const scale = 1.0 + bass * 1.8;
        glow.scale.set(scale, scale, 1.0 + bass * 2.5);
        glow.material.color.setHex(bass > 0.4 ? 0xff6600 : 0x00ffff);
      });
    }
  }

  setVisible(visible) {
    this.root.visible = visible;
  }
}
