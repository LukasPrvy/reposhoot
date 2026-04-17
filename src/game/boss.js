var RS = RS || {};

RS.Boss = {
  active: false,
  x: 400,
  y: -100,
  hp: 0,
  maxHp: 0,
  hitRadius: 55,
  width: 140,
  height: 120,

  eyes: [],
  mouth: {},

  moveTimer: 0,
  dead: false,
  deathTimer: 0,
  deathExplosions: 0,
  entryComplete: false,

  phase: 'eyes',
  eyePatternTimer: 0,
  eyePattern: 0,

  scriptState: 'ENTRY',
  scriptTimer: 0,
  scriptModeIndex: 0,
  eyesOpen: false,

  _baseY: -100,
  _eyeFlashCanvas: null,
  _deathCanvas: null,

  init: function () {
    this.active = false;
    this.x = 400;
    this.y = -100;
    this.hitRadius = 55;
    this.width = 140;
    this.height = 120;
    this._baseY = -100;

    this.eyes = [];
    for (var i = 0; i < 6; i++) {
      this.eyes.push({
        x: 0,
        y: 0,
        hp: 50,
        maxHp: 50,
        alive: true,
        open: false,
        hitRadius: 14,
        shootTimer: 40 + i * 15,
        hitFlashTimer: 0,
      });
    }

    this.mouth = {
      x: 0,
      y: 30,
      hp: 120,
      maxHp: 120,
      alive: true,
      hitRadius: 18,
      shootTimer: 30,
      exposed: false,
      fireMode: 0,
    };

    this.hp = 420;
    this.maxHp = 420;
    this.moveTimer = 0;
    this.dead = false;
    this.deathTimer = 0;
    this.deathExplosions = 0;
    this.entryComplete = false;
    this.phase = 'eyes';
    this.eyePatternTimer = 0;
    this.eyePattern = 0;
    this.scriptState = 'ENTRY';
    this.scriptTimer = 0;
    this.scriptModeIndex = 0;
    this.eyesOpen = false;
  },

  start: function () {
    this.active = true;
    this.dead = false;
    this.phase = 'eyes';
    this._baseY = -120;

    var eyePositions = [
      {x: -45, y: -30},
      {x: 45, y: -30},
      {x: -60, y: 0},
      {x: 60, y: 0},
      {x: -40, y: 25},
      {x: 40, y: 25},
    ];
    this.eyes = [];
    for (var i = 0; i < 6; i++) {
      this.eyes.push({
        x: eyePositions[i].x,
        y: eyePositions[i].y,
        hp: 50,
        maxHp: 50,
        alive: true,
        open: false,
        hitRadius: 14,
        shootTimer: 40 + i * 15,
        hitFlashTimer: 0,
      });
    }

    this.mouth = {
      x: 0,
      y: 30,
      hp: 120,
      maxHp: 120,
      alive: true,
      hitRadius: 18,
      shootTimer: 30,
      exposed: false,
      fireMode: 0,
    };

    this.hp = 420;
    this.maxHp = 420;
    this.x = 400;
    this.y = -120;
    this.moveTimer = 0;
    this.deathTimer = 0;
    this.deathExplosions = 0;
    this.entryComplete = false;
    this.eyePatternTimer = 0;
    this.eyePattern = 0;

    this.scriptState = 'MOVE_DOWN';
    this.scriptTimer = 500;
    this.scriptModeIndex = 0;
    this.eyesOpen = false;

    if (RS.Audio && RS.Audio.playBossWarning) RS.Audio.playBossWarning();
  },

  update: function () {
    if (!this.active) return;

    this.moveTimer++;
    this.updateScript();

    var amplitude = 70;
    if (this.phase === 'mouth') amplitude = 100;
    else if (this.phase === 'few_eyes') amplitude = 85;
    this.x = 400 + Math.sin(this.moveTimer * 0.02) * amplitude;
    this.y = this._baseY + Math.sin(this.moveTimer * 0.01) * 15;

    if (this.dead) {
      this.handleDeath();
      return;
    }

    var bossBounds =
      RS.CodeEnv && RS.CodeEnv.loaded
        ? RS.CodeEnv.getCorridorBoundsRange(
            this.y - this.height / 2,
            this.height,
          )
        : {left: RS.CORRIDOR_LEFT, right: RS.CORRIDOR_RIGHT};
    this.x = Math.max(
      bossBounds.left + 80,
      Math.min(bossBounds.right - 80, this.x),
    );

    var aliveEyes = 0;
    for (var i = 0; i < this.eyes.length; i++) {
      if (this.eyes[i].alive) aliveEyes++;
    }

    if (aliveEyes === 0) {
      this.phase = 'mouth';
      this.mouth.exposed = true;
      this.eyesOpen = false;
    } else if (aliveEyes <= 2) {
      this.phase = 'few_eyes';
    }

    for (var ei = 0; ei < this.eyes.length; ei++) {
      var eye = this.eyes[ei];
      if (!eye.alive) {
        eye.open = false;
        continue;
      }
      eye.open = this.eyesOpen;
    }

    for (var i = 0; i < this.eyes.length; i++) {
      if (this.eyes[i].hitFlashTimer > 0) this.eyes[i].hitFlashTimer--;
    }

    if (this.eyesOpen) {
      for (var fi = 0; fi < this.eyes.length; fi++) {
        var fEye = this.eyes[fi];
        if (!fEye.alive || !fEye.open) continue;

        fEye.shootTimer--;
        if (fEye.shootTimer <= 0) {
          var bx = this.x + fEye.x;
          var by = this.y + fEye.y;
          if (RS.Player && RS.Player.alive) {
            var angle = Math.atan2(RS.Player.y - by, RS.Player.x - bx);
            this.fireSpinner(bx, by, Math.cos(angle) * 4, Math.sin(angle) * 4);
          }
          fEye.shootTimer = this.phase === 'few_eyes' ? 20 : 35;
        }
      }
    }

    if (
      this.mouth.exposed &&
      this.mouth.alive &&
      this.scriptState === 'TRIGGER'
    ) {
      this.mouth.shootTimer--;
      if (this.mouth.shootTimer <= 0) {
        this.fireMouthPattern();
      }
    }

    this.hp = 0;
    for (var hi = 0; hi < this.eyes.length; hi++) {
      if (this.eyes[hi].alive) this.hp += this.eyes[hi].hp;
    }
    if (this.mouth.alive) this.hp += this.mouth.hp;

    if (this.hp <= 0) {
      this.dead = true;
      this.deathTimer = 0;
      this.deathExplosions = 0;
    }
  },

  updateScript: function () {
    switch (this.scriptState) {
      case 'MOVE_DOWN':
        this._baseY += 1;
        this.scriptTimer--;
        if (this._baseY >= 120 || this.scriptTimer <= 0) {
          this._baseY = Math.min(this._baseY, 150);
          this.scriptState = 'STATIC';
          this.scriptTimer = 50;
          this.entryComplete = true;
        }
        break;

      case 'STATIC':
        this.scriptTimer--;
        if (this.scriptTimer <= 0) {
          this.scriptState = 'ROAR';
          this.scriptTimer = 30;
          if (RS.Audio && RS.Audio.playBigExplosion)
            RS.Audio.playBigExplosion();
        }
        break;

      case 'ROAR':
        this.scriptTimer--;
        if (this.scriptTimer <= 0) {
          this.scriptState = 'OPEN_EYES';
          this.scriptTimer = 10;
        }
        break;

      case 'OPEN_EYES':
        this.eyesOpen = true;
        this.scriptTimer--;
        if (this.scriptTimer <= 0) {
          this.scriptState = 'MOVE_UP';
          this.scriptTimer = 200;
        }
        break;

      case 'MOVE_UP':
        this._baseY -= 0.5;
        this.scriptTimer--;
        if (this.scriptTimer <= 0) {
          this.scriptState = 'SNORT';
          this.scriptTimer = 20;
          if (RS.Audio && RS.Audio.playExplosion) RS.Audio.playExplosion();
        }
        break;

      case 'SNORT':
        this.scriptTimer--;
        if (this.scriptTimer <= 0) {
          this.scriptState = 'TRIGGER';
          this.scriptTimer = 120;
        }
        break;

      case 'TRIGGER':
        this.scriptTimer--;
        if (this.scriptTimer <= 0) {
          this.scriptState = 'STATIC2';
          this.scriptTimer = 50;
        }
        break;

      case 'STATIC2':
        this.scriptTimer--;
        if (this.scriptTimer <= 0) {
          this.scriptState = 'TRIGGER2';
          this.scriptTimer = 120;
          this.scriptModeIndex = (this.scriptModeIndex + 1) % 4;
        }
        break;

      case 'TRIGGER2':
        this.scriptTimer--;
        if (this.scriptTimer <= 0) {
          this.scriptState = 'SHUT_EYES';
          this.scriptTimer = 10;
        }
        break;

      case 'SHUT_EYES':
        this.eyesOpen = false;
        this.scriptTimer--;
        if (this.scriptTimer <= 0) {
          this.scriptState = 'MOVE_DOWN_LOOP';
          this.scriptTimer = 200;
        }
        break;

      case 'MOVE_DOWN_LOOP':
        this._baseY += 0.5;
        this.scriptTimer--;
        if (this.scriptTimer <= 0) {
          this.scriptModeIndex = (this.scriptModeIndex + 1) % 4;
          this.scriptState = 'STATIC';
          this.scriptTimer = 50;
        }
        break;
    }
  },

  fireSpinner: function (x, y, vx, vy) {
    if (RS.Enemies) {
      RS.Enemies.fireSpinner(x, y, vx, vy, 1);
    }
  },

  fireMouthPattern: function () {
    var mx = this.x + this.mouth.x;
    var my = this.y + this.mouth.y;

    switch (this.mouth.fireMode) {
      case 0:
        for (var i = 0; i < 4; i++) {
          var a = (i / 4) * Math.PI * 2;
          for (var j = 0; j < 4; j++) {
            var speed = 2 + j * 0.5;
            this.fireSpinner(mx, my, Math.cos(a) * speed, Math.sin(a) * speed);
          }
        }
        this.mouth.shootTimer = 25;
        break;
      case 1:
        if (RS.Player && RS.Player.alive) {
          var spreadAngle = Math.PI / 3;
          var baseAngle = Math.atan2(RS.Player.y - my, RS.Player.x - mx);
          for (var mi = 0; mi < 5; mi++) {
            var ma = baseAngle - spreadAngle / 2 + (mi / 4) * spreadAngle;
            this.fireSpinner(mx, my, Math.cos(ma) * 3, Math.sin(ma) * 3);
          }
        }
        this.mouth.shootTimer = 30;
        break;
      case 2:
        for (var si = 0; si < 8; si++) {
          var sa = (si / 8) * Math.PI * 2;
          this.fireSpinner(mx, my, Math.cos(sa) * 3.5, Math.sin(sa) * 3.5);
          this.fireSpinner(mx, my, Math.cos(sa) * 2.5, Math.sin(sa) * 2.5);
        }
        this.mouth.shootTimer = 22;
        break;
      case 3:
        if (RS.Player && RS.Player.alive) {
          var burstAngle = Math.atan2(RS.Player.y - my, RS.Player.x - mx);
          this.fireSpinner(
            mx,
            my,
            Math.cos(burstAngle) * 4.5,
            Math.sin(burstAngle) * 4.5,
          );
          this.fireSpinner(
            mx,
            my,
            Math.cos(burstAngle) * 3.5,
            Math.sin(burstAngle) * 3.5,
          );
          this.fireSpinner(
            mx,
            my,
            Math.cos(burstAngle) * 2.5,
            Math.sin(burstAngle) * 2.5,
          );
        }
        this.mouth.shootTimer = 18;
        break;
    }
    this.mouth.fireMode = (this.mouth.fireMode + 1) % 4;
  },

  fireBullet: function (x, y, vx, vy) {
    if (RS.Enemies) {
      RS.Enemies.bullets.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        active: true,
        hitRadius: 3,
        spriteKey: 'bullet_enemyBullet',
        width: 4,
        height: 10,
      });
    }
  },

  handleDeath: function () {
    this.deathTimer++;
    this._baseY += 1;
    if (this.deathTimer % 8 === 0) {
      var ringRadius = this.deathExplosions * 12;
      var ringAngle = Math.random() * Math.PI * 2;
      var rx = this.x + Math.cos(ringAngle) * ringRadius;
      var ry = this.y + Math.sin(ringAngle) * ringRadius;
      if (RS.Particles) RS.Particles.emitSpriteExplosion(rx, ry, 'big', 0, 0);
      if (RS.Audio) RS.Audio.playBigExplosion();
      this.deathExplosions++;
    }
    if (this.deathExplosions >= 18) {
      this.active = false;
      RS.Player.addScore(5000);
    }
  },

  hit: function (damage) {
    if (this.dead) return;
    if (this.mouth.exposed && this.mouth.alive) {
      this.mouth.hp -= damage;
      if (this.mouth.hp <= 0) {
        this.mouth.hp = 0;
        this.mouth.alive = false;
      }
    }
  },

  hitPart: function (part, damage) {
    if (!part.alive) return false;
    if (part.open === false) return false;

    part.hp -= damage;
    part.hitFlashTimer = 4;
    if (part.hp <= 0) {
      part.hp = 0;
      part.alive = false;
      if (RS.Particles)
        RS.Particles.emitSpriteExplosion(
          this.x + part.x,
          this.y + part.y,
          'big',
          0,
          0,
        );
      if (RS.Audio) RS.Audio.playBigExplosion();
    }
    return true;
  },

  render: function (ctx) {
    if (!this.active) return;

    var coreSprite = RS.Sprites ? RS.Sprites.get('boss_core') : null;
    if (coreSprite) {
      ctx.imageSmoothingEnabled = false;
      if (this.dead && this.deathTimer % 4 < 2) {
        if (!this._deathCanvas) {
          this._deathCanvas = document.createElement('canvas');
          this._deathCanvas.width = this.width;
          this._deathCanvas.height = this.height;
        }
        var dCtx = this._deathCanvas.getContext('2d');
        dCtx.clearRect(0, 0, this.width, this.height);
        dCtx.imageSmoothingEnabled = false;
        dCtx.drawImage(coreSprite, 0, 0, this.width, this.height);
        dCtx.globalCompositeOperation = 'source-atop';
        dCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        dCtx.fillRect(0, 0, this.width, this.height);
        dCtx.globalCompositeOperation = 'source-over';
        ctx.drawImage(
          this._deathCanvas,
          this.x - this.width / 2,
          this.y - this.height / 2,
        );
      } else {
        ctx.drawImage(
          coreSprite,
          this.x - this.width / 2,
          this.y - this.height / 2,
          this.width,
          this.height,
        );
      }
    }

    var eyeFrames = RS.Sprites.sheets['bosseyes'];
    for (var i = 0; i < this.eyes.length; i++) {
      var eye = this.eyes[i];
      if (!eye.alive) continue;
      var ex = this.x + eye.x;
      var ey = this.y + eye.y;

      var eyeSprite = null;
      if (eyeFrames && eyeFrames.length > 0) {
        if (eye.open) {
          var openIdx =
            Math.floor(this.moveTimer / 6) % Math.min(6, eyeFrames.length);
          eyeSprite = eyeFrames[openIdx];
        } else {
          var closedIdx = Math.min(eyeFrames.length - 1, 12);
          eyeSprite = eyeFrames[closedIdx];
        }
      }

      if (eyeSprite) {
        ctx.imageSmoothingEnabled = false;
        if (eye.hitFlashTimer > 0) {
          if (!this._eyeFlashCanvas) {
            this._eyeFlashCanvas = document.createElement('canvas');
            this._eyeFlashCanvas.width = 40;
            this._eyeFlashCanvas.height = 40;
          }
          var eCtx = this._eyeFlashCanvas.getContext('2d');
          eCtx.clearRect(0, 0, 40, 40);
          eCtx.imageSmoothingEnabled = false;
          eCtx.drawImage(eyeSprite, 0, 0, 40, 40);
          eCtx.globalCompositeOperation = 'source-atop';
          eCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          eCtx.fillRect(0, 0, 40, 40);
          eCtx.globalCompositeOperation = 'source-over';
          ctx.drawImage(this._eyeFlashCanvas, ex - 20, ey - 20);
        } else {
          ctx.drawImage(eyeSprite, ex - 20, ey - 20, 40, 40);
        }
      }
    }
  },

  getHittableParts: function () {
    var parts = [];
    for (var i = 0; i < this.eyes.length; i++) {
      var eye = this.eyes[i];
      if (eye.alive && eye.open) {
        parts.push({
          x: this.x + eye.x,
          y: this.y + eye.y,
          radius: eye.hitRadius,
          part: eye,
        });
      }
    }
    if (this.mouth.exposed && this.mouth.alive) {
      parts.push({
        x: this.x + this.mouth.x,
        y: this.y + this.mouth.y,
        radius: this.mouth.hitRadius,
        part: this.mouth,
      });
    }
    return parts;
  },

  getBounds: function () {
    return {x: this.x, y: this.y, radius: this.hitRadius};
  },

  isActive: function () {
    return this.active;
  },
  isDead: function () {
    return this.dead && !this.active;
  },
};
