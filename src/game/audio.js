var RS = RS || {};

RS.Audio = {
  ctx: null,
  initialized: false,
  musicPlaying: false,
  masterGain: null,
  sfxGain: null,
  musicGain: null,
  muted: false,

  // Preloaded audio buffers (WAV)
  buffers: {},
  // Music elements (HTML5 Audio for MP3 looping)
  musicElements: {},
  currentMusic: null,

  // Mapping of sound names to file paths
  SFX_FILES: {
    fire_missile: 'assets/sounds/fire_missile.wav',
    fire_laser: 'assets/sounds/fire_laser.wav',
    fire_homing: 'assets/sounds/fire_homing_missile.wav',
    small_explosion: 'assets/sounds/small_explosion.wav',
    medium_explosion: 'assets/sounds/medium_explosion.wav',
    big_explosion: 'assets/sounds/big_explosion.wav',
    pickup: 'assets/sounds/pickup.wav',
    bonus: 'assets/sounds/bonus.wav',
    hit_background: 'assets/sounds/hit_background.wav',
    player_destroyed: 'assets/sounds/player_destroyed.wav',
    player_created: 'assets/sounds/player_created.wav',
    checkpoint: 'assets/sounds/checkpoint.wav',
    asteroid_breakup: 'assets/sounds/asteroid_breakup.wav',
  },

  MUSIC_FILES: {
    game: 'assets/music/game.mp3',
    boss: 'assets/music/boss.mp3',
    hiscore: 'assets/music/hiscore.mp3',
    outro: 'assets/music/outro.mp3',
  },

  init: function () {
    try {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.5;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.35;
      this.musicGain.connect(this.masterGain);

      this.initialized = true;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.preloadAll();
    } catch (e) {
      console.error('Audio init failed:', e);
    }
  },

  ensureInit: function () {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  preloadAll: function () {
    var self = this;
    var keys = Object.keys(this.SFX_FILES);
    for (var i = 0; i < keys.length; i++) {
      (function (key) {
        self.loadBuffer(key, self.SFX_FILES[key]);
      })(keys[i]);
    }

    // Preload music as HTML5 Audio elements
    var mkeys = Object.keys(this.MUSIC_FILES);
    for (var j = 0; j < mkeys.length; j++) {
      (function (key) {
        var audio = new Audio();
        audio.src = self.MUSIC_FILES[key];
        audio.preload = 'auto';
        audio.loop = true;
        self.musicElements[key] = audio;
      })(mkeys[j]);
    }
  },

  loadBuffer: function (key, url) {
    var self = this;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
      if (self.ctx) {
        self.ctx.decodeAudioData(
          request.response,
          function (buffer) {
            self.buffers[key] = buffer;
          },
          function (err) {
            console.warn('Failed to decode audio: ' + key, err);
          },
        );
      }
    };
    request.onerror = function () {
      console.warn('Failed to load audio: ' + key);
    };
    request.send();
  },

  // Play a preloaded WAV buffer
  playSfx: function (key, volume) {
    try {
      this.ensureInit();
      var buffer = this.buffers[key];
      if (!buffer) return;

      var source = this.ctx.createBufferSource();
      source.buffer = buffer;

      var gain = this.ctx.createGain();
      gain.gain.value = volume !== undefined ? volume : 1.0;

      source.connect(gain);
      gain.connect(this.sfxGain);
      source.start(0);

      // Auto-cleanup
      source.onended = function () {
        try {
          source.disconnect();
          gain.disconnect();
        } catch (e) {}
      };
    } catch (e) {
      // Silently fail - don't spam console for rapid-fire sounds
    }
  },

  // --- Public SFX methods (same signatures as before) ---

  playLaser: function () {
    this.playSfx('fire_missile');
  },

  playFireLaser: function () {
    this.playSfx('fire_laser', 0.25);
  },

  playFireHoming: function () {
    this.playSfx('fire_homing');
  },

  playExplosion: function () {
    this.playSfx('small_explosion');
  },

  playBigExplosion: function () {
    this.playSfx('big_explosion');
  },

  playMediumExplosion: function () {
    this.playSfx('medium_explosion');
  },

  playPowerup: function () {
    this.playSfx('pickup');
  },

  playBonus: function () {
    this.playSfx('bonus');
  },

  playPlayerHit: function () {
    this.playSfx('hit_background');
  },

  playShieldHit: function () {
    this.playSfx('hit_background');
  },

  playPlayerDestroyed: function () {
    this.playSfx('player_destroyed');
  },

  playPlayerCreated: function () {
    this.playSfx('player_created');
  },

  playCheckpoint: function () {
    this.playSfx('checkpoint');
  },

  playBossWarning: function () {
    this.playSfx('checkpoint');
  },

  playWaveAnnounce: function () {
    this.playSfx('checkpoint');
  },

  playWallHit: function () {
    this.playSfx('asteroid_breakup');
  },

  playCoinPickup: function () {
    this.playSfx('bonus');
  },

  // --- Music ---

  startMusic: function (trackOrIntensity, volume) {
    try {
      this.ensureInit();
      this.stopMusic();

      // Determine which track to play
      var trackKey = 'game';
      if (typeof trackOrIntensity === 'string') {
        trackKey = trackOrIntensity;
      }

      var audio = this.musicElements[trackKey];
      if (!audio) return;

      audio.volume =
        volume !== undefined
          ? volume
          : this.musicGain
            ? this.musicGain.gain.value
            : 0.35;
      audio.currentTime = 0;
      audio.loop = true;

      var playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(function () {
          // Autoplay blocked - will play on next user interaction
        });
      }

      this.currentMusic = audio;
      this.musicPlaying = true;
    } catch (e) {
      console.error('startMusic failed:', e);
    }
  },

  startBossMusic: function () {
    this.startMusic('boss');
  },

  startVictoryMusic: function () {
    this.startMusic('outro');
  },

  stopMusic: function () {
    try {
      if (this.currentMusic) {
        this.currentMusic.pause();
        this.currentMusic.currentTime = 0;
        this.currentMusic = null;
      }
      this.musicPlaying = false;
    } catch (e) {
      console.error('stopMusic failed:', e);
    }
  },

  toggleMute: function () {
    try {
      this.muted = !this.muted;
      if (this.masterGain) {
        this.masterGain.gain.value = this.muted ? 0 : 1;
      }
      // Also mute/unmute music element
      if (this.currentMusic) {
        this.currentMusic.muted = this.muted;
      }
    } catch (e) {
      console.error('toggleMute failed:', e);
    }
  },
};
