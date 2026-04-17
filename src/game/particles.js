var RS = RS || {};

RS.Particles = {
  pool: [],
  active: [],
  MAX_PARTICLES: 3000,

  init: function () {
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.pool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0,
        color: '',
        size: 0,
        gravity: 0,
        active: false,
        alpha: 1,
      });
    }
  },

  spawn: function (x, y, vx, vy, life, color, size, gravity) {
    let p = this.pool.pop();
    if (!p) {
      p = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0,
        color: '',
        size: 0,
        gravity: 0,
        active: false,
        alpha: 1,
      };
    }
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = life;
    p.maxLife = life;
    p.color = color;
    p.size = size;
    p.gravity = gravity || 0;
    p.active = true;
    p.alpha = 1;
    this.active.push(p);
    return p;
  },

  update: function () {
    for (let i = this.active.length - 1; i >= 0; i--) {
      let p = this.active[i];
      p.life--;
      if (p.life <= 0) {
        p.active = false;
        this.pool.push(p);
        this.active[i] = this.active[this.active.length - 1];
        this.active.pop();
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha = p.life / p.maxLife;
      p.vx *= 0.99;
      p.vy *= 0.99;
    }
  },

  render: function (ctx) {
    for (let i = 0; i < this.active.length; i++) {
      let p = this.active[i];
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      if (p.size > 2) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    }
    ctx.globalAlpha = 1.0;
  },

  clear: function () {
    while (this.active.length > 0) {
      let p = this.active.pop();
      p.active = false;
      this.pool.push(p);
    }
  },

  emitThrust: function (x, y) {
    const count = RS.randomInt(2, 3);
    const colors = ['#ff9800', '#ffeb3b'];
    for (let i = 0; i < count; i++) {
      const color = colors[RS.randomInt(0, colors.length - 1)];
      const size = RS.randomRange(1, 3);
      const vx = RS.randomRange(-0.5, 0.5);
      const vy = RS.randomRange(1, 3);
      const life = RS.randomInt(10, 20);
      this.spawn(x, y, vx, vy, life, color, size, 0);
    }
  },

  emitWallDebris: function (x, y, count) {
    var c = count || 24;
    var colors = ['#A3BE8C', '#81A1C1', '#D8DEE9', '#616E88', '#88C0D0'];
    for (var i = 0; i < c; i++) {
      var angle = RS.randomRange(0, Math.PI * 2);
      var speed = RS.randomRange(1, 5);
      var vx = Math.cos(angle) * speed;
      var vy = Math.sin(angle) * speed;
      var life = RS.randomInt(45, 80);
      var color = colors[RS.randomInt(0, colors.length - 1)];
      var size = RS.randomRange(1, 5);
      this.spawn(x, y, vx, vy, life, color, size, 0.03);
    }
  },

  emitHitSparks: function (x, y, count) {
    var c = count || 16;
    var colors = ['#ffeb3b', '#ff9800', '#ffffff', '#ffcc80'];
    for (var i = 0; i < c; i++) {
      var angle = RS.randomRange(0, Math.PI * 2);
      var speed = RS.randomRange(1.5, 7);
      var vx = Math.cos(angle) * speed;
      var vy = Math.sin(angle) * speed;
      var life = RS.randomInt(18, 35);
      var color = colors[RS.randomInt(0, colors.length - 1)];
      var size = RS.randomRange(1, 3.5);
      this.spawn(x, y, vx, vy, life, color, size, 0);
    }
  },

  emitExplosionDebris: function (x, y, size, vx, vy) {
    var counts = {small: 20, medium: 36, big: 50};
    var c = counts[size] || 24;
    var colors = [
      '#ff9800',
      '#ffeb3b',
      '#ff5722',
      '#ffffff',
      '#ff7043',
      '#ffcc80',
    ];
    for (var i = 0; i < c; i++) {
      var angle = RS.randomRange(0, Math.PI * 2);
      var speed = RS.randomRange(1, 7);
      var pvx = Math.cos(angle) * speed + (vx || 0) * 0.5;
      var pvy = Math.sin(angle) * speed + (vy || 0) * 0.5;
      var life = RS.randomInt(30, 65);
      var color = colors[RS.randomInt(0, colors.length - 1)];
      var psize = RS.randomRange(1, 5.5);
      this.spawn(x, y, pvx, pvy, life, color, psize, 0.03);
    }
  },

  // Sprite-based dust effects on asteroid fragmentation
  dustEffects: [],

  emitDust: function (x, y, dustKey, count) {
    var c = count || 4;
    for (var i = 0; i < c; i++) {
      var angle = RS.randomRange(0, Math.PI * 2);
      var speed = RS.randomRange(0.3, 1.2);
      this.dustEffects.push({
        x: x + RS.randomRange(-6, 6),
        y: y + RS.randomRange(-6, 6),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        frame: 0,
        timer: 0,
        sheetKey: dustKey || 'gdust',
        alpha: 1,
        active: true,
      });
    }
  },

  updateDust: function () {
    for (var i = this.dustEffects.length - 1; i >= 0; i--) {
      var d = this.dustEffects[i];
      d.timer++;
      if (d.timer % 3 === 0) d.frame++;
      d.x += d.vx;
      d.y += d.vy;
      d.vx *= 0.95;
      d.vy *= 0.95;
      var frames = RS.Sprites ? RS.Sprites.sheets[d.sheetKey] : null;
      if (!frames || d.frame >= frames.length) {
        this.dustEffects.splice(i, 1);
      } else {
        d.alpha = 1 - d.frame / frames.length;
      }
    }
  },

  renderDust: function (ctx) {
    for (var i = 0; i < this.dustEffects.length; i++) {
      var d = this.dustEffects[i];
      var frames = RS.Sprites ? RS.Sprites.sheets[d.sheetKey] : null;
      if (!frames) continue;
      if (d.frame < frames.length) {
        var w = 8;
        ctx.globalAlpha = d.alpha !== undefined ? d.alpha : 1;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(frames[d.frame], d.x - w / 2, d.y - w / 2, w, w);
      }
    }
    ctx.globalAlpha = 1;
  },

  // Sprite-based explosions with 3 sizes and velocity inheritance
  spriteExplosions: [],

  // size: 'small' (16px), 'medium' (32px), 'big' (64px)
  // vx/vy: inherited velocity from destroyed actor
  emitSpriteExplosion: function (x, y, size, vx, vy) {
    var sheetKey, pixelSize;
    switch (size) {
      case 'small':
        sheetKey = 'explode16';
        pixelSize = 16;
        break;
      case 'big':
        sheetKey = 'explode64';
        pixelSize = 64;
        break;
      default:
        sheetKey = 'explode32';
        pixelSize = 32;
        break;
    }
    this.spriteExplosions.push({
      x: x,
      y: y,
      vx: vx || 0,
      vy: vy || 0,
      frame: 0,
      timer: 0,
      sheetKey: sheetKey,
      pixelSize: pixelSize,
      active: true,
    });
  },

  // Play correct audio for explosion size
  playExplosionAudio: function (size) {
    if (!RS.Audio) return;
    switch (size) {
      case 'small':
        RS.Audio.playExplosion();
        break;
      case 'big':
        RS.Audio.playBigExplosion();
        break;
      default:
        RS.Audio.playMediumExplosion();
        break;
    }
  },

  updateSpriteExplosions: function () {
    for (var i = this.spriteExplosions.length - 1; i >= 0; i--) {
      var se = this.spriteExplosions[i];
      se.timer++;
      // Original runs at 40fps; at 60fps that's ~1.5 frames/tick
      if (se.timer % 2 === 0) se.frame++;
      // Apply inherited velocity
      se.x += se.vx;
      se.y += se.vy;
      var frames = RS.Sprites ? RS.Sprites.sheets[se.sheetKey] : null;
      if (!frames || se.frame >= frames.length) {
        this.spriteExplosions.splice(i, 1);
      }
    }
  },

  renderSpriteExplosions: function (ctx) {
    for (var i = 0; i < this.spriteExplosions.length; i++) {
      var se = this.spriteExplosions[i];
      var frames = RS.Sprites ? RS.Sprites.sheets[se.sheetKey] : null;
      if (!frames) continue;
      if (se.frame < frames.length) {
        var S = RS.SCALE || 1.25;
        var w = se.pixelSize * S;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(frames[se.frame], se.x - w / 2, se.y - w / 2, w, w);
      }
    }
  },
};
