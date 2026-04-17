var RS = RS || {};

RS.UI = {
  floatingTexts: [],
  showFPS: false,
  fps: 0,
  frameCount: 0,
  fpsTimer: 0,

  // Sprite font system
  // font8x8: 8x16 grid, 96 printable chars (ASCII 32-127), each tile 8x8
  // font16x16: 8x12 grid, 96 printable chars (ASCII 32-127), each tile 16x16

  drawSpriteText: function (ctx, text, x, y, fontKey, scale) {
    var frames = RS.Sprites ? RS.Sprites.sheets[fontKey] : null;
    if (!frames || frames.length === 0) {
      // Fallback to canvas text
      ctx.fillStyle = '#ffffff';
      ctx.font = (fontKey === 'font16x16' ? '16' : '10') + 'px monospace';
      ctx.fillText(text, x, y);
      return;
    }
    var tileSize = fontKey === 'font16x16' ? 16 : 8;
    var asciiOffset = 32;
    var s = scale || 1;
    var drawSize = tileSize * s;
    for (var i = 0; i < text.length; i++) {
      var charCode = text.charCodeAt(i) - asciiOffset;
      if (charCode >= 0 && charCode < frames.length) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          frames[charCode],
          x + i * drawSize,
          y,
          drawSize,
          drawSize,
        );
      }
    }
  },

  // Measure sprite text width
  measureSpriteText: function (text, fontKey, scale) {
    var tileSize = fontKey === 'font16x16' ? 16 : 8;
    var s = scale || 1;
    return text.length * tileSize * s;
  },

  // Draw centered sprite text
  drawSpriteTextCentered: function (ctx, text, cx, y, fontKey, scale) {
    var w = this.measureSpriteText(text, fontKey, scale);
    this.drawSpriteText(ctx, text, cx - w / 2, y, fontKey, scale);
  },

  init: function () {
    this.floatingTexts = [];
  },

  // Add pickup label using sprite font
  addLabel: function (x, y, text) {
    this.floatingTexts.push({
      x: x,
      y: y,
      text: text,
      isLabel: true,
      life: 30, // 0.5s at 60fps
      maxLife: 30,
      vy: -1.25, // 1.25 px/frame upward
    });
  },

  addFloatingText: function (x, y, text, color) {
    this.floatingTexts.push({
      x: x,
      y: y,
      text: text,
      color: color || '#ffffff',
      isLabel: false,
      life: 30,
      maxLife: 30,
      vy: -1.25,
    });
  },

  update: function () {
    for (var i = this.floatingTexts.length - 1; i >= 0; i--) {
      var ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  },

  renderMenu: function (ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, RS.GAME_WIDTH, RS.GAME_HEIGHT);

    ctx.save();
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#4fc3f7';
    ctx.fillText('REPOSHOOT', RS.GAME_WIDTH / 2, 180);
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.fillStyle = '#556677';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Clean your code!', RS.GAME_WIDTH / 2, 215);

    var alpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.004);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('PRESS SPACE', RS.GAME_WIDTH / 2, 320);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#445566';
    ctx.font = '12px monospace';
    ctx.fillText('Arrows / WASD = Move', RS.GAME_WIDTH / 2, 390);
    ctx.fillText('Space = Fire', RS.GAME_WIDTH / 2, 410);
    ctx.fillText('ESC = Pause', RS.GAME_WIDTH / 2, 430);

    ctx.fillStyle = '#445566';
    ctx.font = '10px monospace';
    ctx.fillText(
      'Original game (C) The Bitmap Brothers. All rights reserved.',
      RS.GAME_WIDTH / 2,
      520,
    );
    ctx.fillText('Created by Lukas Prvy 2026', RS.GAME_WIDTH / 2, 540);
    ctx.textAlign = 'left';
  },

  renderHUD: function (ctx) {
    // Sprite font for HUD text
    this.drawSpriteTextCentered(ctx, 'HI SCORE', 400, 2, 'font8x8', 1);
    var hiVal =
      RS.Game && RS.Game.hiScore > RS.Player.score
        ? RS.Game.hiScore
        : RS.Player.score;
    var hiScore = String(hiVal).padStart(10, '0');
    this.drawSpriteTextCentered(ctx, hiScore, 400, 14, 'font16x16', 1);

    this.drawSpriteText(ctx, 'SCORE', 12, 2, 'font8x8', 1);
    var playerScore = String(RS.Player.score).padStart(10, '0');
    this.drawSpriteText(ctx, playerScore, 12, 14, 'font16x16', 1);

    var inv = RS.Player ? RS.Player.inventory : {};
    for (var li = 0; li < RS.Player.lives; li++) {
      var lifeSprite = RS.Sprites.getFrame('pu_pulife', 0);
      if (lifeSprite) {
        ctx.drawImage(lifeSprite, 12 + li * 40, 520, 32, 32);
      }
    }

    var barX = 12;
    var barY = 575;
    var barWidth = 125;
    var barHeight = 11;
    var shieldPct = RS.Player.shield / RS.Player.maxShield;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    var barColor;
    if (RS.Player.godMode) {
      barColor = '#ffd700';
      shieldPct = 1;
    } else if (RS.Player.cloakActive) {
      barColor = '#0000ff';
    } else if (shieldPct > 0.66) {
      barColor = '#00ff00';
    } else if (shieldPct > 0.33) {
      barColor = '#ffff00';
    } else {
      barColor = '#ff0000';
    }

    ctx.fillStyle = barColor;
    ctx.fillRect(barX + 1, barY + 1, (barWidth - 2) * shieldPct, barHeight - 2);

    ctx.fillStyle = '#000000';
    var filledWidth = (barWidth - 2) * shieldPct;
    for (var seg = 6; seg < filledWidth; seg += 6) {
      ctx.fillRect(barX + 1 + seg, barY + 1, 1, barHeight - 2);
    }

    if (RS.Player.cloakActive) {
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        'CLOAK ' + Math.ceil(RS.Player.cloakTimer / 60) + 's',
        barX + barWidth + 8,
        barY + 9,
      );
    }
  },

  renderBossHealthBar: function (ctx) {
    if (!RS.Boss.active) return;

    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('BOSS SHIELD', 344, 50);

    var barX = 338;
    var barY = 62;
    var barWidth = 125;
    var barHeight = 11;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    var hpPct = RS.Boss.hp / RS.Boss.maxHp;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(barX + 1, barY + 1, (barWidth - 2) * hpPct, barHeight - 2);
  },

  renderWaveAnnouncement: function (ctx) {
    var msg = RS.Waves.getCurrentMessage();
    if (!msg) return;
    ctx.save();
    ctx.fillStyle = '#f44336';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#f44336';
    ctx.fillText(msg, RS.GAME_WIDTH / 2, RS.GAME_HEIGHT / 2);
    ctx.restore();
  },

  renderFloatingTexts: function (ctx) {
    for (var i = 0; i < this.floatingTexts.length; i++) {
      var text = this.floatingTexts[i];
      var alpha = text.life / text.maxLife;
      ctx.globalAlpha = alpha;
      // Use sprite font for labels
      this.drawSpriteTextCentered(ctx, text.text, text.x, text.y, 'font8x8', 1);
    }
    ctx.globalAlpha = 1;
  },

  renderGameOver: function (ctx, ready) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, RS.GAME_WIDTH, RS.GAME_HEIGHT);

    ctx.save();
    ctx.fillStyle = '#f44336';
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#f44336';
    ctx.fillText('GAME OVER', RS.GAME_WIDTH / 2, 230);
    ctx.restore();

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SCORE: ' + RS.Player.score, RS.GAME_WIDTH / 2, 280);

    if (ready) {
      var alpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.004);
      ctx.globalAlpha = alpha;
      ctx.font = '16px monospace';
      ctx.fillText('PRESS SPACE', RS.GAME_WIDTH / 2, 360);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = 'left';
  },

  renderWin: function (ctx, ready) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, RS.GAME_WIDTH, RS.GAME_HEIGHT);

    ctx.save();
    ctx.fillStyle = '#66bb6a';
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#66bb6a';
    ctx.fillText('YOU WIN', RS.GAME_WIDTH / 2, 200);
    ctx.restore();

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FINAL SCORE: ' + RS.Player.score, RS.GAME_WIDTH / 2, 260);

    ctx.fillStyle = '#8899aa';
    ctx.font = '14px monospace';
    ctx.fillText('The code is clean!', RS.GAME_WIDTH / 2, 300);

    if (ready) {
      var alpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.004);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.fillText('PRESS SPACE', RS.GAME_WIDTH / 2, 380);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = 'left';
  },

  renderFPS: function (ctx) {
    if (!this.showFPS) return;
    ctx.fillStyle = '#00ff00';
    ctx.font = '10px monospace';
    ctx.fillText('FPS: ' + this.fps, RS.GAME_WIDTH - 70, RS.GAME_HEIGHT - 8);
  },

  updateFPS: function (timestamp) {
    this.frameCount++;
    if (!this.fpsTimer) this.fpsTimer = timestamp;
    if (timestamp - this.fpsTimer >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = timestamp;
    }
  },
};
