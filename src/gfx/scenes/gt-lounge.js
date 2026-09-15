// Scene 3: SPEC_LOUNGE (Gran Turismo 3 A-Spec Showroom)
// Polished studio turntable pedestal, rotating 3D CD jewel case and vinyl disc

import * as THREE from 'three';

export class GtLoungeScene {
  constructor(scene) {
    this.root = new THREE.Group();
    scene.add(this.root);

    this.turntable = null;
    this.jewelCase = null;
    this.vinylDisc = null;
    this.studioRings = [];

    this.init();
  }

  init() {
    // 1. Sleek studio turntable pedestal
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, -1.2, -4.0);

    // Outer stage platform
    const stageGeo = new THREE.CylinderGeometry(6.5, 7.0, 0.4, 36);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.1,
      metalness: 0.9
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    pedestalGroup.add(stage);

    // Concentric chrome bevel rings
    const ringGeo = new THREE.RingGeometry(5.8, 6.2, 36);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x004488,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.9,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.21;
    pedestalGroup.add(ringMesh);

    this.turntable = pedestalGroup;
    this.root.add(this.turntable);

    // 2. Floating 3D CD Jewel Case
    const caseGroup = new THREE.Group();
    caseGroup.position.set(-0.8, 0.8, -3.8);

    // Front acrylic cover (translucent glass)
    const coverGeo = new THREE.BoxGeometry(2.4, 2.4, 0.12);
    const coverMat = new THREE.MeshStandardMaterial({
      color: 0x0f1d33,
      roughness: 0.15,
      metalness: 0.7,
      transparent: true,
      opacity: 0.82
    });
    const coverMesh = new THREE.Mesh(coverGeo, coverMat);
    caseGroup.add(coverMesh);

    // Spine inlay
    const spineGeo = new THREE.BoxGeometry(0.12, 2.4, 0.14);
    const spineMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x0066aa });
    const spineMesh = new THREE.Mesh(spineGeo, spineMat);
    spineMesh.position.set(-1.24, 0, 0);
    caseGroup.add(spineMesh);

    // Inner tray teeth (center spindle)
    const spindleGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.16, 16);
    spindleGeo.rotateX(Math.PI / 2);
    const spindleMat = new THREE.MeshStandardMaterial({ color: 0x334466, metalness: 0.8 });
    const spindle = new THREE.Mesh(spindleGeo, spindleMat);
    spindle.position.set(0, 0, 0.08);
    caseGroup.add(spindle);

    this.jewelCase = caseGroup;
    this.root.add(this.jewelCase);

    // 3. Floating Vinyl Record Disc
    const vinylGroup = new THREE.Group();
    vinylGroup.position.set(1.4, 0.7, -3.5);

    // Disc body with grooves
    const discGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.04, 32);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x111115,
      roughness: 0.25,
      metalness: 0.85
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    vinylGroup.add(discMesh);

    // Center label (m0rvidd record sticker)
    const labelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.045, 24);
    const labelMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x004477,
      roughness: 0.3
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    vinylGroup.add(labelMesh);

    // Center spindle hole
    const holeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 12);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const holeMesh = new THREE.Mesh(holeGeo, holeMat);
    vinylGroup.add(holeMesh);

    this.vinylDisc = vinylGroup;
    this.root.add(this.vinylDisc);

    // 4. Overhead Studio Lighting & Architectural Halo
    const haloGeo = new THREE.TorusGeometry(8.0, 0.08, 8, 36);
    haloGeo.rotateX(Math.PI / 2);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.35
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 5.5, -4.0);
    this.root.add(halo);

    const studioLight1 = new THREE.DirectionalLight(0xddeeff, 2.0);
    studioLight1.position.set(5, 8, 2);
    this.root.add(studioLight1);

    const cyanRim = new THREE.PointLight(0x00d4ff, 2.2, 25);
    cyanRim.position.set(-4, 3, -5);
    this.root.add(cyanRim);
  }

  update(time, analysis) {
    const { bass, energy } = analysis;

    // Slow turntable rotation
    if (this.turntable) {
      this.turntable.rotation.y = time * 0.2;
    }

    // Floating Jewel Case tilt and hover
    if (this.jewelCase) {
      this.jewelCase.rotation.y = Math.sin(time * 0.7) * 0.35 - 0.2;
      this.jewelCase.rotation.x = Math.cos(time * 0.6) * 0.15;
      this.jewelCase.position.y = 0.8 + Math.sin(time * 1.6) * 0.12 + bass * 0.2;
    }

    // Spinning vinyl record disc (speeds up on energy)
    if (this.vinylDisc) {
      this.vinylDisc.rotation.y += 0.04 + energy * 0.06;
      this.vinylDisc.rotation.z = Math.sin(time * 1.2) * 0.12;
      this.vinylDisc.position.y = 0.7 + Math.cos(time * 1.8) * 0.15 + bass * 0.18;
    }
  }

  setVisible(visible) {
    this.root.visible = visible;
  }
}
