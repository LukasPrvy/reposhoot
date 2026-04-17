var RS = RS || {};

RS.Companions = {
  list: [],
  orbitAngle: 0,
  orbitRadius: 50,
  orbitSpeed: 0.05,

  init: function () {
    this.list = [];
    this.orbitAngle = 0;
  },

  add: function () {
    if (this.list.length >= 2) return false;
    var S = RS.SCALE || 1.25;
    var comp = {
      x: RS.Player.x,
      y: RS.Player.y,
      hp: 60,
      maxHp: 60,
      active: true,
      hitRadius: 10,
      width: 32 * S,
      height: 32 * S,
      alpha: 1,
      animTimer: 0,
    };
    this.list.push(comp);
    if (RS.Player) RS.Player.inventory.companionCount = this.list.length;
    return true;
  },

  update: function () {
    if (!RS.Player || !RS.Player.alive) return;

    this.orbitAngle += this.orbitSpeed;

    for (var i = this.list.length - 1; i >= 0; i--) {
      var comp = this.list[i];
      if (!comp.active) {
        this.list.splice(i, 1);
        if (RS.Player) RS.Player.inventory.companionCount = this.list.length;
        continue;
      }

      comp.animTimer++;

      var angleOffset = i === 0 ? 0 : Math.PI;
      var targetAngle = this.orbitAngle + angleOffset;
      var targetX = RS.Player.x + Math.cos(targetAngle) * this.orbitRadius;
      var targetY = RS.Player.y + Math.sin(targetAngle) * this.orbitRadius;

      comp.x += (targetX - comp.x) * 0.15;
      comp.y += (targetY - comp.y) * 0.15;

      if (RS.CodeEnv && RS.CodeEnv.loaded) {
        var bounds = RS.CodeEnv.getCorridorBounds(comp.y);
        var minX = bounds.left + comp.width / 2;
        var maxX = bounds.right - comp.width / 2;
        comp.x = RS.clamp(comp.x, minX, maxX);
      }

      comp.y = RS.clamp(comp.y, 20, RS.GAME_HEIGHT - 20);

      if (RS.Player.cloakActive) {
        comp.alpha = 0.1 + Math.random() * 0.3;
      } else {
        comp.alpha = 1;
      }

      if (comp.hp <= 0) {
        comp.active = false;
        if (RS.Particles)
          RS.Particles.emitSpriteExplosion(comp.x, comp.y, 'medium', 0, 0);
        if (RS.Audio) RS.Audio.playExplosion();
      }
    }
  },

  render: function (ctx) {
    for (var i = 0; i < this.list.length; i++) {
      var comp = this.list[i];
      if (!comp.active) continue;

      ctx.save();
      ctx.globalAlpha = comp.alpha;

      // Render clone jet behind companion
      var jetFrame = RS.Sprites.getFrame('clonejet', 0);
      if (jetFrame) {
        var S = RS.SCALE || 1.25;
        var jetW = 24 * S;
        var jetH = 16 * S;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          jetFrame,
          comp.x - jetW / 2,
          comp.y + comp.height / 2 - 5,
          jetW,
          jetH,
        );
      }

      // Render clone sprite (20 frames animated)
      var cloneFrame = RS.Sprites.getAnimFrame('clone', comp.animTimer, 10);
      if (cloneFrame) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          cloneFrame,
          comp.x - comp.width / 2,
          comp.y - comp.height / 2,
          comp.width,
          comp.height,
        );
      }

      ctx.restore();
    }
  },

  hitCompanion: function (comp, damage) {
    if (!comp.active) return;
    comp.hp -= damage || 1;
    if (comp.hp <= 0) {
      comp.active = false;
      if (RS.Particles)
        RS.Particles.emitSpriteExplosion(comp.x, comp.y, 'medium', 0, 0);
      if (RS.Audio) RS.Audio.playExplosion();
    }
  },

  getCount: function () {
    var count = 0;
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].active) count++;
    }
    return count;
  },

  clear: function () {
    this.list = [];
    this.orbitAngle = 0;
  },
};
