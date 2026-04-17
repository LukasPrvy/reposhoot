var RS = RS || {};

RS.Player = {
  x: 400,
  y: 750,
  width: 80,
  height: 80,
  hitRadius: 24,
  vx: 0,
  vy: 0,
  bankLevel: 0,

  shield: 125,
  maxShield: 125,
  alive: true,
  invincible: false,
  invincibleTimer: 0,
  invincibleDuration: 60,
  blinkTimer: 0,

  lives: 3,
  maxLives: 10,
  score: 0,
  frameCount: 0,

  cloakActive: false,
  cloakTimer: 0,
  godMode: false,

  inventory: {
    mainWeapon: 'missile',
    missileTier: 0,
    laserTier: 0,
    homingTier: 0,
    speedTier: 0,
    sideShot: false,
    rearShot: false,
    companionCount: 0,
  },

  _nextMilestoneIndex: 0,
  _milestones: [50000, 100000, 200000, 500000],

  init: function () {
    this.x = RS.GAME_WIDTH / 2;
    this.y = RS.GAME_HEIGHT - 100;
    this.width = 80;
    this.height = 80;
    this.hitRadius = 24;
    this.vx = 0;
    this.vy = 0;
    this.bankLevel = 0;
    this.shield = 100;
    this.maxShield = 100;
    this.alive = true;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.blinkTimer = 0;
    this.lives = 3;
    this.score = 0;
    this.frameCount = 0;
    this.cloakActive = false;
    this.cloakTimer = 0;
    this._shieldFlashTimer = 0;
    this._nextMilestoneIndex = 0;
    this.inventory = {
      mainWeapon: 'missile',
      missileTier: 0,
      laserTier: 0,
      homingTier: 0,
      speedTier: 0,
      sideShot: false,
      rearShot: false,
      companionCount: 0,
    };
  },

  update: function () {
    if (!this.alive) return;
    this.frameCount++;

    var dx = 0,
      dy = 0;
    if (RS.Input.isDown('w') || RS.Input.isDown('arrowup')) dy = -1;
    if (RS.Input.isDown('s') || RS.Input.isDown('arrowdown')) dy = 1;
    if (RS.Input.isDown('a') || RS.Input.isDown('arrowleft')) dx = -1;
    if (
      (!RS._cheatInProgress && RS.Input.isDown('d')) ||
      RS.Input.isDown('arrowright')
    )
      dx = 1;

    // Banking: 7 sprite frames map to bankLevel -3 to +3
    if (dx < 0) {
      this.bankLevel += (-3 - this.bankLevel) * 0.15;
    } else if (dx > 0) {
      this.bankLevel += (3 - this.bankLevel) * 0.15;
    } else {
      this.bankLevel += (0 - this.bankLevel) * 0.08;
    }
    this.bankLevel = RS.clamp(this.bankLevel, -3, 3);

    // Speed tiers: BAD, NORMAL, GOOD
    var speedConfigs = [
      {thrust: 1.25, damp: 0.9, maxV: 3.75},
      {thrust: 1.875, damp: 0.92, maxV: 5.0},
      {thrust: 2.5, damp: 0.94, maxV: 7.5},
    ];
    var tier = this.inventory.speedTier || 0;
    var thrust = speedConfigs[tier].thrust;
    var maxV = speedConfigs[tier].maxV;
    var damping = speedConfigs[tier].damp;

    if (dx !== 0 || dy !== 0) {
      // Normalize diagonal input
      var len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
      // Direct thrust - instant response
      this.vx += dx * thrust;
      this.vy += dy * thrust;
    } else {
      // No input: apply damping to decelerate smoothly
      this.vx *= damping;
      this.vy *= damping;
      // Kill tiny velocities
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
      if (Math.abs(this.vy) < 0.1) this.vy = 0;
    }

    // Clamp to max speed
    var vMag = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (vMag > maxV) {
      this.vx = (this.vx / vMag) * maxV;
      this.vy = (this.vy / vMag) * maxV;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.y = RS.clamp(this.y, 50, RS.GAME_HEIGHT - 50);
    this.x = RS.clamp(this.x, 20, RS.GAME_WIDTH - 20);

    if (this.invincible) {
      this.invincibleTimer--;
      if (this.invincibleTimer <= 0) this.invincible = false;
      this.blinkTimer++;
    }

    if (this.cloakActive) {
      this.cloakTimer--;
      if (this.cloakTimer <= 0) this.cloakActive = false;
    }

    if (this._shieldFlashTimer > 0) this._shieldFlashTimer--;

    // Thrust particles
    if (this.frameCount % 2 === 0) {
      RS.Particles.emitThrust(this.x, this.y + this.height / 2);
    }
  },

  render: function (ctx) {
    if (!this.alive) return;

    if (this.invincible && !this.cloakActive && this.blinkTimer % 6 < 3) return;

    ctx.save();

    // Cloak visual
    if (this.cloakActive) {
      var cloakAlpha = 0.1 + Math.random() * 0.3;
      if (this.cloakTimer < 60) {
        cloakAlpha = this.cloakTimer % 10 < 5 ? 0.6 : 0.1;
      }
      ctx.globalAlpha = cloakAlpha;
    }

    var S = RS.SCALE || 1.25;
    var renderW = 64 * S;
    var renderH = 64 * S;

    // Engine jet behind ship
    var jetFrame = RS.Sprites.getFrame('playerjet', 0);
    if (jetFrame) {
      var jetW = 16 * S;
      var jetH = 32 * S;
      ctx.drawImage(
        jetFrame,
        this.x - jetW / 2,
        this.y + renderH / 2 - 10,
        jetW,
        jetH,
      );
    }

    // Main ship sprite
    var sprite = null;
    if (this.cloakActive) {
      var cloakFrames = RS.Sprites.sheets['ship2_cloak'];
      if (cloakFrames && cloakFrames.length > 0) {
        sprite = cloakFrames[0];
      }
    }

    if (!sprite) {
      sprite = RS.Sprites.getPlayerBank(this.bankLevel);
    }

    if (sprite) {
      ctx.imageSmoothingEnabled = false;
      if (this.godMode) {
        // God mode - draw ship + golden tint
        if (!this._godCanvas) {
          this._godCanvas = document.createElement('canvas');
        }
        var gc = this._godCanvas;
        gc.width = renderW;
        gc.height = renderH;
        var gctx = gc.getContext('2d');
        gctx.clearRect(0, 0, renderW, renderH);
        gctx.imageSmoothingEnabled = false;
        gctx.drawImage(sprite, 0, 0, renderW, renderH);
        gctx.globalCompositeOperation = 'source-atop';
        gctx.globalAlpha = 0.25 + 0.1 * Math.sin(this.frameCount * 0.1);
        gctx.fillStyle = '#ffd700';
        gctx.fillRect(0, 0, renderW, renderH);
        gctx.globalCompositeOperation = 'source-over';
        gctx.globalAlpha = 1;
        ctx.drawImage(gc, this.x - renderW / 2, this.y - renderH / 2);
      } else {
        ctx.drawImage(
          sprite,
          this.x - renderW / 2,
          this.y - renderH / 2,
          renderW,
          renderH,
        );
      }
    }

    ctx.restore();
  },

  hit: function (damage) {
    if (this.godMode) return;
    if (this.invincible) return;

    this.shield -= damage || 25;
    this._shieldFlashTimer = 20;
    if (RS.Audio && RS.Audio.playShieldHit) RS.Audio.playShieldHit();

    this.invincible = true;
    this.invincibleTimer = this.invincibleDuration;

    if (this.shield <= 0) {
      this.shield = 0;
      if (this.lives > 0) {
        this.lives--;
        this.respawn();
      } else {
        this.alive = false;
        if (RS.Particles)
          RS.Particles.emitSpriteExplosion(this.x, this.y, 'big', 0, 0);
        if (RS.Audio && RS.Audio.playPlayerDestroyed)
          RS.Audio.playPlayerDestroyed();
      }
    }
  },

  respawn: function () {
    this.shield = this.maxShield;
    this.x = RS.GAME_WIDTH / 2;
    this.y = RS.GAME_HEIGHT - 100;
    this.vx = 0;
    this.vy = 0;
    this.invincible = true;
    this.invincibleTimer = 180;
    this.alive = true;
    this.bankLevel = 0;
    if (RS.Audio && RS.Audio.playPlayerCreated) RS.Audio.playPlayerCreated();
    if (RS.Enemies) RS.Enemies.bullets = [];
  },

  addScore: function (amount) {
    if (this.godMode) return;
    this.score = Math.round(this.score + amount);
    while (
      this._nextMilestoneIndex < this._milestones.length &&
      this.score >= this._milestones[this._nextMilestoneIndex]
    ) {
      this._nextMilestoneIndex++;
      if (this.lives < this.maxLives) {
        this.lives++;
        if (RS.UI && RS.UI.addFloatingText) {
          RS.UI.addFloatingText(this.x, this.y - 30, 'EXTRA LIFE!', '#66bb6a');
        }
        if (RS.Audio && RS.Audio.playPowerup) RS.Audio.playPowerup();
      }
    }
  },

  collectPowerup: function (type) {
    if (RS.Audio && RS.Audio.playPowerup) RS.Audio.playPowerup();
    // All pickups worth 5 points (KillBonus: 500 / 100)
    this.addScore(5);

    var inv = this.inventory;
    var label = '';

    switch (type) {
      case 'missile':
        if (inv.mainWeapon === 'missile') {
          if (inv.missileTier >= 2) {
            label = 'WEAPON FULL';
          } else {
            inv.missileTier = Math.min(inv.missileTier + 1, 2);
            label = 'WEAPON UP';
          }
        } else {
          inv.mainWeapon = 'missile';
          label = 'WEAPON UP';
        }
        break;
      case 'laser':
        if (inv.mainWeapon === 'laser') {
          if (inv.laserTier >= 2) {
            label = 'WEAPON FULL';
          } else {
            inv.laserTier = Math.min(inv.laserTier + 1, 2);
            label = 'LASER';
          }
        } else {
          inv.mainWeapon = 'laser';
          label = 'LASER';
        }
        break;
      case 'homing':
        if (inv.mainWeapon === 'homing') {
          if (inv.homingTier >= 2) {
            label = 'WEAPON FULL';
          } else {
            inv.homingTier = Math.min(inv.homingTier + 1, 2);
            label = 'HOMING MISSILE';
          }
        } else {
          inv.mainWeapon = 'homing';
          label = 'HOMING MISSILE';
        }
        break;
      case 'weaponUpgrade':
        var tierKey = inv.mainWeapon + 'Tier';
        if ((inv[tierKey] || 0) >= 2) {
          label = 'WEAPON FULL';
        } else {
          inv[tierKey] = Math.min((inv[tierKey] || 0) + 1, 2);
          label = 'WEAPON UP';
        }
        break;
      case 'clone':
        if (RS.Companions) RS.Companions.add();
        label = 'CLONE';
        break;
      case 'wingtip':
        if (!inv.sideShot) {
          inv.sideShot = true;
        } else if (!inv.rearShot) {
          inv.rearShot = true;
        }
        label = 'WINGTIP';
        break;
      case 'shield':
        this.shield = Math.min(this.shield + 50, this.maxShield);
        label = 'SHIELD UP';
        break;
      case 'speed':
        inv.speedTier = Math.min((inv.speedTier || 0) + 1, 2);
        label = 'SPEED UP';
        break;
      case 'cloak':
        this.cloakActive = true;
        this.cloakTimer = 300;
        label = 'CLOAK';
        break;
      case 'score':
        this.addScore(1000);
        label = 'BONUS';
        break;
      case 'life':
        if (this.lives < this.maxLives) {
          this.lives++;
        }
        label = 'EXTRA LIFE';
        break;
    }

    // Spawn pickup label
    if (label && RS.UI && RS.UI.addLabel) {
      RS.UI.addLabel(this.x, this.y - 20, label);
    }
  },

  getBounds: function () {
    return {x: this.x, y: this.y, radius: this.hitRadius};
  },
};
