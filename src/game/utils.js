var RS = RS || {};

RS.GAME_WIDTH = 800;
RS.GAME_HEIGHT = 600;
RS.CORRIDOR_LEFT = 200; // nominal minimum - actual edge varies per row
RS.CORRIDOR_RIGHT = 600; // nominal minimum - actual edge varies per row
RS.CODE_WALL_CHARS = 50; // max characters per wall (lines can be shorter)
RS.CHAR_WIDTH = 7;
RS.CHAR_HEIGHT = 14;
RS.MIN_CORRIDOR_WIDTH = 320; // never narrower than this
RS.MAX_WALL_PX = 240; // max pixel width a wall can extend into the screen
RS.SCALE = 1.25; // Xenon 2000 was 640x480, canvas is 800x600

RS.Colors = {
  bg: '#0d1117',
  codeBg: '#161b22',
  keyword: '#81A1C1',
  string: '#A3BE8C',
  comment: '#616E88',
  number: '#D08770',
  operator: '#B48EAD',
  text: '#D8DEE9',
  corridorEdge: '#58a6ff',
  player: '#4fc3f7',
  enemy: '#ff6b6b',
  bullet: '#ffeb3b',
  shield: '#42a5f5',
  health: '#66bb6a',
  explosion: '#ff9800',
};

RS.lerp = function (a, b, t) {
  return a + (b - a) * t;
};

RS.clamp = function (val, min, max) {
  return Math.max(min, Math.min(max, val));
};

RS.distance = function (x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

RS.randomRange = function (min, max) {
  return Math.random() * (max - min) + min;
};

RS.randomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

RS.angle = function (x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
};

RS.degToRad = function (deg) {
  return (deg * Math.PI) / 180;
};

RS.normalize = function (x, y) {
  var len = Math.sqrt(x * x + y * y);
  if (len === 0) {
    return {x: 0, y: 0};
  }
  return {x: x / len, y: y / len};
};

RS.ObjectPool = (function () {
  function ObjectPool(factory, initialSize) {
    this.factory = factory;
    this.pool = [];
    for (var i = 0; i < initialSize; i++) {
      var obj = this.factory();
      obj.active = false;
      this.pool.push(obj);
    }
  }

  ObjectPool.prototype.get = function () {
    var obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.factory();
    }
    obj.active = true;
    return obj;
  };

  ObjectPool.prototype.release = function (obj) {
    obj.active = false;
    this.pool.push(obj);
  };

  return ObjectPool;
})();

RS.ease = {
  linear: function (t) {
    return t;
  },
  easeInOut: function (t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  easeOut: function (t) {
    return t * (2 - t);
  },
  easeIn: function (t) {
    return t * t;
  },
  bounce: function (t) {
    var n1 = 7.5625;
    var d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
};

RS.screenShake = {x: 0, y: 0, intensity: 0, decay: 0.9};
RS.addShake = function (intensity) {
  RS.screenShake.intensity = Math.max(RS.screenShake.intensity, intensity);
};
RS.updateShake = function () {
  if (RS.screenShake.intensity < 0.5) {
    RS.screenShake.x = 0;
    RS.screenShake.y = 0;
    RS.screenShake.intensity = 0;
    return;
  }
  RS.screenShake.x = (Math.random() - 0.5) * RS.screenShake.intensity * 2;
  RS.screenShake.y = (Math.random() - 0.5) * RS.screenShake.intensity * 2;
  RS.screenShake.intensity *= RS.screenShake.decay;
};
