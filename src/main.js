// Application Entrypoint: Orchestration of 3D Graphics, Web Audio, UI & Gamepad

import { gfx } from './gfx/renderer.js';
import { RetroMenuUI } from './ui/menu.js';
import { GamepadManager } from './ui/gamepad.js';
import { player } from './audio/player.js';
import { sfx } from './audio/sfx.js';
import { SCENES } from './tracks.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');

  // 1. Initialize DOM Menu UI Overlay
  const menuUI = new RetroMenuUI(appContainer);

  // 2. Initialize 3D Graphics Engine in the Mount Point
  const viewport = document.getElementById('webgl-viewport');
  if (viewport) {
    gfx.init(viewport);
  }

  // 3. Initialize Gamepad Controller Support
  const gamepad = new GamepadManager({
    onUp: () => menuUI.navigateTrack(-1),
    onDown: () => menuUI.navigateTrack(1),
    onLeft: () => {
      sfx.playCursor();
      player.prev();
    },
    onRight: () => {
      sfx.playCursor();
      player.next();
    },
    onSelect: () => {
      sfx.playConfirm();
      player.togglePlay();
    },
    onBack: () => {
      sfx.playCancel();
      player.pause();
    },
    onCRT: () => menuUI.cycleCRTMode(),
    onAspect: () => menuUI.toggleAspectRatio(),
    onPrevScene: () => {
      const prevIdx = (menuUI.activeSceneIndex - 1 + SCENES.length) % SCENES.length;
      menuUI.selectScene(prevIdx);
    },
    onNextScene: () => {
      const nextIdx = (menuUI.activeSceneIndex + 1) % SCENES.length;
      menuUI.selectScene(nextIdx);
    },
    onConnect: (pad) => {
      console.log(`[GAMEPAD] Connected: ${pad.id}`);
      sfx.playConfirm();
    }
  });

  // 4. Unlock AudioContext on first user interaction
  const unlockAudio = () => {
    player.ensureContext();
    sfx.ensureContext();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  console.log('[MENU-SCREEN] PS2 Sound Environment Initialized.');
});
