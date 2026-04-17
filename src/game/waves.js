var RS = RS || {};

RS.Waves = {
  scrollDistance: 0,
  scrollSpeed: 1.5,
  totalDistance: 45000,
  spawnIndex: 0,
  bossTriggered: false,
  warningTimer: 0,
  warningActive: false,

  // ~120 spawn events across 45000px - dense, overlapping, multi-directional
  spawnEvents: [
    // === PHASE 1: Intro - Drones + Asteroids (0-5000) ===
    {dist: 150, type: 'drone', count: 3},
    {dist: 400, type: 'drone', count: 4},
    {dist: 700, type: 'asteroidBig', count: 1},
    {dist: 900, type: 'drone', count: 5},
    {dist: 1200, type: 'asteroidMed', count: 2},
    {dist: 1500, type: 'drone', count: 6},
    {dist: 1800, type: 'asteroidBig', count: 1},
    {dist: 2000, type: 'drone', count: 6},
    {dist: 2200, type: 'droneGenerator', count: 1},
    {dist: 2500, type: 'asteroidMed', count: 3},
    {dist: 2800, type: 'drone', count: 8},
    {dist: 3200, type: 'asteroidBig', count: 2},
    {dist: 3500, type: 'drone', count: 6},
    {dist: 3800, type: 'asteroidMed', count: 2},
    {dist: 4200, type: 'droneGenerator', count: 1},
    {dist: 4500, type: 'asteroidBig', count: 1},
    {dist: 4800, type: 'drone', count: 8},

    // === PHASE 2: Rushers enter (5000-10000) ===
    {dist: 5000, type: 'rusher', count: 4},
    {dist: 5200, type: 'asteroidMed', count: 2},
    {dist: 5500, type: 'rusher', count: 6},
    {dist: 5800, type: 'drone', count: 6},
    {dist: 6000, type: 'rusherGenerator', count: 1},
    {dist: 6200, type: 'asteroidBig', count: 1},
    {dist: 6500, type: 'rusher', count: 4},
    {dist: 6500, type: 'drone', count: 4},
    {dist: 6800, type: 'asteroidMed', count: 3},
    {dist: 7100, type: 'rusher', count: 6},
    {dist: 7400, type: 'droneGenerator', count: 1},
    {dist: 7700, type: 'rusher', count: 4},
    {dist: 7700, type: 'asteroidBig', count: 1},

    // === PHASE 3: Reverse rushers + Loners A (8000-14000) ===
    {dist: 8000, type: 'rusherGenReverse', count: 1},
    {dist: 8200, type: 'loner', count: 2, tier: 1},
    {dist: 8500, type: 'drone', count: 6},
    {dist: 8800, type: 'rusherGenReverse', count: 1},
    {dist: 9000, type: 'loner', count: 3, tier: 1},
    {dist: 9000, type: 'asteroidMed', count: 2},
    {dist: 9300, type: 'rusher', count: 4},
    {dist: 9600, type: 'loner', count: 2, tier: 1},
    {dist: 9600, type: 'rusherGenReverse', count: 1},
    {dist: 9900, type: 'droneGenerator', count: 1},
    {dist: 10200, type: 'loner', count: 3, tier: 1},
    {dist: 10200, type: 'asteroidBig', count: 1},

    // === PHASE 4: Homers (10500-15000) ===
    {dist: 10500, type: 'homer', count: 2},
    {dist: 10800, type: 'drone', count: 6},
    {dist: 11100, type: 'homer', count: 3},
    {dist: 11100, type: 'rusherGenReverse', count: 1},
    {dist: 11400, type: 'loner', count: 2, tier: 1},
    {dist: 11700, type: 'homer', count: 4},
    {dist: 11700, type: 'asteroidMed', count: 2},
    {dist: 12000, type: 'rusher', count: 6},
    {dist: 12300, type: 'homer', count: 3},
    {dist: 12600, type: 'droneGenerator', count: 1},
    {dist: 12600, type: 'loner', count: 2, tier: 1},
    {dist: 12900, type: 'homer', count: 4},
    {dist: 12900, type: 'rusherGenReverse', count: 1},
    {dist: 13200, type: 'asteroidBig', count: 2},
    {dist: 13500, type: 'loner', count: 3, tier: 1},
    {dist: 13800, type: 'homer', count: 3},
    {dist: 14100, type: 'rusher', count: 4},
    {dist: 14400, type: 'asteroidMed', count: 3},

    // === PHASE 5: Horizontal rushers + Loner B + Wallhuggers (15000-22000) ===
    {dist: 15000, type: 'rusherGenLeft', count: 1},
    {dist: 15000, type: 'loner', count: 3, tier: 2},
    {dist: 15300, type: 'wallhugger', count: 2},
    {dist: 15600, type: 'rusherGenRight', count: 1},
    {dist: 15900, type: 'homer', count: 3},
    {dist: 15900, type: 'asteroidBig', count: 1},
    {dist: 16200, type: 'loner', count: 2, tier: 2},
    {dist: 16500, type: 'wallhugger', count: 3},
    {dist: 16500, type: 'rusherGenLeft', count: 1},
    {dist: 16800, type: 'rusherGenReverse', count: 1},
    {dist: 17100, type: 'loner', count: 4, tier: 2},
    {dist: 17400, type: 'rusherGenerator', count: 1},
    {dist: 17700, type: 'wallhugger', count: 2},
    {dist: 17700, type: 'homer', count: 4},
    {dist: 18000, type: 'rusherGenRight', count: 1},
    {dist: 18000, type: 'asteroidMed', count: 3},
    {dist: 18300, type: 'loner', count: 3, tier: 2},
    {dist: 18600, type: 'wallhugger', count: 3},
    {dist: 18900, type: 'droneGenerator', count: 1},
    {dist: 18900, type: 'rusherGenReverse', count: 1},
    {dist: 19200, type: 'loner', count: 4, tier: 2},
    {dist: 19500, type: 'homer', count: 4},
    {dist: 19800, type: 'wallhugger', count: 2},
    {dist: 19800, type: 'asteroidBig', count: 1},
    {dist: 20100, type: 'rusherGenLeft', count: 1},
    {dist: 20400, type: 'loner', count: 3, tier: 2},
    {dist: 20700, type: 'wallhugger', count: 3},
    {dist: 21000, type: 'rusherGenRight', count: 1},
    {dist: 21300, type: 'asteroidMed', count: 2},

    // === PHASE 6: Pods + OrganicGuns (22000-30000) ===
    {dist: 22000, type: 'pod', count: 1},
    {dist: 22000, type: 'rusherGenReverse', count: 1},
    {dist: 22300, type: 'loner', count: 3, tier: 2},
    {dist: 22600, type: 'pod', count: 2},
    {dist: 22600, type: 'rusherGenLeft', count: 1},
    {dist: 22900, type: 'homer', count: 4},
    {dist: 23200, type: 'wallhugger', count: 3},
    {dist: 23200, type: 'asteroidBig', count: 2},
    {dist: 23500, type: 'pod', count: 2},
    {dist: 23800, type: 'rusherGenRight', count: 1},
    {dist: 24100, type: 'rusherGenerator', count: 1},
    {dist: 24400, type: 'pod', count: 2},
    {dist: 24700, type: 'organicGun', count: 2},
    {dist: 25000, type: 'loner', count: 3, tier: 2},
    {dist: 25000, type: 'asteroidMed', count: 3},
    {dist: 25300, type: 'pod', count: 2},
    {dist: 25600, type: 'homer', count: 4},
    {dist: 25900, type: 'organicGun', count: 3},
    {dist: 25900, type: 'rusherGenReverse', count: 1},
    {dist: 26200, type: 'pod', count: 2},
    {dist: 26500, type: 'wallhugger', count: 3},
    {dist: 26800, type: 'asteroidBig', count: 1},
    {dist: 27100, type: 'organicGun', count: 2},
    {dist: 27400, type: 'rusherGenLeft', count: 1},
    {dist: 27700, type: 'pod', count: 2},
    {dist: 28000, type: 'homer', count: 4},
    {dist: 28300, type: 'asteroidMed', count: 2},
    {dist: 28600, type: 'organicGun', count: 3},
    {dist: 28900, type: 'rusherGenRight', count: 1},
    {dist: 29200, type: 'pod', count: 2},
    {dist: 29500, type: 'asteroidBig', count: 2},

    // === PHASE 7: Loner C + Everything (30000-40000) ===
    {dist: 30000, type: 'organicGun', count: 3},
    {dist: 30000, type: 'loner', count: 2, tier: 3},
    {dist: 30300, type: 'wallhugger', count: 4},
    {dist: 30300, type: 'rusherGenReverse', count: 1},
    {dist: 30600, type: 'organicGun', count: 2},
    {dist: 30900, type: 'loner', count: 4, tier: 3},
    {dist: 31200, type: 'pod', count: 2},
    {dist: 31200, type: 'rusherGenLeft', count: 1},
    {dist: 31500, type: 'homer', count: 4},
    {dist: 31800, type: 'organicGun', count: 4},
    {dist: 31800, type: 'asteroidBig', count: 2},
    {dist: 32100, type: 'loner', count: 3, tier: 3},
    {dist: 32400, type: 'droneGenerator', count: 2},
    {dist: 32400, type: 'rusherGenRight', count: 1},
    {dist: 32700, type: 'wallhugger', count: 3},
    {dist: 33000, type: 'loner', count: 4, tier: 3},
    {dist: 33300, type: 'pod', count: 2},
    {dist: 33300, type: 'rusherGenReverse', count: 1},
    {dist: 33600, type: 'homer', count: 4},
    {dist: 33600, type: 'asteroidMed', count: 3},
    {dist: 33900, type: 'organicGun', count: 3},
    {dist: 34200, type: 'loner', count: 4, tier: 3},
    {dist: 34200, type: 'rusherGenLeft', count: 1},
    {dist: 34500, type: 'wallhugger', count: 4},
    {dist: 34800, type: 'rusherGenerator', count: 1},
    {dist: 34800, type: 'asteroidBig', count: 1},

    // === PHASE 8: Maximum intensity (35000-44000) ===
    {dist: 35000, type: 'rusherGenerator', count: 1},
    {dist: 35000, type: 'droneGenerator', count: 1},
    {dist: 35000, type: 'rusherGenReverse', count: 1},
    {dist: 35300, type: 'loner', count: 4, tier: 3},
    {dist: 35300, type: 'homer', count: 4},
    {dist: 35600, type: 'pod', count: 3},
    {dist: 35600, type: 'rusherGenLeft', count: 1},
    {dist: 35900, type: 'wallhugger', count: 4},
    {dist: 35900, type: 'asteroidBig', count: 2},
    {dist: 36200, type: 'organicGun', count: 4},
    {dist: 36200, type: 'rusherGenRight', count: 1},
    {dist: 36500, type: 'loner', count: 4, tier: 3},
    {dist: 36500, type: 'homer', count: 4},
    {dist: 36800, type: 'pod', count: 2},
    {dist: 36800, type: 'rusherGenReverse', count: 1},
    {dist: 37100, type: 'rusher', count: 8},
    {dist: 37100, type: 'asteroidMed', count: 4},
    {dist: 37400, type: 'loner', count: 4, tier: 3},
    {dist: 37400, type: 'rusherGenLeft', count: 1},
    {dist: 37700, type: 'organicGun', count: 3},
    {dist: 37700, type: 'wallhugger', count: 3},
    {dist: 38000, type: 'pod', count: 3},
    {dist: 38000, type: 'rusherGenRight', count: 1},
    {dist: 38300, type: 'homer', count: 6},
    {dist: 38300, type: 'asteroidBig', count: 2},
    {dist: 38600, type: 'loner', count: 4, tier: 3},
    {dist: 38600, type: 'rusherGenReverse', count: 1},
    {dist: 38900, type: 'organicGun', count: 4},
    {dist: 39200, type: 'wallhugger', count: 4},
    {dist: 39200, type: 'rusherGenLeft', count: 1},
    {dist: 39500, type: 'pod', count: 2},
    {dist: 39500, type: 'asteroidMed', count: 3},
    {dist: 39800, type: 'loner', count: 4, tier: 3},
    {dist: 39800, type: 'rusherGenRight', count: 1},
    {dist: 40100, type: 'homer', count: 6},
    {dist: 40400, type: 'organicGun', count: 4},
    {dist: 40400, type: 'rusherGenReverse', count: 1},
    {dist: 40700, type: 'pod', count: 3},
    {dist: 40700, type: 'asteroidBig', count: 3},
    {dist: 41000, type: 'rusher', count: 8},
    {dist: 41300, type: 'loner', count: 4, tier: 3},
    {dist: 41600, type: 'wallhugger', count: 4},
    {dist: 41900, type: 'homer', count: 6},
    {dist: 42200, type: 'organicGun', count: 4},
    {dist: 42500, type: 'pod', count: 3},
    {dist: 42800, type: 'asteroidBig', count: 2},
    {dist: 43100, type: 'loner', count: 4, tier: 3},
    {dist: 43400, type: 'rusherGenReverse', count: 1},
    {dist: 43400, type: 'rusherGenLeft', count: 1},
    {dist: 43700, type: 'homer', count: 6},
    {dist: 44000, type: 'organicGun', count: 4},
    {dist: 44000, type: 'wallhugger', count: 4},
  ],

  init: function () {
    this.scrollDistance = 0;
    this.spawnIndex = 0;
    this.bossTriggered = false;
    this.warningTimer = 0;
    this.warningActive = false;
  },

  update: function () {
    if (this.bossTriggered) {
      if (this.warningActive) {
        this.warningTimer--;
        if (this.warningTimer <= 0) {
          this.warningActive = false;
          if (RS.Boss) RS.Boss.start();
        }
      }
      return;
    }

    this.scrollDistance += this.scrollSpeed;

    // Spawn enemies as scroll distance passes their trigger points
    while (
      this.spawnIndex < this.spawnEvents.length &&
      this.scrollDistance >= this.spawnEvents[this.spawnIndex].dist
    ) {
      var evt = this.spawnEvents[this.spawnIndex];
      this._spawnGroup(evt);
      this.spawnIndex++;
    }

    // Boss trigger
    if (this.scrollDistance >= this.totalDistance && !this.bossTriggered) {
      this.bossTriggered = true;
      this.warningActive = true;
      this.warningTimer = 180;
      if (RS.Audio && RS.Audio.playBossWarning) RS.Audio.playBossWarning();
    }
  },

  _spawnGroup: function (evt) {
    for (var i = 0; i < evt.count; i++) {
      var x, y;

      // Generator types don't need visible spawn positions
      if (
        evt.type === 'rusherGenReverse' ||
        evt.type === 'rusherGenLeft' ||
        evt.type === 'rusherGenRight'
      ) {
        x = RS.GAME_WIDTH / 2;
        y = -100;
        var spawned = RS.Enemies.spawn(evt.type, x, y);
        continue;
      }

      if (evt.type === 'wallhugger') {
        y = -80 - i * 150 - RS.randomInt(0, 30);
        var bounds =
          RS.CodeEnv && RS.CodeEnv.loaded
            ? RS.CodeEnv.getCorridorBounds(0)
            : {left: RS.CORRIDOR_LEFT, right: RS.CORRIDOR_RIGHT};
        x = Math.random() < 0.5 ? bounds.left + 50 : bounds.right - 50;
      } else if (evt.type === 'organicGun') {
        y = -80 - i * 150 - RS.randomInt(0, 30);
        x = Math.random() < 0.5 ? -80 : RS.GAME_WIDTH + 80;
      } else if (
        evt.type === 'droneGenerator' ||
        evt.type === 'rusherGenerator'
      ) {
        var bounds =
          RS.CodeEnv && RS.CodeEnv.loaded
            ? RS.CodeEnv.getCorridorBounds(0)
            : {left: RS.CORRIDOR_LEFT, right: RS.CORRIDOR_RIGHT};
        x = RS.randomRange(bounds.left + 60, bounds.right - 60);
        y = -30;
      } else if (
        evt.type === 'asteroidBig' ||
        evt.type === 'asteroidMed' ||
        evt.type === 'asteroidSmall'
      ) {
        // Asteroids spawn across full width
        x = RS.randomRange(80, RS.GAME_WIDTH - 80);
        y = -30 - i * 60;
      } else {
        var bounds =
          RS.CodeEnv && RS.CodeEnv.loaded
            ? RS.CodeEnv.getCorridorBounds(0)
            : {left: RS.CORRIDOR_LEFT, right: RS.CORRIDOR_RIGHT};
        x =
          Math.random() * (bounds.right - bounds.left - 60) +
          (bounds.left + 30);
        y = -30 - i * 40;
      }

      var spawned = RS.Enemies.spawn(evt.type, x, y);
      if (spawned && evt.type === 'loner' && evt.tier) {
        spawned.tier = evt.tier;
        if (evt.tier === 1) {
          spawned.hp = 3;
          spawned.maxHp = 3;
          spawned.scoreValue = 1.5;
          spawned.sheetKey = 'lonerA';
        } else if (evt.tier === 2) {
          spawned.hp = 5;
          spawned.maxHp = 5;
          spawned.scoreValue = 2.5;
          spawned.sheetKey = 'lonerB';
        } else if (evt.tier === 3) {
          spawned.hp = 8;
          spawned.maxHp = 8;
          spawned.scoreValue = 4;
          spawned.sheetKey = 'lonerC';
        }
      }
    }
  },

  getProgress: function () {
    return Math.min(1, this.scrollDistance / this.totalDistance);
  },

  getCurrentMessage: function () {
    if (this.warningActive) return 'WARNING';
    return null;
  },

  isAnnouncing: function () {
    return this.warningActive;
  },

  getWaveNumber: function () {
    return 0;
  },
};
