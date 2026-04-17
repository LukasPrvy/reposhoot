var RS = RS || {};

RS.Game = {
  canvas: null,
  ctx: null,
  state: 'LOADING',
  lastTime: 0,
  accumulator: 0,
  TIMESTEP: 1000 / 60,
  cleanupCounter: 0,
  startTime: 0,
  menuReady: false,
  menuReadyTimer: 0,
  fadeAlpha: 0,
  fadeSpeed: 0,
  fadeCallback: null,
  escWasDown: false,
  pausedFrom: null,
  gameOverTimer: 0,
  gameOverReady: false,
  hiScore: 0,

  init: function () {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.hiScore = parseInt(
      localStorage.getItem('reposhoot_hiscore') || '0',
      10,
    );

    RS.Input.init(this.canvas);
    RS.Sprites.init();
    RS.Particles.init();
    RS.Weapons.init();
    RS.Enemies.init();
    RS.Boss.init();
    RS.Powerups.init();
    RS.Companions.init();
    RS.Collision.init();
    RS.Waves.init();
    RS.UI.init();

    var self = this;
    RS.CodeEnv.init()
      .then(function () {
        self.state = 'MENU';
        self.menuReady = false;
        self.menuReadyTimer = 0;
        RS.Audio.ensureInit();
      })
      .catch(function (err) {
        console.error('Failed to load code:', err);
        RS.CodeEnv.lineBuffer = [];
        RS.CodeEnv.rightLineBuffer = [];
        for (var i = 0; i < 500; i++) {
          RS.CodeEnv.lineBuffer.push(
            '// RepoShoot - No code loaded - Play anyway!',
          );
          RS.CodeEnv.lineBuffer.push('function game() { return "fun"; }');
          RS.CodeEnv.lineBuffer.push(
            'const score = player.hp * weapons.damage;',
          );
          RS.CodeEnv.lineBuffer.push('');
          RS.CodeEnv.rightLineBuffer.push('// RepoShoot fallback code');
          RS.CodeEnv.rightLineBuffer.push('var enemies = spawn(wave);');
          RS.CodeEnv.rightLineBuffer.push(
            'if (collision) explode(enemy.x, enemy.y);',
          );
          RS.CodeEnv.rightLineBuffer.push('');
        }
        RS.CodeEnv.buildInitialGrids();
        RS.CodeEnv.loaded = true;
        self.state = 'MENU';
        self.menuReady = false;
        self.menuReadyTimer = 0;
      });

    requestAnimationFrame(function (t) {
      self.gameLoop(t);
    });
  },

  gameLoop: function (timestamp) {
    var dt = timestamp - this.lastTime;
    this.lastTime = timestamp;
    if (dt > 100) dt = 100;

    RS.UI.updateFPS(timestamp);

    this.accumulator += dt;
    while (this.accumulator >= this.TIMESTEP) {
      this.update();
      this.accumulator -= this.TIMESTEP;
    }

    this.render();
    var self = this;
    requestAnimationFrame(function (t) {
      self.gameLoop(t);
    });
  },

  update: function () {
    RS.Sprites.tick();

    var escDown = RS.Input.isDown('escape');
    var escPressed = escDown && !this.escWasDown;
    this.escWasDown = escDown;

    if (escPressed && (this.state === 'PLAYING' || this.state === 'BOSS')) {
      this.pausedFrom = this.state;
      this.state = 'PAUSED';
      return;
    }
    if (escPressed && this.state === 'PAUSED') {
      this.state = this.pausedFrom || 'PLAYING';
      return;
    }

    switch (this.state) {
      case 'LOADING':
        break;

      case 'MENU':
        RS.CodeEnv.update();
        if (!this.menuReady) {
          this.menuReadyTimer++;
          if (this.menuReadyTimer > 30 && !RS.Input.isDown(' ')) {
            this.menuReady = true;
          }
        } else if (RS.Input.isDown(' ')) {
          this.startGame();
        }
        break;

      case 'PLAYING':
        if (this.fadeAlpha > 0) {
          this.fadeAlpha += this.fadeSpeed;
          if (this.fadeAlpha < 0) this.fadeAlpha = 0;
        }

        RS.CodeEnv.update();
        RS.Player.update();
        RS.Companions.update();
        RS.Weapons.update(RS.Enemies.list);
        RS.Enemies.update();
        RS.Waves.update();
        RS.Powerups.update();
        RS.Particles.update();
        if (RS.Particles.updateSpriteExplosions)
          RS.Particles.updateSpriteExplosions();
        if (RS.Particles.updateDust) RS.Particles.updateDust();
        RS.Collision.checkAll();
        RS.UI.update();

        this.handleBossCollision();

        if (!RS.Player.alive) {
          this.state = 'DYING';
          this.gameOverTimer = 60;
          RS.Audio.stopMusic();
        }

        if (RS.Boss.active) {
          this.state = 'BOSS';
          RS.Audio.startMusic('boss');
        }
        break;

      case 'BOSS':
        RS.CodeEnv.update();
        RS.Player.update();
        RS.Companions.update();
        RS.Weapons.update(RS.Enemies.list);
        RS.Enemies.update();
        RS.Boss.update();
        RS.Powerups.update();
        RS.Particles.update();
        if (RS.Particles.updateSpriteExplosions)
          RS.Particles.updateSpriteExplosions();
        if (RS.Particles.updateDust) RS.Particles.updateDust();
        RS.Collision.checkAll();
        this.handleBossCollision();
        RS.UI.update();

        if (!RS.Player.alive) {
          this.state = 'DYING';
          this.gameOverTimer = 60;
          RS.Audio.stopMusic();
        }

        if (RS.Boss.isDead()) {
          this.state = 'WIN';
          this.gameOverTimer = 120;
          this.gameOverReady = false;
          this.updateHiScore();
          RS.Audio.startMusic('outro');
        }
        break;

      case 'PAUSED':
        break;

      case 'DYING':
        RS.Particles.update();
        if (RS.Particles.updateSpriteExplosions)
          RS.Particles.updateSpriteExplosions();
        RS.CodeEnv.update();
        this.gameOverTimer--;
        if (this.gameOverTimer <= 0) {
          this.state = 'GAME_OVER';
          this.gameOverTimer = 120;
          this.gameOverReady = false;
          this.updateHiScore();
          RS.Audio.startMusic('hiscore');
        }
        break;

      case 'GAME_OVER':
        RS.Particles.update();
        RS.CodeEnv.update();
        this.gameOverTimer--;
        if (this.gameOverTimer <= 0 && !this.gameOverReady) {
          this.gameOverReady = true;
        }
        if (this.gameOverReady && RS.Input.isDown(' ')) {
          this.restartGame();
        }
        break;

      case 'WIN':
        RS.Particles.update();
        RS.CodeEnv.update();
        this.gameOverTimer--;
        if (this.gameOverTimer <= 0 && !this.gameOverReady) {
          this.gameOverReady = true;
        }
        if (this.gameOverReady && RS.Input.isDown(' ')) {
          this.restartGame();
        }
        break;
    }

    this.cleanupCounter++;
    if (this.cleanupCounter >= 60) {
      this.cleanupCounter = 0;
      this.compactArrays();
    }
  },

  render: function () {
    var ctx = this.ctx;
    ctx.fillStyle = RS.Colors.bg;
    ctx.fillRect(0, 0, RS.GAME_WIDTH, RS.GAME_HEIGHT);

    ctx.save();
    RS.updateShake();
    ctx.translate(RS.screenShake.x, RS.screenShake.y);

    if (RS.CodeEnv.loaded) {
      RS.CodeEnv.render(ctx);
    }

    switch (this.state) {
      case 'LOADING':
        ctx.fillStyle = '#4fc3f7';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Loading code...', RS.GAME_WIDTH / 2, RS.GAME_HEIGHT / 2);
        ctx.textAlign = 'left';
        break;

      case 'MENU':
        RS.UI.renderMenu(ctx);
        break;

      case 'PLAYING':
      case 'BOSS':
        RS.Powerups.render(ctx);
        RS.Weapons.render(ctx);
        RS.Enemies.render(ctx);
        if (RS.Boss.active) RS.Boss.render(ctx);
        RS.Player.render(ctx);
        RS.Companions.render(ctx);
        RS.Particles.render(ctx);
        if (RS.Particles.renderSpriteExplosions)
          RS.Particles.renderSpriteExplosions(ctx);
        if (RS.Particles.renderDust) RS.Particles.renderDust(ctx);
        RS.UI.renderFloatingTexts(ctx);
        RS.UI.renderHUD(ctx);
        RS.UI.renderWaveAnnouncement(ctx);
        if (RS.Boss.active) RS.UI.renderBossHealthBar(ctx);
        break;

      case 'PAUSED':
        RS.Powerups.render(ctx);
        RS.Weapons.render(ctx);
        RS.Enemies.render(ctx);
        if (RS.Boss.active) RS.Boss.render(ctx);
        RS.Player.render(ctx);
        RS.Companions.render(ctx);
        RS.Particles.render(ctx);
        RS.UI.renderHUD(ctx);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, RS.GAME_WIDTH, RS.GAME_HEIGHT);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', RS.GAME_WIDTH / 2, RS.GAME_HEIGHT / 2 - 20);
        ctx.fillStyle = '#888888';
        ctx.font = '18px monospace';
        ctx.fillText(
          'Press ESC to resume',
          RS.GAME_WIDTH / 2,
          RS.GAME_HEIGHT / 2 + 30,
        );
        ctx.textAlign = 'left';
        break;

      case 'DYING':
        RS.Enemies.render(ctx);
        if (RS.Boss.active) RS.Boss.render(ctx);
        RS.Particles.render(ctx);
        if (RS.Particles.renderSpriteExplosions)
          RS.Particles.renderSpriteExplosions(ctx);
        RS.UI.renderHUD(ctx);
        break;

      case 'GAME_OVER':
        RS.Particles.render(ctx);
        if (RS.Particles.renderSpriteExplosions)
          RS.Particles.renderSpriteExplosions(ctx);
        RS.UI.renderGameOver(ctx, this.gameOverReady);
        break;

      case 'WIN':
        RS.Particles.render(ctx);
        RS.UI.renderWin(ctx, this.gameOverReady);
        break;
    }

    if (this.fadeAlpha > 0) {
      ctx.globalAlpha = this.fadeAlpha;
      ctx.fillStyle = '#000000';
      ctx.fillRect(-10, -10, RS.GAME_WIDTH + 20, RS.GAME_HEIGHT + 20);
      ctx.globalAlpha = 1;
    }

    RS.UI.renderFPS(ctx);
    ctx.restore();
  },

  startGame: function () {
    RS.Audio.ensureInit();
    RS.Player.init();
    RS.Weapons.init();
    RS.Enemies.init();
    RS.Boss.init();
    RS.Powerups.init();
    RS.Companions.init();
    RS.Particles.clear();
    RS.Waves.init();
    RS.UI.init();
    this.state = 'PLAYING';
    this.startTime = Date.now();
    RS.Weapons.fireTimer = 30;
    RS.Audio.startMusic('game');
  },

  restartGame: function () {
    this.gameOverTimer = 0;
    this.gameOverReady = false;
    this.startGame();
  },

  updateHiScore: function () {
    if (RS.Player.score > this.hiScore) {
      this.hiScore = RS.Player.score;
      try {
        localStorage.setItem('reposhoot_hiscore', String(this.hiScore));
      } catch (e) {}
    }
  },

  handleBossCollision: function () {
    if (!RS.Boss.active || RS.Boss.dead) return;

    for (var i = 0; i < RS.Weapons.bullets.length; i++) {
      var bullet = RS.Weapons.bullets[i];
      if (!bullet.active) continue;

      var hitPart = false;
      var parts = RS.Boss.getHittableParts();
      for (var j = 0; j < parts.length; j++) {
        var part = parts[j];
        if (
          RS.Collision.circleCollision(
            {x: bullet.x, y: bullet.y, radius: bullet.hitRadius},
            {x: part.x, y: part.y, radius: part.radius},
          )
        ) {
          RS.Boss.hitPart(part.part, bullet.damage);
          bullet.active = false;
          hitPart = true;
          break;
        }
      }
      if (hitPart) continue;

      if (RS.Boss.mouth.exposed) {
        var bossBounds = RS.Boss.getBounds();
        if (
          RS.Collision.circleCollision(
            {x: bullet.x, y: bullet.y, radius: bullet.hitRadius},
            bossBounds,
          )
        ) {
          RS.Boss.hit(bullet.damage);
          bullet.active = false;
        }
      }
    }
  },

  compactArrays: function () {
    RS.Weapons.bullets = RS.Weapons.bullets.filter(function (b) {
      return b.active;
    });
    RS.Enemies.list = RS.Enemies.list.filter(function (e) {
      return e.active;
    });
    RS.Enemies.bullets = RS.Enemies.bullets.filter(function (b) {
      return b.active;
    });
    RS.Powerups.list = RS.Powerups.list.filter(function (p) {
      return p.active;
    });
  },
};

window.addEventListener('DOMContentLoaded', function () {
  RS.Game.init();
});

RS._cheatBuffer = '';
RS._cheatInProgress = false;
window.addEventListener('keydown', function (e) {
  if (e.key === 'f' || e.key === 'F') RS.UI.showFPS = !RS.UI.showFPS;
  if (e.key === 'm' || e.key === 'M') RS.Audio.toggleMute();

  // God mode
  var state = RS.Game.state;
  if (state === 'PLAYING' || state === 'BOSS') {
    RS._cheatBuffer += e.key.toLowerCase();
    if (RS._cheatBuffer.length > 10) {
      RS._cheatBuffer = RS._cheatBuffer.slice(-10);
    }
    if (RS._cheatBuffer.endsWith('iddqd')) {
      RS._cheatBuffer = '';
      RS.Player.godMode = !RS.Player.godMode;
      if (RS.UI && RS.UI.addFloatingText) {
        var msg = RS.Player.godMode ? 'GOD MODE ON' : 'GOD MODE OFF';
        RS.UI.addFloatingText(RS.Player.x, RS.Player.y - 40, msg, '#ffd700');
      }
      if (RS.Audio && RS.Audio.playBonus) RS.Audio.playBonus();
    } else {
      var code = 'iddqd';
      var buf = RS._cheatBuffer;
      RS._cheatInProgress = false;
      for (var cl = Math.min(buf.length, 4); cl >= 1; cl--) {
        if (buf.slice(-cl) === code.slice(0, cl)) {
          RS._cheatInProgress = true;
          break;
        }
      }
    }
  } else {
    RS._cheatBuffer = '';
    RS._cheatInProgress = false;
  }
});
