var RS = RS || {};

RS.Input = {
  keys: new Set(),
  mouse: {x: 0, y: 0, down: false},
  canvas: null,

  init: function (canvas) {
    if (!canvas) return;

    this.canvas = canvas;

    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      this.keys.add(key);

      if (e.key === 'ArrowUp') this.keys.add('arrowup');
      if (e.key === 'ArrowDown') this.keys.add('arrowdown');
      if (e.key === 'ArrowLeft') this.keys.add('arrowleft');
      if (e.key === 'ArrowRight') this.keys.add('arrowright');

      if (key === ' ' || key.startsWith('arrow')) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      this.keys.delete(key);
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
      this.mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    });

    canvas.addEventListener('mousedown', () => {
      this.mouse.down = true;
    });

    window.addEventListener('mouseup', () => {
      this.mouse.down = false;
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
    });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  },

  isDown: function (key) {
    return this.keys.has(key.toLowerCase());
  },

  mousePos: function () {
    return {x: this.mouse.x, y: this.mouse.y};
  },

  isMouseDown: function () {
    return this.mouse.down;
  },
};
