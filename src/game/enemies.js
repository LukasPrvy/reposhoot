var RS = RS || {};

RS.Enemies = {
  list: [],
  bullets: [],
  S: 1.25,
  // Explosion sizes: 'small'=16px, 'medium'=32px, 'big'=64px
  TYPES: {
    drone: {
      hp: 1,
      speed: 0.75,
      scoreValue: 0.3,
      hitRadius: 10,
      sheetKey: 'drone',
      renderW: 40,
      renderH: 40,
      dropRate: 0.1,
      animFps: 10,
      explodeSize: 'small',
    },
    rusher: {
      hp: 5,
      speed: 3.5,
      scoreValue: 1,
      hitRadius: 16,
      sheetKey: 'rusher',
      renderW: 80,
      renderH: 40,
      dropRate: 0.15,
      animFps: 12,
      explodeSize: 'medium',
    },
    rusherReverse: {
      hp: 5,
      speed: 4.0,
      scoreValue: 1,
      hitRadius: 16,
      sheetKey: 'rusher',
      renderW: 80,
      renderH: 40,
      dropRate: 0.15,
      animFps: 12,
      explodeSize: 'medium',
    },
    rusherLeft: {
      hp: 5,
      speed: 3.5,
      scoreValue: 1,
      hitRadius: 16,
      sheetKey: 'rusher',
      renderW: 40,
      renderH: 80,
      dropRate: 0.15,
      animFps: 12,
      explodeSize: 'medium',
    },
    rusherRight: {
      hp: 5,
      speed: 3.5,
      scoreValue: 1,
      hitRadius: 16,
      sheetKey: 'rusher',
      renderW: 40,
      renderH: 80,
      dropRate: 0.15,
      animFps: 12,
      explodeSize: 'medium',
    },
    loner: {
      hp: 3,
      speed: 0.8,
      scoreValue: 1.5,
      hitRadius: 20,
      sheetKey: 'lonerA',
      renderW: 80,
      renderH: 80,
      dropRate: 0.25,
      animFps: 10,
      explodeSize: 'medium',
    },
    homer: {
      hp: 5,
      speed: 0.6,
      scoreValue: 5,
      hitRadius: 20,
      sheetKey: 'homer',
      renderW: 80,
      renderH: 80,
      dropRate: 0.2,
      animFps: 10,
      explodeSize: 'medium',
    },
    pod: {
      hp: 10,
      speed: 0.8,
      scoreValue: 2,
      hitRadius: 30,
      sheetKey: 'pod',
      renderW: 120,
      renderH: 120,
      dropRate: 0.2,
      animFps: 8,
      explodeSize: 'big',
    },
    wallhugger: {
      hp: 5,
      speed: 0,
      scoreValue: 3,
      hitRadius: 20,
      sheetKey: 'wallhugger',
      renderW: 80,
      renderH: 80,
      dropRate: 0.3,
      animFps: 8,
      explodeSize: 'medium',
    },
    droneGenerator: {
      hp: 8,
      speed: 0,
      scoreValue: 4,
      hitRadius: 16,
      sheetKey: 'drone',
      renderW: 40,
      renderH: 40,
      dropRate: 0.35,
      animFps: 6,
      explodeSize: 'medium',
    },
    rusherGenerator: {
      hp: 6,
      speed: 0,
      scoreValue: 3.5,
      hitRadius: 16,
      sheetKey: 'rusher',
      renderW: 80,
      renderH: 40,
      dropRate: 0.3,
      animFps: 6,
      explodeSize: 'medium',
    },
    organicGun: {
      hp: 5,
      speed: 0,
      scoreValue: 3,
      hitRadius: 12,
      sheetKey: 'organicgun',
      renderW: 80,
      renderH: 80,
      dropRate: 0.2,
      animFps: 10,
      explodeSize: 'medium',
    },
    asteroidBig: {
      hp: 3,
      speed: 1.0,
      scoreValue: 1.5,
      hitRadius: 50,
      sheetKey: 'asteroid_big',
      renderW: 120,
      renderH: 120,
      dropRate: 0.05,
      animFps: 0,
      explodeSize: 'big',
    },
    asteroidMed: {
      hp: 2,
      speed: 1.5,
      scoreValue: 1,
      hitRadius: 30,
      sheetKey: 'asteroid_med',
      renderW: 80,
      renderH: 80,
      dropRate: 0.03,
      animFps: 0,
      explodeSize: 'medium',
    },
    asteroidSmall: {
      hp: 1,
      speed: 2.0,
      scoreValue: 0.5,
      hitRadius: 15,
      sheetKey: 'asteroid_small',
      renderW: 40,
      renderH: 40,
      dropRate: 0.01,
      animFps: 0,
      explodeSize: 'small',
    },
    // Standard density asteroids
    sasterBig: {
      hp: 3,
      speed: 1.0,
      scoreValue: 1.5,
      hitRadius: 50,
      sheetKey: 'saster_big',
      renderW: 120,
      renderH: 120,
      dropRate: 0.05,
      animFps: 0,
      explodeSize: 'big',
    },
    sasterMed: {
      hp: 2,
      speed: 1.5,
      scoreValue: 1,
      hitRadius: 30,
      sheetKey: 'saster_med',
      renderW: 80,
      renderH: 80,
      dropRate: 0.03,
      animFps: 0,
      explodeSize: 'medium',
    },
    sasterSmall: {
      hp: 1,
      speed: 2.0,
      scoreValue: 0.5,
      hitRadius: 15,
      sheetKey: 'saster_small',
      renderW: 40,
      renderH: 40,
      dropRate: 0.01,
      animFps: 0,
      explodeSize: 'small',
    },
    // Indestructible asteroids (MAster sprites)
    masterBig: {
      hp: 9999,
      speed: 1.0,
      scoreValue: 0,
      hitRadius: 50,
      sheetKey: 'master_big',
      renderW: 120,
      renderH: 120,
      dropRate: 0,
      animFps: 0,
      explodeSize: 'big',
    },
    masterMed: {
      hp: 9999,
      speed: 1.5,
      scoreValue: 0,
      hitRadius: 30,
      sheetKey: 'master_med',
      renderW: 80,
      renderH: 80,
      dropRate: 0,
      animFps: 0,
      explodeSize: 'medium',
    },
    masterSmall: {
      hp: 9999,
      speed: 2.0,
      scoreValue: 0,
      hitRadius: 15,
      sheetKey: 'master_small',
      renderW: 40,
      renderH: 40,
      dropRate: 0,
      animFps: 0,
      explodeSize: 'small',
    },
    rusherGenReverse: {
      hp: 999,
      speed: 0,
      scoreValue: 0,
      hitRadius: 1,
      sheetKey: null,
      renderW: 1,
      renderH: 1,
      dropRate: 0,
      animFps: 0,
      explodeSize: 'small',
    },
    rusherGenLeft: {
      hp: 999,
      speed: 0,
      scoreValue: 0,
      hitRadius: 1,
      sheetKey: null,
      renderW: 1,
      renderH: 1,
      dropRate: 0,
      animFps: 0,
      explodeSize: 'small',
    },
    rusherGenRight: {
      hp: 999,
      speed: 0,
      scoreValue: 0,
      hitRadius: 1,
      sheetKey: null,
      renderW: 1,
      renderH: 1,
      dropRate: 0,
      animFps: 0,
      explodeSize: 'small',
    },
  },

  init: function () {
    this.list = [];
    this.bullets = [];
  },

  spawn: function (type, x, y) {
    var config = this.TYPES[type];
    if (!config) return;

    var enemy = {
      type: type,
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      hp: config.hp,
      maxHp: config.hp,
      speed: config.speed,
      hitRadius: config.hitRadius,
      sheetKey: config.sheetKey,
      renderW: config.renderW,
      renderH: config.renderH,
      scoreValue: config.scoreValue,
      dropRate: config.dropRate,
      animFps: config.animFps,
      animTimer: 0,
      active: true,
      shootTimer: 30 + Math.random() * 90,
      moveTimer: 0,
      phase: 0,
      alpha: 1,
      reversed: false,
      spawnX: x,
      amplitude: 40,
      tier: 1,
      parked: false,
      burstTimer: 0,
      wallState: 'STILL',
      wallStateTimer: 80,
      wallDir: Math.random() < 0.5 ? -1 : 1,
      wallSide: null,
      wallTargetX: 0,
      spawnCooldown: 0,
      childCount: 0,
      driftY: 0,
      spinnerGrade: 0,
      asteroidVariant: Math.floor(Math.random() * 4),
      rotAngle: 0,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      explodeSize: config.explodeSize || 'medium',
      hitFlashTimer: 0,
    };

    // Initialize velocities for directional enemies
    if (type === 'rusherReverse') {
      enemy.vy = -enemy.speed;
    } else if (type === 'rusherLeft') {
      enemy.vx = -enemy.speed;
    } else if (type === 'rusherRight') {
      enemy.vx = enemy.speed;
    } else if (
      type.indexOf('asteroid') !== -1 ||
      type.indexOf('saster') !== -1 ||
      type.indexOf('master') !== -1
    ) {
      enemy.vy = enemy.speed;
      enemy.vx = (Math.random() - 0.5) * enemy.speed;
    }

    // Loner tier-based HP, score, and sheet (actors.ini: LonerA=3/150, LonerB=5/250, LonerC=8/400)
    if (type === 'loner') {
      if (enemy.tier === 1) {
        enemy.hp = 3;
        enemy.maxHp = 3;
        enemy.scoreValue = 1.5;
        enemy.sheetKey = 'lonerA';
      } else if (enemy.tier === 2) {
        enemy.hp = 5;
        enemy.maxHp = 5;
        enemy.scoreValue = 2.5;
        enemy.sheetKey = 'lonerB';
      } else if (enemy.tier === 3) {
        enemy.hp = 8;
        enemy.maxHp = 8;
        enemy.scoreValue = 4;
        enemy.sheetKey = 'lonerC';
      }
    }

    // Clamp spawn position to corridor
    var isAsteroidType =
      type.indexOf('asteroid') !== -1 ||
      type.indexOf('saster') !== -1 ||
      type.indexOf('master') !== -1;
    var skipClamp =
      type === 'wallhugger' ||
      type === 'organicGun' ||
      type === 'rusherReverse' ||
      type === 'rusherLeft' ||
      type === 'rusherRight' ||
      isAsteroidType ||
      type === 'rusherGenReverse' ||
      type === 'rusherGenLeft' ||
      type === 'rusherGenRight';
    if (!skipClamp) {
      var spawnBounds = this._getBounds(Math.max(0, y));
      var hr = enemy.hitRadius || 10;
      var minSpawnX = spawnBounds.left + hr;
      var maxSpawnX = spawnBounds.right - hr;
      if (minSpawnX < maxSpawnX) {
        enemy.x = Math.max(minSpawnX, Math.min(maxSpawnX, enemy.x));
      } else {
        enemy.x = (spawnBounds.left + spawnBounds.right) / 2;
      }
    }
    this.list.push(enemy);
    return enemy;
  },

  update: function () {
    for (var i = 0; i < this.list.length; i++) {
      var enemy = this.list[i];
      if (enemy.active) {
        enemy.animTimer++;
        if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer--;
        this.updateBehavior(enemy);
      }
    }

    for (var i = 0; i < this.bullets.length; i++) {
      var b = this.bullets[i];
      if (!b.active) continue;

      if (b.isSpinner) {
        b.spinAngle = (b.spinAngle || 0) + 0.2;
      }

      if (b.isSpore) {
        if (b.sporeDelay > 0) {
          b.sporeDelay--;
        } else {
          if (RS.Player && RS.Player.alive && !RS.Player.cloakActive) {
            var sdx = RS.Player.x - b.x;
            var sdy = RS.Player.y - b.y;
            var sdist = Math.sqrt(sdx * sdx + sdy * sdy);
            if (sdist > 0) {
              b.vx += (sdx / sdist) * 0.12;
              b.vy += (sdy / sdist) * 0.12;
              var sMag = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
              if (sMag > 1.2) {
                b.vx = (b.vx / sMag) * 1.2;
                b.vy = (b.vy / sMag) * 1.2;
              }
            }
          }
        }
        b.sporeLife--;
        if (b.sporeLife <= 0) {
          b.active = false;
          if (RS.Particles)
            RS.Particles.emitSpriteExplosion(b.x, b.y, 'small', 0, 0);
          if (RS.Particles) RS.Particles.playExplosionAudio('small');
          continue;
        }
      }

      if (b.isHomingMissile) {
        if (RS.Player && RS.Player.alive && !RS.Player.cloakActive) {
          var hdx = RS.Player.x - b.x;
          var hdy = RS.Player.y - b.y;
          var hdist = Math.sqrt(hdx * hdx + hdy * hdy);
          if (hdist > 0) {
            b.vx += (hdx / hdist) * 0.08;
            b.vy += (hdy / hdist) * 0.08;
            var hMag = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            if (hMag > 2.5) {
              b.vx = (b.vx / hMag) * 2.5;
              b.vy = (b.vy / hMag) * 2.5;
            }
          }
        }
        b.homingLife--;
        if (b.homingLife <= 0) {
          b.active = false;
          if (RS.Particles)
            RS.Particles.emitSpriteExplosion(b.x, b.y, 'small', b.vx, b.vy);
          if (RS.Particles) RS.Particles.playExplosionAudio('small');
          continue;
        }
      }

      b.x += b.vx;
      b.y += b.vy;
      if (
        b.y < -50 ||
        b.y > RS.GAME_HEIGHT + 50 ||
        b.x < -50 ||
        b.x > RS.GAME_WIDTH + 50
      ) {
        b.active = false;
      }
    }

    this.list = this.list.filter(function (e) {
      return e.active;
    });
    this.bullets = this.bullets.filter(function (b) {
      return b.active;
    });
  },

  _getBounds: function (y) {
    return RS.CodeEnv && RS.CodeEnv.loaded
      ? RS.CodeEnv.getCorridorBounds(y)
      : {left: RS.CORRIDOR_LEFT, right: RS.CORRIDOR_RIGHT};
  },

  _wallSteer: function (enemy, margin) {
    var b = this._getBounds(enemy.y);
    var hr = enemy.hitRadius || 10;
    var innerLeft = b.left + hr;
    var innerRight = b.right - hr;
    var center = (innerLeft + innerRight) / 2;
    var corridorWidth = innerRight - innerLeft;
    if (corridorWidth < 40) {
      return (center - enemy.x) * 0.1;
    }
    var accel = 0;
    var distLeft = enemy.x - innerLeft;
    var distRight = innerRight - enemy.x;
    if (distLeft < margin) {
      var t = 1 - Math.max(0, distLeft) / margin;
      accel += 0.3 * t;
    }
    if (distRight < margin) {
      var t = 1 - Math.max(0, distRight) / margin;
      accel -= 0.3 * t;
    }
    if (distLeft < 0) accel += 0.5;
    if (distRight < 0) accel -= 0.5;
    return accel;
  },

  _clampToCorridor: function (enemy) {
    var b = this._getBounds(enemy.y);
    var hr = enemy.hitRadius || 10;
    var minX = b.left + hr;
    var maxX = b.right - hr;
    if (minX > maxX) {
      enemy.x = (b.left + b.right) / 2;
      enemy.vx = 0;
      return;
    }
    if (enemy.x < minX) {
      enemy.x = minX;
      if (enemy.vx < 0) enemy.vx = 0;
    }
    if (enemy.x > maxX) {
      enemy.x = maxX;
      if (enemy.vx > 0) enemy.vx = 0;
    }
  },

  _countChildren: function (parentType) {
    var childType = parentType === 'droneGenerator' ? 'drone' : 'rusher';
    var count = 0;
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].active && this.list[i].type === childType) count++;
    }
    return count;
  },

  updateBehavior: function (enemy) {
    enemy.moveTimer++;
    enemy.shootTimer--;

    var playerAlive = RS.Player && RS.Player.alive;
    var cloaked = playerAlive && RS.Player.cloakActive;
    var targetX = playerAlive && !cloaked ? RS.Player.x : RS.GAME_WIDTH / 2;
    var targetY = playerAlive && !cloaked ? RS.Player.y : RS.GAME_HEIGHT;

    switch (enemy.type) {
      case 'rusher':
        if (!enemy.reversed) {
          enemy.y += enemy.speed;
          enemy.vx += (targetX - enemy.x) * 0.003;
          if (enemy.y > RS.GAME_HEIGHT * 0.6) {
            enemy.reversed = true;
            enemy.vx += (Math.random() - 0.5) * 2;
          }
        } else {
          enemy.y -= 5.5;
        }
        enemy.vx += this._wallSteer(enemy, 40);
        enemy.vx *= 0.85;
        enemy.x += enemy.vx;
        this._clampToCorridor(enemy);
        if (enemy.y > RS.GAME_HEIGHT + 30 || enemy.y < -30)
          enemy.active = false;
        break;

      case 'rusherReverse':
        enemy.y += enemy.vy;
        enemy.vx += (targetX - enemy.x) * 0.002;
        enemy.vx *= 0.9;
        enemy.x += enemy.vx;
        if (enemy.y < -50) enemy.active = false;
        break;

      case 'rusherLeft':
        enemy.x += enemy.vx;
        enemy.vy += (targetY - enemy.y) * 0.002;
        enemy.vy *= 0.9;
        enemy.y += enemy.vy;
        if (enemy.x < -50) enemy.active = false;
        break;

      case 'rusherRight':
        enemy.x += enemy.vx;
        enemy.vy += (targetY - enemy.y) * 0.002;
        enemy.vy *= 0.9;
        enemy.y += enemy.vy;
        if (enemy.x > RS.GAME_WIDTH + 50) enemy.active = false;
        break;

      case 'loner':
        if (!enemy.parked) {
          enemy.y += enemy.speed;
          if (enemy.y >= 180) {
            enemy.parked = true;
          }
        } else {
          enemy.vx += Math.sin(enemy.moveTimer * 0.015) * 0.15;
          enemy.y += 0.15;
        }
        enemy.vx += this._wallSteer(enemy, 35);
        enemy.vx *= 0.85;
        enemy.x += enemy.vx;
        this._clampToCorridor(enemy);

        if (enemy.parked && enemy.shootTimer <= 0) {
          if (enemy.tier >= 3) {
            this.shootSpinnerSpread(enemy, 3, RS.degToRad(30), 2);
            enemy.shootTimer = 60;
          } else if (enemy.tier >= 2) {
            this.shootSpinner(enemy, targetX - 10, targetY, 1);
            this.shootSpinner(enemy, targetX + 10, targetY, 1);
            enemy.shootTimer = 80;
          } else {
            this.shootSpinner(enemy, targetX, targetY, 0);
            enemy.shootTimer = 100;
          }
        }
        if (enemy.y > RS.GAME_HEIGHT + 40) enemy.active = false;
        break;

      case 'drone':
        var droneBounds = this._getBounds(enemy.y);
        var droneCenter = (droneBounds.left + droneBounds.right) / 2;
        enemy.spawnX += (droneCenter - enemy.spawnX) * 0.04;
        var corridorW = droneBounds.right - droneBounds.left;
        enemy.amplitude = RS.lerp(20, 40, Math.min(corridorW / 400, 1));
        var targetDroneX =
          enemy.spawnX + Math.sin(enemy.moveTimer * 0.06) * enemy.amplitude;
        enemy.vx += (targetDroneX - enemy.x) * 0.08;
        enemy.vx += this._wallSteer(enemy, 30);
        enemy.vx *= 0.85;
        enemy.x += enemy.vx;
        this._clampToCorridor(enemy);
        enemy.y += 0.75;
        if (enemy.y > RS.GAME_HEIGHT + 20) enemy.active = false;
        break;

      case 'homer':
        if (!cloaked) {
          enemy.vx += (targetX - enemy.x) * 0.03;
        }
        enemy.vx += this._wallSteer(enemy, 35);
        enemy.vx *= 0.9;
        var maxHomerVx = 3.75;
        if (enemy.vx > maxHomerVx) enemy.vx = maxHomerVx;
        if (enemy.vx < -maxHomerVx) enemy.vx = -maxHomerVx;
        enemy.x += enemy.vx;
        this._clampToCorridor(enemy);

        var homerYSpeed = 0.6;
        if (enemy.burstTimer > 0) {
          homerYSpeed = 1.5;
          enemy.burstTimer--;
        }
        enemy.y += homerYSpeed;

        if (enemy.shootTimer > 5) {
          enemy.alpha = Math.max(0.4, enemy.alpha - 0.02);
        }

        if (enemy.shootTimer <= 0) {
          this.shootSpinner(enemy, targetX, targetY, 0);
          enemy.shootTimer = 70;
          enemy.burstTimer = 15;
          enemy.alpha = 1.0;
        }
        if (enemy.y > RS.GAME_HEIGHT + 30) enemy.active = false;
        break;

      case 'pod':
        enemy.vx += (targetX - enemy.x) * 0.0125;
        enemy.vx += this._wallSteer(enemy, 30);
        enemy.vx *= 0.9;
        if (enemy.vx > 0.625) enemy.vx = 0.625;
        if (enemy.vx < -0.625) enemy.vx = -0.625;
        enemy.x += enemy.vx;
        this._clampToCorridor(enemy);
        enemy.y += 0.8;
        if (enemy.y > RS.GAME_HEIGHT + 30) enemy.active = false;
        break;

      case 'wallhugger':
        if (enemy.wallSide === null) {
          enemy.wallSide = enemy.x < RS.GAME_WIDTH / 2 ? 'left' : 'right';
          var whInit = this._getBounds(Math.max(0, enemy.y));
          enemy.wallTargetX =
            enemy.wallSide === 'left'
              ? whInit.left + enemy.renderW / 2
              : whInit.right - enemy.renderW / 2;
          enemy.x = enemy.wallTargetX;
          enemy.spawnScale = 0;
          enemy.alpha = 0;
        }
        // Scale + fade in
        if (enemy.spawnScale !== undefined && enemy.spawnScale < 1) {
          enemy.spawnScale = Math.min(1, enemy.spawnScale + 0.02);
          enemy.alpha = enemy.spawnScale;
        }
        // Scroll with code walls
        var whScrollSpeed =
          RS.CodeEnv && RS.CodeEnv.scrollSpeed ? RS.CodeEnv.scrollSpeed : 1.25;
        enemy.y += whScrollSpeed;
        // Track wall edge as it scrolls
        var whBounds = this._getBounds(enemy.y);
        var whCycle = enemy.animTimer % 80;
        var whOffset;
        if (whCycle < 10) {
          whOffset = (whCycle / 10) * 25;
        } else if (whCycle < 40) {
          whOffset = 25;
        } else if (whCycle < 50) {
          whOffset = 25 - ((whCycle - 40) / 10) * 25;
        } else {
          whOffset = 0;
        }
        var whInward = enemy.wallSide === 'left' ? whOffset : -whOffset;
        var wallEdgeTarget =
          enemy.wallSide === 'left'
            ? whBounds.left + enemy.renderW / 2 + whInward
            : whBounds.right - enemy.renderW / 2 + whInward;
        enemy.wallTargetX = RS.lerp(enemy.wallTargetX, wallEdgeTarget, 0.08);
        enemy.x = RS.lerp(enemy.x, enemy.wallTargetX, 0.15);

        enemy.wallStateTimer--;
        if (enemy.wallState === 'STILL') {
          if (enemy.wallStateTimer <= 0) {
            enemy.wallState = 'SHOOT';
            enemy.wallStateTimer = 1;
          }
        } else if (enemy.wallState === 'SHOOT') {
          var downAngle = RS.degToRad(5);
          var bDir = enemy.wallSide === 'left' ? 1 : -1;
          var whSpeed = 6.25;
          this.fireSpinner(
            enemy.x,
            enemy.y,
            bDir * whSpeed * Math.cos(downAngle),
            whSpeed * Math.sin(downAngle),
            1,
          );
          this.fireSpinner(
            enemy.x,
            enemy.y,
            bDir * whSpeed * Math.cos(-downAngle),
            whSpeed * Math.sin(-downAngle),
            1,
          );
          enemy.wallState = 'STILL';
          enemy.wallStateTimer = 80;
        }
        if (enemy.y > RS.GAME_HEIGHT + enemy.renderH) enemy.active = false;
        break;

      case 'droneGenerator':
        if (enemy.y < 120) enemy.y += 0.5;
        enemy.vx += this._wallSteer(enemy, 40);
        enemy.vx *= 0.85;
        enemy.x += enemy.vx;
        this._clampToCorridor(enemy);
        enemy.spawnCooldown--;
        if (enemy.spawnCooldown <= 0) {
          var droneCount = this._countChildren('droneGenerator');
          if (droneCount < 8) {
            this.spawn('drone', enemy.x, enemy.y + 20);
            enemy.childCount++;
          }
          enemy.spawnCooldown = 90;
        }
        break;

      case 'rusherGenerator':
        if (enemy.y < 80) enemy.y += 0.5;
        enemy.vx += this._wallSteer(enemy, 40);
        enemy.vx *= 0.85;
        enemy.x += enemy.vx;
        this._clampToCorridor(enemy);
        enemy.spawnCooldown--;
        if (enemy.spawnCooldown <= 0) {
          var rusherCount = this._countChildren('rusherGenerator');
          if (rusherCount < 6) {
            this.spawn('rusher', enemy.x, enemy.y + 20);
            enemy.childCount++;
          }
          enemy.spawnCooldown = 120;
        }
        break;

      case 'organicGun':
        // Wall-mounted turret: scroll with code walls, stick to screen edge
        if (!enemy.wallSide) {
          enemy.wallSide = enemy.x < RS.GAME_WIDTH / 2 ? 'left' : 'right';
          enemy.ogTargetX =
            enemy.wallSide === 'left'
              ? enemy.renderW / 2
              : RS.GAME_WIDTH - enemy.renderW / 2;
          enemy.ogArrived = false;
        }
        if (!enemy.ogArrived) {
          enemy.x = RS.lerp(enemy.x, enemy.ogTargetX, 0.06);
          if (Math.abs(enemy.x - enemy.ogTargetX) < 1) {
            enemy.x = enemy.ogTargetX;
            enemy.ogArrived = true;
          }
        } else {
          enemy.x = enemy.ogTargetX;
        }
        var ogScrollSpeed =
          RS.CodeEnv && RS.CodeEnv.scrollSpeed ? RS.CodeEnv.scrollSpeed : 1.25;
        enemy.y += ogScrollSpeed;
        if (enemy.ogArrived && enemy.shootTimer <= 0) {
          var ogDir = enemy.wallSide === 'left' ? 1 : -1;
          this.fireSpinner(enemy.x, enemy.y, ogDir * 6.25, 0, 2);
          enemy.shootTimer = 50;
        }
        if (enemy.y > RS.GAME_HEIGHT + enemy.renderH) enemy.active = false;
        break;

      case 'rusherGenReverse':
        enemy.spawnCooldown--;
        if (enemy.spawnCooldown <= 0 && enemy.childCount < 6) {
          var revBounds = this._getBounds(RS.GAME_HEIGHT - 50);
          var revX = RS.randomRange(revBounds.left + 30, revBounds.right - 30);
          this.spawn('rusherReverse', revX, RS.GAME_HEIGHT + 50);
          enemy.childCount++;
          enemy.spawnCooldown = 15;
        }
        if (enemy.childCount >= 6) enemy.active = false;
        break;

      case 'rusherGenLeft':
        enemy.spawnCooldown--;
        if (enemy.spawnCooldown <= 0 && enemy.childCount < 6) {
          var leftY = RS.randomRange(100, RS.GAME_HEIGHT - 100);
          this.spawn('rusherLeft', RS.GAME_WIDTH + 50, leftY);
          enemy.childCount++;
          enemy.spawnCooldown = 15;
        }
        if (enemy.childCount >= 6) enemy.active = false;
        break;

      case 'rusherGenRight':
        enemy.spawnCooldown--;
        if (enemy.spawnCooldown <= 0 && enemy.childCount < 6) {
          var rightY = RS.randomRange(100, RS.GAME_HEIGHT - 100);
          this.spawn('rusherRight', -50, rightY);
          enemy.childCount++;
          enemy.spawnCooldown = 15;
        }
        if (enemy.childCount >= 6) enemy.active = false;
        break;

      case 'asteroidBig':
      case 'asteroidMed':
      case 'asteroidSmall':
      case 'sasterBig':
      case 'sasterMed':
      case 'sasterSmall':
      case 'masterBig':
      case 'masterMed':
      case 'masterSmall':
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        enemy.rotAngle += enemy.rotSpeed;

        // Simple bounce off screen edges
        if (enemy.x < enemy.hitRadius) {
          enemy.x = enemy.hitRadius;
          enemy.vx *= -1;
        }
        if (enemy.x > RS.GAME_WIDTH - enemy.hitRadius) {
          enemy.x = RS.GAME_WIDTH - enemy.hitRadius;
          enemy.vx *= -1;
        }

        if (enemy.y > RS.GAME_HEIGHT + 100 || enemy.y < -100)
          enemy.active = false;
        break;
    }
  },

  fireSpinner: function (x, y, vx, vy, grade) {
    this.bullets.push({
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      active: true,
      hitRadius: 4,
      isSpinner: true,
      spinnerGrade: grade || 0,
      spinAngle: 0,
      animTimer: Math.floor(Math.random() * 100),
      width: 20,
      height: 20,
    });
  },

  shootSpinner: function (enemy, targetX, targetY, grade) {
    var angle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
    var speed = 6.25; // original 5 * 1.25 scale
    this.fireSpinner(
      enemy.x,
      enemy.y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      grade,
    );
  },

  shootSpinnerSpread: function (enemy, count, spreadAngle, grade) {
    var baseAngle = Math.PI / 2;
    var startAngle = baseAngle - spreadAngle / 2;
    var step = count > 1 ? spreadAngle / (count - 1) : 0;
    var speed = 6.25; // original 5 * 1.25 scale
    for (var i = 0; i < count; i++) {
      var angle = startAngle + step * i;
      this.fireSpinner(
        enemy.x,
        enemy.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        grade,
      );
    }
  },

  spawnSpores: function (x, y) {
    var sporeGroup = {total: 16, killed: 0};
    for (var i = 0; i < 8; i++) {
      var angle = (i / 8) * Math.PI * 2;
      this.bullets.push({
        x: x + Math.cos(angle) * 16,
        y: y + Math.sin(angle) * 16,
        vx: Math.cos(angle) * 0.3,
        vy: Math.sin(angle) * 0.3,
        active: true,
        hitRadius: 3,
        isSpore: true,
        sporeDelay: 30,
        sporeLife: 240,
        sporeGroup: sporeGroup,
        animTimer: Math.floor(Math.random() * 100),
        width: 20,
        height: 20,
      });
    }
    for (var j = 0; j < 8; j++) {
      var angle = (j / 8) * Math.PI * 2 + (22.5 * Math.PI) / 180;
      this.bullets.push({
        x: x + Math.cos(angle) * 32,
        y: y + Math.sin(angle) * 32,
        vx: Math.cos(angle) * 0.6,
        vy: Math.sin(angle) * 0.6,
        active: true,
        hitRadius: 3,
        isSpore: true,
        sporeDelay: 30,
        sporeLife: 240,
        sporeGroup: sporeGroup,
        animTimer: Math.floor(Math.random() * 100),
        width: 20,
        height: 20,
      });
    }
  },

  // Homer death fires 8 projectiles in cardinal+diagonal directions
  spawnHomingMissile: function (x, y) {
    var speed = 3.0 * (RS.SCALE || 1.25); // original speed 3.0, scaled
    for (var i = 0; i < 8; i++) {
      var angle = (i / 8) * Math.PI * 2;
      this.bullets.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        active: true,
        hitRadius: 5,
        isHomerProjectile: true,
        spriteKey: 'homprojc',
        animTimer: Math.floor(Math.random() * 100),
        damage: 2,
        width: 20,
        height: 20,
      });
    }
  },

  shootAt: function (enemy, targetX, targetY) {
    var angle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
    this.bullets.push({
      x: enemy.x,
      y: enemy.y,
      vx: Math.cos(angle) * 4,
      vy: Math.sin(angle) * 4,
      active: true,
      hitRadius: 3,
      spriteKey: 'bullet_enemyAimed',
      width: 5,
      height: 5,
    });
  },

  shootSpread: function (enemy, count, spreadAngle) {
    var baseAngle = Math.PI / 2;
    var startAngle = baseAngle - spreadAngle / 2;
    var step = count > 1 ? spreadAngle / (count - 1) : 0;
    for (var i = 0; i < count; i++) {
      var angle = startAngle + step * i;
      this.bullets.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        active: true,
        hitRadius: 3,
        spriteKey: 'bullet_enemyBullet',
        width: 5,
        height: 5,
      });
    }
  },

  render: function (ctx) {
    var S = RS.SCALE || 1.25;

    for (var i = 0; i < this.bullets.length; i++) {
      var b = this.bullets[i];
      if (!b.active) continue;

      if (b.isSpinner) {
        var gradeOffset = (b.spinnerGrade || 0) * 8;
        var spinFrame = null;
        var spinFrames = RS.Sprites.sheets['spinners'];
        if (spinFrames && spinFrames.length > gradeOffset) {
          var fIdx = gradeOffset + (Math.floor((b.animTimer || 0) / 4) % 8);
          spinFrame = spinFrames[Math.min(fIdx, spinFrames.length - 1)];
        }
        if (spinFrame) {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.spinAngle || 0);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            spinFrame,
            -b.width / 2,
            -b.height / 2,
            b.width,
            b.height,
          );
          ctx.restore();
        }
        b.animTimer++;
        continue;
      }

      if (b.isSpore) {
        var sporeFrame = RS.Sprites.getAnimFrame(
          'spores',
          b.animTimer || 0,
          10,
        );
        if (sporeFrame) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            sporeFrame,
            b.x - b.width / 2,
            b.y - b.height / 2,
            b.width,
            b.height,
          );
        }
        b.animTimer++;
        continue;
      }

      if (b.isHomingMissile) {
        var hmFrame = RS.Sprites.getAnimFrame('hmissile', b.animTimer || 0, 10);
        if (hmFrame) {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            hmFrame,
            -b.width / 2,
            -b.height / 2,
            b.width,
            b.height,
          );
          ctx.restore();
        }
        b.animTimer++;
        continue;
      }

      // Homer death projectile rendering
      if (b.isHomerProjectile) {
        var hpFrame = RS.Sprites.getAnimFrame('homprojc', b.animTimer || 0, 10);
        if (hpFrame) {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            hpFrame,
            -b.width / 2,
            -b.height / 2,
            b.width,
            b.height,
          );
          ctx.restore();
        }
        b.animTimer++;
        continue;
      }

      var bSprite = RS.Sprites ? RS.Sprites.get(b.spriteKey) : null;
      if (bSprite) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          bSprite,
          b.x - b.width / 2,
          b.y - b.height / 2,
          b.width,
          b.height,
        );
      }
    }

    for (var j = 0; j < this.list.length; j++) {
      var e = this.list[j];
      if (!e.active) continue;
      ctx.save();
      ctx.globalAlpha = e.alpha;

      if (e.type === 'droneGenerator' || e.type === 'rusherGenerator') {
        ctx.shadowBlur = 10 + Math.sin(e.moveTimer * 0.1) * 5;
        ctx.shadowColor = '#ff4081';
      }

      // Asteroid Rendering - uses original rotation sprite sheets
      if (
        e.type.indexOf('asteroid') !== -1 ||
        e.type.indexOf('saster') !== -1 ||
        e.type.indexOf('master') !== -1
      ) {
        var astFrames = RS.Sprites.sheets[e.sheetKey];
        var astTotal = astFrames ? astFrames.length : 1;
        var astIdx =
          (e.asteroidVariant + Math.floor(e.moveTimer / 4)) % astTotal;
        var astSprite = RS.Sprites.getFrame(e.sheetKey, astIdx);
        if (astSprite) {
          ctx.imageSmoothingEnabled = false;
          if (e.hitFlashTimer > 0) ctx.filter = 'brightness(5) saturate(0)';
          ctx.drawImage(
            astSprite,
            e.x - e.renderW / 2,
            e.y - e.renderH / 2,
            e.renderW,
            e.renderH,
          );
          if (e.hitFlashTimer > 0) ctx.filter = 'none';
        }
        ctx.restore();
        continue;
      }

      var eSprite = null;
      if (e.sheetKey) {
        if (e.type === 'organicGun' || e.type === 'wallhugger') {
          eSprite = RS.Sprites.getFrame(e.sheetKey, 0);
        } else {
          eSprite = RS.Sprites.getAnimFrame(
            e.sheetKey,
            e.animTimer,
            e.animFps || 10,
          );
        }
      }

      if (eSprite) {
        ctx.imageSmoothingEnabled = false;
        if (e.hitFlashTimer > 0) ctx.filter = 'brightness(5) saturate(0)';

        if (e.type === 'rusherReverse') {
          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.scale(1, -1);
          ctx.drawImage(
            eSprite,
            -e.renderW / 2,
            -e.renderH / 2,
            e.renderW,
            e.renderH,
          );
          ctx.restore();
        } else if (e.type === 'rusherLeft') {
          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.rotate(Math.PI / 2);
          ctx.drawImage(
            eSprite,
            -e.renderH / 2,
            -e.renderW / 2,
            e.renderH,
            e.renderW,
          );
          ctx.restore();
        } else if (e.type === 'rusherRight') {
          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.rotate(-Math.PI / 2);
          ctx.drawImage(
            eSprite,
            -e.renderH / 2,
            -e.renderW / 2,
            e.renderH,
            e.renderW,
          );
          ctx.restore();
        } else if (e.type === 'wallhugger') {
          var whScale =
            e.spawnScale !== undefined && e.spawnScale < 1 ? e.spawnScale : 1;
          var whFlip = e.wallSide === 'right' ? -1 : 1;
          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.scale(whFlip * whScale, whScale);
          ctx.drawImage(
            eSprite,
            -e.renderW / 2,
            -e.renderH / 2,
            e.renderW,
            e.renderH,
          );
          ctx.restore();
        } else if (e.type === 'organicGun' && e.wallSide === 'right') {
          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.scale(-1, 1);
          ctx.drawImage(
            eSprite,
            -e.renderW / 2,
            -e.renderH / 2,
            e.renderW,
            e.renderH,
          );
          ctx.restore();
        } else {
          ctx.drawImage(
            eSprite,
            e.x - e.renderW / 2,
            e.y - e.renderH / 2,
            e.renderW,
            e.renderH,
          );
        }
        if (e.hitFlashTimer > 0) ctx.filter = 'none';
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    }
  },

  killEnemy: function (enemy) {
    enemy.active = false;

    // Type-specific death effects
    switch (enemy.type) {
      case 'pod':
        this.spawnSpores(enemy.x, enemy.y);
        break;
      case 'homer':
        this.spawnHomingMissile(enemy.x, enemy.y);
        break;
      case 'asteroidBig':
        var abC1 = this.spawn('asteroidMed', enemy.x - 15, enemy.y);
        var abC2 = this.spawn('asteroidMed', enemy.x, enemy.y);
        var abC3 = this.spawn('asteroidMed', enemy.x + 15, enemy.y);
        if (abC1) {
          abC1.vx = -1.25;
          abC1.vy = 1.25;
          abC1.scoreValue *= 1.5;
        }
        if (abC2) {
          abC2.vx = 0;
          abC2.vy = 1.625;
          abC2.scoreValue *= 1.5;
        }
        if (abC3) {
          abC3.vx = 1.25;
          abC3.vy = 1.25;
          abC3.scoreValue *= 1.5;
        }
        break;
      case 'asteroidMed':
        var amC1 = this.spawn('asteroidSmall', enemy.x - 10, enemy.y);
        var amC2 = this.spawn('asteroidSmall', enemy.x + 10, enemy.y);
        if (amC1) {
          amC1.vx = -1.25;
          amC1.vy = 1.25;
          amC1.scoreValue *= 1.5;
        }
        if (amC2) {
          amC2.vx = 1.25;
          amC2.vy = 1.25;
          amC2.scoreValue *= 1.5;
        }
        break;
      case 'sasterBig':
        var sbC1 = this.spawn('sasterMed', enemy.x - 15, enemy.y);
        var sbC2 = this.spawn('sasterMed', enemy.x, enemy.y);
        var sbC3 = this.spawn('sasterMed', enemy.x + 15, enemy.y);
        if (sbC1) {
          sbC1.vx = -1.25;
          sbC1.vy = 1.25;
          sbC1.scoreValue *= 1.5;
        }
        if (sbC2) {
          sbC2.vx = 0;
          sbC2.vy = 1.625;
          sbC2.scoreValue *= 1.5;
        }
        if (sbC3) {
          sbC3.vx = 1.25;
          sbC3.vy = 1.25;
          sbC3.scoreValue *= 1.5;
        }
        break;
      case 'sasterMed':
        var smC1 = this.spawn('sasterSmall', enemy.x - 10, enemy.y);
        var smC2 = this.spawn('sasterSmall', enemy.x + 10, enemy.y);
        if (smC1) {
          smC1.vx = -1.25;
          smC1.vy = 1.25;
          smC1.scoreValue *= 1.5;
        }
        if (smC2) {
          smC2.vx = 1.25;
          smC2.vy = 1.25;
          smC2.scoreValue *= 1.5;
        }
        break;
    }

    // Sprite explosion with correct size, velocity inheritance
    var explodeSize = enemy.explodeSize || 'medium';
    if (RS.Particles) {
      RS.Particles.emitSpriteExplosion(
        enemy.x,
        enemy.y,
        explodeSize,
        enemy.vx || 0,
        enemy.vy || 0,
      );
      RS.Particles.playExplosionAudio(explodeSize);
      if (RS.Particles.emitExplosionDebris)
        RS.Particles.emitExplosionDebris(
          enemy.x,
          enemy.y,
          explodeSize,
          enemy.vx || 0,
          enemy.vy || 0,
        );
    }
    if (RS.addShake) {
      var shakeMap = {small: 3, medium: 6, big: 10};
      RS.addShake(shakeMap[explodeSize] || 3);
    }
    if (RS.Player) RS.Player.addScore(enemy.scoreValue);

    if (Math.random() < enemy.dropRate) {
      if (RS.Powerups) RS.Powerups.spawnRandom(enemy.x, enemy.y);
    }
  },

  clear: function () {
    this.list = [];
    this.bullets = [];
  },

  getActiveCount: function () {
    return this.list.length;
  },

  getActiveEnemyCount: function () {
    var count = 0;
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].active) count++;
    }
    return count;
  },
};
