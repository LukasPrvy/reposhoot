var RS = RS || {};

RS.Weapons = {
  fireTimer: 0,
  bullets: [],
  sideFireTimer: 0,
  rearFireTimer: 0,
  laserActive: false,
  laserBeams: [],

  init: function () {
    this.fireTimer = 0;
    this.bullets = [];
    this.sideFireTimer = 0;
    this.rearFireTimer = 0;
    this.laserActive = false;
    this.laserBeams = [];
  },

  // Weapon reverse direction
  reversed: false,

  getMainWeaponConfig: function () {
    var inv = RS.Player
      ? RS.Player.inventory
      : {mainWeapon: 'missile', missileTier: 0, homingTier: 0, laserTier: 0};
    var type = inv.mainWeapon;

    // Original values ×1.25 scale for 800x600
    if (type === 'missile') {
      var tier = inv.missileTier || 0;
      return {
        name: 'Missile',
        fireRate: [15, 12, 10][tier], // autofire frames (original: 15)
        damage: [1, 2, 3][tier],
        bulletSpeed: 12.5, // original 10 * 1.25
        bulletCount: [1, 2, 3][tier],
        spread: [0, 6, 10][tier],
        spriteKey: 'bullet_playerSingle',
        tier: tier,
      };
    } else if (type === 'homing') {
      var tier = inv.homingTier || 0;
      return {
        name: 'Homing',
        fireRate: [15, 12, 10][tier], // startup frames
        damage: [1, 2, 3][tier],
        bulletSpeed: 6.25, // original 5 * 1.25
        bulletCount: [1, 1, 2][tier],
        spread: [0, 0, 10][tier],
        spriteKey: 'bullet_homing',
        isHoming: true,
        turnRate: [10, 10, 10][tier], // 10 degrees/frame (original)
        tier: tier,
      };
    } else if (type === 'laser') {
      var tier = inv.laserTier || 0;
      // Original: solid rect with one random color channel per frame
      var colorFns = [
        function () {
          var f = Math.floor(Math.random() * 256);
          return 'rgb(0,' + f + ',255)';
        },
        function () {
          var f = Math.floor(Math.random() * 256);
          return 'rgb(' + f + ',255,0)';
        },
        function () {
          var f = Math.floor(Math.random() * 256);
          return 'rgb(255,0,' + f + ')';
        },
      ];
      return {
        name: 'Laser',
        damage: [2, 4, 6][tier],
        beamWidth: 2,
        beamCount: [1, 1, 2][tier],
        beamSpread: [0, 0, 8][tier],
        beamColor: colorFns[tier],
        beamMaxLength: 320, // original 256 * 1.25
        isLaser: true,
        isContinuousLaser: true,
        tier: tier,
      };
    }

    return {
      name: 'Missile',
      fireRate: 15,
      damage: 1,
      bulletSpeed: 12.5,
      bulletCount: 1,
      spread: 0,
      spriteKey: 'bullet_playerSingle',
      tier: 0,
    };
  },

  update: function (enemies) {
    if (this.fireTimer > 0) this.fireTimer--;
    if (this.sideFireTimer > 0) this.sideFireTimer--;
    if (this.rearFireTimer > 0) this.rearFireTimer--;

    var weapon = this.getMainWeaponConfig();

    if (weapon.isContinuousLaser) {
      this.laserActive = false;
      if (RS.Player.alive) {
        var fireInput = false;
        if (RS.Input) {
          if (RS.Input.isDown(' ') || RS.Input.isMouseDown()) fireInput = true;
        }
        if (fireInput) {
          this.laserActive = true;
          this.updateLaserBeams(weapon);
        } else {
          this.laserBeams = [];
        }
      } else {
        this.laserBeams = [];
      }
    } else {
      this.laserActive = false;
      this.laserBeams = [];
    }

    if (!weapon.isContinuousLaser) {
      if (RS.Player.alive && this.fireTimer <= 0) {
        var fireInput = false;
        if (RS.Input) {
          if (RS.Input.isDown(' ')) fireInput = true;
          if (RS.Input.isMouseDown()) fireInput = true;
        }

        if (fireInput) {
          this.fireMain(weapon);
          this.fireTimer = weapon.fireRate;

          if (RS.Companions && RS.Companions.list) {
            for (var ci = 0; ci < RS.Companions.list.length; ci++) {
              var comp = RS.Companions.list[ci];
              if (comp.active) {
                this.fireCompanion(comp);
              }
            }
          }

          var inv = RS.Player ? RS.Player.inventory : {};
          if (inv.sideShot && this.sideFireTimer <= 0) {
            this.fireSide();
            this.sideFireTimer = 12;
          }
          if (inv.rearShot && this.rearFireTimer <= 0) {
            this.fireRear();
            this.rearFireTimer = 15;
          }

          if (RS.Audio) {
            if (weapon.isHoming) RS.Audio.playFireHoming();
            else RS.Audio.playLaser();
          }
        }
      }
    } else if (weapon.isContinuousLaser && this.laserActive) {
      var fireInput2 =
        RS.Input && (RS.Input.isDown(' ') || RS.Input.isMouseDown());
      if (fireInput2) {
        if (RS.Companions && RS.Companions.list) {
          for (var ci = 0; ci < RS.Companions.list.length; ci++) {
            var comp = RS.Companions.list[ci];
            if (comp.active && this.fireTimer <= 0) {
              this.fireCompanion(comp);
            }
          }
          if (this.fireTimer <= 0) this.fireTimer = 15;
        }
        var inv2 = RS.Player ? RS.Player.inventory : {};
        if (inv2.sideShot && this.sideFireTimer <= 0) {
          this.fireSide();
          this.sideFireTimer = 12;
        }
        if (inv2.rearShot && this.rearFireTimer <= 0) {
          this.fireRear();
          this.rearFireTimer = 15;
        }
        if (RS.Audio && RS.Audio.playFireLaser) RS.Audio.playFireLaser();
      }
    }

    for (var i = 0; i < this.bullets.length; i++) {
      var b = this.bullets[i];
      if (!b.active) continue;

      if (b.isHoming && RS.Enemies) {
        var nearest = this.findNearestEnemy(b.x, b.y);
        if (nearest) {
          var tdx = nearest.x - b.x;
          var tdy = nearest.y - b.y;
          var targetAngle = Math.atan2(tdy, tdx);
          var currentAngle = Math.atan2(b.vy, b.vx);
          var angleDiff = targetAngle - currentAngle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          var maxTurn = ((b.turnRate || 2.5) * Math.PI) / 180;
          if (angleDiff > maxTurn) angleDiff = maxTurn;
          if (angleDiff < -maxTurn) angleDiff = -maxTurn;
          var newAngle = currentAngle + angleDiff;
          var spd = b.homingSpeed || 6;
          b.vx = Math.cos(newAngle) * spd;
          b.vy = Math.sin(newAngle) * spd;
        }
      }

      b.x += b.vx;
      b.y += b.vy;

      if (
        b.y < -20 ||
        b.y > RS.GAME_HEIGHT + 20 ||
        b.x < -20 ||
        b.x > RS.GAME_WIDTH + 20
      ) {
        b.active = false;
      }
    }

    this.bullets = this.bullets.filter(function (b) {
      return b.active;
    });
  },

  findNearestEnemy: function (x, y) {
    var nearest = null;
    var nearDist = Infinity;
    if (RS.Enemies && RS.Enemies.list) {
      for (var i = 0; i < RS.Enemies.list.length; i++) {
        var e = RS.Enemies.list[i];
        if (!e.active) continue;
        var d = RS.distance(x, y, e.x, e.y);
        if (d < nearDist) {
          nearDist = d;
          nearest = e;
        }
      }
    }
    if (RS.Enemies && RS.Enemies.bullets) {
      for (var j = 0; j < RS.Enemies.bullets.length; j++) {
        var eb = RS.Enemies.bullets[j];
        if (!eb.active) continue;
        if (!eb.isSpore) continue;
        var ed = RS.distance(x, y, eb.x, eb.y);
        if (ed < nearDist) {
          nearDist = ed;
          nearest = eb;
        }
      }
    }
    if (RS.Boss && RS.Boss.active && !RS.Boss.dead) {
      var bd = RS.distance(x, y, RS.Boss.x, RS.Boss.y);
      if (bd < nearDist) {
        nearest = {x: RS.Boss.x, y: RS.Boss.y};
      }
    }
    return nearest;
  },

  updateLaserBeams: function (weapon) {
    var px = RS.Player.x;
    var py = RS.Player.y;
    this.laserBeams = [];

    var count = weapon.beamCount;
    var spread = weapon.beamSpread;

    for (var i = 0; i < count; i++) {
      var offsetX = 0;
      if (count === 2) {
        offsetX = i === 0 ? -spread : spread;
      }
      this.laserBeams.push({
        x: px + offsetX,
        y: py,
        width: weapon.beamWidth,
        damage: weapon.damage,
        color: weapon.beamColor,
        hitY: 0,
      });
    }
  },

  createBullet: function (x, y, vx, vy, damage, spriteKey, isLaser) {
    var b = {
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      damage: damage,
      speed: Math.sqrt(vx * vx + vy * vy),
      active: true,
      spriteKey: spriteKey,
      hitRadius: isLaser ? 6 : 4,
      width: isLaser ? 6 : 4,
      height: isLaser ? 40 : 12,
    };
    this.bullets.push(b);
    return b;
  },

  fireMain: function (weapon) {
    var px = RS.Player.x;
    var py = RS.Player.y;
    var speed = weapon.bulletSpeed;
    var dmg = weapon.damage;
    var key = weapon.spriteKey;
    // direction multiplier (1 = up, -1 = down)
    var dir = this.reversed ? 1 : -1;

    if (weapon.isHoming) {
      var turnRate = weapon.turnRate || 10;
      if (weapon.bulletCount === 1) {
        var b = this.createBullet(px, py, 0, dir * speed, dmg, key, false);
        b.isHoming = true;
        b.homingSpeed = speed;
        b.turnRate = turnRate;
      } else if (weapon.bulletCount >= 2) {
        var b1 = this.createBullet(
          px - weapon.spread,
          py,
          0,
          dir * speed,
          dmg,
          key,
          false,
        );
        b1.isHoming = true;
        b1.homingSpeed = speed;
        b1.turnRate = turnRate;
        var b2 = this.createBullet(
          px + weapon.spread,
          py,
          0,
          dir * speed,
          dmg,
          key,
          false,
        );
        b2.isHoming = true;
        b2.homingSpeed = speed;
        b2.turnRate = turnRate;
      }
    } else {
      if (weapon.bulletCount === 1) {
        this.createBullet(px, py, 0, dir * speed, dmg, key, false);
      } else if (weapon.bulletCount === 2) {
        this.createBullet(
          px - weapon.spread,
          py,
          0,
          dir * speed,
          dmg,
          key,
          false,
        );
        this.createBullet(
          px + weapon.spread,
          py,
          0,
          dir * speed,
          dmg,
          key,
          false,
        );
      } else if (weapon.bulletCount === 3) {
        this.createBullet(px, py, 0, dir * speed, dmg, key, false);
        this.createBullet(
          px - weapon.spread,
          py,
          0,
          dir * speed,
          dmg,
          key,
          false,
        );
        this.createBullet(
          px + weapon.spread,
          py,
          0,
          dir * speed,
          dmg,
          key,
          false,
        );
      }
    }
  },

  fireCompanion: function (comp) {
    var weapon = this.getMainWeaponConfig();
    var speed = weapon.bulletSpeed || 13.75;
    var dmg = weapon.damage || 1;
    var key = weapon.spriteKey || 'bullet_playerSingle';

    if (weapon.isHoming) {
      var b = this.createBullet(comp.x, comp.y, 0, -speed, dmg, key, false);
      b.isHoming = true;
      b.homingSpeed = speed;
      b.turnRate = weapon.turnRate || 2.5;
    } else {
      this.createBullet(comp.x, comp.y, 0, -speed, dmg, key, false);
    }
  },

  fireSide: function () {
    var px = RS.Player.x;
    var py = RS.Player.y;
    this.createBullet(px, py, -8, 0, 1, 'bullet_playerSpread', false);
    this.createBullet(px, py, 8, 0, 1, 'bullet_playerSpread', false);
  },

  fireRear: function () {
    var px = RS.Player.x;
    var py = RS.Player.y;
    this.createBullet(px, py, 0, 8, 0.8, 'bullet_playerSingle', false);
  },

  getCurrentWeaponName: function () {
    var config = this.getMainWeaponConfig();
    return config.name + ' T' + config.tier;
  },

  render: function (ctx) {
    // Simple 2px solid colored rect (no glow, no inner line)
    if (this.laserActive && this.laserBeams.length > 0) {
      for (var li = 0; li < this.laserBeams.length; li++) {
        var beam = this.laserBeams[li];
        var beamColor =
          typeof beam.color === 'function' ? beam.color() : beam.color;
        ctx.fillStyle = beamColor;
        var hitY = beam.hitY || 0;
        ctx.fillRect(beam.x - beam.width / 2, hitY, beam.width, beam.y - hitY);
      }
    }

    for (var i = 0; i < this.bullets.length; i++) {
      var b = this.bullets[i];
      if (!b.active) continue;

      // Increment animTimer for sprite-based rendering
      if (b._animTimer === undefined) b._animTimer = 0;
      b._animTimer++;

      if (b.isHoming) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
        // Try homing missile sprite sheet first
        var hmFrame = RS.Sprites.getAnimFrame('hmissile', b._animTimer, 10);
        if (hmFrame) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(hmFrame, -10, -10, 20, 20);
        }
        ctx.restore();
      } else {
        // Try missile sprite sheet for non-homing bullets
        var missileFrame = RS.Sprites.getAnimFrame('missile', b._animTimer, 12);
        if (missileFrame && b.spriteKey && b.spriteKey.indexOf('player') >= 0) {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(missileFrame, -10, -10, 20, 20);
          ctx.restore();
        } else {
          var sprite2 = RS.Sprites ? RS.Sprites.get(b.spriteKey) : null;
          if (sprite2) {
            ctx.drawImage(sprite2, b.x - b.width / 2, b.y - b.height / 2);
          }
        }
      }
    }
  },

  clear: function () {
    this.bullets = [];
    this.laserBeams = [];
    this.laserActive = false;
  },
};
