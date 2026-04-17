var RS = RS || {};

RS.Collision = {
  gridSize: 64,
  grid: {},

  init: function () {
    this.clear();
  },

  clear: function () {
    this.grid = {};
  },

  getKey: function (x, y) {
    return Math.floor(x / this.gridSize) + ',' + Math.floor(y / this.gridSize);
  },

  insert: function (entity) {
    var key = this.getKey(entity.x, entity.y);
    if (!this.grid[key]) {
      this.grid[key] = [];
    }
    this.grid[key].push(entity);

    var cellX = Math.floor(entity.x / this.gridSize);
    var cellY = Math.floor(entity.y / this.gridSize);
    var radius = entity.hitRadius || entity.radius || 0;

    if (entity.x - radius < cellX * this.gridSize) {
      var leftKey = cellX - 1 + ',' + cellY;
      if (!this.grid[leftKey]) this.grid[leftKey] = [];
      this.grid[leftKey].push(entity);
    }
    if (entity.x + radius > (cellX + 1) * this.gridSize) {
      var rightKey = cellX + 1 + ',' + cellY;
      if (!this.grid[rightKey]) this.grid[rightKey] = [];
      this.grid[rightKey].push(entity);
    }
    if (entity.y - radius < cellY * this.gridSize) {
      var topKey = cellX + ',' + (cellY - 1);
      if (!this.grid[topKey]) this.grid[topKey] = [];
      this.grid[topKey].push(entity);
    }
    if (entity.y + radius > (cellY + 1) * this.gridSize) {
      var bottomKey = cellX + ',' + (cellY + 1);
      if (!this.grid[bottomKey]) this.grid[bottomKey] = [];
      this.grid[bottomKey].push(entity);
    }
  },

  query: function (x, y, radius) {
    var entities = [];
    var minCellX = Math.floor((x - radius) / this.gridSize);
    var maxCellX = Math.floor((x + radius) / this.gridSize);
    var minCellY = Math.floor((y - radius) / this.gridSize);
    var maxCellY = Math.floor((y + radius) / this.gridSize);

    for (var i = minCellX; i <= maxCellX; i++) {
      for (var j = minCellY; j <= maxCellY; j++) {
        var key = i + ',' + j;
        if (this.grid[key]) {
          for (var k = 0; k < this.grid[key].length; k++) {
            entities.push(this.grid[key][k]);
          }
        }
      }
    }

    var uniqueEntities = [];
    var seen = {};
    for (var l = 0; l < entities.length; l++) {
      var e = entities[l];
      if (!seen[e]) {
        seen[e] = true;
        uniqueEntities.push(e);
      }
    }
    return uniqueEntities;
  },

  circleCollision: function (a, b) {
    var r1 = a.hitRadius !== undefined ? a.hitRadius : a.radius;
    var r2 = b.hitRadius !== undefined ? b.hitRadius : b.radius;
    return RS.distance(a.x, a.y, b.x, b.y) < r1 + r2;
  },

  checkAll: function () {
    // Player bullets vs Enemies
    if (RS.Weapons && RS.Weapons.bullets && RS.Enemies && RS.Enemies.list) {
      for (var i = 0; i < RS.Weapons.bullets.length; i++) {
        var bullet = RS.Weapons.bullets[i];
        if (!bullet.active) continue;

        for (var j = 0; j < RS.Enemies.list.length; j++) {
          var enemy = RS.Enemies.list[j];
          if (!enemy.active) continue;

          if (
            this.circleCollision(
              {x: bullet.x, y: bullet.y, radius: bullet.hitRadius},
              {x: enemy.x, y: enemy.y, radius: enemy.hitRadius},
            )
          ) {
            enemy.hp -= bullet.damage;
            bullet.active = false;

            if (enemy.hp <= 0) {
              RS.Enemies.killEnemy(enemy);
            } else {
              enemy.hitFlashTimer = 4;
              if (RS.Particles && RS.Particles.emitHitSparks)
                RS.Particles.emitHitSparks(bullet.x, bullet.y, 10);
            }
            break;
          }
        }
      }
    }

    // Player bullets vs Enemy bullets (spores/homerProjectiles destroyable, spinners block)
    if (RS.Weapons && RS.Weapons.bullets && RS.Enemies && RS.Enemies.bullets) {
      for (var pbi = 0; pbi < RS.Weapons.bullets.length; pbi++) {
        var pb = RS.Weapons.bullets[pbi];
        if (!pb.active) continue;

        for (var ebi = 0; ebi < RS.Enemies.bullets.length; ebi++) {
          var eb = RS.Enemies.bullets[ebi];
          if (!eb.active) continue;
          if (!eb.isSpore && !eb.isHomerProjectile && !eb.isSpinner) continue;

          if (
            this.circleCollision(
              {x: pb.x, y: pb.y, radius: pb.hitRadius},
              {x: eb.x, y: eb.y, radius: eb.hitRadius},
            )
          ) {
            pb.active = false;
            if (eb.isSpore) {
              eb.active = false;
              if (RS.Particles)
                RS.Particles.emitSpriteExplosion(
                  eb.x,
                  eb.y,
                  'small',
                  eb.vx,
                  eb.vy,
                );
              if (RS.Player) RS.Player.addScore(0.05);
              if (eb.sporeGroup) {
                eb.sporeGroup.killed++;
                if (eb.sporeGroup.killed >= eb.sporeGroup.total) {
                  if (RS.Powerups) RS.Powerups.spawnRandom(eb.x, eb.y);
                }
              }
            } else if (eb.isHomerProjectile) {
              eb.active = false;
              if (RS.Particles)
                RS.Particles.emitSpriteExplosion(
                  eb.x,
                  eb.y,
                  'small',
                  eb.vx,
                  eb.vy,
                );
              if (RS.Player) RS.Player.addScore(0.5);
            }
            // Spinners: infinite shield - bullet consumed but spinner survives
            break;
          }
        }
      }
    }

    // Player bullets vs Walls
    if (RS.Weapons && RS.Weapons.bullets) {
      for (var k = 0; k < RS.Weapons.bullets.length; k++) {
        var b = RS.Weapons.bullets[k];
        if (!b.active) continue;

        if (RS.CodeEnv && RS.CodeEnv.isInsideWall(b.x, b.y)) {
          RS.CodeEnv.destroyAt(b.x, b.y, 40);
          if (RS.Particles && RS.Particles.emitWallDebris)
            RS.Particles.emitWallDebris(b.x, b.y, 20);
          if (RS.Audio && RS.Audio.playWallHit) RS.Audio.playWallHit();
          b.active = false;
        }
      }
    }

    // Enemy bullets vs Player
    if (
      RS.Enemies &&
      RS.Enemies.bullets &&
      RS.Player &&
      RS.Player.alive &&
      !RS.Player.invincible &&
      !RS.Player.cloakActive
    ) {
      for (var m = 0; m < RS.Enemies.bullets.length; m++) {
        var eBullet = RS.Enemies.bullets[m];
        if (!eBullet.active) continue;

        if (
          this.circleCollision(
            {x: eBullet.x, y: eBullet.y, radius: eBullet.hitRadius},
            RS.Player.getBounds(),
          )
        ) {
          if (RS.Player.hit) RS.Player.hit();
          eBullet.active = false;
        }
      }
    }

    // Enemies vs Companions
    if (RS.Enemies && RS.Enemies.list && RS.Companions && RS.Companions.list) {
      for (var eq = 0; eq < RS.Enemies.list.length; eq++) {
        var eComp = RS.Enemies.list[eq];
        if (!eComp.active) continue;
        for (var cq = 0; cq < RS.Companions.list.length; cq++) {
          var compQ = RS.Companions.list[cq];
          if (!compQ.active) continue;
          if (
            this.circleCollision(
              {x: eComp.x, y: eComp.y, radius: eComp.hitRadius},
              {x: compQ.x, y: compQ.y, radius: compQ.hitRadius},
            )
          ) {
            RS.Companions.hitCompanion(compQ, 2);
            eComp.hp -= 2;
            if (eComp.hp <= 0 && RS.Enemies.killEnemy) {
              RS.Enemies.killEnemy(eComp);
            }
          }
        }
      }
    }

    // Enemy bullets vs Walls
    if (RS.Enemies && RS.Enemies.bullets) {
      for (var n = 0; n < RS.Enemies.bullets.length; n++) {
        var eb = RS.Enemies.bullets[n];
        if (!eb.active) continue;
        if (eb.isSpinner) continue;

        if (RS.CodeEnv && RS.CodeEnv.isInsideWall(eb.x, eb.y)) {
          RS.CodeEnv.destroyAt(eb.x, eb.y, 30);
          if (RS.Particles && RS.Particles.emitWallDebris)
            RS.Particles.emitWallDebris(eb.x, eb.y, 16);
          eb.active = false;
        }
      }
    }

    // Powerups vs Player
    if (
      RS.Powerups &&
      RS.Powerups.list &&
      RS.Player &&
      RS.Player.alive &&
      !RS.Player.cloakActive
    ) {
      for (var p = 0; p < RS.Powerups.list.length; p++) {
        var powerup = RS.Powerups.list[p];
        if (!powerup.active) continue;

        if (
          this.circleCollision(
            {x: powerup.x, y: powerup.y, radius: powerup.hitRadius},
            RS.Player.getBounds(),
          )
        ) {
          if (RS.Player.collectPowerup) RS.Player.collectPowerup(powerup.type);
          powerup.active = false;
        }
      }
    }

    // Enemies vs Player (body collision)
    if (
      RS.Enemies &&
      RS.Enemies.list &&
      RS.Player &&
      RS.Player.alive &&
      !RS.Player.invincible &&
      !RS.Player.cloakActive
    ) {
      for (var q = 0; q < RS.Enemies.list.length; q++) {
        var enemy = RS.Enemies.list[q];
        if (!enemy.active) continue;

        if (
          this.circleCollision(
            {x: enemy.x, y: enemy.y, radius: enemy.hitRadius},
            RS.Player.getBounds(),
          )
        ) {
          if (RS.Player.hit) RS.Player.hit();
          enemy.hp -= 2;
          if (enemy.hp <= 0 && RS.Enemies.killEnemy) {
            RS.Enemies.killEnemy(enemy);
          }
        }
      }
    }

    // Player vs Walls - pushback always, damage only when vulnerable
    if (RS.Player && RS.Player.alive && RS.CodeEnv && RS.CodeEnv.loaded) {
      var pBounds = RS.CodeEnv.getCorridorBounds(RS.Player.y);
      var pLeft = RS.Player.x - RS.Player.hitRadius;
      var pRight = RS.Player.x + RS.Player.hitRadius;
      if (pLeft < pBounds.left && RS.CodeEnv.isInsideWall(pLeft, RS.Player.y)) {
        if (!RS.Player.invincible) {
          if (RS.Player.hit) RS.Player.hit(10);
          RS.CodeEnv.destroyAt(pLeft, RS.Player.y, 30);
          if (RS.Particles && RS.Particles.emitWallDebris)
            RS.Particles.emitWallDebris(pLeft, RS.Player.y, 16);
        }
        var targetL = pBounds.left + RS.Player.hitRadius;
        RS.Player.x = RS.Player.x + (targetL - RS.Player.x) * 0.5;
        if (RS.Player.vx < 0) RS.Player.vx *= 0.3;
      } else if (
        pRight > pBounds.right &&
        RS.CodeEnv.isInsideWall(pRight, RS.Player.y)
      ) {
        if (!RS.Player.invincible) {
          if (RS.Player.hit) RS.Player.hit(10);
          RS.CodeEnv.destroyAt(pRight, RS.Player.y, 30);
          if (RS.Particles && RS.Particles.emitWallDebris)
            RS.Particles.emitWallDebris(pRight, RS.Player.y, 16);
        }
        var targetR = pBounds.right - RS.Player.hitRadius;
        RS.Player.x = RS.Player.x + (targetR - RS.Player.x) * 0.5;
        if (RS.Player.vx > 0) RS.Player.vx *= 0.3;
      }
    }

    // Asteroids vs Walls - destroy code cells and deflect
    if (RS.Enemies && RS.Enemies.list && RS.CodeEnv && RS.CodeEnv.loaded) {
      for (var ai = 0; ai < RS.Enemies.list.length; ai++) {
        var ast = RS.Enemies.list[ai];
        if (!ast.active) continue;
        if (
          ast.type.indexOf('asteroid') === -1 &&
          ast.type.indexOf('saster') === -1 &&
          ast.type.indexOf('master') === -1
        )
          continue;

        var astBounds = RS.CodeEnv.getCorridorBounds(ast.y);
        var astLeft = ast.x - ast.hitRadius;
        var astRight = ast.x + ast.hitRadius;

        if (astLeft < astBounds.left) {
          RS.CodeEnv.destroyAt(astLeft, ast.y, ast.hitRadius);
          if (RS.Particles && RS.Particles.emitWallDebris)
            RS.Particles.emitWallDebris(astLeft, ast.y, 24);
          ast.x = astBounds.left + ast.hitRadius;
          ast.vx = Math.abs(ast.vx) * 0.6 + 0.3;
        } else if (astRight > astBounds.right) {
          RS.CodeEnv.destroyAt(astRight, ast.y, ast.hitRadius);
          if (RS.Particles && RS.Particles.emitWallDebris)
            RS.Particles.emitWallDebris(astRight, ast.y, 24);
          ast.x = astBounds.right - ast.hitRadius;
          ast.vx = -Math.abs(ast.vx) * 0.6 - 0.3;
        }
      }
    }

    // Laser beam collision (ray-cast from player upward)
    if (
      RS.Weapons &&
      RS.Weapons.laserActive &&
      RS.Weapons.laserBeams &&
      RS.Enemies
    ) {
      for (var li = 0; li < RS.Weapons.laserBeams.length; li++) {
        var beam = RS.Weapons.laserBeams[li];
        var beamX = beam.x;
        var beamW = beam.width;
        var nearestY = 0;
        var hitEnemy = null;

        // Find nearest enemy in beam path
        for (var le = 0; le < RS.Enemies.list.length; le++) {
          var lEnemy = RS.Enemies.list[le];
          if (!lEnemy.active) continue;
          // Check if enemy overlaps beam X ± width
          if (Math.abs(lEnemy.x - beamX) < beamW / 2 + lEnemy.hitRadius) {
            if (lEnemy.y < RS.Player.y && lEnemy.y > nearestY) {
              nearestY = lEnemy.y;
              hitEnemy = lEnemy;
            }
          }
        }

        // Also check boss parts (eyes, mouth) and body
        if (RS.Boss && RS.Boss.active && !RS.Boss.dead) {
          var bParts = RS.Boss.getHittableParts();
          var hitBossPart = false;
          for (var bp = 0; bp < bParts.length; bp++) {
            var bPart = bParts[bp];
            if (Math.abs(bPart.x - beamX) < beamW / 2 + bPart.radius) {
              if (bPart.y < RS.Player.y && bPart.y > nearestY) {
                nearestY = bPart.y;
                hitEnemy = null;
                RS.Boss.hitPart(bPart.part, beam.damage);
                beam.hitY = nearestY;
                hitBossPart = true;
              }
            }
          }
          if (!hitBossPart) {
            if (Math.abs(RS.Boss.x - beamX) < beamW / 2 + RS.Boss.hitRadius) {
              if (RS.Boss.y < RS.Player.y && RS.Boss.y > nearestY) {
                nearestY = RS.Boss.y;
                hitEnemy = null;
                RS.Boss.hit(beam.damage);
                beam.hitY = nearestY;
              }
            }
          }
        }

        // Laser vs enemy bullets (spores, homer projectiles, spinners)
        if (RS.Enemies.bullets) {
          for (var lbi = 0; lbi < RS.Enemies.bullets.length; lbi++) {
            var lb = RS.Enemies.bullets[lbi];
            if (!lb.active) continue;
            if (!lb.isSpore && !lb.isHomerProjectile && !lb.isSpinner) continue;
            if (Math.abs(lb.x - beamX) < beamW / 2 + lb.hitRadius) {
              if (lb.y < RS.Player.y && lb.y > nearestY) {
                if (lb.isSpore) {
                  lb.active = false;
                  if (RS.Particles)
                    RS.Particles.emitSpriteExplosion(
                      lb.x,
                      lb.y,
                      'small',
                      lb.vx,
                      lb.vy,
                    );
                  if (RS.Player) RS.Player.addScore(1);
                  if (lb.sporeGroup) {
                    lb.sporeGroup.killed++;
                    if (lb.sporeGroup.killed >= lb.sporeGroup.total) {
                      if (RS.Powerups) RS.Powerups.spawnRandom(lb.x, lb.y);
                    }
                  }
                } else if (lb.isHomerProjectile) {
                  lb.active = false;
                  if (RS.Particles)
                    RS.Particles.emitSpriteExplosion(
                      lb.x,
                      lb.y,
                      'small',
                      lb.vx,
                      lb.vy,
                    );
                  if (RS.Player) RS.Player.addScore(1);
                }
                // Spinners: laser stops at spinner but doesn't destroy it
                if (lb.y > nearestY) {
                  nearestY = lb.y;
                  hitEnemy = null;
                }
              }
            }
          }
        }

        if (hitEnemy) {
          beam.hitY = hitEnemy.y;
          hitEnemy.hp -= beam.damage;
          if (hitEnemy.hp <= 0) {
            RS.Enemies.killEnemy(hitEnemy);
          }
        } else if (nearestY > 0) {
          beam.hitY = nearestY;
        } else {
          beam.hitY = 0;
        }

        // Laser vs walls - scan beam path for wall intersections
        if (RS.CodeEnv && RS.CodeEnv.loaded) {
          var scanStep = RS.CHAR_HEIGHT || 10;
          var scanFrom = beam.hitY;
          var scanTo = RS.Player.y;
          for (var sy = scanFrom; sy < scanTo; sy += scanStep) {
            if (RS.CodeEnv.isInsideWall(beamX, sy)) {
              RS.CodeEnv.destroyAt(beamX, sy, 30);
              if (RS.Particles && RS.Particles.emitWallDebris)
                RS.Particles.emitWallDebris(beamX, sy, 16);
              // Wall stops the beam - set hitY to wall position
              if (sy > beam.hitY) {
                beam.hitY = sy;
              }
              break;
            }
          }
        }
      }
    }
  },
};
