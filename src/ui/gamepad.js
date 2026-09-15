// Gamepad API Controller Manager
// DualShock / Xbox gamepad input with deadzone filtering, repeat gating, and haptics

export class GamepadManager {
  constructor(handlers = {}) {
    this.handlers = handlers;
    this.connectedIndex = null;
    this.buttonStates = {};
    this.axisCooldown = 0;
    this.isConnected = false;

    this.init();
  }

  init() {
    window.addEventListener('gamepadconnected', (e) => {
      this.connectedIndex = e.gamepad.index;
      this.isConnected = true;
      if (this.handlers.onConnect) this.handlers.onConnect(e.gamepad);
      this.vibrate(50, 0.4, 0.4);
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      if (this.connectedIndex === e.gamepad.index) {
        this.connectedIndex = null;
        this.isConnected = false;
        if (this.handlers.onDisconnect) this.handlers.onDisconnect(e.gamepad);
      }
    });

    this.poll();
  }

  vibrate(durationMs = 60, weak = 0.3, strong = 0.3) {
    if (this.connectedIndex === null) return;
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = gamepads[this.connectedIndex];
    if (pad && pad.vibrationActuator && pad.vibrationActuator.playEffect) {
      try {
        pad.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: durationMs,
          weakMagnitude: weak,
          strongMagnitude: strong
        });
      } catch {}
    }
  }

  poll() {
    requestAnimationFrame(() => this.poll());
    if (this.connectedIndex === null) return;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = gamepads[this.connectedIndex];
    if (!pad) return;

    const now = performance.now();

    // 1. Check Face & Shoulder Buttons
    // 0: Cross / A, 1: Circle / B, 2: Square / X, 3: Triangle / Y
    // 4: L1 / LB, 5: R1 / RB
    // 12: Up, 13: Down, 14: Left, 15: Right
    const buttonsToWatch = [0, 1, 2, 3, 4, 5, 12, 13, 14, 15];
    buttonsToWatch.forEach((btnIdx) => {
      const btn = pad.buttons[btnIdx];
      const pressed = btn ? (btn.pressed || btn.value > 0.5) : false;
      const wasPressed = !!this.buttonStates[btnIdx];

      if (pressed && !wasPressed) {
        this.triggerButton(btnIdx);
      }
      this.buttonStates[btnIdx] = pressed;
    });

    // 2. Analog Stick Axis (Left Stick: axis 0 = X, axis 1 = Y)
    const deadzone = 0.35;
    const axisX = pad.axes[0] || 0;
    const axisY = pad.axes[1] || 0;

    if (now > this.axisCooldown) {
      if (axisY < -deadzone) {
        if (this.handlers.onUp) this.handlers.onUp();
        this.vibrate(30, 0.2, 0.1);
        this.axisCooldown = now + 180;
      } else if (axisY > deadzone) {
        if (this.handlers.onDown) this.handlers.onDown();
        this.vibrate(30, 0.2, 0.1);
        this.axisCooldown = now + 180;
      } else if (axisX < -deadzone) {
        if (this.handlers.onLeft) this.handlers.onLeft();
        this.vibrate(30, 0.2, 0.1);
        this.axisCooldown = now + 200;
      } else if (axisX > deadzone) {
        if (this.handlers.onRight) this.handlers.onRight();
        this.vibrate(30, 0.2, 0.1);
        this.axisCooldown = now + 200;
      }
    }
  }

  triggerButton(btnIdx) {
    this.vibrate(40, 0.25, 0.2);
    switch (btnIdx) {
      case 0: // Cross / A: Select
        if (this.handlers.onSelect) this.handlers.onSelect();
        break;
      case 1: // Circle / B: Back
        if (this.handlers.onBack) this.handlers.onBack();
        break;
      case 2: // Square / X: Aspect Ratio
        if (this.handlers.onAspect) this.handlers.onAspect();
        break;
      case 3: // Triangle / Y: CRT Mode
        if (this.handlers.onCRT) this.handlers.onCRT();
        break;
      case 4: // L1: Prev Scene
        if (this.handlers.onPrevScene) this.handlers.onPrevScene();
        break;
      case 5: // R1: Next Scene
        if (this.handlers.onNextScene) this.handlers.onNextScene();
        break;
      case 12: // D-pad Up
        if (this.handlers.onUp) this.handlers.onUp();
        break;
      case 13: // D-pad Down
        if (this.handlers.onDown) this.handlers.onDown();
        break;
      case 14: // D-pad Left
        if (this.handlers.onLeft) this.handlers.onLeft();
        break;
      case 15: // D-pad Right
        if (this.handlers.onRight) this.handlers.onRight();
        break;
    }
  }
}
