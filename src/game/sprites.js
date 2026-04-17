var RS = RS || {};

RS.Sprites = {
  cache: {},
  animated: {},
  sheets: {},
  tickCount: 0,
  _playerBankFrames: null,

  createCanvas: function (w, h) {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return {canvas: canvas, ctx: canvas.getContext('2d')};
  },

  loadImage: function (src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function () {
        reject(new Error('Failed to load ' + src));
      };
      img.src = src;
    });
  },

  // Load a sprite sheet, slice into frames, replace magenta with transparency
  loadSpriteSheet: function (key, path, frameW, frameH) {
    var self = this;
    return this.loadImage(path)
      .then(function (img) {
        var cols = Math.floor(img.width / frameW);
        var rows = Math.floor(img.height / frameH);
        var frames = [];
        for (var r = 0; r < rows; r++) {
          for (var c = 0; c < cols; c++) {
            var fc = self.createCanvas(frameW, frameH);
            fc.ctx.drawImage(
              img,
              c * frameW,
              r * frameH,
              frameW,
              frameH,
              0,
              0,
              frameW,
              frameH,
            );
            // Replace magenta (255,0,255) with alpha=0
            var imageData = fc.ctx.getImageData(0, 0, frameW, frameH);
            var data = imageData.data;
            for (var i = 0; i < data.length; i += 4) {
              if (data[i] >= 240 && data[i + 1] <= 15 && data[i + 2] >= 240) {
                data[i + 3] = 0;
              }
            }
            fc.ctx.putImageData(imageData, 0, 0);
            frames.push(fc.canvas);
          }
        }
        self.sheets[key] = frames;
        return frames;
      })
      .catch(function (err) {
        console.warn('Failed to load sprite sheet ' + key + ':', err);
        return [];
      });
  },

  getFrame: function (key, frameIndex) {
    var frames = this.sheets[key];
    if (!frames || frames.length === 0) return null;
    return frames[Math.max(0, Math.min(frameIndex, frames.length - 1))];
  },

  getAnimFrame: function (key, timer, fps) {
    var frames = this.sheets[key];
    if (!frames || frames.length === 0) return null;
    var frameIndex = Math.floor(timer / (60 / (fps || 10))) % frames.length;
    return frames[frameIndex];
  },

  registerAnimated: function (key, frames, speed) {
    this.animated[key] = {frames: frames, frameIndex: 0, speed: speed || 8};
    this.cache[key] = frames[0];
  },

  tick: function () {
    this.tickCount++;
    var keys = Object.keys(this.animated);
    for (var i = 0; i < keys.length; i++) {
      var anim = this.animated[keys[i]];
      if (this.tickCount % anim.speed === 0) {
        anim.frameIndex = (anim.frameIndex + 1) % anim.frames.length;
        this.cache[keys[i]] = anim.frames[anim.frameIndex];
      }
    }
  },

  getPlayerBank: function (bankLevel) {
    if (!this._playerBankFrames) return null;
    // bankLevel ranges from -3 to +3, map to frame index 0-6 (center=3)
    var index = Math.round(bankLevel) + 3;
    index = Math.max(0, Math.min(6, index));
    return this._playerBankFrames[index];
  },

  get: function (key) {
    return this.cache[key];
  },

  init: function () {
    this.loadXenonSprites();
  },

  loadXenonSprites: function () {
    var self = this;
    var base = 'assets/graphics/';

    // Player Ship2: 64x64, 7 cols x 3 rows = 21 frames
    // Row 0 (frames 0-6) = banking, Row 1 (7-13) = dive, Row 2 (14-20) = cloak
    this.loadSpriteSheet('ship2', base + 'Ship2.png', 64, 64).then(
      function (frames) {
        if (frames.length >= 7) {
          // Banking frames: row 0, indices 0-6, center=3
          self._playerBankFrames = frames.slice(0, 7);
          self.cache['player'] = self._playerBankFrames[3];
          // Dive frames: row 1
          self.sheets['ship2_dive'] = frames.slice(7, 14);
          // Cloak frames: row 2
          self.sheets['ship2_cloak'] = frames.slice(14, 21);
        }
      },
    );

    // Player engine jet: 16x32, single frame
    this.loadSpriteSheet('playerjet', base + 'playerjet.png', 16, 32);

    // Drone: 32x32, 8x2 = 16 frames
    this.loadSpriteSheet('drone', base + 'drone.png', 32, 32);

    // Rusher: 64x32, 4x6 = 24 frames
    this.loadSpriteSheet('rusher', base + 'rusher.png', 64, 32);

    // Loner A/B/C: 64x64, 4x4 = 16 frames each
    this.loadSpriteSheet('lonerA', base + 'LonerA.png', 64, 64);
    this.loadSpriteSheet('lonerB', base + 'LonerB.png', 64, 64);
    this.loadSpriteSheet('lonerC', base + 'LonerC.png', 64, 64);

    // Homer: 64x64, 4x4 = 16 frames
    this.loadSpriteSheet('homer', base + 'Homing.png', 64, 64);

    // Pod: 96x96, 6x4 = 24 frames
    this.loadSpriteSheet('pod', base + 'pod.png', 96, 96);

    // WallHugger: 64x64, 7x4 = 28 frames
    this.loadSpriteSheet('wallhugger', base + 'wallhugger.png', 64, 64);

    // Clone: 32x32, 4x5 = 20 frames
    this.loadSpriteSheet('clone', base + 'clone.png', 32, 32);

    // Wingtip: 32x64, 4x3 = 12 frames
    this.loadSpriteSheet('wingtip', base + 'Wingtip.png', 32, 64);

    // Clone jet: 24x16, single frame
    this.loadSpriteSheet('clonejet', base + 'clonejet.png', 24, 16);

    // Boss eyes: 32x32, 3x6 = 18 frames
    this.loadSpriteSheet('bosseyes', base + 'bosseyes2.png', 32, 32);

    // Explosions: 3 sizes (original 40fps = ~1.5 frames per tick at 60fps)
    // explode16: 16x16, 5x2 = 10 frames (small explosion)
    this.loadSpriteSheet('explode16', base + 'explode16.png', 16, 16);
    // explode32: 32x32, 5x2 = 10 frames (medium explosion)
    this.loadSpriteSheet('explode32', base + 'explode32.png', 32, 32).then(
      function (frames) {
        if (frames.length > 0) {
          self.registerAnimated('explosion', frames, 4);
        }
      },
    );
    // explode64: 64x64, 5x2 = 10 frames (big explosion)
    this.loadSpriteSheet('explode64', base + 'explode64.png', 64, 64);

    // Asteroids: High density (GAster - default)
    this.loadSpriteSheet('asteroid_big', base + 'GAster96.png', 96, 96);
    this.loadSpriteSheet('asteroid_med', base + 'GAster64.png', 64, 64);
    this.loadSpriteSheet('asteroid_small', base + 'GAster32.png', 32, 32);

    // Asteroids: Standard density (SAster)
    this.loadSpriteSheet('saster_big', base + 'SAster96.png', 96, 96);
    this.loadSpriteSheet('saster_med', base + 'SAster64.png', 64, 64);
    this.loadSpriteSheet('saster_small', base + 'SAster32.png', 32, 32);

    // Asteroids: Indestructible (MAster)
    this.loadSpriteSheet('master_big', base + 'MAster96.png', 96, 96);
    this.loadSpriteSheet('master_med', base + 'MAster64.png', 64, 64);
    this.loadSpriteSheet('master_small', base + 'MAster32.png', 32, 32);

    // Organic gun: 64x64, 4x4 = 16 frames
    this.loadSpriteSheet('organicgun', base + 'GShoot.png', 64, 64);

    // Homer death projectile: 16x16, 4x2 = 8 frames
    this.loadSpriteSheet('homprojc', base + 'HomProjc.png', 16, 16);

    // Dust effects: sprite-based (small strips)
    this.loadSpriteSheet('sdust', base + 'SDust.png', 8, 8);
    this.loadSpriteSheet('gdust', base + 'GDust.png', 8, 8);
    this.loadSpriteSheet('smoke', base + 'smoke.png', 32, 32);

    // Bitmap fonts
    this.loadSpriteSheet('font8x8', base + 'Font8x8.png', 8, 8);
    this.loadSpriteSheet('font16x16', base + 'font16x16.png', 16, 16);

    // Missile (player): 16x16, 2x3 = 6 frames
    this.loadSpriteSheet('missile', base + 'missile.png', 16, 16);

    // Homing missile: 32x32, 4x2 = 8 frames
    this.loadSpriteSheet('hmissile', base + 'hmissile.png', 32, 32);

    // Enemy weapon (spinner): 16x16, 8x1 = 8 frames
    this.loadSpriteSheet('enweap6', base + 'EnWeap6.png', 16, 16);

    // Spores: 16x16, 4x2 = 8 frames
    this.loadSpriteSheet('spores', base + 'SporesA.png', 16, 16);

    // Spinners (3 grades): 16x16, 8x3 = 24 frames
    this.loadSpriteSheet('spinners', base + 'spinners.png', 16, 16);

    // Powerups: 32x32, 4x2 = 8 frames each
    var puNames = [
      'PUMissil',
      'PULaser',
      'PUWeapon',
      'PUShield',
      'PUSpeed',
      'PUDive',
      'PUInvuln',
      'PUScore',
      'PULife',
    ];
    for (var i = 0; i < puNames.length; i++) {
      this.loadSpriteSheet(
        'pu_' + puNames[i].toLowerCase(),
        base + puNames[i] + '.png',
        32,
        32,
      );
    }

    // Keep existing boss_body from old assets
    this.loadStatic('boss_core', 'graphics/boss_body.png');
  },

  imgToCanvas: function (img) {
    var c = this.createCanvas(img.width, img.height);
    c.ctx.drawImage(img, 0, 0);
    return c.canvas;
  },

  loadStatic: function (key, file) {
    var self = this;
    this.loadImage('assets/' + file)
      .then(function (img) {
        self.cache[key] = self.imgToCanvas(img);
      })
      .catch(function (err) {
        console.warn('Failed to load sprite ' + key + ':', err);
      });
  },
};
