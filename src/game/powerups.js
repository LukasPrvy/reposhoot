var RS = RS || {};

RS.Powerups = {
  list: [],

  TYPES: [
    'missile',
    'laser',
    'homing',
    'weaponUpgrade',
    'clone',
    'wingtip',
    'shield',
    'speed',
    'cloak',
    'score',
    'life',
  ],

  COLORS: {
    missile: '#ff6d00',
    laser: '#00e5ff',
    homing: '#00c853',
    weaponUpgrade: '#ffffff',
    clone: '#00e5ff',
    wingtip: '#ffd600',
    shield: '#00c853',
    speed: '#ff6d00',
    cloak: '#7b1fa2',
    score: '#e040fb',
    life: '#66bb6a',
  },

  // Map powerup types to sprite sheet keys
  SHEET_KEYS: {
    missile: 'pu_pumissil',
    laser: 'pu_pulaser',
    homing: 'pu_pumissil',
    weaponUpgrade: 'pu_puweapon',
    clone: 'pu_puinvuln',
    wingtip: 'pu_puweapon',
    shield: 'pu_pushield',
    speed: 'pu_puspeed',
    cloak: 'pu_puinvuln',
    score: 'pu_puscore',
    life: 'pu_pulife',
  },

  DROP_TABLE: [
    {type: 'missile', weight: 12},
    {type: 'laser', weight: 10},
    {type: 'homing', weight: 10},
    {type: 'weaponUpgrade', weight: 15},
    {type: 'clone', weight: 5},
    {type: 'wingtip', weight: 8},
    {type: 'shield', weight: 15},
    {type: 'speed', weight: 8},
    {type: 'cloak', weight: 5},
    {type: 'score', weight: 5},
    {type: 'life', weight: 2},
  ],

  init: function () {
    this.list = [];
  },

  getRandomType: function () {
    var totalWeight = 0;
    for (var i = 0; i < this.DROP_TABLE.length; i++) {
      totalWeight += this.DROP_TABLE[i].weight;
    }
    var roll = Math.random() * totalWeight;
    var cumulative = 0;
    for (var i = 0; i < this.DROP_TABLE.length; i++) {
      cumulative += this.DROP_TABLE[i].weight;
      if (roll < cumulative) return this.DROP_TABLE[i].type;
    }
    return 'weaponUpgrade';
  },

  spawnRandom: function (x, y) {
    var type = this.getRandomType();
    this.spawn(type, x, y);
  },

  spawn: function (type, x, y) {
    var S = RS.SCALE || 1.25;
    var renderSize = 32 * S;
    var powerup = {
      type: type,
      x: x,
      y: y,
      vx: 0,
      vy: 1.5,
      active: true,
      hitRadius: 14,
      color: this.COLORS[type] || '#ffffff',
      sheetKey: this.SHEET_KEYS[type] || null,
      wobbleTimer: 0,
      animTimer: Math.floor(Math.random() * 100),
      width: renderSize,
      height: renderSize,
    };
    this.list.push(powerup);
  },

  update: function () {
    for (var i = 0; i < this.list.length; i++) {
      var p = this.list[i];
      if (!p.active) continue;

      p.y += p.vy;
      p.animTimer++;

      if (p.y > RS.GAME_HEIGHT + 20) {
        p.active = false;
      }
    }

    this.list = this.list.filter(function (p) {
      return p.active;
    });
  },

  render: function (ctx) {
    for (var i = 0; i < this.list.length; i++) {
      var p = this.list[i];
      if (!p.active) continue;

      // Simple sprite animation (8fps like original)
      var sprite = null;
      if (p.sheetKey) {
        sprite = RS.Sprites.getAnimFrame(p.sheetKey, p.animTimer, 8);
      }

      if (sprite) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          sprite,
          p.x - p.width / 2,
          p.y - p.height / 2,
          p.width,
          p.height,
        );
      }
    }
  },

  clear: function () {
    this.list = [];
  },
};
