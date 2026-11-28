const THEME_STORAGE_KEY = "petes_pretzels_theme";
const COLLAPSED_SECTIONS_KEY = "petes_pretzels_collapsed_sections_v1";
const AUDIO_PREFS_KEY = "petes_pretzels_audio_v1";
// Shooting star: checked every minute, ~1 in 90 per check, so roughly once per 1.5 hours on average.
const SHOOTING_STAR_CHECK_MS = 60 * 1000;
const SHOOTING_STAR_CHANCE = 1 / 90;
// Star twinkle: one random star every 4 to 12 seconds.
const STAR_TWINKLE_MIN_MS = 4000;
const STAR_TWINKLE_MAX_MS = 12000;
const MAX_CLICK_POPS = 12;
const STARFIELD_STAR_COUNT = 24;

const FMT2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const FMT1 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// unlock = continent index (0 = NA ... 6 = Antarctica) needed before the track appears in the picker.
// Bonus tracks (unlock 7) open once you reach Global Franchise.
// galactic-spacetrip.mp3 removed; painted_sky.mp3 is default.
const MUSIC_TRACKS = [
  { file: "painted_sky.mp3", label: "Beneath a Painted Sky", unlock: 0 },
  { file: "luminous_canopy.mp3", label: "Under the Luminous Canopy", unlock: 1 },
  { file: "patterns_on_the_pane.mp3", label: "Patterns on the Pane", unlock: 2 },
  { file: "midnight_pines.mp3", label: "Midnight Under the Pines", unlock: 3 },
  { file: "the_only_creed.mp3", label: "The Only Creed", unlock: 4 },
  { file: "jazzy.mp3", label: "Jazzy", unlock: 5 },
  { file: "minecraft.mp3", label: "Minecraft", unlock: 6 },
  { file: "binaural-deep-space.mp3", label: "Binaural Deep Space", unlock: 7 },
  { file: "chill.mp3", label: "Chill", unlock: 7 },
  { file: "vibes.mp3", label: "Vybez", unlock: 7 }
];

const CONTINENT_THEME_MAP = [
  "espresso",       // 0: North America
  "emerald",        // 1: South America
  "indigo",         // 2: Europe
  "sahara",         // 3: Africa
  "cyber",          // 4: Asia
  "coral",          // 5: Oceania
  "glacial"         // 6: Antarctica
];

const THEMES_CATALOG = [
  { id: "espresso", name: "Warm Espresso (Default)", minContinent: 0, requiresGoldUi: false, requiresAllAchievements: false, requiresSubHourWin: false },
  { id: "computer-green", name: "Computer Green", minContinent: 0, requiresGoldUi: false, requiresAllAchievements: false, requiresSubHourWin: false },
  { id: "light-mode", name: "Light Mode", minContinent: 0, requiresGoldUi: false, requiresAllAchievements: false, requiresSubHourWin: false },
  { id: "terminal", name: "Midnight Terminal", minContinent: 0, requiresGoldUi: false, requiresAllAchievements: false, requiresSubHourWin: false },
  { id: "copper", name: "Bavarian Copper", minContinent: 0, requiresGoldUi: false, requiresAllAchievements: false, requiresSubHourWin: false },
  { id: "emerald", name: "Amazon Emerald", minContinent: 1, unlockLabel: "South America", requiresGoldUi: false, requiresAllAchievements: false, requiresSubHourWin: false },
  { id: "indigo", name: "Royal Lye Indigo", minContinent: 2, unlockLabel: "Europe", requiresGoldUi: false, requiresAllAchievements: false, requiresSubHourWin: false },
  { id: "sahara", name: "Sahara Gold", minContinent: 3, unlockLabel: "Africa", requiresGoldUi: false, requiresAllAchievements: false, requiresSubHourWin: false },
  { id: "cyber", name: "Neon Tokyo Cyber", minContinent: 4, unlockLabel: "Asia", requiresGoldUi: false, requiresAllAchievements: false, requiresSubHourWin: false },
  { id: "coral", name: "Coral Reef Teal", minContinent: 5, unlockLabel: "Oceania", requiresGoldUi: false, requiresAllAchievements: false, requiresSubHourWin: false },
  { id: "glacial", name: "Glacial Cryo Frost", minContinent: 6, unlockLabel: "Antarctica", requiresGoldUi: false, requiresAllAchievements: false, requiresSubHourWin: false },
  { id: "gold-solid", name: "Solid Gold UI", minContinent: 7, unlockLabel: "Final World", requiresGoldUi: true, requiresAllAchievements: false, requiresSubHourWin: false },
  { id: "diamond-sparkly", name: "Diamond Sparkly", minContinent: 0, unlockLabel: "Beat Full Run in < 1h", requiresGoldUi: false, requiresAllAchievements: false, requiresSubHourWin: true },
  { id: "rgb-rainbow", name: "Moving RGB Rainbow", minContinent: 0, unlockLabel: "All Achievements", requiresGoldUi: false, requiresAllAchievements: true, requiresSubHourWin: false }
];

const ALL_THEME_CLASSES = [
  "theme-computer-green",
  "theme-light-mode",
  "theme-gold-solid",
  "theme-diamond-sparkly",
  "theme-rgb-rainbow",
  "theme-terminal",
  "theme-copper",
  "theme-emerald",
  "theme-indigo",
  "theme-sahara",
  "theme-cyber",
  "theme-coral",
  "theme-glacial"
];

const COLLAPSIBLE_SECTION_IDS = [
  "row-production",
  "system-supply-chain",
  "system-delivery",
  "panel-projects"
];

const domCache = new Map();
const lastTextCache = new Map();
const lastModuleTierMap = new Map();
const lastPlinkoSignature = { value: "" };
let lastThemeDropdownSignature = "";
let lastDocumentTitle = "";
let lastStageAnimClass = "";
let lastProjectAffordSig = "";
let lastRangeTargetLefts = ["", "", "", "", ""];
let lastCrosshairLeft = "";
let lastPointerPos = {
  x: typeof window !== "undefined" ? Math.round(window.innerWidth * 0.5) : 400,
  y: typeof window !== "undefined" ? Math.round(window.innerHeight * 0.5) : 300
};

function getActiveGameVersion() {
  return typeof GAME_VERSION !== "undefined" ? GAME_VERSION : "BETA.14";
}

function getEl(id) {
  if (domCache.has(id)) {
    const cached = domCache.get(id);
    if (cached && cached.isConnected) return cached;
  }
  const el = document.getElementById(id);
  if (el) domCache.set(id, el);
  return el;
}

function setText(id, val) {
  const strVal = String(val);
  const cacheKey = `txt:${id}`;
  if (lastTextCache.get(cacheKey) === strVal) return;
  const el = getEl(id);
  if (el) {
    el.textContent = strVal;
    lastTextCache.set(cacheKey, strVal);
  }
}

function showEl(id) {
  const el = getEl(id);
  if (el && el.classList.contains("hidden")) el.classList.remove("hidden");
}

function hideEl(id) {
  const el = getEl(id);
  if (el && !el.classList.contains("hidden")) el.classList.add("hidden");
}

function setDisabled(id, isDisabled) {
  const el = getEl(id);
  if (el && el.disabled !== isDisabled) el.disabled = isDisabled;
}

function onClick(id, handler) {
  const el = getEl(id);
  if (el) el.addEventListener("click", handler);
}

const SoundSystem = {
  ctx: null,
  bgmEl: null,
  bgmSource: null,
  bgmGain: null,
  analyser: null,
  analyserData: null,
  enabledMusic: false,
  musicTrack: MUSIC_TRACKS[0].file,
  musicVol: 0.35,
  sfxVol: 0.65,
  autoShiftMusic: true,
  randomizedContinentMap: null,

  getTrackLabel(file) {
    const found = MUSIC_TRACKS.find(t => t.file === file);
    return found ? found.label : file;
  },

  buildRandomizedContinentMap() {
    // Keep index 0 on painted_sky.mp3 as default; randomize remaining slots across available tracks.
    const others = MUSIC_TRACKS.filter(t => t.file !== "painted_sky.mp3").map(t => t.file);
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    this.randomizedContinentMap = ["painted_sky.mp3", ...others];
  },

  loadPrefs() {
    try {
      const raw = localStorage.getItem(AUDIO_PREFS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.enabledMusic === "boolean") this.enabledMusic = p.enabledMusic;
        if (typeof p.musicTrack === "string" && MUSIC_TRACKS.some(t => t.file === p.musicTrack)) {
          this.musicTrack = p.musicTrack;
        }
        if (typeof p.autoShiftMusic === "boolean") this.autoShiftMusic = p.autoShiftMusic;
        if (Number.isFinite(p.musicVol)) this.musicVol = Math.max(0, Math.min(1, p.musicVol));
        if (Number.isFinite(p.sfxVol)) this.sfxVol = Math.max(0, Math.min(1, p.sfxVol));
        if (Array.isArray(p.randomizedContinentMap) && p.randomizedContinentMap.length > 0) {
          const valid = p.randomizedContinentMap.filter(f => MUSIC_TRACKS.some(t => t.file === f));
          if (valid.length > 0) this.randomizedContinentMap = valid;
        }
      }
    } catch (e) {
      console.error("Audio pref load error:", e);
    }

    if (typeof GameState !== "undefined" && typeof GameState.musicAutoShiftOnContinent === "boolean") {
      this.autoShiftMusic = GameState.musicAutoShiftOnContinent;
    }
    if (!this.randomizedContinentMap) {
      this.buildRandomizedContinentMap();
    }
  },

  savePrefs() {
    try {
      localStorage.setItem(AUDIO_PREFS_KEY, JSON.stringify({
        enabledMusic: this.enabledMusic,
        musicTrack: this.musicTrack,
        autoShiftMusic: this.autoShiftMusic,
        musicVol: this.musicVol,
        sfxVol: this.sfxVol,
        randomizedContinentMap: this.randomizedContinentMap
      }));
    } catch (e) {
      console.error("Audio pref save error:", e);
    }
    if (typeof GameState !== "undefined") {
      GameState.musicAutoShiftOnContinent = this.autoShiftMusic;
      GameState.musicTrack = this.musicTrack;
    }
  },

  ensureContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state !== "running" && this.ctx.state !== "closed") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  },

  elementVolumeWorks() {
    if (this._elVolOk !== undefined) return this._elVolOk;
    try {
      const probe = new Audio();
      probe.volume = 0.5;
      this._elVolOk = Math.abs(probe.volume - 0.5) < 0.001;
    } catch (e) {
      this._elVolOk = true;
    }
    return this._elVolOk;
  },

  ensureBgm() {
    if (!this.bgmEl) {
      this.bgmEl = new Audio();
      this.bgmEl.loop = true;
      this.bgmEl.preload = "none";
    }
    const desiredSrc = `music/${this.musicTrack}`;
    if (this.bgmEl.getAttribute("src") !== desiredSrc) {
      this.bgmEl.setAttribute("src", desiredSrc);
    }
    this.applyMusicVolume();
    return this.bgmEl;
  },

  routeBgmThroughGain() {
    if (this.bgmGain) return true;
    if (this.elementVolumeWorks()) return false;
    const ctx = this.ensureContext();
    if (!ctx || !this.bgmEl || typeof ctx.createMediaElementSource !== "function") return false;
    try {
      this.bgmSource = ctx.createMediaElementSource(this.bgmEl);
      this.bgmGain = ctx.createGain();
      this.analyser = typeof ctx.createAnalyser === "function" ? ctx.createAnalyser() : null;
      if (this.analyser) {
        this.analyser.fftSize = 256;
        this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);
        this.bgmSource.connect(this.analyser);
        this.analyser.connect(this.bgmGain);
      } else {
        this.bgmSource.connect(this.bgmGain);
      }
      this.bgmGain.connect(ctx.destination);
      return true;
    } catch (e) {
      console.error("BGM gain routing failed:", e);
      this.bgmSource = null;
      this.bgmGain = null;
      this.analyser = null;
      this.analyserData = null;
      return false;
    }
  },

  getBassLevel() {
    if (!this.analyser || !this.analyserData || !this.enabledMusic || !this.bgmEl || this.bgmEl.paused) {
      return 0;
    }
    try {
      this.analyser.getByteFrequencyData(this.analyserData);
      let sum = 0;
      const bins = Math.min(12, this.analyserData.length);
      for (let i = 0; i < bins; i++) sum += this.analyserData[i];
      return Math.min(1, sum / (bins * 255));
    } catch (e) {
      return 0;
    }
  },

  applyMusicVolume() {
    if (this.bgmGain) {
      this.bgmGain.gain.value = this.musicVol;
      if (this.bgmEl) this.bgmEl.volume = 1;
    } else if (this.bgmEl) {
      this.bgmEl.volume = this.musicVol;
    }
  },

  playBgm() {
    const bgm = this.bgmEl;
    if (!bgm) return;
    const start = () => {
      const p = bgm.play();
      if (p && p.catch) p.catch(e => console.warn("Music play blocked/failed:", e && e.name, e && e.message));
    };
    const ctx = this.bgmGain ? this.ensureContext() : null;
    if (ctx && ctx.state !== "running") {
      ctx.resume().then(start, start);
    } else {
      start();
    }
  },

  armMusicAutostart() {
    if (!this.enabledMusic || this._autostartArmed) return;
    this._autostartArmed = true;
    const events = ["pointerdown", "touchend", "keydown"];
    const disarm = () => {
      events.forEach(ev => document.removeEventListener(ev, onGesture, true));
      this._autostartArmed = false;
    };
    const onGesture = (e) => {
      if (!this.enabledMusic) { disarm(); return; }
      const t = e.target;
      if (t && t.closest && t.closest("#btn-toggle-music")) return;
      disarm();
      if (this.bgmEl && !this.bgmEl.paused) return;
      this.syncMusicPlayback();
    };
    events.forEach(ev => document.addEventListener(ev, onGesture, true));
  },

  syncMusicPlayback() {
    const bgm = this.ensureBgm();
    this.routeBgmThroughGain();
    this.applyMusicVolume();
    if (this.enabledMusic) {
      this.playBgm();
    } else {
      bgm.pause();
    }
    this.savePrefs();
    this.refreshControlsUI();
  },

  playTone(freq, duration, type = "sine", gainPeak = 0.14, delaySec = 0) {
    if (this.sfxVol <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    const peak = Math.max(0.0001, gainPeak * this.sfxVol);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  },

  playSfx(kind) {
    if (this.sfxVol <= 0) return;
    if (kind === "bake") {
      this.playTone(340, 0.06, "triangle", 0.10, 0);
      this.playTone(460, 0.05, "sine", 0.07, 0.025);
    } else if (kind === "buy") {
      this.playTone(520, 0.07, "sine", 0.11, 0);
      this.playTone(660, 0.09, "sine", 0.11, 0.055);
    } else if (kind === "tier") {
      this.playTone(440, 0.11, "triangle", 0.14, 0);
      this.playTone(554.37, 0.11, "triangle", 0.14, 0.08);
      this.playTone(659.25, 0.18, "sine", 0.15, 0.16);
    } else if (kind === "achievement") {
      this.playTone(523.25, 0.12, "triangle", 0.16, 0);
      this.playTone(659.25, 0.12, "triangle", 0.16, 0.09);
      this.playTone(783.99, 0.14, "triangle", 0.17, 0.18);
      this.playTone(1046.5, 0.28, "sine", 0.18, 0.27);
    } else if (kind === "prestige") {
      this.playTone(392.0, 0.14, "sine", 0.15, 0);
      this.playTone(523.25, 0.14, "sine", 0.15, 0.1);
      this.playTone(783.99, 0.26, "triangle", 0.16, 0.2);
    }
  },

  musicUnlockLevel() {
    if (typeof GameState === "undefined") return 0;
    return Math.max(GameState.continentIndex || 0, GameState.highestContinentReached || 0);
  },

  isTrackUnlocked(t) {
    return (t.unlock || 0) <= this.musicUnlockLevel();
  },

  getUnlockedTracks() {
    return MUSIC_TRACKS.filter(t => this.isTrackUnlocked(t));
  },

  trackForContinent(idx) {
    const cIdx = Math.max(0, idx | 0);
    if (cIdx === 0) return MUSIC_TRACKS[0];
    const pool = this.randomizedContinentMap && this.randomizedContinentMap.length > 0
      ? this.randomizedContinentMap
      : MUSIC_TRACKS.map(t => t.file);
    const chosenFile = pool[cIdx % pool.length] || "painted_sky.mp3";
    return MUSIC_TRACKS.find(t => t.file === chosenFile) || MUSIC_TRACKS[0];
  },

  cycleNextUnlockedTrack() {
    const unlocked = this.getUnlockedTracks();
    if (unlocked.length <= 1) return;
    const curIdx = unlocked.findIndex(t => t.file === this.musicTrack);
    const nextTrack = unlocked[(curIdx + 1) % unlocked.length] || unlocked[0];
    this.ensureContext();
    this.musicTrack = nextTrack.file;
    this.syncMusicPlayback();
    if (typeof GameState !== "undefined" && GameState.started) {
      logMessage(`Jukebox switched to: ${nextTrack.label}`);
    }
  },

  syncAfterLoad() {
    if (typeof GameState !== "undefined" && typeof GameState.musicAutoShiftOnContinent === "boolean") {
      this.autoShiftMusic = GameState.musicAutoShiftOnContinent;
    }
    const cur = MUSIC_TRACKS.find(t => t.file === this.musicTrack);
    if (this.autoShiftMusic) {
      this.musicTrack = this.trackForContinent(GameState.continentIndex || 0).file;
    } else if (!cur || !this.isTrackUnlocked(cur)) {
      this.musicTrack = MUSIC_TRACKS[0].file;
    }
    this.populateTrackSelect();
    this.refreshControlsUI();
    if (this.bgmEl) this.ensureBgm();
    this.savePrefs();
  },

  onContinentChanged() {
    this.buildRandomizedContinentMap();
    if (this.autoShiftMusic && typeof GameState !== "undefined") {
      this.musicTrack = this.trackForContinent(GameState.continentIndex || 0).file;
      if (this.bgmEl || this.enabledMusic) this.syncMusicPlayback();
      else this.savePrefs();
    }
    this.populateTrackSelect();
    this.refreshControlsUI();
  },

  populateTrackSelect() {
    const trackSel = getEl("select-music-track");
    if (!trackSel) return;
    trackSel.innerHTML = "";
    MUSIC_TRACKS.filter(t => this.isTrackUnlocked(t) || t.file === this.musicTrack).forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.file;
      opt.textContent = t.label;
      if (t.file === this.musicTrack) opt.selected = true;
      trackSel.appendChild(opt);
    });
  },

  refreshControlsUI() {
    const toggleBtn = getEl("btn-toggle-music");
    const trackSel = getEl("select-music-track");
    const musicSlider = getEl("slider-music-vol");
    const sfxSlider = getEl("slider-sfx-vol");
    const musicLabel = getEl("music-vol-label");
    const sfxLabel = getEl("sfx-vol-label");
    const autoShiftChk = getEl("chk-music-autoshift");
    const nextPillBtn = getEl("btn-next-track-pill");

    const trackLabel = this.getTrackLabel(this.musicTrack);
    setText("now-playing-ticker", `${this.enabledMusic ? "♪" : "⏸"} ${trackLabel}`);
    if (nextPillBtn) {
      nextPillBtn.disabled = this.getUnlockedTracks().length <= 1;
    }

    if (toggleBtn) toggleBtn.textContent = `Music: ${this.enabledMusic ? "ON" : "OFF"}`;
    if (trackSel && trackSel.value !== this.musicTrack) trackSel.value = this.musicTrack;
    if (autoShiftChk) autoShiftChk.checked = Boolean(this.autoShiftMusic);
    if (musicSlider) musicSlider.value = String(Math.round(this.musicVol * 100));
    if (sfxSlider) sfxSlider.value = String(Math.round(this.sfxVol * 100));
    if (musicLabel) musicLabel.textContent = `${Math.round(this.musicVol * 100)}%`;
    if (sfxLabel) sfxLabel.textContent = `${Math.round(this.sfxVol * 100)}%`;
  },

  bindUI() {
    this.loadPrefs();
    this.populateTrackSelect();
    this.ensureBgm();
    this.refreshControlsUI();

    onClick("btn-toggle-music", () => {
      this.ensureContext();
      if (this.enabledMusic && this.bgmEl && this.bgmEl.paused) {
        this.syncMusicPlayback();
        return;
      }
      this.enabledMusic = !this.enabledMusic;
      this.syncMusicPlayback();
    });

    onClick("btn-next-track-pill", () => {
      this.cycleNextUnlockedTrack();
    });

    this.armMusicAutostart();

    const autoShiftChk = getEl("chk-music-autoshift");
    if (autoShiftChk) {
      autoShiftChk.checked = this.autoShiftMusic;
      autoShiftChk.addEventListener("change", (e) => {
        this.autoShiftMusic = Boolean(e.target.checked);
        this.savePrefs();
      });
    }

    const trackSel = getEl("select-music-track");
    if (trackSel) {
      trackSel.addEventListener("change", (e) => {
        this.ensureContext();
        this.musicTrack = e.target.value;
        this.syncMusicPlayback();
      });
    }

    const musicSlider = getEl("slider-music-vol");
    if (musicSlider) {
      musicSlider.addEventListener("input", (e) => {
        this.musicVol = Math.max(0, Math.min(1, Number(e.target.value) / 100));
        this.ensureBgm();
        this.routeBgmThroughGain();
        this.applyMusicVolume();
        this.savePrefs();
        this.refreshControlsUI();
      });
    }

    const sfxSlider = getEl("slider-sfx-vol");
    if (sfxSlider) {
      sfxSlider.addEventListener("input", (e) => {
        this.sfxVol = Math.max(0, Math.min(1, Number(e.target.value) / 100));
        this.savePrefs();
        this.refreshControlsUI();
        this.playSfx("bake");
      });
    }
  }
};

window.SoundSystem = SoundSystem;

let tabIconApplied = false;
let lastTitleAt = 0;

function applyTabPretzelIconAndTitle(pretzelCount = 0) {
  if (!tabIconApplied) {
    tabIconApplied = true;
    if (!document.querySelector("link[rel~='icon']")) {
      const linkEl = document.createElement("link");
      linkEl.rel = "icon";
      linkEl.type = "image/png";
      linkEl.href = "icon-192.png";
      document.head.appendChild(linkEl);
    }
  }

  const now = Date.now();
  if (lastDocumentTitle && now - lastTitleAt < 1000) return;
  const countNum = Math.max(0, Math.floor(Number(pretzelCount) || 0));
  const nextTitle = `(${countNum.toLocaleString()}) Pete's Pretzels`;
  if (nextTitle !== lastDocumentTitle) {
    lastDocumentTitle = nextTitle;
    lastTitleAt = now;
    document.title = nextTitle;
  }
}

function initStarfieldBackdrop() {
  let layer = document.getElementById("bakery-starfield");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "bakery-starfield";
    layer.className = "starfield-layer starfield-prevalent";
    document.body.prepend(layer);
  } else {
    layer.classList.add("starfield-layer", "starfield-prevalent");
  }

  if (layer.childElementCount === 0) {
    const frag = document.createDocumentFragment();
    const starGlyphs = ["✦", "✧", "·", "*"];
    for (let i = 0; i < STARFIELD_STAR_COUNT; i++) {
      const star = document.createElement("span");
      star.className = "starfield-dot";
      star.textContent = starGlyphs[i % starGlyphs.length];
      star.style.left = `${((i * 19.7) % 97) + 1.5}%`;
      star.style.top = `${((i * 29.3) % 94) + 2.5}%`;
      star.style.fontSize = i % 3 === 0 ? "12px" : i % 2 === 0 ? "10px" : "8px";
      const baseOpacity = 0.32 + ((i % 4) * 0.14);
      star.style.opacity = String(baseOpacity);
      star.style.setProperty("--star-base", String(baseOpacity));
      frag.appendChild(star);
    }
    layer.appendChild(frag);
  }
}

function scheduleStarTwinkle() {
  const delay = STAR_TWINKLE_MIN_MS + Math.random() * (STAR_TWINKLE_MAX_MS - STAR_TWINKLE_MIN_MS);
  setTimeout(() => {
    if (!document.hidden) {
      const stars = document.querySelectorAll("#bakery-starfield .starfield-dot");
      if (stars.length) {
        const s = stars[Math.floor(Math.random() * stars.length)];
        s.classList.remove("twinkle");
        void s.offsetWidth;
        s.classList.add("twinkle");
        setTimeout(() => s.classList.remove("twinkle"), 1500);
      }
    }
    scheduleStarTwinkle();
  }, delay);
}

function spawnRareShootingStar(announce = true) {
  if (document.hidden) return;
  const sky = getEl("golden-sky-layer") || document.body;
  const star = document.createElement("div");
  star.className = "shooting-star";

  const startX = Math.round(window.innerWidth * (0.15 + Math.random() * 0.5));
  const startY = Math.round(window.innerHeight * (0.06 + Math.random() * 0.25));
  star.style.left = `${startX}px`;
  star.style.top = `${startY}px`;

  sky.appendChild(star);
  if (announce && typeof GameState !== "undefined" && GameState.started) {
    logMessage("✦ A rare shooting star streaked across the bakery sky!");
  }

  setTimeout(() => {
    if (star.parentNode) star.remove();
  }, 1250);
}

function spawnSubtleClickPop(_anchorEl, labelText = "+1") {
  if (document.hidden) return;
  const sky = getEl("golden-sky-layer") || document.body;
  const existingPops = sky.querySelectorAll(".subtle-click-pop");
  if (existingPops.length >= MAX_CLICK_POPS) {
    existingPops[0].remove();
  }

  const offsetX = Math.round((Math.random() - 0.5) * 28) + 14;
  const offsetY = Math.round((Math.random() - 0.5) * 18) - 10;
  const x = Math.max(12, Math.min(window.innerWidth - 60, lastPointerPos.x + offsetX));
  const y = Math.max(12, Math.min(window.innerHeight - 24, lastPointerPos.y + offsetY));

  const pop = document.createElement("span");
  pop.className = "subtle-click-pop wow-damage-pop";
  pop.textContent = labelText.includes("🥨") ? labelText : `🥨 ${labelText}`;
  pop.style.left = `${x}px`;
  pop.style.top = `${y}px`;
  sky.appendChild(pop);

  setTimeout(() => {
    if (pop.parentNode) pop.remove();
  }, 780);
}

function hasAllAchievementsUnlocked() {
  if (typeof AchievementManager === "undefined" || typeof ACHIEVEMENTS_LIST === "undefined") return false;
  return AchievementManager.getUnlockedIds().length >= ACHIEVEMENTS_LIST.length;
}

function hasSubHourFullRunWin() {
  if (typeof GameState === "undefined") return false;
  const bestSecs = Number(GameState.bestRunSeconds || 0);
  const reachedFinal = Boolean(GameState.goldUiUnlocked) || Math.max(GameState.continentIndex || 0, GameState.highestContinentReached || 0) >= 7;
  return reachedFinal && bestSecs > 0 && bestSecs <= 3600;
}

function readCollapsedSections() {
  try {
    const raw = localStorage.getItem(COLLAPSED_SECTIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    return {};
  }
}

function writeCollapsedSections(mapObj) {
  try {
    localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify(mapObj));
  } catch (e) {
    console.error("Failed to save section collapse state:", e);
  }
}

function applyModalSectionCollapseUI(targetKey, collapsed) {
  const isCollapsed = Boolean(collapsed);
  if (targetKey === "leaderboard") {
    const panel = getEl("leaderboard-panel") || document.querySelector(".leaderboard-panel");
    const list = getEl("leaderboard-list");
    const btn = getEl("btn-collapse-leaderboard");
    if (panel) panel.classList.toggle("collapsed", isCollapsed);
    if (list) list.classList.toggle("hidden", isCollapsed);
    if (btn) {
      btn.textContent = isCollapsed ? "▸" : "▾";
      btn.setAttribute("aria-expanded", String(!isCollapsed));
    }
  } else if (targetKey === "achievements") {
    const grid = getEl("achievements-grid");
    const btn = getEl("btn-collapse-achievements");
    if (grid) grid.classList.toggle("collapsed", isCollapsed);
    if (grid) grid.classList.toggle("hidden", isCollapsed);
    if (btn) {
      btn.textContent = isCollapsed ? "▸" : "▾";
      btn.setAttribute("aria-expanded", String(!isCollapsed));
    }
  }
}

function ensureTrophyRoomCollapsibles() {
  const lbList = getEl("leaderboard-list");
  if (lbList && !getEl("btn-collapse-leaderboard")) {
    const lbHeader = lbList.parentElement?.querySelector(".row-header");
    if (lbHeader) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "btn-collapse-leaderboard";
      btn.className = "section-collapse-btn";
      btn.title = "Collapse or expand Leaderboard";
      btn.setAttribute("aria-expanded", "true");
      btn.textContent = "▾";
      btn.addEventListener("click", () => {
        const mapObj = readCollapsedSections();
        const next = !Boolean(mapObj.modal_leaderboard);
        mapObj.modal_leaderboard = next;
        writeCollapsedSections(mapObj);
        applyModalSectionCollapseUI("leaderboard", next);
      });
      lbHeader.appendChild(btn);
    }
  }

  const achGrid = getEl("achievements-grid");
  if (achGrid && !getEl("btn-collapse-achievements")) {
    let achHeader = getEl("achievements-header");
    if (!achHeader && achGrid.parentElement) {
      achHeader = document.createElement("div");
      achHeader.id = "achievements-header";
      achHeader.className = "row-header";
      achHeader.style.marginTop = "12px";
      achHeader.style.marginBottom = "8px";
      achHeader.innerHTML = `<h3>[🏆] Achievements</h3>`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "btn-collapse-achievements";
      btn.className = "section-collapse-btn";
      btn.title = "Collapse or expand Achievements";
      btn.setAttribute("aria-expanded", "true");
      btn.textContent = "▾";
      btn.addEventListener("click", () => {
        const mapObj = readCollapsedSections();
        const next = !Boolean(mapObj.modal_achievements);
        mapObj.modal_achievements = next;
        writeCollapsedSections(mapObj);
        applyModalSectionCollapseUI("achievements", next);
      });
      achHeader.appendChild(btn);
      achGrid.parentElement.insertBefore(achHeader, achGrid);
    }
  }

  const mapObj = readCollapsedSections();
  applyModalSectionCollapseUI("leaderboard", Boolean(mapObj.modal_leaderboard));
  applyModalSectionCollapseUI("achievements", Boolean(mapObj.modal_achievements));
}

function setSectionCollapsed(sectionId, collapsed, persist = true) {
  const sec = getEl(sectionId);
  const btn = getEl(`btn-collapse-${sectionId}`);
  const isCollapsed = Boolean(collapsed);
  if (sec) sec.classList.toggle("collapsed", isCollapsed);
  if (btn) {
    btn.textContent = isCollapsed ? "▸" : "▾";
    btn.setAttribute("aria-expanded", String(!isCollapsed));
  }
  if (persist) {
    const stateMap = readCollapsedSections();
    stateMap[sectionId] = isCollapsed;
    writeCollapsedSections(stateMap);
  }
}

function applySavedSectionCollapseStates() {
  const stateMap = readCollapsedSections();
  COLLAPSIBLE_SECTION_IDS.forEach(id => {
    setSectionCollapsed(id, Boolean(stateMap[id]), false);
  });
  ensureTrophyRoomCollapsibles();
}

function toggleSectionCollapsed(sectionId) {
  const sec = getEl(sectionId);
  if (!sec) return;
  const nextCollapsed = !sec.classList.contains("collapsed");
  setSectionCollapsed(sectionId, nextCollapsed, true);
}

function triggerScreenShake() {
  if (document.hidden) return;
  document.body.classList.remove("screen-shake");
  void document.body.offsetWidth;
  document.body.classList.add("screen-shake");
  setTimeout(() => document.body.classList.remove("screen-shake"), 300);
}

function triggerConfettiStarBurst(centerX = window.innerWidth * 0.5, centerY = window.innerHeight * 0.4, count = 12) {
  if (document.hidden) return;
  const stars = ["✦", "★", "✧", "*"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "confetti-star";
    el.textContent = stars[i % stars.length];
    el.style.left = `${centerX}px`;
    el.style.top = `${centerY}px`;

    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.35);
    const dist = 55 + Math.random() * 75;
    el.style.setProperty("--cx", `${(Math.cos(angle) * dist).toFixed(1)}px`);
    el.style.setProperty("--cy", `${(Math.sin(angle) * dist - 20).toFixed(1)}px`);

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 820);
  }
}

function triggerModuleTierGlow(boxId) {
  const box = getEl(boxId);
  if (!box) return;
  box.classList.remove("tier-up-flash");
  void box.offsetWidth;
  box.classList.add("tier-up-flash");
  SoundSystem.playSfx("tier");
  setTimeout(() => {
    if (box.isConnected) box.classList.remove("tier-up-flash");
  }, 1150);
}

function getUnlockedThemeTier() {
  const currentIdx = typeof GameState !== "undefined" ? (GameState.continentIndex || 0) : 0;
  const highestIdx = typeof GameState !== "undefined" ? (GameState.highestContinentReached || 0) : 0;
  return Math.max(currentIdx, highestIdx);
}

function getThemeIdForContinent(contIdx) {
  const idx = Math.max(0, contIdx | 0);
  if (idx < CONTINENT_THEME_MAP.length) {
    return CONTINENT_THEME_MAP[idx];
  }
  const extraLoops = idx - CONTINENT_THEME_MAP.length + 1;
  return extraLoops % 2 === 1 ? "gold-solid" : "cyber";
}

function isThemeUnlocked(themeObj) {
  if (!themeObj || themeObj.id === "espresso") return true;
  if (themeObj.requiresAllAchievements) {
    return hasAllAchievementsUnlocked();
  }
  if (themeObj.requiresSubHourWin) {
    return hasSubHourFullRunWin();
  }
  const unlockedTier = getUnlockedThemeTier();
  const hasGoldUi = typeof GameState !== "undefined" ? Boolean(GameState.goldUiUnlocked) : false;
  if (themeObj.requiresGoldUi) {
    return hasGoldUi || unlockedTier >= themeObj.minContinent;
  }
  return unlockedTier >= themeObj.minContinent;
}

function getPreferredThemeId() {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return "espresso";
    const found = THEMES_CATALOG.find(t => t.id === raw);
    if (!found) return "espresso";
    return found.id;
  } catch (e) {
    return "espresso";
  }
}

function refreshThemeDropdown(force = false, activeThemeId = null) {
  const select = getEl("select-theme");
  if (!select) return;

  const currentTheme = activeThemeId || getPreferredThemeId();
  const unlockSig = THEMES_CATALOG.map(t => (isThemeUnlocked(t) ? "1" : "0")).join("");
  const signature = `${currentTheme}|${unlockSig}`;

  if (!force && signature === lastThemeDropdownSignature && select.options.length === THEMES_CATALOG.length) {
    if (select.value !== currentTheme) {
      select.value = currentTheme;
    }
    return;
  }

  lastThemeDropdownSignature = signature;
  select.innerHTML = "";

  THEMES_CATALOG.forEach(t => {
    const opt = document.createElement("option");
    const unlocked = isThemeUnlocked(t);
    opt.value = t.id;
    opt.disabled = !unlocked;
    opt.textContent = unlocked
      ? t.name
      : `🔒 ${t.name} (${t.unlockLabel})`;
    if (t.id === currentTheme) opt.selected = true;
    select.appendChild(opt);
  });
  select.value = currentTheme;
}

function applyTheme(themeId, persist = true) {
  const requested = THEMES_CATALOG.find(t => t.id === themeId) || THEMES_CATALOG[0];
  const safeTheme = isThemeUnlocked(requested) ? requested : THEMES_CATALOG[0];

  document.body.classList.remove(...ALL_THEME_CLASSES);
  document.documentElement.classList.remove(...ALL_THEME_CLASSES);

  if (safeTheme.id !== "espresso") {
    document.body.classList.add(`theme-${safeTheme.id}`);
  }

  document.documentElement.style.colorScheme = safeTheme.id === "light-mode" ? "light" : "dark";
  document.body.style.backgroundColor = "";
  document.body.style.color = "";

  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, safeTheme.id);
    } catch (e) {
      console.error("Failed to save theme:", e);
    }
  }
  refreshThemeDropdown(true, safeTheme.id);
}

function updateAudioReactiveStage() {
  const stageEl = getEl("ascii-stage");
  if (!stageEl) return;
  const isReactiveTheme = document.body.classList.contains("theme-cyber") || document.body.classList.contains("theme-gold-solid");
  if (!isReactiveTheme) {
    stageEl.style.boxShadow = "";
    return;
  }
  const bass = SoundSystem.getBassLevel();
  if (bass > 0.05) {
    const glowPx = Math.round(8 + bass * 22);
    const alpha = (0.25 + bass * 0.55).toFixed(2);
    const color = document.body.classList.contains("theme-cyber")
      ? `rgba(255, 94, 196, ${alpha})`
      : `rgba(255, 210, 63, ${alpha})`;
    stageEl.style.boxShadow = `0 0 ${glowPx}px ${color}, inset 0 0 ${Math.round(bass * 10)}px ${color}`;
  } else {
    stageEl.style.boxShadow = "";
  }
}

function refreshCloudMenuUI() {
  const loggedOutBox = getEl("cloud-logged-out-controls");
  const loggedInBox = getEl("cloud-logged-in-controls");
  const emailEl = getEl("cloud-user-email");

  if (typeof CloudSave !== "undefined" && CloudSave.user) {
    if (loggedOutBox) loggedOutBox.classList.add("hidden");
    if (loggedInBox) loggedInBox.classList.remove("hidden");
    if (emailEl) emailEl.textContent = CloudSave.user.email || "Signed In";
  } else {
    if (loggedOutBox) loggedOutBox.classList.remove("hidden");
    if (loggedInBox) loggedInBox.classList.add("hidden");
  }
}

let pendingConfirmAction = null;

function refreshPrestigeMenuUI() {
  if (typeof GameState === "undefined") return;
  const currentGold = GameState.goldenPretzels || 0;
  const canClaimPending = typeof AchievementManager !== "undefined" && AchievementManager.canExpandContinent();
  const pendingGold = canClaimPending ? GameState.calculatePendingGoldenPretzels() : 0;
  const totalAfter = currentGold + pendingGold;

  setText("prestige-keep-pill", `Keep ${totalAfter.toLocaleString()} [🥨★] (+${totalAfter * 25}%)`);

  const descEl = getEl("prestige-menu-desc");
  if (descEl) {
    if (canClaimPending) {
      descEl.innerHTML = `Territory complete! <strong>Prestige</strong> claims +${pendingGold} pending Golden Pretzels (${totalAfter} total) and restarts in North America while keeping unlocked themes. <strong>Full Wipe</strong> completely resets your run, lifetime pretzel count, and leaderboard score.`;
    } else {
      descEl.innerHTML = `<strong>Prestige</strong> restarts in North America while keeping all ${currentGold.toLocaleString()} Golden Pretzels (+${currentGold * 25}% cash), unlocked themes &amp; achievements. <strong>Full Wipe</strong> completely resets your run, lifetime pretzel count, and leaderboard score.`;
    }
  }
}

function openActionConfirmation(actionType) {
  pendingConfirmAction = actionType;
  const execBtn = getEl("btn-execute-confirm-modal");

  if (actionType === "prestige") {
    const currentGold = GameState.goldenPretzels || 0;
    const canClaimPending = typeof AchievementManager !== "undefined" && AchievementManager.canExpandContinent();
    const pendingGold = canClaimPending ? GameState.calculatePendingGoldenPretzels() : 0;
    const totalAfter = currentGold + pendingGold;

    setText("confirm-modal-title", "[🥨★] Confirm Prestige Run");
    setText(
      "confirm-modal-body",
      `Start a fresh run in North America? Your current pretzels, cash, upgrades, and territory progress will reset, while you keep ${totalAfter.toLocaleString()} Golden Pretzels (+${totalAfter * 25}% cash bonus), unlocked themes, all unlocked achievements, and your best run records.`
    );
    if (execBtn) {
      execBtn.className = "expand-btn";
      execBtn.style.marginTop = "0";
      execBtn.textContent = `Confirm Prestige (Keep ${totalAfter.toLocaleString()} [🥨★])`;
    }
  } else {
    setText("confirm-modal-title", "[⚠️] Confirm Full Wipe");
    setText(
      "confirm-modal-body",
      "Perform a complete wipe? This resets your current run, pretzels, lifetime pretzel count, best run stats, upgrades, continents, Golden Pretzels, achievements, and syncs 0 pretzels to the leaderboard so old pretzel counts cannot carry over."
    );
    if (execBtn) {
      execBtn.className = "danger-btn";
      execBtn.style.marginTop = "0";
      execBtn.textContent = "Confirm Full Wipe";
    }
  }

  hideEl("restart-modal");
  showEl("confirm-action-modal");
}

function executePrestigeRun() {
  if (typeof GameState === "undefined" || typeof GameState.prestigeRestartRun !== "function") return;
  const activeTheme = getPreferredThemeId();
  const canClaimPending = typeof AchievementManager !== "undefined" && AchievementManager.canExpandContinent();
  const { totalGold, bonusGold } = GameState.prestigeRestartRun(canClaimPending);

  resetRegionalPanelsUI();
  updateDemand();
  applyTheme(activeTheme, true);
  applySessionUI();
  hideEl("confirm-action-modal");
  hideEl("restart-modal");
  SoundSystem.playSfx("prestige");

  const bonusNote = bonusGold > 0 ? ` (+${bonusGold} newly claimed)` : "";
  logMessage(`PRESTIGE RUN STARTED! Fresh start in North America with ${totalGold.toLocaleString()} Golden Pretzels${bonusNote} (+${totalGold * 25}% cash)!`);
  requestRender();
}

async function clearCloudLeaderboardScoreOnWipe() {
  if (typeof CloudSave === "undefined" || !CloudSave.user || !CloudSave.client) return;
  const shopName = ((GameState.playerName || "").trim() || "Unnamed Pretzel Shop").slice(0, 28);
  const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shop";
  try {
    await pushLeaderboardRow({
      shopKey: slug,
      shopName,
      pretzelsAllRuns: 0,
      completedFullRun: false,
      bestWinSeconds: null,
      lifetimeGold: 0,
      fastestDomSeconds: null
    });
  } catch (e) {
    console.warn("Leaderboard wipe sync warning:", e);
  }
}

async function executeFullWipe() {
  await clearCloudLeaderboardScoreOnWipe();

  if (typeof GameState !== "undefined") {
    if (typeof GameState.writeHighScores === "function") {
      GameState.writeHighScores({
        totalPlaySecondsAllRuns: 0,
        bestRunSeconds: 0,
        fastestDominationSeconds: 0,
        bestRunPretzels: 0,
        lifetimePretzelsBanked: 0,
        lifetimeGoldenPretzels: 0,
        completedFullRun: false
      });
    }
    if (typeof GameState.reset === "function") {
      GameState.reset(true);
    }
    GameState.lifetimePretzelsAllRuns = 0;
    GameState.lifetimeGoldenPretzels = 0;
    GameState.bestRunPretzels = 0;
    GameState.bestRunSeconds = 0;
    GameState.fastestDominationSeconds = 0;
    GameState.totalPlaySecondsAllRuns = 0;
    GameState.completedFullRun = false;
    GameState.pretzels = 0;
    GameState.started = false;
    GameState.playerName = "";
    GameState.selectedAsciiIndex = 0;
    if (typeof GameState.writeHighScores === "function") {
      GameState.writeHighScores({
        totalPlaySecondsAllRuns: 0,
        bestRunSeconds: 0,
        fastestDominationSeconds: 0,
        bestRunPretzels: 0,
        lifetimePretzelsBanked: 0,
        lifetimeGoldenPretzels: 0,
        completedFullRun: false
      });
    }
  }

  localStorage.removeItem(COLLAPSED_SECTIONS_KEY);
  localStorage.removeItem("petes_pretzels_high_scores_v1");
  localStorage.removeItem("petes_pretzels_old_shops_v1");

  if (typeof liveLeaderboardRows !== "undefined") {
    liveLeaderboardRows = [];
  }
  if (typeof lastLeaderboardSyncByMode !== "undefined") {
    lastLeaderboardSyncByMode = { pretzels: 0, time: 0, domination: 0, gold: 0 };
  }
  if (typeof lastLeaderboardPushSig !== "undefined") {
    lastLeaderboardPushSig = "";
    lastLeaderboardPushAt = 0;
  }

  applyTheme("espresso", true);
  resetRegionalPanelsUI();
  lastTextCache.delete("txt:display-player-name");
  setText("display-player-name", "Baker");
  logMessage("Fresh start. Click the pretzel to begin.");
  hideEl("confirm-action-modal");
  hideEl("restart-modal");
  hideEl("setup-modal");
  hideEl("ending-modal");

  const nameInput = getEl("input-player-name");
  if (nameInput) nameInput.value = "";

  if (typeof AchievementManager !== "undefined") {
    AchievementManager.queue = [];
    AchievementManager.updateButtonCount();
  }

  if (typeof syncAndFetchLeaderboard === "function") {
    syncAndFetchLeaderboard(true);
  }

  initSetupPicker();
  showEl("title-intro-screen");
  requestRender();
}

async function applyCloudUserSave(user) {
  refreshCloudMenuUI();
  if (typeof CloudSave === "undefined" || !user) return;

  const cloudSave = await CloudSave.loadFromCloud();
  const cloudTotal = cloudSave ? (Number(cloudSave.lifetimePretzelsAllRuns) || 0) + (Number(cloudSave.pretzels) || 0) : 0;
  const localTotal = GameState.started ? GameState.getTotalLifetimePretzelsAllRuns() : 0;
  const localIsFurther = Boolean(GameState.started && localTotal > cloudTotal);
  if (cloudSave && cloudSave.started && !localIsFurther) {
    GameState.applySaveObject(cloudSave);
    sanitizeNumbers();
    updateDemand();
    applyTheme(getPreferredThemeId(), false);
    applySessionUI();
    logMessage(`Cloud save loaded for ${GameState.playerName}.`);
    requestRender();
  } else if (GameState.started) {
    GameState.save(true);
    logMessage("Current save uploaded to cloud.");
  }

  if (typeof syncAndFetchLeaderboard === "function") {
    syncAndFetchLeaderboard(true);
  }
}

function getModuleTierInfo(count) {
  if (count >= 100) return { tier: 4, label: "TIER IV • 5x", mult: 5.0, next: null };
  if (count >= 50)  return { tier: 3, label: "TIER III • 3x", mult: 3.0, next: 100 };
  if (count >= 25)  return { tier: 2, label: "TIER II • 2x", mult: 2.0, next: 50 };
  if (count >= 10)  return { tier: 1, label: "TIER I • 1.5x", mult: 1.5, next: 25 };
  return { tier: 0, label: "BASE • 1x", mult: 1.0, next: 10 };
}

function getModuleAsciiStage(artKey, tierIndex) {
  if (typeof ModuleAsciiStages === "undefined" || !ModuleAsciiStages[artKey]) return "";
  const stages = ModuleAsciiStages[artKey];
  return stages[Math.min(stages.length - 1, Math.max(0, tierIndex))] || stages[0];
}

function applyModuleTierUI(boxId, badgeId, nextId, count, prefix = "", asciiElId = null, artKey = null) {
  const info = getModuleTierInfo(count);
  const box = getEl(boxId);
  const prevTier = lastModuleTierMap.get(boxId);
  if (prevTier !== undefined && info.tier > prevTier) {
    triggerModuleTierGlow(boxId);
  }
  lastModuleTierMap.set(boxId, info.tier);

  if (box) {
    const desiredTierClass = info.tier > 0 ? `tier-${info.tier}` : "";
    if (!desiredTierClass) {
      if (box.classList.contains("tier-1") || box.classList.contains("tier-2") || box.classList.contains("tier-3") || box.classList.contains("tier-4")) {
        box.classList.remove("tier-1", "tier-2", "tier-3", "tier-4");
      }
    } else if (!box.classList.contains(desiredTierClass)) {
      box.classList.remove("tier-1", "tier-2", "tier-3", "tier-4");
      box.classList.add(desiredTierClass);
    }
  }
  if (badgeId) setText(badgeId, info.label);
  if (nextId) setText(nextId, info.next ? `Next: ${prefix}${info.next}` : "MAX TIER");
  if (asciiElId && artKey) {
    const nextArt = getModuleAsciiStage(artKey, info.tier);
    if (lastTextCache.get(`ascii:${asciiElId}`) !== nextArt) {
      lastTextCache.set(`ascii:${asciiElId}`, nextArt);
      setText(asciiElId, nextArt);
    }
  }
  return info;
}

const FALLBACK_ASCII = [
  "   .-'```'-.   \n  /  .---.  \\  \n |  (  X  )  | \n  \\  '---'  /  \n   '-.___.-'   ",
  "   _.-'''-._   \n  / * .-. * \\  \n ( * (   ) * ) \n  \\ * '-' * /  \n   '-.....-'   ",
  " .-----------. \n | PRETZELS  | \n | FOR  SALE | \n '-----------' \n   |       |   ",
  "   .-'''''-.   \n  (         )  \n   |_______|   \n   |=======|   \n   '-------'   "
];

function getGallery() {
  return (typeof AsciiGallery !== "undefined" && Array.isArray(AsciiGallery) && AsciiGallery.length > 0)
    ? AsciiGallery
    : FALLBACK_ASCII;
}

function getDominanceForStage() {
  if (typeof AchievementManager !== "undefined" && typeof AchievementManager.getDominancePercent === "function") {
    return AchievementManager.getDominancePercent();
  }
  return 0;
}

function getEvolvedAscii() {
  const gallery = getGallery();
  const idx = (typeof GameState !== "undefined" && Number.isInteger(GameState.selectedAsciiIndex))
    ? Math.max(0, Math.min(gallery.length - 1, GameState.selectedAsciiIndex))
    : 0;
  const base = gallery[idx] || gallery[0];
  const domPct = getDominanceForStage();
  const sparkFrame = ["✦", "✧", "★", "·"][Math.floor(Date.now() / 600) % 4];

  if (domPct >= 100) {
    return `👑 ═══ KING OF PRETZELS ═══ 👑\n${sparkFrame} ${base} ${sparkFrame}\n👑 ════ 100% DOMINANCE ════ 👑`;
  }
  if (domPct >= 75) {
    return `${sparkFrame} ─── ${domPct}% NEAR CROWN ─── ${sparkFrame}\n${base}\n✦ ─────────────────────── ✦`;
  }
  if (domPct >= 40) {
    return `· ${sparkFrame} ── ${domPct}% CONQUEST ── ${sparkFrame} ·\n${base}`;
  }
  if (domPct >= 15) {
    return `  ·  ${sparkFrame}  ·  \n${base}`;
  }
  return base;
}

function applyStageAnimationTier(domPct) {
  let nextClass = "";
  if (domPct >= 100) nextClass = "ascii-anim-king";
  else if (domPct >= 75) nextClass = "ascii-anim-tier-3";
  else if (domPct >= 40) nextClass = "ascii-anim-tier-2";
  else if (domPct >= 15) nextClass = "ascii-anim-tier-1";

  if (nextClass === lastStageAnimClass) return;
  lastStageAnimClass = nextClass;

  const asciiEl = getEl("ascii-stage");
  if (!asciiEl) return;
  asciiEl.classList.remove("ascii-sway", "ascii-anim-tier-1", "ascii-anim-tier-2", "ascii-anim-tier-3", "ascii-anim-king");
  if (nextClass) asciiEl.classList.add(nextClass);
}

function openSetupModal() {
  hideEl("title-intro-screen");
  initSetupPicker();
  const inputEl = getEl("input-player-name");
  if (inputEl && typeof GameState !== "undefined" && GameState.playerName && !inputEl.value) {
    inputEl.value = GameState.playerName;
  }
  showEl("setup-modal");
  if (inputEl) {
    setTimeout(() => inputEl.focus(), 25);
  }
}

function startGameFromModal() {
  const inputEl = getEl("input-player-name");
  const nameInput = inputEl ? inputEl.value.trim() : "";
  const finalName = nameInput || "Baker";

  SoundSystem.ensureContext();

  if (typeof GameState !== "undefined") {
    GameState.playerName = finalName;
    GameState.started = true;
    GameState.gameVersion = getActiveGameVersion();
    if (!Number.isInteger(GameState.selectedAsciiIndex) || GameState.selectedAsciiIndex < 0) {
      GameState.selectedAsciiIndex = 0;
    }
    if (!GameState.runStartTime) GameState.runStartTime = Date.now();
    if (typeof GameState.save === "function") {
      GameState.save(true, true);
    }
  }

  lastTextCache.delete("txt:display-player-name");
  lastTextCache.delete("txt:ascii-stage");
  setText("display-player-name", finalName);
  hideEl("title-intro-screen");
  hideEl("setup-modal");

  applyTheme(getPreferredThemeId(), false);
  applySessionUI();
  logMessage(`Welcome to ${getActiveGameVersion()}, ${finalName}. Kitchen is open.`);
  requestRender();
}

window.openSetupModal = openSetupModal;
window.startGameFromModal = startGameFromModal;
window.forceStartGame = startGameFromModal;

function openEndingModal(records = {}) {
  const goldCount = GameState.goldenPretzels || 0;
  const runSecs = Math.floor(
    Number.isFinite(records.runSecs) ? records.runSecs : (GameState.elapsedRunSeconds || 0)
  );
  const bestSecs = Math.floor(GameState.bestRunSeconds || runSecs);
  const runPretzels = Math.floor(
    Number.isFinite(records.runPretzels) ? records.runPretzels : (GameState.pretzels || 0)
  );
  const bestPretzels = Math.max(Math.floor(GameState.bestRunPretzels || 0), runPretzels);

  setText("ending-player-name", GameState.playerName || "Baker");
  setText("ending-run-time", formatDuration(runSecs));
  setText("ending-best-time", bestSecs > 0 ? formatDuration(bestSecs) : formatDuration(runSecs));
  setText("ending-run-pretzels", runPretzels.toLocaleString());
  setText("ending-best-pretzels", bestPretzels.toLocaleString());
  setText("ending-gold-pretzels", goldCount.toLocaleString());
  setText("ending-gold-bonus", `+${goldCount * 25}%`);

  if (records.isNewBestTime) showEl("ending-best-time-badge");
  else hideEl("ending-best-time-badge");

  if (records.isNewBestPretzels) showEl("ending-best-pretzels-badge");
  else hideEl("ending-best-pretzels-badge");

  triggerScreenShake();
  triggerConfettiStarBurst(window.innerWidth * 0.5, window.innerHeight * 0.35, 18);
  showEl("ending-modal");
}

const Projects = [
  {
    id: "manual_gloves",
    icon: "[🧤]",
    title: "Asbestos Baker's Mitts",
    desc: "Bake 2 pretzels per click (uses 2 lbs dough).",
    cashCost: 25,
    rpCost: 0,
    trigger: () => GameState.pretzels >= 20,
    effect: () => {
      GameState.clickPower = 2;
      logMessage("Upgraded: Manual baking doubled.");
    }
  },
  {
    id: "income_ticker",
    icon: "[📈]",
    title: "Live Cash Flow Meter",
    desc: "Displays real-time net cash per second under Unsold Inventory.",
    cashCost: 40,
    rpCost: 0,
    trigger: () => GameState.pretzels >= 35,
    effect: () => {
      GameState.unlockedIncomeTicker = true;
      showEl("income-rate-line");
      logMessage("Upgraded: Live $/sec cash flow meter installed.");
    }
  },
  {
    id: "faster_extruders",
    icon: "[🔩]",
    title: "High-Torque Dough Nozzles",
    desc: "Doubles Auto-Extruder output.",
    cashCost: 65,
    rpCost: 0,
    trigger: () => GameState.extruders >= 3,
    effect: () => {
      GameState.extruderSpeed *= 2;
      logMessage("Upgraded: Auto-Extruders now run at 2x speed.");
    }
  },
  {
    id: "unlock_trucks",
    icon: "[🚚]",
    title: "Regional Delivery Fleet",
    desc: "Unlocks Delivery Trucks to move bulk inventory.",
    cashCost: 150,
    rpCost: 0,
    trigger: () => GameState.pretzels >= 120,
    effect: () => {
      GameState.unlockedTrucks = true;
      showEl("system-delivery");
      showEl("panel-trucks");
      logMessage("Delivery Trucks unlocked.");
    }
  },
  {
    id: "unlock_minigame",
    icon: "[◎]",
    title: "R&D Ballistic Test Range",
    desc: "Unlocks target range mini-game for Research Points (RP).",
    cashCost: 220,
    rpCost: 0,
    trigger: () => GameState.pretzels >= 200,
    effect: () => {
      GameState.unlockedMinigame = true;
      showEl("rp-badge");
      showEl("panel-minigame");
      updateRangeTargetsUI();
      logMessage("R&D Test Range online! Shoot the target for RP.");
    }
  },
  {
    id: "unlock_range_shooters",
    icon: "[🤖]",
    title: "Automated Range Turrets",
    desc: "Allows buying & selling auto-shooters on the Ballistic Range that fire every ~1–2s for RP.",
    cashCost: 1800,
    rpCost: 12,
    trigger: () => GameState.unlockedMinigame,
    effect: () => {
      GameState.unlockedRangeShooters = true;
      showEl("range-shooter-controls");
      logMessage("Automated Range Turrets unlocked! Buy/sell shooters inside Ballistic Dough Tester.");
    }
  },
  {
    id: "range_targets_2",
    icon: "[◎]",
    title: "Dual Moving Range Targets",
    desc: "Adds a 2nd sliding target on the Ballistic Dough Tester at a different speed.",
    cashCost: 600,
    rpCost: 8,
    trigger: () => GameState.unlockedMinigame,
    effect: () => {
      GameState.rangeTargetCount = Math.max(GameState.rangeTargetCount || 1, 2);
      updateRangeTargetsUI();
      logMessage("Ballistic Range upgraded to 2 moving targets!");
    }
  },
  {
    id: "range_targets_3",
    icon: "[◎]",
    title: "Triple Oscillating Range Targets",
    desc: "Adds a 3rd sliding target moving out of phase on the Ballistic Dough Tester.",
    cashCost: 1800,
    rpCost: 16,
    trigger: () => GameState.unlockedMinigame && (GameState.rangeTargetCount || 1) >= 2,
    effect: () => {
      GameState.rangeTargetCount = Math.max(GameState.rangeTargetCount || 1, 3);
      updateRangeTargetsUI();
      logMessage("Ballistic Range upgraded to 3 moving targets!");
    }
  },
  {
    id: "range_targets_4",
    icon: "[◎]",
    title: "Quad Staggered Range Targets",
    desc: "Adds a 4th target with a distinct rhythm on the Ballistic Dough Tester.",
    cashCost: 5500,
    rpCost: 28,
    trigger: () => GameState.unlockedMinigame && (GameState.rangeTargetCount || 1) >= 3,
    effect: () => {
      GameState.rangeTargetCount = Math.max(GameState.rangeTargetCount || 1, 4);
      updateRangeTargetsUI();
      logMessage("Ballistic Range upgraded to 4 moving targets!");
    }
  },
  {
    id: "range_targets_5",
    icon: "[🎯]",
    title: "Pentagram Ballistic Target Array (Max)",
    desc: "Unlocks all 5 staggered targets on the Ballistic Dough Tester.",
    cashCost: 15000,
    rpCost: 45,
    trigger: () => GameState.unlockedMinigame && (GameState.rangeTargetCount || 1) >= 4,
    effect: () => {
      GameState.rangeTargetCount = 5;
      updateRangeTargetsUI();
      logMessage("Ballistic Range maxed out at 5 targets!");
    }
  },
  {
    id: "dough_pallet_1",
    icon: "[📦]",
    title: "Palletized Flour Delivery",
    desc: "Increases Dough bought per order from 500 lbs to 1,500 lbs.",
    cashCost: 275,
    rpCost: 0,
    trigger: () => GameState.doughPurchases >= 2,
    effect: () => {
      GameState.doughBatchSize = 1500;
      logMessage("Upgraded: Dough orders now deliver 1,500 lbs per batch!");
    }
  },
  {
    id: "dip_cheddar",
    icon: "[🧀]",
    title: "Dip: Warm Cheddar Cup",
    desc: "Adds +$0.25 to every pretzel sold.",
    cashCost: 320,
    rpCost: 0,
    trigger: () => GameState.pretzels >= 280,
    effect: () => {
      GameState.dipBonus += 0.25;
      logMessage("Menu Added: Warm Cheddar Dip (+$0.25/pretzel).");
    }
  },
  {
    id: "rp_auto_dough",
    icon: "[⚖️]",
    title: "Precision Auto-Dough Silo",
    desc: "Unlocks Auto-Buyer to restock dough automatically.",
    cashCost: 400,
    rpCost: 10,
    trigger: () => GameState.unlockedMinigame && (GameState.doughPurchases >= 1 || GameState.handMadeDoughTotal >= 1),
    effect: () => {
      GameState.unlockedAutoDough = true;
      GameState.autoDoughEnabled = true;
      showEl("btn-toggle-autodough");
      logMessage("Precision Auto-Dough Silo online!");
    }
  },
  {
    id: "recipe_cinnamon",
    icon: "[🍯]",
    title: "Recipe: Cinnamon Sugar",
    desc: "Unlocks Cinnamon Sugar pretzels (1.6x price, +15% demand).",
    cashCost: 450,
    rpCost: 0,
    trigger: () => GameState.pretzels >= 400,
    effect: () => {
      unlockRecipe("cinnamon");
      logMessage("New Recipe: Cinnamon Sugar Pretzels unlocked!");
    }
  },
  {
    id: "industrial_ovens",
    icon: "[🔥]",
    title: "Industrial Steam Ovens",
    desc: "Doubles Auto-Extruder speed again.",
    cashCost: 600,
    rpCost: 0,
    trigger: () => GameState.extruders >= 8,
    effect: () => {
      GameState.extruderSpeed *= 2;
      logMessage("Upgraded: Steam ovens installed.");
    }
  },
  {
    id: "turbo_dispatch",
    icon: "[⚡]",
    title: "Turbocharged Route Dispatch",
    desc: "Doubles Delivery Truck capacity.",
    cashCost: 950,
    rpCost: 0,
    trigger: () => GameState.trucks >= 3,
    effect: () => {
      GameState.truckCapacity *= 2;
      logMessage("Upgraded: Delivery Trucks now haul 2x pretzels.");
    }
  },
  {
    id: "unlock_plinko",
    icon: "[🎰]",
    title: "ASCII Pretzel Plinko",
    desc: "Unlocks high-stakes Plinko in R&D to win Dough or a rare 30s Golden Rush! Press [E] to drop.",
    cashCost: 1200,
    rpCost: 10,
    trigger: () => GameState.unlockedMinigame && GameState.pretzels >= 1500,
    effect: () => {
      GameState.unlockedPlinko = true;
      showEl("panel-plinko");
      renderPlinkoBoard(true);
      logMessage("ASCII Plinko unlocked! Press [E] or click Drop to hit center [★] for Golden Rush.");
    }
  },
  {
    id: "dough_pallet_2",
    icon: "[🏗️]",
    title: "Bulk Grain Hopper",
    desc: "Increases Dough bought per order to 5,000 lbs.",
    cashCost: 1200,
    rpCost: 0,
    trigger: () => GameState.completedProjects.includes("dough_pallet_1") && GameState.pretzels >= 1500,
    effect: () => {
      GameState.doughBatchSize = 5000;
      logMessage("Upgraded: Dough orders now deliver 5,000 lbs per batch!");
    }
  },
  {
    id: "dip_beer_cheese",
    icon: "[🍺]",
    title: "Dip: Sharp Beer Cheese",
    desc: "Adds +$0.75 to every pretzel sold.",
    cashCost: 1400,
    rpCost: 0,
    trigger: () => GameState.completedProjects.includes("dip_cheddar") && GameState.pretzels >= 1200,
    effect: () => {
      GameState.dipBonus += 0.75;
      logMessage("Menu Added: Sharp Beer Cheese (+$0.75/pretzel).");
    }
  },
  {
    id: "recipe_bavarian",
    icon: "[🥨]",
    title: "Recipe: Bavarian Lye-Dipped",
    desc: "Unlocks authentic Bavarian pretzels (2.5x price, +25% demand).",
    cashCost: 1800,
    rpCost: 0,
    trigger: () => GameState.unlockedRecipes.includes("cinnamon") && GameState.pretzels >= 1600,
    effect: () => {
      unlockRecipe("bavarian");
      logMessage("New Recipe: Bavarian Pretzels unlocked!");
    }
  },
  {
    id: "triple_screw_extruder",
    icon: "[🌀]",
    title: "Triple-Screw Dough Press",
    desc: "Triples (3x) Auto-Extruder output speed.",
    cashCost: 2200,
    rpCost: 0,
    trigger: () => GameState.extruders >= 12,
    effect: () => {
      GameState.extruderSpeed *= 3;
      logMessage("Upgraded: Triple-Screw Dough Presses running at 3x!");
    }
  },
  {
    id: "sea_salt_glaze",
    icon: "[🧂]",
    title: "Artisanal Sea Salt Glaze",
    desc: "Permanently increases public demand by +35%.",
    cashCost: 2800,
    rpCost: 0,
    trigger: () => GameState.pretzels >= 2500,
    effect: () => {
      GameState.demandBonus += 0.35;
      updateDemand();
      logMessage("Upgraded: Customers are hooked on the sea salt glaze.");
    }
  },
  {
    id: "unlock_drones",
    icon: "[🛸]",
    title: "Autonomous Drone Network",
    desc: "Unlocks high-speed Pretzel Drones.",
    cashCost: 3500,
    rpCost: 0,
    trigger: () => GameState.trucks >= 5 && GameState.pretzels >= 4000,
    effect: () => {
      GameState.unlockedDrones = true;
      showEl("system-delivery");
      showEl("panel-drones");
      logMessage("Autonomous Drone Network online.");
    }
  },
  {
    id: "warming_racks",
    icon: "[♨️]",
    title: "Insulated Warming Racks",
    desc: "Increases Delivery Truck capacity by 2.5x.",
    cashCost: 4200,
    rpCost: 0,
    trigger: () => GameState.trucks >= 8,
    effect: () => {
      GameState.truckCapacity = Math.round(GameState.truckCapacity * 2.5);
      logMessage("Upgraded: Trucks keep pretzels fresh across county lines.");
    }
  },
  {
    id: "unlock_supply_chain",
    icon: "[⛓️]",
    title: "Vertical Supply Chain Charter",
    desc: "Unlocks Rock Salt Mines, Winter Wheat Fields, and Dough Refineries to produce massive dough in-house.",
    cashCost: 5000,
    rpCost: 25,
    trigger: () => GameState.unlockedMinigame && GameState.pretzels >= 10000 && (GameState.doughPurchases >= 6 || GameState.doughCost >= 15),
    effect: () => {
      GameState.unlockedSupplyChain = true;
      GameState.supplyChainEnabled = true;
      showEl("system-supply-chain");
      logMessage("Vertical Supply Chain unlocked! Open Mines, Fields & Refineries.");
    }
  },
  {
    id: "auto_pricer",
    icon: "[🏷️]",
    title: "Auto-Pricer Algorithm",
    desc: "Automatically sets your price to the highest point where demand still matches your production.",
    cashCost: 25000,
    rpCost: 40,
    trigger: () => GameState.unlockedSupplyChain && GameState.extruders >= 25,
    effect: () => {
      GameState.unlockedAutoPricer = true;
      GameState.autoPricerEnabled = true;
      showEl("btn-toggle-autopricer");
      applyAutoPrice();
      logMessage("Auto-Pricer online! Price now tracks demand automatically.");
    }
  },
  {
    id: "supply_cryo_salt",
    icon: "[⛏️]",
    title: "Cryo-Borehole Salt Extraction",
    desc: "3x Rock Salt Mine output so salt never bottlenecks your refineries.",
    cashCost: 14000,
    rpCost: 15,
    trigger: () => GameState.unlockedSupplyChain && GameState.saltMines >= 3,
    effect: () => {
      GameState.saltRateMult *= 3;
      logMessage("Supply Upgrade: Rock Salt Mines boosted by 3x!");
    }
  },
  {
    id: "supply_hybrid_wheat",
    icon: "[🌾]",
    title: "High-Yield Winter Wheat Genetics",
    desc: "3x Winter Wheat Field harvest rate.",
    cashCost: 18000,
    rpCost: 15,
    trigger: () => GameState.unlockedSupplyChain && GameState.wheatFarms >= 3,
    effect: () => {
      GameState.wheatRateMult *= 3;
      logMessage("Supply Upgrade: Winter Wheat Fields boosted by 3x!");
    }
  },
  {
    id: "supply_pressurized_refinery",
    icon: "[🏭]",
    title: "Pressurized Continuous Dough Reactors",
    desc: "4x Dough Refinery throughput (with 2x Salt & Wheat feed) to replace Dough Buyer.",
    cashCost: 28000,
    rpCost: 25,
    trigger: () => GameState.unlockedSupplyChain && GameState.refineries >= 3,
    effect: () => {
      GameState.refineryRateMult *= 4;
      GameState.saltRateMult *= 2;
      GameState.wheatRateMult *= 2;
      logMessage("Supply Upgrade: Dough Refineries now refine at 4x throughput!");
    }
  },
  {
    id: "supply_hyper_silos",
    icon: "[⚡]",
    title: "Automated Mega-Silo Logistics",
    desc: "5x ALL Supply Chain production (Salt, Wheat & Dough Refineries) — Dough Buyer obsolete!",
    cashCost: 95000,
    rpCost: 45,
    trigger: () => GameState.unlockedSupplyChain && GameState.refineries >= 10,
    effect: () => {
      GameState.saltRateMult *= 5;
      GameState.wheatRateMult *= 5;
      GameState.refineryRateMult *= 5;
      logMessage("MEGA-SILOS ONLINE: Supply Chain boosted by 5x across all facilities!");
    }
  },
  {
    id: "dough_pipeline",
    icon: "[🏭]",
    title: "Industrial Flour Pipeline",
    desc: "Increases Dough bought per order to 20,000 lbs.",
    cashCost: 6500,
    rpCost: 0,
    trigger: () => GameState.completedProjects.includes("dough_pallet_2") && GameState.pretzels >= 10000,
    effect: () => {
      GameState.doughBatchSize = 20000;
      logMessage("Upgraded: Dough pipeline pumps 20,000 lbs per batch!");
    }
  },
  {
    id: "magma_kilns",
    icon: "[🌋]",
    title: "Hydraulic Magma Kilns",
    desc: "Quadruples (4x) Auto-Extruder output speed.",
    cashCost: 11000,
    rpCost: 0,
    trigger: () => GameState.extruders >= 16,
    effect: () => {
      GameState.extruderSpeed *= 4;
      logMessage("Upgraded: Hydraulic Magma Kilns baking at 4x!");
    }
  },
  {
    id: "lidar_drones",
    icon: "[📡]",
    title: "LIDAR Roof-Drop Guidance",
    desc: "Doubles Pretzel Drone delivery capacity.",
    cashCost: 18000,
    rpCost: 0,
    trigger: () => GameState.drones >= 3,
    effect: () => {
      GameState.droneCapacity *= 2;
      logMessage("Upgraded: Drones now fly precision roof-drop routes.");
    }
  },
  {
    id: "suborbital_pods",
    icon: "[🚀]",
    title: "Sub-Orbital Pretzel Pods",
    desc: "Triples Pretzel Drone delivery capacity.",
    cashCost: 75000,
    rpCost: 0,
    trigger: () => GameState.drones >= 8,
    effect: () => {
      GameState.droneCapacity *= 3;
      logMessage("Upgraded: Sub-orbital pretzel drops active.");
    }
  },
  {
    id: "rp_cryo_extruder",
    icon: "[❄️]",
    title: "Cryo-Cooled Extruder Cores",
    desc: "3x Auto-Extruder output speed.",
    cashCost: 850,
    rpCost: 15,
    trigger: () => GameState.unlockedMinigame,
    effect: () => {
      GameState.extruderSpeed *= 3;
      logMessage("RP Breakthrough: Auto-Extruders boosted by 3x!");
    }
  },
  {
    id: "rp_dip_queso",
    icon: "[🌶️]",
    title: "Dip: Spicy Queso Blanco",
    desc: "Adds +$2.00 to every pretzel sold.",
    cashCost: 2200,
    rpCost: 25,
    trigger: () => GameState.unlockedMinigame && GameState.completedProjects.includes("dip_beer_cheese"),
    effect: () => {
      GameState.dipBonus += 2.00;
      logMessage("RP Menu Added: Spicy Queso Blanco (+$2.00/pretzel)!");
    }
  },
  {
    id: "rp_aero_trucks",
    icon: "[💨]",
    title: "Aerodynamic Truck Fairings",
    desc: "2x Delivery Truck hauling capacity.",
    cashCost: 3000,
    rpCost: 30,
    trigger: () => GameState.unlockedMinigame && GameState.unlockedTrucks,
    effect: () => {
      GameState.truckCapacity *= 2;
      logMessage("RP Breakthrough: Delivery Trucks boosted by 2x!");
    }
  },
  {
    id: "rp_recipe_jalapeno",
    icon: "[🧀]",
    title: "Recipe: Jalapeño Cheddar",
    desc: "Unlocks gourmet Jalapeño Cheddar pretzels (4.0x price, +40% demand).",
    cashCost: 4800,
    rpCost: 40,
    trigger: () => GameState.unlockedMinigame && GameState.unlockedRecipes.includes("bavarian"),
    effect: () => {
      unlockRecipe("jalapeno");
      logMessage("RP Menu Added: Jalapeño Cheddar Pretzels unlocked!");
    }
  },
  {
    id: "rp_quantum_yeast",
    icon: "[🧬]",
    title: "Quantum Yeast Catalyst",
    desc: "+50% public demand & 2x manual bake power.",
    cashCost: 7500,
    rpCost: 50,
    trigger: () => GameState.unlockedMinigame && GameState.researchPoints >= 15,
    effect: () => {
      GameState.demandBonus += 0.50;
      GameState.clickPower *= 2;
      updateDemand();
      logMessage("RP Breakthrough: Quantum Yeast skyrockets demand!");
    }
  },
  {
    id: "rp_zero_point_extruder",
    icon: "[⚛️]",
    title: "Zero-Point Dough Reactor",
    desc: "5x Auto-Extruder output speed to crush late-game demand.",
    cashCost: 15000,
    rpCost: 65,
    trigger: () => GameState.unlockedMinigame && GameState.extruders >= 15,
    effect: () => {
      GameState.extruderSpeed *= 5;
      logMessage("RP Breakthrough: Zero-Point Reactor running at 5x!");
    }
  },
  {
    id: "rp_drone_thrusters",
    icon: "[☄️]",
    title: "Overclocked Drone Thrusters",
    desc: "3x Pretzel Drone delivery speed.",
    cashCost: 25000,
    rpCost: 85,
    trigger: () => GameState.unlockedMinigame && GameState.unlockedDrones,
    effect: () => {
      GameState.droneCapacity *= 3;
      logMessage("RP Breakthrough: Drones boosted by 3x!");
    }
  },
  {
    id: "sa_recipe_dulce",
    icon: "[🍮]",
    title: "[South America] Recipe: Dulce de Leche Glaze",
    desc: "Unlocks South American caramel glaze pretzels (6.5x price, +55% demand).",
    cashCost: 35000,
    rpCost: 20,
    minContinent: 1,
    trigger: () => (GameState.continentIndex || 0) >= 1 && GameState.pretzels >= 2500,
    effect: () => {
      unlockRecipe("dulce");
      logMessage("South America Specialty Unlocked: Dulce de Leche Glaze (6.5x)!");
    }
  },
  {
    id: "sa_extruder_wind",
    icon: "[🌬️]",
    title: "[South America] Patagonian Wind-Driven Extruders",
    desc: "4x Auto-Extruder output speed.",
    cashCost: 65000,
    rpCost: 30,
    minContinent: 1,
    trigger: () => (GameState.continentIndex || 0) >= 1 && GameState.extruders >= 10,
    effect: () => {
      GameState.extruderSpeed *= 4;
      logMessage("South America Upgrade: Patagonian Extruders running at 4x!");
    }
  },
  {
    id: "sa_supply_andean",
    icon: "[⛰️]",
    title: "[South America] Andean Brine & Highland Grain",
    desc: "3x Salt Mine, Wheat Field & Dough Refinery output.",
    cashCost: 120000,
    rpCost: 40,
    minContinent: 1,
    trigger: () => (GameState.continentIndex || 0) >= 1 && GameState.unlockedSupplyChain,
    effect: () => {
      GameState.saltRateMult *= 3;
      GameState.wheatRateMult *= 3;
      GameState.refineryRateMult *= 3;
      logMessage("South America Upgrade: Supply Chain boosted by 3x!");
    }
  },
  {
    id: "eu_recipe_truffle",
    icon: "[🍄]",
    title: "[Europe] Recipe: Alpine Truffle & Gruyère",
    desc: "Unlocks luxury European truffle pretzels (10.0x price, +70% demand).",
    cashCost: 90000,
    rpCost: 30,
    minContinent: 2,
    trigger: () => (GameState.continentIndex || 0) >= 2 && GameState.pretzels >= 5000,
    effect: () => {
      unlockRecipe("truffle");
      logMessage("Europe Specialty Unlocked: Alpine Truffle & Gruyère (10.0x)!");
    }
  },
  {
    id: "eu_extruder_geothermal",
    icon: "[♨️]",
    title: "[Europe] Alpine Geothermal Kiln Array",
    desc: "5x Auto-Extruder output speed.",
    cashCost: 180000,
    rpCost: 45,
    minContinent: 2,
    trigger: () => (GameState.continentIndex || 0) >= 2 && GameState.extruders >= 15,
    effect: () => {
      GameState.extruderSpeed *= 5;
      logMessage("Europe Upgrade: Geothermal Kiln Array running at 5x!");
    }
  },
  {
    id: "eu_freight_barges",
    icon: "[🚢]",
    title: "[Europe] Rhine River Heavy Freight Barges",
    desc: "4x Delivery Truck hauling capacity & +$5.00 luxury dip pairing.",
    cashCost: 320000,
    rpCost: 55,
    minContinent: 2,
    trigger: () => (GameState.continentIndex || 0) >= 2 && GameState.trucks >= 8,
    effect: () => {
      GameState.truckCapacity *= 4;
      GameState.dipBonus += 5.00;
      logMessage("Europe Upgrade: Freight Barges (4x Trucks) & +$5.00 dip bonus!");
    }
  },
  {
    id: "af_recipe_berbere",
    icon: "[🌶️]",
    title: "[Africa] Recipe: Spiced Berbere Cheddar",
    desc: "Unlocks bold spiced cheddar pretzels (16.0x price, +85% demand).",
    cashCost: 220000,
    rpCost: 40,
    minContinent: 3,
    trigger: () => (GameState.continentIndex || 0) >= 3 && GameState.pretzels >= 10000,
    effect: () => {
      unlockRecipe("berbere");
      logMessage("Africa Specialty Unlocked: Spiced Berbere Cheddar (16.0x)!");
    }
  },
  {
    id: "af_extruder_solar",
    icon: "[☀️]",
    title: "[Africa] Sahara Concentrated Solar Ovens",
    desc: "6x Auto-Extruder output speed.",
    cashCost: 420000,
    rpCost: 60,
    minContinent: 3,
    trigger: () => (GameState.continentIndex || 0) >= 3 && GameState.extruders >= 20,
    effect: () => {
      GameState.extruderSpeed *= 6;
      logMessage("Africa Upgrade: Sahara Solar Ovens baking at 6x!");
    }
  },
  {
    id: "af_supply_rail",
    icon: "[🚂]",
    title: "[Africa] Trans-Continental Bulk Rail Grid",
    desc: "5x Dough Refinery & Salt/Wheat Supply Chain throughput.",
    cashCost: 750000,
    rpCost: 75,
    minContinent: 3,
    trigger: () => (GameState.continentIndex || 0) >= 3 && GameState.unlockedSupplyChain,
    effect: () => {
      GameState.saltRateMult *= 5;
      GameState.wheatRateMult *= 5;
      GameState.refineryRateMult *= 5;
      logMessage("Africa Upgrade: Bulk Rail Grid boosted Supply Chain by 5x!");
    }
  },
  {
    id: "as_recipe_matcha",
    icon: "[🍵]",
    title: "[Asia] Recipe: Matcha & Yuzu Honey",
    desc: "Unlocks artisanal Matcha & Yuzu pretzels (25.0x price, +105% demand).",
    cashCost: 500000,
    rpCost: 55,
    minContinent: 4,
    trigger: () => (GameState.continentIndex || 0) >= 4 && GameState.pretzels >= 25000,
    effect: () => {
      unlockRecipe("matcha");
      logMessage("Asia Specialty Unlocked: Matcha & Yuzu Honey (25.0x)!");
    }
  },
  {
    id: "as_extruder_maglev",
    icon: "[🚄]",
    title: "[Asia] Maglev Continuous Dough Conduits",
    desc: "8x Auto-Extruder output speed.",
    cashCost: 950000,
    rpCost: 75,
    minContinent: 4,
    trigger: () => (GameState.continentIndex || 0) >= 4 && GameState.extruders >= 25,
    effect: () => {
      GameState.extruderSpeed *= 8;
      logMessage("Asia Upgrade: Maglev Dough Conduits running at 8x!");
    }
  },
  {
    id: "as_swarm_drones",
    icon: "[🛸]",
    title: "[Asia] Hypersonic AI Swarm Drones",
    desc: "5x Pretzel Drone delivery capacity & +$15.00 dip bonus.",
    cashCost: 1600000,
    rpCost: 90,
    minContinent: 4,
    trigger: () => (GameState.continentIndex || 0) >= 4 && GameState.drones >= 10,
    effect: () => {
      GameState.droneCapacity *= 5;
      GameState.dipBonus += 15.00;
      logMessage("Asia Upgrade: AI Swarm Drones (5x Drones) & +$15.00 dip bonus!");
    }
  },
  {
    id: "oc_recipe_macadamia",
    icon: "[🥥]",
    title: "[Oceania] Recipe: Macadamia Salted Caramel",
    desc: "Unlocks roasted macadamia caramel pretzels (40.0x price, +130% demand).",
    cashCost: 1100000,
    rpCost: 70,
    minContinent: 5,
    trigger: () => (GameState.continentIndex || 0) >= 5 && GameState.pretzels >= 50000,
    effect: () => {
      unlockRecipe("macadamia");
      logMessage("Oceania Specialty Unlocked: Macadamia Salted Caramel (40.0x)!");
    }
  },
  {
    id: "oc_extruder_tidal",
    icon: "[🌊]",
    title: "[Oceania] Deep-Ocean Tidal Press Turbines",
    desc: "10x Auto-Extruder output speed.",
    cashCost: 2200000,
    rpCost: 95,
    minContinent: 5,
    trigger: () => (GameState.continentIndex || 0) >= 5 && GameState.extruders >= 30,
    effect: () => {
      GameState.extruderSpeed *= 10;
      logMessage("Oceania Upgrade: Tidal Press Turbines running at 10x!");
    }
  },
  {
    id: "oc_supply_brine",
    icon: "[🐚]",
    title: "[Oceania] Abyssal Brine & Reef Bio-Refineries",
    desc: "8x Salt Mine, Wheat Field & Dough Refinery throughput.",
    cashCost: 3800000,
    rpCost: 115,
    minContinent: 5,
    trigger: () => (GameState.continentIndex || 0) >= 5 && GameState.unlockedSupplyChain,
    effect: () => {
      GameState.saltRateMult *= 8;
      GameState.wheatRateMult *= 8;
      GameState.refineryRateMult *= 8;
      logMessage("Oceania Upgrade: Bio-Refineries boosted Supply Chain by 8x!");
    }
  },
  {
    id: "an_recipe_glacier",
    icon: "[🧊]",
    title: "[Antarctica] Recipe: Crystalline Glacier Salt",
    desc: "Unlocks ancient glacial-salt pretzels (65.0x price, +160% demand).",
    cashCost: 2500000,
    rpCost: 90,
    minContinent: 6,
    trigger: () => (GameState.continentIndex || 0) >= 6 && GameState.pretzels >= 100000,
    effect: () => {
      unlockRecipe("glacier");
      logMessage("Antarctica Specialty Unlocked: Crystalline Glacier Salt (65.0x)!");
    }
  },
  {
    id: "an_extruder_superconductor",
    icon: "[💠]",
    title: "[Antarctica] Sub-Zero Superconducting Presses",
    desc: "15x Auto-Extruder output speed.",
    cashCost: 4800000,
    rpCost: 120,
    minContinent: 6,
    trigger: () => (GameState.continentIndex || 0) >= 6 && GameState.extruders >= 35,
    effect: () => {
      GameState.extruderSpeed *= 15;
      logMessage("Antarctica Upgrade: Superconducting Presses running at 15x!");
    }
  },
  {
    id: "an_orbital_logistics",
    icon: "[🛰️]",
    title: "[Antarctica] Polar Orbital Drop-Pod Network",
    desc: "10x Drone & Truck capacity + 10x Supply Chain refining for final Earth conquest!",
    cashCost: 8500000,
    rpCost: 150,
    minContinent: 6,
    trigger: () => (GameState.continentIndex || 0) >= 6 && GameState.drones >= 15,
    effect: () => {
      GameState.droneCapacity *= 10;
      GameState.truckCapacity *= 10;
      GameState.saltRateMult *= 10;
      GameState.wheatRateMult *= 10;
      GameState.refineryRateMult *= 10;
      logMessage("Antarctica Upgrade: Polar Orbital Network boosted Delivery & Supply by 10x!");
    }
  }
];

let pendingSales = 0;
let cashFlowHistory = [];
let liveCashPerSec = 0;
let manualBakeHistory = [];
let crosshairPos = 10;
let crosshairDir = 1;
let rangeAnimClock = 0;
let autoShooterTimer = 0;
let lastAnimTime = null;
let lastShotTime = 0;
let controlsBound = false;
let globeSpinTimer = 0;

const RANGE_TARGET_CONFIGS = [
  { center: 50, amp: 0,  speed: 0,    phase: 0.0 },
  { center: 50, amp: 26, speed: 1.65, phase: 0.0 },
  { center: 50, amp: 32, speed: 2.35, phase: 1.8 },
  { center: 50, amp: 22, speed: 3.10, phase: 3.6 },
  { center: 50, amp: 35, speed: 1.25, phase: 5.1 }
];

const SALT_BASE_RATE = 250;
const WHEAT_BASE_RATE = 350;
const REFINERY_BASE_RATE = 600;
const SALT_BASE_PAYROLL = 12.00;
const WHEAT_BASE_PAYROLL = 20.00;
const REFINERY_BASE_PAYROLL = 45.00;

const PLINKO_COLS = 19;
const PLINKO_INNER_COLS = PLINKO_COLS - 2;
const PLINKO_ROWS = 6;
const PLINKO_COST = 50;
const MAX_FALLING_PRETZELS = 3;
let plinkoDropperPos = 9;
let plinkoDropperDir = 1;
let plinkoBall = null;
let plinkoStepTimer = 0;

function bindHoldButton(id, actionFn, options = {}) {
  const btn = getEl(id);
  if (!btn) return;

  const initialDelay = options.initialDelay ?? 240;
  const repeatMs = options.repeatMs ?? 55;
  const onRelease = options.onRelease ?? null;

  let holdDelayTimer = null;
  let repeatInterval = null;
  let holdStartTime = 0;

  const stopHold = () => {
    const wasHolding = Boolean(holdDelayTimer || repeatInterval);
    clearTimeout(holdDelayTimer);
    clearInterval(repeatInterval);
    holdDelayTimer = null;
    repeatInterval = null;
    if (wasHolding && typeof onRelease === "function") {
      onRelease();
    }
  };

  const startHold = (e) => {
    if (typeof e.clientX === "number" && typeof e.clientY === "number") {
      lastPointerPos = { x: Math.round(e.clientX), y: Math.round(e.clientY) };
    } else if (e.touches && e.touches[0]) {
      lastPointerPos = { x: Math.round(e.touches[0].clientX), y: Math.round(e.touches[0].clientY) };
    }
    if (e.type === "mousedown" && e.button !== 0) return;
    stopHold();
    holdStartTime = Date.now();
    actionFn(0);
    holdDelayTimer = setTimeout(() => {
      repeatInterval = setInterval(() => {
        const heldSecs = (Date.now() - holdStartTime) / 1000;
        actionFn(heldSecs);
      }, repeatMs);
    }, initialDelay);
  };

  btn.addEventListener("mousedown", startHold);
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startHold(e);
  }, { passive: false });

  btn.addEventListener("mouseup", stopHold);
  btn.addEventListener("mouseleave", stopHold);
  btn.addEventListener("touchend", stopHold);
  btn.addEventListener("touchcancel", stopHold);
}

function getExponentialPriceStep(heldSecs) {
  if (heldSecs <= 0.15) return 0.05;
  const expStep = 0.05 * Math.pow(1.45, Math.min(heldSecs * 4.5, 16));
  return Math.min(5.00, Math.round(expStep * 20) / 20);
}

function logMessage(msg) {
  setText("console-log", `> ${msg}`);
  updateConsoleMarquee();
}

function updateConsoleMarquee() {
  const box = getEl("console-box");
  const log = getEl("console-log");
  if (!box || !log) return;
  log.classList.remove("marquee");
  log.style.removeProperty("--marquee-dist");
  log.style.removeProperty("--marquee-time");
  const overflow = log.scrollWidth - box.clientWidth;
  if (overflow > 2) {
    const secs = Math.max(6, overflow / 25 + 3);
    log.style.setProperty("--marquee-dist", `-${Math.ceil(overflow + 4)}px`);
    log.style.setProperty("--marquee-time", `${secs.toFixed(1)}s`);
    void log.offsetWidth;
    log.classList.add("marquee");
  }
}
window.addEventListener("resize", () => updateConsoleMarquee());

function formatDuration(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function sanitizeNumbers() {
  if (typeof GameState === "undefined") return;
  GameState.gameVersion = getActiveGameVersion();
  if (!Number.isInteger(GameState.selectedAsciiIndex) || GameState.selectedAsciiIndex < 0) GameState.selectedAsciiIndex = 0;
  if (!Number.isFinite(GameState.continentIndex)) GameState.continentIndex = 0;
  if (!Number.isFinite(GameState.highestContinentReached)) GameState.highestContinentReached = 0;
  GameState.highestContinentReached = Math.max(GameState.continentIndex, GameState.highestContinentReached);
  if (!Number.isFinite(GameState.goldenPretzels)) GameState.goldenPretzels = 0;
  if (!Number.isFinite(GameState.lifetimeGoldenPretzels)) GameState.lifetimeGoldenPretzels = GameState.goldenPretzels;
  if (!Number.isFinite(GameState.lifetimePretzelsAllRuns)) GameState.lifetimePretzelsAllRuns = 0;
  if (!Number.isFinite(GameState.totalPlaySecondsAllRuns)) GameState.totalPlaySecondsAllRuns = 0;
  if (!Number.isFinite(GameState.runStartTime)) GameState.runStartTime = Date.now();
  if (!Number.isFinite(GameState.elapsedRunSeconds)) GameState.elapsedRunSeconds = 0;
  if (!Number.isFinite(GameState.continentElapsedSeconds)) GameState.continentElapsedSeconds = 0;
  if (!Number.isFinite(GameState.bestRunSeconds)) GameState.bestRunSeconds = 0;
  if (!Number.isFinite(GameState.fastestDominationSeconds)) GameState.fastestDominationSeconds = 0;
  if (!Number.isFinite(GameState.bestRunPretzels)) GameState.bestRunPretzels = 0;
  if (typeof GameState.goldUiUnlocked !== "boolean") GameState.goldUiUnlocked = false;
  if (typeof GameState.endingSeenForRun !== "boolean") GameState.endingSeenForRun = false;

  if (!Number.isFinite(GameState.pretzels)) GameState.pretzels = 0;
  if (!Number.isFinite(GameState.inventory)) GameState.inventory = 0;
  if (!Number.isFinite(GameState.funds)) GameState.funds = 0;
  if (!Number.isFinite(GameState.researchPoints)) GameState.researchPoints = 0;
  if (!Number.isFinite(GameState.rangeTargetCount) || GameState.rangeTargetCount < 1) GameState.rangeTargetCount = 1;
  if (GameState.rangeTargetCount > 5) GameState.rangeTargetCount = 5;
  if (typeof GameState.unlockedRangeShooters !== "boolean") GameState.unlockedRangeShooters = false;
  if (!Number.isFinite(GameState.rangeShooters) || GameState.rangeShooters < 0) GameState.rangeShooters = 0;
  if (!Number.isFinite(GameState.rangeShooterCost) || GameState.rangeShooterCost <= 0) GameState.rangeShooterCost = 2500.00;
  if (!Number.isFinite(GameState.dough)) GameState.dough = 200;
  if (!Number.isFinite(GameState.doughBatchSize) || GameState.doughBatchSize < 500) GameState.doughBatchSize = 500;
  if (!Number.isFinite(GameState.doughCost) || GameState.doughCost <= 0) GameState.doughCost = 12.00;
  if (!Number.isFinite(GameState.doughPurchases)) GameState.doughPurchases = 0;
  if (!Number.isFinite(GameState.kneadClicks)) GameState.kneadClicks = 0;
  if (!Number.isFinite(GameState.handMadeDoughTotal)) GameState.handMadeDoughTotal = 0;

  if (typeof GameState.unlockedSupplyChain !== "boolean") GameState.unlockedSupplyChain = false;
  if (typeof GameState.supplyChainEnabled !== "boolean") GameState.supplyChainEnabled = true;
  if (!Number.isFinite(GameState.salt)) GameState.salt = 0;
  if (!Number.isFinite(GameState.wheat)) GameState.wheat = 0;
  if (!Number.isFinite(GameState.saltMines)) GameState.saltMines = 0;
  if (!Number.isFinite(GameState.saltMineCost) || GameState.saltMineCost <= 0) GameState.saltMineCost = 2500.00;
  if (!Number.isFinite(GameState.saltRateMult) || GameState.saltRateMult <= 0) GameState.saltRateMult = 1;
  if (!Number.isFinite(GameState.wheatFarms)) GameState.wheatFarms = 0;
  if (!Number.isFinite(GameState.wheatFarmCost) || GameState.wheatFarmCost <= 0) GameState.wheatFarmCost = 4000.00;
  if (!Number.isFinite(GameState.wheatRateMult) || GameState.wheatRateMult <= 0) GameState.wheatRateMult = 1;
  if (!Number.isFinite(GameState.refineries)) GameState.refineries = 0;
  if (!Number.isFinite(GameState.refineryCost) || GameState.refineryCost <= 0) GameState.refineryCost = 8500.00;
  if (!Number.isFinite(GameState.refineryRateMult) || GameState.refineryRateMult <= 0) GameState.refineryRateMult = 1;

  if (!Number.isFinite(GameState.promoLevel) || GameState.promoLevel < 1) GameState.promoLevel = 1;
  if (!Number.isFinite(GameState.promoCost) || GameState.promoCost <= 0) GameState.promoCost = 50.00;
  if (!Number.isFinite(GameState.price) || GameState.price <= 0) GameState.price = 0.50;
  if (!Number.isFinite(GameState.demandBonus) || GameState.demandBonus <= 0) GameState.demandBonus = 1.0;
  if (!Number.isFinite(GameState.dipBonus)) GameState.dipBonus = 0;
  if (!Number.isFinite(GameState.clickPower) || GameState.clickPower < 1) GameState.clickPower = 1;
  if (!Number.isFinite(GameState.goldenRushEndTime)) GameState.goldenRushEndTime = 0;
  if (!Array.isArray(GameState.unlockedRecipes) || GameState.unlockedRecipes.length === 0) {
    GameState.unlockedRecipes = ["classic"];
  }
  if (!Array.isArray(GameState.unlockedAchievements)) {
    GameState.unlockedAchievements = [];
  }
  const safeRecipes = typeof RECIPES !== "undefined" ? RECIPES : { classic: { id: "classic", name: "Classic Salted", priceMult: 1, demandMult: 1 } };
  if (!safeRecipes[GameState.activeRecipe]) GameState.activeRecipe = "classic";
  if (!Number.isFinite(GameState.extruders)) GameState.extruders = 0;
  if (!Number.isFinite(GameState.extruderCost) || GameState.extruderCost <= 0) GameState.extruderCost = 15.00;
  if (!Number.isFinite(GameState.extruderSpeed) || GameState.extruderSpeed <= 0) GameState.extruderSpeed = 1;
  if (!Number.isFinite(GameState.trucks)) GameState.trucks = 0;
  if (!Number.isFinite(GameState.truckCost) || GameState.truckCost <= 0) GameState.truckCost = 250.00;
  if (!Number.isFinite(GameState.truckCapacity) || GameState.truckCapacity <= 0) GameState.truckCapacity = 8;
  if (!Number.isFinite(GameState.drones)) GameState.drones = 0;
  if (!Number.isFinite(GameState.droneCost) || GameState.droneCost <= 0) GameState.droneCost = 5000.00;
  if (!Number.isFinite(GameState.droneCapacity) || GameState.droneCapacity <= 0) GameState.droneCapacity = 75;
}

function getSafeRecipe() {
  const safeRecipes = typeof RECIPES !== "undefined"
    ? RECIPES
    : { classic: { id: "classic", name: "Classic Salted", priceMult: 1.0, demandMult: 1.0 } };
  return safeRecipes[GameState.activeRecipe] || safeRecipes.classic;
}

function getEffectivePriceSafe() {
  if (typeof GameState.getEffectivePrice === "function") {
    return GameState.getEffectivePrice();
  }
  const r = getSafeRecipe();
  const achBonus = 1 + ((GameState.unlockedAchievements?.length || 0) * 0.01);
  const goldBonus = 1 + ((GameState.goldenPretzels || 0) * 0.25);
  const rushMult = Date.now() < (GameState.goldenRushEndTime || 0) ? 2.0 : 1.0;
  return Math.round(((GameState.price * r.priceMult) + (GameState.dipBonus || 0)) * achBonus * goldBonus * rushMult * 100) / 100;
}

function getRangeShooterIntervalSec() {
  const count = Math.max(1, GameState.rangeShooters || 0);
  return Math.max(0.35, 1.60 / (1 + ((count - 1) * 0.22)));
}

function getCostGrowth(baseRate, ownedAfterBuy) {
  return ownedAfterBuy > 25 ? 1 + (baseRate - 1) * 0.25 : baseRate;
}

function getRangeShooterSellValue() {
  if ((GameState.rangeShooters || 0) <= 0) return 0;
  const prevBuyCost = GameState.rangeShooterCost / getCostGrowth(1.48, GameState.rangeShooters);
  return Math.round(prevBuyCost * 0.60 * 100) / 100;
}

function buyRangeShooterStep() {
  if (GameState.funds < GameState.rangeShooterCost) return false;
  GameState.funds -= GameState.rangeShooterCost;
  GameState.rangeShooters = (GameState.rangeShooters || 0) + 1;
  GameState.rangeShooterCost = Math.round(GameState.rangeShooterCost * getCostGrowth(1.48, GameState.rangeShooters) * 100) / 100;
  SoundSystem.playSfx("buy");
  logMessage(`Purchased Range Shooter #${GameState.rangeShooters} (fires every ${getRangeShooterIntervalSec().toFixed(2)}s)!`);
  requestRender();
  return true;
}

function triggerAutoShooterShot() {
  const count = GameState.rangeShooters || 0;
  if (count <= 0 || !GameState.started || !GameState.unlockedMinigame) return;

  const targets = getActiveRangeTargets();
  let hitBonus = 1;
  targets.forEach(targetPos => {
    const dist = Math.abs(crosshairPos - targetPos);
    if (dist <= 5.5) hitBonus = Math.max(hitBonus, 3);
    else if (dist <= 12) hitBonus = Math.max(hitBonus, 2);
  });

  const gainedRP = count * hitBonus;
  GameState.researchPoints += gainedRP;
  setText("range-feedback", `Auto-Shooter volley: +${gainedRP} RP (${count} shooter${count === 1 ? "" : "s"})`);
}

function isSupplyChainActivelyRunning() {
  if (!GameState.unlockedSupplyChain || !GameState.supplyChainEnabled) return false;
  return getSupplyPayrollPerSec() <= 0 || GameState.funds >= getSupplyPayrollPerSec() * 0.2;
}

function getActiveSupplyRates() {
  if (!isSupplyChainActivelyRunning()) {
    return { saltPerSec: 0, wheatPerSec: 0, doughPerSec: 0 };
  }
  const saltMult = getModuleTierInfo(GameState.saltMines).mult * (GameState.saltRateMult || 1);
  const wheatMult = getModuleTierInfo(GameState.wheatFarms).mult * (GameState.wheatRateMult || 1);
  const refineryMult = getModuleTierInfo(GameState.refineries).mult * (GameState.refineryRateMult || 1);

  const saltPerSec = GameState.saltMines * SALT_BASE_RATE * saltMult;
  const wheatPerSec = GameState.wheatFarms * WHEAT_BASE_RATE * wheatMult;
  const maxRefineryRate = GameState.refineries * REFINERY_BASE_RATE * refineryMult;

  const availableSalt = (GameState.salt || 0) + saltPerSec;
  const availableWheat = (GameState.wheat || 0) + wheatPerSec;
  const doughPerSec = GameState.refineries > 0
    ? Math.max(0, Math.min(maxRefineryRate, availableSalt, availableWheat))
    : 0;

  return { saltPerSec, wheatPerSec, doughPerSec };
}

function recordManualBakeRate(bakedAmount) {
  if (!bakedAmount || bakedAmount <= 0) return;
  manualBakeHistory.push({ time: Date.now(), amount: bakedAmount });
}

function getManualBakesPerSec() {
  const nowMs = Date.now();
  const windowMs = 1500;
  manualBakeHistory = manualBakeHistory.filter(entry => nowMs - entry.time <= windowMs);
  const totalBaked = manualBakeHistory.reduce((sum, entry) => sum + entry.amount, 0);
  return Math.round((totalBaked / (windowMs / 1000)) * 10) / 10;
}

function getEffectiveBakeRate() {
  const extruderMult = getModuleTierInfo(GameState.extruders).mult;
  const extruderBakeRate = GameState.extruders * GameState.extruderSpeed * extruderMult;
  const manualRate = getManualBakesPerSec();

  if (GameState.dough > 0) {
    return extruderBakeRate + manualRate;
  }
  const { doughPerSec } = getActiveSupplyRates();
  return Math.min(extruderBakeRate, doughPerSec) + manualRate;
}

function getEffectiveMaxDelivery() {
  const truckMult = getModuleTierInfo(GameState.trucks).mult;
  const droneMult = getModuleTierInfo(GameState.drones).mult;
  return 1
    + (GameState.trucks * GameState.truckCapacity * truckMult)
    + (GameState.drones * GameState.droneCapacity * droneMult);
}

function getFacilityPayrollPerSec(count, baseRate) {
  if (count <= 0) return 0;
  const tierMult = getModuleTierInfo(count).mult;
  const scaleFactor = 1 + (count * 0.08);
  return Math.round(count * baseRate * scaleFactor * tierMult * 100) / 100;
}

function getSupplyPayrollPerSec() {
  if (!GameState.unlockedSupplyChain || !GameState.supplyChainEnabled) return 0;
  return getFacilityPayrollPerSec(GameState.saltMines, SALT_BASE_PAYROLL)
    + getFacilityPayrollPerSec(GameState.wheatFarms, WHEAT_BASE_PAYROLL)
    + getFacilityPayrollPerSec(GameState.refineries, REFINERY_BASE_PAYROLL);
}

function getSaltMineSellValue() {
  if (GameState.saltMines <= 0) return 0;
  return Math.round((GameState.saltMineCost / getCostGrowth(1.45, GameState.saltMines)) * 0.60 * 100) / 100;
}

function getWheatFarmSellValue() {
  if (GameState.wheatFarms <= 0) return 0;
  return Math.round((GameState.wheatFarmCost / getCostGrowth(1.45, GameState.wheatFarms)) * 0.60 * 100) / 100;
}

function getRefinerySellValue() {
  if (GameState.refineries <= 0) return 0;
  return Math.round((GameState.refineryCost / getCostGrowth(1.50, GameState.refineries)) * 0.60 * 100) / 100;
}

function getTruckSellValue() {
  if (GameState.trucks <= 0) return 0;
  const prevBuyCost = GameState.truckCost / getCostGrowth(1.48, GameState.trucks);
  return Math.round(prevBuyCost * 0.60 * 100) / 100;
}

function getDroneSellValue() {
  if (GameState.drones <= 0) return 0;
  const prevBuyCost = GameState.droneCost / getCostGrowth(1.55, GameState.drones);
  return Math.round(prevBuyCost * 0.60 * 100) / 100;
}

function bakePretzels(requestedAmount) {
  if (GameState.dough <= 0) {
    GameState.dough = 0;
    return 0;
  }
  const actualBaked = Math.min(GameState.dough, requestedAmount);
  GameState.dough -= actualBaked;
  GameState.pretzels += actualBaked;
  GameState.inventory += actualBaked;
  GameState.recordRunProgress(0);
  return actualBaked;
}

function handleManualBake() {
  if (typeof GameState === "undefined") return;
  const bakeBtn = getEl("btn-bake");
  if (GameState.dough < 1) {
    logMessage("Out of dough! Hand-knead flour or buy a fresh bag.");
    requestRender();
    return;
  }
  const baked = bakePretzels((GameState.clickPower || 1) * getBuffMult("production"));
  if (baked > 0) {
    recordManualBakeRate(baked);
    spawnSubtleClickPop(bakeBtn, `🥨 +${baked}`);
    SoundSystem.playSfx("bake");
  }
  requestRender();
}
window.handleManualBake = handleManualBake;

function buyDoughBatch(isAuto = false) {
  const batchSize = GameState.doughBatchSize || 500;
  if (GameState.funds >= GameState.doughCost) {
    GameState.funds -= GameState.doughCost;
    GameState.dough += batchSize;
    GameState.doughPurchases += 1;
    if (GameState.doughPurchases % 5 === 0) {
      GameState.doughCost = Math.round(GameState.doughCost * 1.15 * 100) / 100;
    }
    if (!isAuto) {
      SoundSystem.playSfx("buy");
      spawnSubtleClickPop(getEl("btn-buy-dough"), `🥨 +${batchSize.toLocaleString()} lbs`);
      logMessage(`Restocked +${batchSize.toLocaleString()} lbs of fresh dough.`);
    }
    return true;
  }
  return false;
}

function buySaltMineStep() {
  if (GameState.funds < GameState.saltMineCost) return false;
  const prevTier = getModuleTierInfo(GameState.saltMines).tier;
  GameState.funds -= GameState.saltMineCost;
  GameState.saltMines += 1;
  GameState.saltMineCost = Math.round(GameState.saltMineCost * getCostGrowth(1.45, GameState.saltMines) * 100) / 100;
  const newTierInfo = getModuleTierInfo(GameState.saltMines);
  SoundSystem.playSfx("buy");
  if (newTierInfo.tier > prevTier) {
    logMessage(`MILESTONE! Rock Salt Mines reached ${newTierInfo.label} extraction!`);
  }
  requestRender();
  return true;
}

function buyWheatFarmStep() {
  if (GameState.funds < GameState.wheatFarmCost) return false;
  const prevTier = getModuleTierInfo(GameState.wheatFarms).tier;
  GameState.funds -= GameState.wheatFarmCost;
  GameState.wheatFarms += 1;
  GameState.wheatFarmCost = Math.round(GameState.wheatFarmCost * getCostGrowth(1.45, GameState.wheatFarms) * 100) / 100;
  const newTierInfo = getModuleTierInfo(GameState.wheatFarms);
  SoundSystem.playSfx("buy");
  if (newTierInfo.tier > prevTier) {
    logMessage(`MILESTONE! Winter Wheat Fields reached ${newTierInfo.label} harvest!`);
  }
  requestRender();
  return true;
}

function buyRefineryStep() {
  if (GameState.funds < GameState.refineryCost) return false;
  const prevTier = getModuleTierInfo(GameState.refineries).tier;
  GameState.funds -= GameState.refineryCost;
  GameState.refineries += 1;
  GameState.refineryCost = Math.round(GameState.refineryCost * getCostGrowth(1.50, GameState.refineries) * 100) / 100;
  const newTierInfo = getModuleTierInfo(GameState.refineries);
  SoundSystem.playSfx("buy");
  if (newTierInfo.tier > prevTier) {
    logMessage(`MILESTONE! Dough Refineries reached ${newTierInfo.label} throughput!`);
  }
  showEl("refinery-rate-wrap");
  requestRender();
  return true;
}

function buyPromoStep() {
  if (GameState.funds < GameState.promoCost) return false;
  const prevTier = getModuleTierInfo(GameState.promoLevel).tier;
  GameState.funds -= GameState.promoCost;
  GameState.promoLevel += 1;
  GameState.promoCost = Math.round(GameState.promoCost * 1.75 * 100) / 100;
  const newTierInfo = getModuleTierInfo(GameState.promoLevel);
  updateDemand();
  SoundSystem.playSfx("buy");
  if (newTierInfo.tier > prevTier) {
    logMessage(`MILESTONE! Marketing reached ${newTierInfo.label} Demand!`);
  } else {
    logMessage(`Marketing upgraded to Level ${GameState.promoLevel}!`);
  }
  requestRender();
  return true;
}

function buyExtruderStep() {
  if (GameState.funds < GameState.extruderCost) return false;
  const prevTier = getModuleTierInfo(GameState.extruders).tier;
  GameState.funds -= GameState.extruderCost;
  GameState.extruders += 1;
  GameState.extruderCost = Math.round(GameState.extruderCost * getCostGrowth(1.42, GameState.extruders) * 100) / 100;
  const newTierInfo = getModuleTierInfo(GameState.extruders);
  SoundSystem.playSfx("buy");
  if (newTierInfo.tier > prevTier) {
    logMessage(`MILESTONE! Auto-Extruders reached ${newTierInfo.label} output!`);
  }
  requestRender();
  return true;
}

function buyTruckStep() {
  if (GameState.funds < GameState.truckCost) return false;
  const prevTier = getModuleTierInfo(GameState.trucks).tier;
  GameState.funds -= GameState.truckCost;
  GameState.trucks += 1;
  GameState.truckCost = Math.round(GameState.truckCost * getCostGrowth(1.48, GameState.trucks) * 100) / 100;
  const newTierInfo = getModuleTierInfo(GameState.trucks);
  SoundSystem.playSfx("buy");
  if (newTierInfo.tier > prevTier) {
    logMessage(`MILESTONE! Delivery Trucks reached ${newTierInfo.label} capacity!`);
  }
  requestRender();
  return true;
}

function buyDroneStep() {
  if (GameState.funds < GameState.droneCost) return false;
  const prevTier = getModuleTierInfo(GameState.drones).tier;
  GameState.funds -= GameState.droneCost;
  GameState.drones += 1;
  GameState.droneCost = Math.round(GameState.droneCost * getCostGrowth(1.55, GameState.drones) * 100) / 100;
  const newTierInfo = getModuleTierInfo(GameState.drones);
  SoundSystem.playSfx("buy");
  if (newTierInfo.tier > prevTier) {
    logMessage(`MILESTONE! Pretzel Drones reached ${newTierInfo.label} capacity!`);
  }
  requestRender();
  return true;
}

function unlockRecipe(recipeId) {
  if (!GameState.unlockedRecipes.includes(recipeId)) {
    GameState.unlockedRecipes.push(recipeId);
  }
  GameState.activeRecipe = recipeId;
  refreshRecipeDropdown();
  updateDemand();
}

function refreshRecipeDropdown() {
  const select = getEl("select-recipe");
  if (!select) return;

  if (GameState.unlockedRecipes.length > 1) {
    showEl("recipe-box");
  } else {
    hideEl("recipe-box");
  }

  const safeRecipes = typeof RECIPES !== "undefined" ? RECIPES : {};
  select.innerHTML = "";
  GameState.unlockedRecipes.forEach(id => {
    const r = safeRecipes[id];
    if (!r) return;
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = `${r.name} (${r.priceMult}x)`;
    if (r.id === GameState.activeRecipe) opt.selected = true;
    select.appendChild(opt);
  });
}

function getDemandAtPrice(price) {
  const recipe = getSafeRecipe();
  const promoTierMult = getModuleTierInfo(GameState.promoLevel).mult;
  const promoMult = (1 + ((GameState.promoLevel - 1) * 0.20)) * promoTierMult;
  const priceElasticity = Math.pow(0.50 / price, 1.18);
  const rawDemand = priceElasticity * 100 * GameState.demandBonus * recipe.demandMult * promoMult;
  return Math.max(1, Math.round(rawDemand));
}

function updateDemand() {
  GameState.demand = getDemandAtPrice(GameState.price);
}

function getAutoPriceTarget() {
  const supply = GameState.extruders * GameState.extruderSpeed * getModuleTierInfo(GameState.extruders).mult;
  if (!(supply > 0)) return GameState.price;
  const maxDelivery = getEffectiveMaxDelivery();
  const salesAt = (cents) => maxDelivery * getDemandAtPrice(cents / 100) / 100;
  let lo = 5;
  let hi = 10000;
  if (salesAt(hi) >= supply) return hi / 100;
  if (salesAt(lo) < supply) return lo / 100;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (salesAt(mid) >= supply) lo = mid; else hi = mid;
  }
  return lo / 100;
}

function applyAutoPrice() {
  const target = getAutoPriceTarget();
  if (target > 0 && target !== GameState.price) {
    GameState.price = target;
    updateDemand();
  }
}

function getActiveRangeTargets() {
  const count = Math.max(1, Math.min(5, GameState.rangeTargetCount || 1));
  const targets = [];
  for (let i = 0; i < count; i++) {
    const cfg = RANGE_TARGET_CONFIGS[i];
    const pos = i === 0
      ? 50
      : Math.max(12, Math.min(88, cfg.center + Math.sin(rangeAnimClock * cfg.speed + cfg.phase) * cfg.amp));
    targets.push(pos);
  }
  return targets;
}

function updateRangeTargetsUI() {
  const count = Math.max(1, Math.min(5, GameState.rangeTargetCount || 1));
  setText("range-target-count-label", count);
  const positions = getActiveRangeTargets();

  for (let i = 0; i < 5; i++) {
    const el = getEl(`range-target-${i}`);
    if (!el) continue;
    if (i < count) {
      if (el.classList.contains("hidden")) el.classList.remove("hidden");
      const nextLeft = `${positions[i].toFixed(1)}%`;
      if (lastRangeTargetLefts[i] !== nextLeft) {
        lastRangeTargetLefts[i] = nextLeft;
        el.style.left = nextLeft;
      }
    } else if (!el.classList.contains("hidden")) {
      el.classList.add("hidden");
    }
  }
}
function getBuffMult(kind) {
  if (typeof GameState === "undefined" || GameState._simulatingOffline) return 1;
  const buffs = Array.isArray(GameState.activeBuffs) ? GameState.activeBuffs : [];
  let mult = 1;
  for (const b of buffs) {
    if (!b || b.remaining <= 0) continue;
    if (b.kind === kind && Number.isFinite(b.mult)) mult *= b.mult;
  }
  return mult;
}

function addBuff(id, label, kind, mult, durationSec) {
  if (!Array.isArray(GameState.activeBuffs)) GameState.activeBuffs = [];
  const existing = GameState.activeBuffs.find(b => b.id === id);
  if (existing) {
    existing.remaining = Math.max(existing.remaining, durationSec);
    existing.mult = mult;
    existing.label = label;
  } else {
    GameState.activeBuffs.push({ id, label, kind, mult, remaining: durationSec });
  }
}

function tickBuffs(dt) {
  if (!Array.isArray(GameState.activeBuffs) || GameState.activeBuffs.length === 0) return;
  const next = [];
  for (const b of GameState.activeBuffs) {
    if (!b || b.remaining <= 0) continue;
    b.remaining = Math.max(0, b.remaining - dt);
    if (b.remaining > 0) next.push(b);
  }
  GameState.activeBuffs = next;
}

function renderBuffBar() {
  const bar = getEl("buff-bar");
  if (!bar) return;
  const buffs = Array.isArray(GameState.activeBuffs) ? GameState.activeBuffs.filter(b => b && b.remaining > 0) : [];
  if (buffs.length === 0) {
    bar.classList.add("hidden");
    bar.replaceChildren();
    return;
  }
  bar.classList.remove("hidden");
  const frag = document.createDocumentFragment();
  for (const b of buffs) {
    const pill = document.createElement("span");
    pill.className = "buff-pill";
    pill.textContent = `${b.label} (${Math.ceil(b.remaining)}s)`;
    frag.appendChild(pill);
  }
  bar.replaceChildren(frag);
}

function renderPlinkoBoard(force = false) {
  const boardEl = getEl("plinko-board");
  if (!boardEl || !GameState.unlockedPlinko) return;

  const lines = [];
  lines.push(`DROPPER: ${" ".repeat(plinkoDropperPos)}[▼]${" ".repeat(Math.max(0, PLINKO_INNER_COLS - 1 - plinkoDropperPos))}`);
  for (let r = 0; r < PLINKO_ROWS; r++) {
    const rowChars = Array.from({ length: PLINKO_INNER_COLS }, (_, c) => ((r + c) % 2 === 0 ? "." : " "));
    if (plinkoBall && plinkoBall.row === r) {
      const bCol = Math.max(0, Math.min(PLINKO_INNER_COLS - 1, plinkoBall.col));
      rowChars[bCol] = "@";
    }
    lines.push(`|${rowChars.join("")}|`);
  }
  lines.push("|[X][🌾][🌾][★][🌾][🌾][X]|");

  const sig = lines.join("\n");
  if (!force && sig === lastPlinkoSignature.value) return;
  lastPlinkoSignature.value = sig;
  boardEl.textContent = sig;
}

function dropPlinkoPretzel() {
  if (!GameState.unlockedPlinko || plinkoBall) return;
  if (GameState.inventory < PLINKO_COST) {
    setText("plinko-feedback", `Need ${PLINKO_COST} unsold inventory to drop.`);
    return;
  }
  GameState.inventory -= PLINKO_COST;
  plinkoBall = {
    row: 0,
    col: Math.max(0, Math.min(PLINKO_INNER_COLS - 1, plinkoDropperPos))
  };
  plinkoStepTimer = 0;
  setText("plinko-feedback", "Pretzel dropped...");
  renderPlinkoBoard(true);
  requestRender();
}

function resolvePlinkoLanding(col) {
  const ratio = col / Math.max(1, PLINKO_INNER_COLS - 1);
  if (ratio < 0.16 || ratio > 0.84) {
    setText("plinko-feedback", "[X] Burnt in the chute! (0 reward)");
    logMessage("Plinko: Pretzel burnt up in the side chute.");
  } else if (ratio >= 0.42 && ratio <= 0.58) {
    GameState.goldenRushEndTime = Date.now() + 30000;
    addBuff("golden_rush", "★ GOLDEN RUSH (2x Cash)", "sales", 2.0, 30);
    const bonusDough = Math.max(250, GameState.doughBatchSize || 500);
    GameState.dough += bonusDough;
    setText("plinko-feedback", `[★] JACKPOT! 30s Golden Rush + ${bonusDough.toLocaleString()} lbs dough!`);
    logMessage("PLINKO JACKPOT! 30s Golden Rush active + bonus dough!");
    triggerConfettiStarBurst(window.innerWidth * 0.5, window.innerHeight * 0.5, 14);
  } else {
    const rewardDough = Math.max(150, Math.round((GameState.doughBatchSize || 500) * 0.6));
    GameState.dough += rewardDough;
    setText("plinko-feedback", `[🌾] Caught +${rewardDough.toLocaleString()} lbs dough!`);
    logMessage(`Plinko: Won +${rewardDough.toLocaleString()} lbs dough.`);
  }
}

function tickPlinko(dt) {
  if (!GameState.unlockedPlinko) return;
  plinkoStepTimer += dt;
  const stepInterval = plinkoBall ? 0.12 : 0.16;
  if (plinkoStepTimer < stepInterval) return;
  plinkoStepTimer = 0;

  if (!plinkoBall) {
    plinkoDropperPos += plinkoDropperDir;
    if (plinkoDropperPos >= PLINKO_INNER_COLS - 1) {
      plinkoDropperPos = PLINKO_INNER_COLS - 1;
      plinkoDropperDir = -1;
    } else if (plinkoDropperPos <= 0) {
      plinkoDropperPos = 0;
      plinkoDropperDir = 1;
    }
    renderPlinkoBoard(false);
    return;
  }

  plinkoBall.row += 1;
  const drift = Math.floor(Math.random() * 3) - 1;
  plinkoBall.col = Math.max(0, Math.min(PLINKO_INNER_COLS - 1, plinkoBall.col + drift));

  if (plinkoBall.row >= PLINKO_ROWS) {
    const landedCol = plinkoBall.col;
    plinkoBall = null;
    resolvePlinkoLanding(landedCol);
    renderPlinkoBoard(true);
    return;
  }
  renderPlinkoBoard(true);
}

function simulateEconomyStep(dt) {
  if (!GameState.started) return;

  const payrollPerSec = getSupplyPayrollPerSec();
  if (payrollPerSec > 0 && GameState.unlockedSupplyChain && GameState.supplyChainEnabled) {
    const payrollDue = payrollPerSec * dt;
    if (GameState.funds >= payrollDue) {
      GameState.funds -= payrollDue;
    } else {
      GameState.supplyChainEnabled = false;
      logMessage("Supply Chain paused: Insufficient funds to cover worker payroll.");
    }
  }

  if (isSupplyChainActivelyRunning()) {
    const saltMult = getModuleTierInfo(GameState.saltMines).mult * (GameState.saltRateMult || 1);
    const wheatMult = getModuleTierInfo(GameState.wheatFarms).mult * (GameState.wheatRateMult || 1);
    const refineryMult = getModuleTierInfo(GameState.refineries).mult * (GameState.refineryRateMult || 1);

    const minedSalt = GameState.saltMines * SALT_BASE_RATE * saltMult * dt;
    const harvestedWheat = GameState.wheatFarms * WHEAT_BASE_RATE * wheatMult * dt;
    GameState.salt = (GameState.salt || 0) + minedSalt;
    GameState.wheat = (GameState.wheat || 0) + harvestedWheat;

    if (GameState.refineries > 0) {
      const maxRefine = GameState.refineries * REFINERY_BASE_RATE * refineryMult * dt;
      const actualRefine = Math.min(maxRefine, GameState.salt, GameState.wheat);
      if (actualRefine > 0) {
        GameState.salt -= actualRefine;
        GameState.wheat -= actualRefine;
        GameState.dough += actualRefine;
      }
    }
  }

  const extruderMult = getModuleTierInfo(GameState.extruders).mult;
  const prodMult = getBuffMult("production");
  const autoBakeAmount = GameState.extruders * GameState.extruderSpeed * extruderMult * prodMult * dt;
  if (autoBakeAmount > 0) {
    bakePretzels(autoBakeAmount);
  }

  if (GameState.unlockedAutoDough && GameState.autoDoughEnabled) {
    const batchSize = GameState.doughBatchSize || 500;
    if (GameState.dough < batchSize * 0.25 && GameState.funds >= GameState.doughCost) {
      buyDoughBatch(true);
    }
  }

  if (GameState.unlockedAutoPricer && GameState.autoPricerEnabled) {
    applyAutoPrice();
  }

  updateDemand();
  const maxDelivery = getEffectiveMaxDelivery() * getBuffMult("sales");
  const effectiveDemand = Math.min(maxDelivery, maxDelivery * (GameState.demand / 100));
  const desiredSales = effectiveDemand * dt;
  const sold = Math.min(GameState.inventory, desiredSales);

  if (sold > 0) {
    GameState.inventory -= sold;
    const earned = sold * getEffectivePriceSafe();
    GameState.funds += earned;
    if (!GameState._simulatingOffline) {
      pendingSales += earned;
      cashFlowHistory.push({ time: Date.now(), amount: earned });
    }
  }
}

function flushCashFlow() {
  if (pendingSales > 0) {
    pendingSales = 0;
  }
  const nowMs = Date.now();
  const windowMs = 1500;
  cashFlowHistory = cashFlowHistory.filter(entry => nowMs - entry.time <= windowMs);
  const totalInWindow = cashFlowHistory.reduce((sum, entry) => sum + entry.amount, 0);
  liveCashPerSec = totalInWindow / (windowMs / 1000);
}

function renderProjects() {
  const container = getEl("projects-list");
  if (!container) return;

  const currentCont = GameState.continentIndex || 0;
  const unlockedProjects = Projects.filter(p => {
    if (GameState.completedProjects.includes(p.id)) return false;
    if (p.minContinent && currentCont < p.minContinent) return false;
    return p.trigger();
  });

  const completedCount = Projects.filter(p => GameState.completedProjects.includes(p.id)).length;
  setText("rd-completed-count", completedCount);
  setText("rd-total-count", Projects.length);

  if (unlockedProjects.length > 0 || GameState.unlockedMinigame || GameState.unlockedPlinko || completedCount > 0) {
    showEl("panel-projects");
  }

  const affordSig = unlockedProjects.map(p => {
    const canAfford = GameState.funds >= p.cashCost && GameState.researchPoints >= (p.rpCost || 0);
    return `${p.id}:${canAfford ? 1 : 0}`;
  }).join("|");

  if (container.dataset.renderedIds === unlockedProjects.map(p => p.id).join(",")) {
    if (affordSig !== lastProjectAffordSig) {
      lastProjectAffordSig = affordSig;
      unlockedProjects.forEach(p => {
        const btn = container.querySelector(`button[data-proj-id="${p.id}"]`);
        if (btn) btn.disabled = !(GameState.funds >= p.cashCost && GameState.researchPoints >= (p.rpCost || 0));
      });
    }
    return;
  }

  lastProjectAffordSig = affordSig;
  container.dataset.renderedIds = unlockedProjects.map(p => p.id).join(",");
  container.innerHTML = "";

  unlockedProjects.forEach(proj => {
    const rpCost = proj.rpCost || 0;
    const canAfford = GameState.funds >= proj.cashCost && GameState.researchPoints >= rpCost;
    const card = document.createElement("div");
    card.className = "project-card" + (rpCost > 0 ? " rp-card" : "");

    const costLabel = rpCost > 0
      ? `$${FMT2.format(proj.cashCost)} + ${rpCost} RP`
      : `$${FMT2.format(proj.cashCost)}`;

    card.innerHTML = `
      <div>
        <p><strong>${proj.icon} ${proj.title}</strong></p>
        <p class="subtext">${proj.desc}</p>
      </div>
      <button type="button" data-proj-id="${proj.id}" ${canAfford ? "" : "disabled"}>
        Research (${costLabel})
      </button>
    `;

    const btn = card.querySelector("button");
    btn.addEventListener("click", () => {
      if (GameState.funds >= proj.cashCost && GameState.researchPoints >= rpCost) {
        GameState.funds -= proj.cashCost;
        if (rpCost > 0) GameState.researchPoints -= rpCost;
        GameState.completedProjects.push(proj.id);
        proj.effect();
        SoundSystem.playSfx("buy");
        container.dataset.renderedIds = "";
        requestRender();
      }
    });

    container.appendChild(card);
  });
}

function resetRegionalPanelsUI() {
  hideEl("system-supply-chain");
  hideEl("system-delivery");
  hideEl("panel-trucks");
  hideEl("panel-drones");
  hideEl("panel-projects");
  hideEl("panel-minigame");
  hideEl("panel-plinko");
  hideEl("rp-badge");
  hideEl("income-rate-line");
  hideEl("btn-toggle-autodough");
  hideEl("btn-toggle-autopricer");
  hideEl("range-shooter-controls");
  hideEl("refinery-rate-wrap");
  hideEl("ending-modal");
  refreshRecipeDropdown();
}

function applySessionUI() {
  if (!GameState.started) return;
  setText("display-player-name", GameState.playerName || "Baker");

  if (GameState.unlockedAutomation || GameState.extruders > 0) showEl("panel-automation");
  if (GameState.unlockedSupplyChain) showEl("system-supply-chain");
  if (GameState.unlockedTrucks || GameState.unlockedDrones) showEl("system-delivery");
  if (GameState.unlockedTrucks) showEl("panel-trucks");
  if (GameState.unlockedDrones) showEl("panel-drones");
  if (GameState.unlockedMinigame) {
    showEl("panel-projects");
    showEl("rp-badge");
    showEl("panel-minigame");
    updateRangeTargetsUI();
  }
  if (GameState.unlockedRangeShooters) showEl("range-shooter-controls");
  if (GameState.unlockedPlinko) {
    showEl("panel-projects");
    showEl("panel-plinko");
    renderPlinkoBoard(true);
  }
  if (GameState.unlockedIncomeTicker) showEl("income-rate-line");
  if (GameState.unlockedAutoDough) showEl("btn-toggle-autodough");
  if (GameState.unlockedAutoPricer) showEl("btn-toggle-autopricer");
  if (GameState.refineries > 0) showEl("refinery-rate-wrap");

  refreshRecipeDropdown();
  if (typeof AchievementManager !== "undefined") {
    AchievementManager.updateButtonCount();
  }
  applySavedSectionCollapseStates();
}

function render() {
  if (typeof GameState === "undefined") return;
  sanitizeNumbers();

  const floorPretzels = Math.floor(GameState.pretzels);
  applyTabPretzelIconAndTitle(floorPretzels);

  const playerNameStr = GameState.playerName || "Baker";
  setText("display-player-name", playerNameStr);
  setText("pretzels-total", floorPretzels.toLocaleString());
  setText("top-funds", FMT2.format(GameState.funds));
  setText("mobile-funds", FMT2.format(GameState.funds));

  const contObj = typeof GameState.getCurrentContinent === "function"
    ? GameState.getCurrentContinent()
    : { name: "North America" };
  const goldCount = GameState.goldenPretzels || 0;
  setText("header-continent-name", contObj.name);
  if (goldCount > 0 || GameState.goldUiUnlocked) {
    showEl("header-gold-pill");
    setText("header-gold-count", goldCount.toLocaleString());
    setText("header-gold-bonus", `+${goldCount * 25}%`);
  } else {
    hideEl("header-gold-pill");
  }

  renderBuffBar();

  const rushActive = typeof GameState.isGoldenRushActive === "function" && GameState.isGoldenRushActive();
  if (rushActive) {
    const secsLeft = Math.max(1, Math.ceil((GameState.goldenRushEndTime - Date.now()) / 1000));
    showEl("golden-rush-badge");
    setText("golden-rush-timer", secsLeft);
    document.body.classList.add("golden-rush-active");
  } else {
    hideEl("golden-rush-badge");
    document.body.classList.remove("golden-rush-active");
  }

  const domPct = getDominanceForStage();
  const nextAscii = getEvolvedAscii();
  if (lastTextCache.get("ascii:ascii-stage") !== nextAscii) {
    lastTextCache.set("ascii:ascii-stage", nextAscii);
    setText("ascii-stage", nextAscii);
  }
  applyStageAnimationTier(domPct);
  updateAudioReactiveStage();

  const floorInv = Math.floor(GameState.inventory);
  const invEl = getEl("inventory");
  setText("inventory", floorInv.toLocaleString());
  if (invEl) invEl.classList.toggle("zero-danger", floorInv === 0 && GameState.pretzels > 0);

  const floorDough = Math.floor(GameState.dough);
  const doughEl = getEl("dough-amount");
  setText("dough-amount", floorDough.toLocaleString());
  if (doughEl) doughEl.classList.toggle("zero-danger", floorDough <= 0);

  const batchSize = GameState.doughBatchSize || 500;
  setText("dough-batch-size", batchSize.toLocaleString());
  setText("dough-cost", FMT2.format(GameState.doughCost));

  const outOfDough = GameState.dough < 1;
  const broke = GameState.funds < GameState.doughCost;
  if (outOfDough && broke) {
    showEl("panel-hand-dough");
    setText("knead-progress", GameState.kneadClicks);
  } else {
    hideEl("panel-hand-dough");
  }

  if (GameState.unlockedAutoDough) {
    showEl("btn-toggle-autodough");
    setText("btn-toggle-autodough", `Auto-Buyer: ${GameState.autoDoughEnabled ? "ON" : "OFF"}`);
  }

  if (GameState.unlockedAutoPricer) {
    showEl("btn-toggle-autopricer");
    setText("btn-toggle-autopricer", `Auto-Pricer: ${GameState.autoPricerEnabled ? "ON" : "OFF"}`);
  }

  setDisabled("btn-buy-dough", GameState.funds < GameState.doughCost);
  setDisabled("btn-bake", GameState.dough < 1);
  setDisabled("mobile-btn-bake", GameState.dough < 1);
  setText("click-power", Math.max(1, Math.round((GameState.clickPower || 1) * getBuffMult("production"))));

  const effectivePrice = getEffectivePriceSafe();
  setText("price", FMT2.format(GameState.price));
  setText("effective-price", FMT2.format(effectivePrice));
  setText("demand", GameState.demand);
  setDisabled("btn-price-down", GameState.price <= 0.05);

  const promoInfo = applyModuleTierUI("module-promo", "promo-tier-badge", "promo-next", GameState.promoLevel, "Lvl ", "promo-ascii", "marketing");
  setText("promo-level", GameState.promoLevel);
  setText("promo-cost", FMT2.format(GameState.promoCost));
  const promoBonusPct = Math.round(((1 + ((GameState.promoLevel - 1) * 0.20)) * promoInfo.mult - 1) * 100);
  setText("promo-bonus", `+${promoBonusPct}%`);
  setDisabled("btn-buy-promo", GameState.funds < GameState.promoCost);

  const extInfo = applyModuleTierUI("panel-automation", "extruder-tier-badge", "extruder-next", GameState.extruders, "", "extruder-ascii", "extruder");
  setText("extruder-count", GameState.extruders);
  setText("extruder-cost", FMT2.format(GameState.extruderCost));
  setText("extruder-rate", FMT1.format(GameState.extruderSpeed * extInfo.mult));
  setDisabled("btn-buy-extruder", GameState.funds < GameState.extruderCost);

  if (GameState.unlockedSupplyChain) {
    showEl("system-supply-chain");
    const { saltPerSec, wheatPerSec, doughPerSec } = getActiveSupplyRates();
    const payrollPerSec = getSupplyPayrollPerSec();

    setText("salt-stock", Math.floor(GameState.salt || 0).toLocaleString());
    setText("wheat-stock", Math.floor(GameState.wheat || 0).toLocaleString());
    setText("salt-active-rate", Math.floor(saltPerSec).toLocaleString());
    setText("wheat-active-rate", Math.floor(wheatPerSec).toLocaleString());
    setText("dough-active-rate", Math.floor(doughPerSec).toLocaleString());
    setText("supply-payroll-badge", FMT2.format(payrollPerSec));
    setText("btn-toggle-supply", `Operations: ${GameState.supplyChainEnabled ? "ON" : "OFF"}`);

    if (GameState.refineries > 0 || doughPerSec > 0) {
      showEl("refinery-rate-wrap");
      setText("refinery-active-rate", Math.floor(doughPerSec).toLocaleString());
    }

    const saltInfo = applyModuleTierUI("module-salt-mine", "salt-mine-tier-badge", "salt-mine-next", GameState.saltMines, "", "salt-mine-ascii", "saltMine");
    setText("salt-mine-count", GameState.saltMines);
    setText("salt-mine-cost", FMT2.format(GameState.saltMineCost));
    setText("salt-mine-rate", Math.round(SALT_BASE_RATE * saltInfo.mult * (GameState.saltRateMult || 1)).toLocaleString());
    setText("salt-mine-payroll", FMT2.format(getFacilityPayrollPerSec(GameState.saltMines, SALT_BASE_PAYROLL)));
    setText("salt-mine-sell-val", FMT2.format(getSaltMineSellValue()));
    setDisabled("btn-buy-salt-mine", GameState.funds < GameState.saltMineCost);
    setDisabled("btn-sell-salt-mine", GameState.saltMines <= 0);

    const wheatInfo = applyModuleTierUI("module-wheat-farm", "wheat-farm-tier-badge", "wheat-farm-next", GameState.wheatFarms, "", "wheat-farm-ascii", "wheatFarm");
    setText("wheat-farm-count", GameState.wheatFarms);
    setText("wheat-farm-cost", FMT2.format(GameState.wheatFarmCost));
    setText("wheat-farm-rate", Math.round(WHEAT_BASE_RATE * wheatInfo.mult * (GameState.wheatRateMult || 1)).toLocaleString());
    setText("wheat-farm-payroll", FMT2.format(getFacilityPayrollPerSec(GameState.wheatFarms, WHEAT_BASE_PAYROLL)));
    setText("wheat-farm-sell-val", FMT2.format(getWheatFarmSellValue()));
    setDisabled("btn-buy-wheat-farm", GameState.funds < GameState.wheatFarmCost);
    setDisabled("btn-sell-wheat-farm", GameState.wheatFarms <= 0);

    const refInfo = applyModuleTierUI("module-refinery", "refinery-tier-badge", "refinery-next", GameState.refineries, "", "refinery-ascii", "refinery");
    setText("refinery-count", GameState.refineries);
    setText("refinery-cost", FMT2.format(GameState.refineryCost));
    setText("refinery-rate", Math.round(REFINERY_BASE_RATE * refInfo.mult * (GameState.refineryRateMult || 1)).toLocaleString());
    setText("refinery-payroll", FMT2.format(getFacilityPayrollPerSec(GameState.refineries, REFINERY_BASE_PAYROLL)));
    setText("refinery-sell-val", FMT2.format(getRefinerySellValue()));
    setDisabled("btn-buy-refinery", GameState.funds < GameState.refineryCost);
    setDisabled("btn-sell-refinery", GameState.refineries <= 0);
  }

  const truckInfo = applyModuleTierUI("panel-trucks", "truck-tier-badge", "truck-next", GameState.trucks, "", "truck-ascii", "truck");
  setText("truck-count", GameState.trucks);
  setText("truck-cost", FMT2.format(GameState.truckCost));
  setText("truck-rate", FMT1.format(GameState.truckCapacity * truckInfo.mult));
  setText("truck-sell-val", FMT2.format(getTruckSellValue()));
  setDisabled("btn-buy-truck", GameState.funds < GameState.truckCost);
  setDisabled("btn-sell-truck", GameState.trucks <= 0);

  const droneInfo = applyModuleTierUI("panel-drones", "drone-tier-badge", "drone-next", GameState.drones, "", "drone-ascii", "drone");
  setText("drone-count", GameState.drones);
  setText("drone-cost", FMT2.format(GameState.droneCost));
  setText("drone-rate", FMT1.format(GameState.droneCapacity * droneInfo.mult));
  setText("drone-sell-val", FMT2.format(getDroneSellValue()));
  setDisabled("btn-buy-drone", GameState.funds < GameState.droneCost);
  setDisabled("btn-sell-drone", GameState.drones <= 0);

  setText("bake-rate", FMT1.format(getEffectiveBakeRate()));
  setText("sell-rate", FMT1.format(getEffectiveMaxDelivery()));
  setText("rp-total", Math.floor(GameState.researchPoints));

  if (GameState.unlockedRangeShooters) {
    showEl("range-shooter-controls");
    setText("range-shooter-count", GameState.rangeShooters || 0);
    setText("range-shooter-interval", getRangeShooterIntervalSec().toFixed(2));
    setText("range-shooter-cost", FMT2.format(GameState.rangeShooterCost));
    setText("range-shooter-sell-val", FMT2.format(getRangeShooterSellValue()));
    setDisabled("btn-buy-shooter", GameState.funds < GameState.rangeShooterCost);
    setDisabled("btn-sell-shooter", (GameState.rangeShooters || 0) <= 0);
  }

  if (GameState.unlockedPlinko) {
    setDisabled("btn-drop-plinko", Boolean(plinkoBall) || GameState.inventory < PLINKO_COST);
    renderPlinkoBoard(false);
  }

  if (GameState.unlockedIncomeTicker) {
    showEl("income-rate-line");
    const netFlow = liveCashPerSec - getSupplyPayrollPerSec();
    const isNeg = netFlow < -0.005;
    const rateLine = getEl("income-rate-line");
    if (rateLine) rateLine.classList.toggle("negative-flow", isNeg);
    setText("income-sign", isNeg ? "-$" : "+$");
    setText("income-per-sec", FMT2.format(Math.abs(netFlow)));
  }

  renderProjects();
  if (typeof AchievementManager !== "undefined") {
    AchievementManager.updateButtonCount();
    AchievementManager.checkAll();
  }
}

let renderQueued = false;
function requestRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    render();
  });
}

function shootRangeTarget() {
  if (!GameState.unlockedMinigame) return;
  const now = Date.now();
  if (now - lastShotTime < 140) return;
  lastShotTime = now;

  const track = getEl("range-track");
  const targets = getActiveRangeTargets();
  let bestDist = Infinity;
  targets.forEach(pos => {
    const d = Math.abs(crosshairPos - pos);
    if (d < bestDist) bestDist = d;
  });

  if (bestDist <= 5.5) {
    GameState.researchPoints += 3;
    setText("range-feedback", "BULLSEYE! +3 RP");
    if (track) {
      track.classList.remove("flash-miss", "flash-hit");
      void track.offsetWidth;
      track.classList.add("flash-hit");
      setTimeout(() => track.classList.remove("flash-hit"), 180);
    }
  } else if (bestDist <= 12) {
    GameState.researchPoints += 2;
    setText("range-feedback", "Solid hit! +2 RP");
    if (track) {
      track.classList.remove("flash-miss", "flash-hit");
      void track.offsetWidth;
      track.classList.add("flash-hit");
      setTimeout(() => track.classList.remove("flash-hit"), 180);
    }
  } else {
    GameState.researchPoints += 1;
    setText("range-feedback", "Graze! +1 RP");
    if (track) {
      track.classList.remove("flash-hit", "flash-miss");
      void track.offsetWidth;
      track.classList.add("flash-miss");
      setTimeout(() => track.classList.remove("flash-miss"), 180);
    }
  }
  SoundSystem.playSfx("bake");
  requestRender();
}

function initSetupPicker() {
  const grid = getEl("ascii-picker-grid");
  if (!grid) return;
  const gallery = getGallery();
  grid.innerHTML = "";

  const currentIdx = (typeof GameState !== "undefined" && Number.isInteger(GameState.selectedAsciiIndex))
    ? Math.max(0, Math.min(gallery.length - 1, GameState.selectedAsciiIndex))
    : 0;

  gallery.forEach((art, idx) => {
    const option = document.createElement("div");
    option.className = "ascii-option" + (idx === currentIdx ? " selected" : "");
    option.setAttribute("role", "button");
    option.setAttribute("tabindex", "0");

    const pre = document.createElement("pre");
    pre.textContent = art;
    option.appendChild(pre);

    const selectOption = () => {
      grid.querySelectorAll(".ascii-option").forEach(el => el.classList.remove("selected"));
      option.classList.add("selected");
      if (typeof GameState !== "undefined") {
        GameState.selectedAsciiIndex = idx;
      }
      lastTextCache.delete("txt:ascii-stage");
      const nextAscii = getEvolvedAscii();
      setText("ascii-stage", nextAscii);
      requestRender();
    };

    option.addEventListener("click", selectOption);
    option.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectOption();
      }
    });

    grid.appendChild(option);
  });
}

function bindControls() {
  if (controlsBound) return;
  controlsBound = true;

  // Intro pretzel trigger -> opens Shop Name & ASCII picker setup modal
  const introTrigger = getEl("intro-pretzel-trigger");
  if (introTrigger) {
    introTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      SoundSystem.ensureContext();
      openSetupModal();
    });
  }

  const setupNameInput = getEl("input-player-name");
  if (setupNameInput) {
    setupNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        startGameFromModal();
      }
    });
  }

  onClick("btn-start-game", () => {
    startGameFromModal();
  });

  document.querySelectorAll(".section-collapse-btn[data-section]").forEach(btn => {
    btn.addEventListener("click", () => {
      const secId = btn.getAttribute("data-section");
      if (secId) toggleSectionCollapsed(secId);
    });
  });

  onClick("btn-bake", () => {
    handleManualBake();
  });

  onClick("mobile-btn-bake", () => {
    handleManualBake();
  });

  onClick("btn-knead-dough", () => {
    GameState.kneadClicks += 1;
    if (GameState.kneadClicks >= 30) {
      GameState.kneadClicks = 0;
      GameState.dough += 1;
      GameState.handMadeDoughTotal += 1;
      spawnSubtleClickPop(getEl("btn-knead-dough"), "🥨 +1 lb dough");
      logMessage("Hand-kneaded +1 lb of emergency dough!");
    }
    requestRender();
  });

  onClick("btn-buy-dough", () => {
    buyDoughBatch(false);
    requestRender();
  });

  onClick("btn-toggle-autodough", () => {
    GameState.autoDoughEnabled = !GameState.autoDoughEnabled;
    logMessage(`Auto-Dough Silo ${GameState.autoDoughEnabled ? "enabled" : "paused"}.`);
    requestRender();
  });

  onClick("btn-toggle-autopricer", () => {
    GameState.autoPricerEnabled = !GameState.autoPricerEnabled;
    if (GameState.autoPricerEnabled) applyAutoPrice();
    logMessage(`Auto-Pricer ${GameState.autoPricerEnabled ? "enabled" : "paused"}.`);
    requestRender();
  });

  onClick("btn-toggle-supply", () => {
    GameState.supplyChainEnabled = !GameState.supplyChainEnabled;
    logMessage(`Supply Chain operations ${GameState.supplyChainEnabled ? "resumed" : "paused"}.`);
    requestRender();
  });

  bindHoldButton("btn-price-down", (heldSecs) => {
    const step = getExponentialPriceStep(heldSecs);
    GameState.price = Math.max(0.05, Math.round((GameState.price - step) * 100) / 100);
    updateDemand();
    requestRender();
  }, { onRelease: () => logMessage(`Price set to $${FMT2.format(GameState.price)}.`) });

  bindHoldButton("btn-price-up", (heldSecs) => {
    const step = getExponentialPriceStep(heldSecs);
    GameState.price = Math.min(250.00, Math.round((GameState.price + step) * 100) / 100);
    updateDemand();
    requestRender();
  }, { onRelease: () => logMessage(`Price set to $${FMT2.format(GameState.price)}.`) });

  bindHoldButton("btn-buy-promo", () => {
    buyPromoStep();
  });

  bindHoldButton("btn-buy-extruder", () => {
    buyExtruderStep();
  });

  bindHoldButton("btn-buy-salt-mine", () => {
    buySaltMineStep();
  });

  onClick("btn-sell-salt-mine", () => {
    if (GameState.saltMines <= 0) return;
    const refund = getSaltMineSellValue();
    GameState.saltMines -= 1;
    GameState.saltMineCost = Math.max(2500.00, Math.round((GameState.saltMineCost / getCostGrowth(1.45, GameState.saltMines + 1)) * 100) / 100);
    GameState.funds += refund;
    logMessage(`Sold 1 Rock Salt Mine for +$${FMT2.format(refund)}.`);
    requestRender();
  });

  bindHoldButton("btn-buy-wheat-farm", () => {
    buyWheatFarmStep();
  });

  onClick("btn-sell-wheat-farm", () => {
    if (GameState.wheatFarms <= 0) return;
    const refund = getWheatFarmSellValue();
    GameState.wheatFarms -= 1;
    GameState.wheatFarmCost = Math.max(4000.00, Math.round((GameState.wheatFarmCost / getCostGrowth(1.45, GameState.wheatFarms + 1)) * 100) / 100);
    GameState.funds += refund;
    logMessage(`Sold 1 Winter Wheat Field for +$${FMT2.format(refund)}.`);
    requestRender();
  });

  bindHoldButton("btn-buy-refinery", () => {
    buyRefineryStep();
  });

  onClick("btn-sell-refinery", () => {
    if (GameState.refineries <= 0) return;
    const refund = getRefinerySellValue();
    GameState.refineries -= 1;
    GameState.refineryCost = Math.max(8500.00, Math.round((GameState.refineryCost / getCostGrowth(1.50, GameState.refineries + 1)) * 100) / 100);
    GameState.funds += refund;
    logMessage(`Sold 1 Dough Refinery for +$${FMT2.format(refund)}.`);
    requestRender();
  });

  bindHoldButton("btn-buy-truck", () => {
    buyTruckStep();
  });

  onClick("btn-sell-truck", () => {
    if (GameState.trucks <= 0) return;
    const refund = getTruckSellValue();
    GameState.trucks -= 1;
    GameState.truckCost = Math.max(250.00, Math.round((GameState.truckCost / getCostGrowth(1.48, GameState.trucks + 1)) * 100) / 100);
    GameState.funds += refund;
    logMessage(`Sold 1 Delivery Truck for +$${FMT2.format(refund)}.`);
    requestRender();
  });

  bindHoldButton("btn-buy-drone", () => {
    buyDroneStep();
  });

  onClick("btn-sell-drone", () => {
    if (GameState.drones <= 0) return;
    const refund = getDroneSellValue();
    GameState.drones -= 1;
    GameState.droneCost = Math.max(5000.00, Math.round((GameState.droneCost / getCostGrowth(1.55, GameState.drones + 1)) * 100) / 100);
    GameState.funds += refund;
    logMessage(`Sold 1 Pretzel Drone for +$${FMT2.format(refund)}.`);
    requestRender();
  });

  const recipeSelect = getEl("select-recipe");
  if (recipeSelect) {
    recipeSelect.addEventListener("change", (e) => {
      GameState.activeRecipe = e.target.value;
      updateDemand();
      const recipeName = getSafeRecipe().name;
      logMessage(`Active menu switched to ${recipeName}.`);
      requestRender();
    });
  }

  onClick("btn-shoot-target", () => {
    shootRangeTarget();
  });

  const rangeTrack = getEl("range-track");
  if (rangeTrack) {
    rangeTrack.addEventListener("pointerdown", (e) => {
      if (!GameState.unlockedMinigame) return;
      e.preventDefault();
      const rect = rangeTrack.getBoundingClientRect();
      if (rect.width > 0) {
        const pct = Math.max(4, Math.min(96, ((e.clientX - rect.left) / rect.width) * 100));
        crosshairPos = pct;
        const crosshairEl = getEl("range-crosshair");
        if (crosshairEl) crosshairEl.style.left = `${crosshairPos.toFixed(1)}%`;
      }
      shootRangeTarget();
    });
  }

  bindHoldButton("btn-buy-shooter", () => {
    buyRangeShooterStep();
  });

  onClick("btn-sell-shooter", () => {
    if ((GameState.rangeShooters || 0) <= 0) return;
    const refund = getRangeShooterSellValue();
    GameState.rangeShooters -= 1;
    GameState.rangeShooterCost = Math.max(2500.00, Math.round((GameState.rangeShooterCost / getCostGrowth(1.48, GameState.rangeShooters + 1)) * 100) / 100);
    GameState.funds += refund;
    logMessage(`Sold 1 Range Shooter for +$${FMT2.format(refund)}.`);
    requestRender();
  });

  onClick("btn-drop-plinko", () => {
    dropPlinkoPretzel();
  });

  onClick("btn-open-achievements", () => {
    if (typeof AchievementManager !== "undefined") {
      AchievementManager.renderModal();
    }
    applyModalSectionCollapseUI("leaderboard", Boolean(readCollapsedSections().modal_leaderboard));
    applyModalSectionCollapseUI("achievements", Boolean(readCollapsedSections().modal_achievements));
    showEl("achievements-modal");
    if (typeof syncAndFetchLeaderboard === "function") {
      syncAndFetchLeaderboard(true);
    }
  });

  onClick("btn-close-achievements", () => {
    hideEl("achievements-modal");
  });

  onClick("btn-lb-pretzels", () => {
    if (typeof AchievementManager !== "undefined") AchievementManager.setLeaderboardMode("pretzels");
  });

  onClick("btn-lb-time", () => {
    if (typeof AchievementManager !== "undefined") AchievementManager.setLeaderboardMode("time");
  });

  onClick("btn-lb-domination", () => {
    if (typeof AchievementManager !== "undefined") AchievementManager.setLeaderboardMode("domination");
  });

  onClick("btn-lb-gold", () => {
    if (typeof AchievementManager !== "undefined") AchievementManager.setLeaderboardMode("gold");
  });

  onClick("btn-expand-continent", () => {
    if (typeof AchievementManager === "undefined" || !AchievementManager.canExpandContinent()) return;
   const nextName = GameState.getNextContinentName();
   const { earnedGold, conqueringFinalWorld, completedFullRunSecs } = GameState.expandToNextContinent();
   const records = conqueringFinalWorld ? GameState.finalizeRunRecords(completedFullRunSecs) : null;

    resetRegionalPanelsUI();
    updateDemand();
    SoundSystem.onContinentChanged();
    const areaTheme = getThemeIdForContinent(GameState.continentIndex || 0);
    applyTheme(areaTheme, true);
    applySessionUI();

    if (conqueringFinalWorld) {
      GameState.endingSeenForRun = true;
      openEndingModal(records || {});
      logMessage(`EARTH CONQUERED! Earned +${earnedGold} Golden Pretzels and unlocked Solid Gold UI!`);
    } else {
      triggerConfettiStarBurst(window.innerWidth * 0.5, window.innerHeight * 0.4, 12);
      logMessage(`Expanded into ${nextName}! Earned +${earnedGold} Golden Pretzels (${GameState.goldenPretzels} total).`);
    }

    if (typeof syncAndFetchLeaderboard === "function") {
      syncAndFetchLeaderboard(true);
    }
    if (typeof AchievementManager !== "undefined") {
      AchievementManager.renderModal();
    }
    requestRender();
  });

  onClick("btn-continue-current-world", () => {
    hideEl("ending-modal");
    requestRender();
  });

  onClick("btn-prestige-next-loop", () => {
    hideEl("ending-modal");
    executePrestigeRun();
  });

  onClick("player-badge", () => {
    refreshCloudMenuUI();
    refreshPrestigeMenuUI();
    refreshThemeDropdown(true);
    SoundSystem.refreshControlsUI();
    showEl("restart-modal");
  });

  onClick("btn-close-restart", () => {
    hideEl("restart-modal");
  });

  onClick("btn-cancel-restart", () => {
    hideEl("restart-modal");
  });

  onClick("btn-open-prestige-confirm", () => {
    openActionConfirmation("prestige");
  });

  onClick("btn-open-wipe-confirm", () => {
    openActionConfirmation("wipe");
  });

  onClick("btn-close-confirm-modal", () => {
    pendingConfirmAction = null;
    hideEl("confirm-action-modal");
  });

  onClick("btn-cancel-confirm-modal", () => {
    pendingConfirmAction = null;
    hideEl("confirm-action-modal");
  });

  onClick("btn-execute-confirm-modal", async () => {
    const action = pendingConfirmAction;
    pendingConfirmAction = null;
    if (action === "prestige") {
      executePrestigeRun();
    } else if (action === "wipe") {
      await executeFullWipe();
    }
  });

  const themeSel = getEl("select-theme");
  if (themeSel) {
    themeSel.addEventListener("change", (e) => {
      applyTheme(e.target.value, true);
      requestRender();
    });
  }

  onClick("btn-cloud-login", async () => {
    const email = (getEl("cloud-email")?.value || "").trim();
    const pass = getEl("cloud-password")?.value || "";
    const msgEl = getEl("cloud-menu-msg");
    if (!email || !pass) {
      if (msgEl) msgEl.textContent = "Enter both email and password.";
      return;
    }
    if (msgEl) msgEl.textContent = "Logging in...";
    try {
      const data = await CloudSave.signIn(email, pass);
      if (msgEl) msgEl.textContent = "Logged in!";
      await applyCloudUserSave(data.user);
    } catch (err) {
      if (msgEl) msgEl.textContent = err.message || "Login failed.";
    }
  });

  onClick("btn-cloud-signup", async () => {
    const email = (getEl("cloud-email")?.value || "").trim();
    const pass = getEl("cloud-password")?.value || "";
    const msgEl = getEl("cloud-menu-msg");
    if (!email || pass.length < 6) {
      if (msgEl) msgEl.textContent = "Use a valid email and 6+ character password.";
      return;
    }
    if (msgEl) msgEl.textContent = "Creating account...";
    try {
      const data = await CloudSave.signUp(email, pass);
      if (data.session && data.user) {
        if (msgEl) msgEl.textContent = "Account created & signed in!";
        await applyCloudUserSave(data.user);
      } else {
        if (msgEl) msgEl.textContent = "Account created! Check email to confirm if required.";
      }
    } catch (err) {
      if (msgEl) msgEl.textContent = err.message || "Sign up failed.";
    }
  });

  onClick("btn-cloud-sync-now", async () => {
    const msgEl = getEl("cloud-menu-msg");
    if (!CloudSave.user) return;
    if (msgEl) msgEl.textContent = "Syncing...";
    await applyCloudUserSave(CloudSave.user);
    if (msgEl) msgEl.textContent = "Synced with cloud!";
  });

  onClick("btn-cloud-logout", async () => {
    const msgEl = getEl("cloud-menu-msg");
    await CloudSave.signOut();
    refreshCloudMenuUI();
    if (msgEl) msgEl.textContent = "Signed out.";
  });

  document.addEventListener("keydown", (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName : "";
    if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;

    const setupModal = getEl("setup-modal");
    const restartModal = getEl("restart-modal");
    const confirmModal = getEl("confirm-action-modal");
    const achModal = getEl("achievements-modal");
    const endingModal = getEl("ending-modal");
    const introScreen = getEl("title-intro-screen");

    if (e.key === "Escape") {
      if (confirmModal && !confirmModal.classList.contains("hidden")) {
        pendingConfirmAction = null;
        hideEl("confirm-action-modal");
        return;
      }
      if (restartModal && !restartModal.classList.contains("hidden")) {
        hideEl("restart-modal");
        return;
      }
      if (achModal && !achModal.classList.contains("hidden")) {
        hideEl("achievements-modal");
        return;
      }
      if (endingModal && !endingModal.classList.contains("hidden")) {
        hideEl("ending-modal");
        return;
      }
      return;
    }

    const anyModalOpen = (setupModal && !setupModal.classList.contains("hidden"))
      || (restartModal && !restartModal.classList.contains("hidden"))
      || (confirmModal && !confirmModal.classList.contains("hidden"))
      || (achModal && !achModal.classList.contains("hidden"))
      || (endingModal && !endingModal.classList.contains("hidden"));

    if (introScreen && !introScreen.classList.contains("hidden") && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openSetupModal();
      return;
    }

    if (anyModalOpen || !GameState.started) return;

    if (e.key === "b" || e.key === "B") {
      e.preventDefault();
      handleManualBake();
    } else if (e.code === "Space" && GameState.unlockedMinigame) {
      e.preventDefault();
      shootRangeTarget();
    } else if ((e.key === "e" || e.key === "E") && GameState.unlockedPlinko) {
      e.preventDefault();
      dropPlinkoPretzel();
    }
  });
}

function gameLoop(timestamp) {
  if (!lastAnimTime) lastAnimTime = timestamp;
  const rawDt = (timestamp - lastAnimTime) / 1000;
  lastAnimTime = timestamp;
  const dt = Math.min(Math.max(rawDt, 0.001), 0.25);

  if (GameState.started) {
    GameState.recordRunProgress(dt);
    simulateEconomyStep(dt);
    tickBuffs(dt);
    flushCashFlow();

    if (GameState.unlockedMinigame) {
      rangeAnimClock += dt;
      crosshairPos += crosshairDir * 68 * dt;
      if (crosshairPos >= 92) {
        crosshairPos = 92;
        crosshairDir = -1;
      } else if (crosshairPos <= 8) {
        crosshairPos = 8;
        crosshairDir = 1;
      }
      const crosshairEl = getEl("range-crosshair");
      if (crosshairEl) {
        const nextLeft = `${crosshairPos.toFixed(1)}%`;
        if (lastCrosshairLeft !== nextLeft) {
          lastCrosshairLeft = nextLeft;
          crosshairEl.style.left = nextLeft;
        }
      }
      updateRangeTargetsUI();

      if ((GameState.rangeShooters || 0) > 0) {
        autoShooterTimer += dt;
        const interval = getRangeShooterIntervalSec();
        if (autoShooterTimer >= interval) {
          autoShooterTimer -= interval;
          triggerAutoShooterShot();
        }
      }
    }

    if (GameState.unlockedPlinko) {
      tickPlinko(dt);
    }

    if (isLeaderboardVisible()) {
      globeSpinTimer += dt;
      if (globeSpinTimer >= 0.22) {
        globeSpinTimer = 0;
        globeSpinOffset = (globeSpinOffset + 1) % 30;
        renderSpinningGlobe();
      }
    }

    if (typeof NewsSystem !== "undefined" && typeof NewsSystem.tick === "function") {
      NewsSystem.tick(dt);
    }

    render();
  } else {
    updateAudioReactiveStage();
  }

  requestAnimationFrame(gameLoop);
}

async function init() {
  SoundSystem.bindUI();
  bindControls();
  initStarfieldBackdrop();
  scheduleStarTwinkle();

  setInterval(() => {
    if (Math.random() < SHOOTING_STAR_CHANCE) {
      spawnRareShootingStar(true);
    }
  }, SHOOTING_STAR_CHECK_MS);

  setInterval(() => {
    if (typeof GameState !== "undefined" && GameState.started) {
      GameState.save(true);
      if (typeof syncAndFetchLeaderboard === "function") {
        syncAndFetchLeaderboard(false);
      }
    }
  }, 5000);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (typeof GameState !== "undefined" && GameState.started && typeof GameState.saveOnExit === "function") {
        GameState.saveOnExit();
      }
      if (SoundSystem.bgmEl && !SoundSystem.bgmEl.paused) {
        SoundSystem.bgmEl.pause();
        SoundSystem._pausedForHidden = true;
      }
    } else {
      if (typeof GameState !== "undefined" && GameState.started) {
        GameState.lastTick = Date.now();
        if (typeof syncAndFetchLeaderboard === "function") {
          syncAndFetchLeaderboard(false);
        }
      }
      if (SoundSystem.enabledMusic && SoundSystem._pausedForHidden) {
        SoundSystem._pausedForHidden = false;
        SoundSystem.playBgm();
      }
    }
  });

  window.addEventListener("pagehide", () => {
    if (typeof GameState !== "undefined" && GameState.started && typeof GameState.saveOnExit === "function") {
      GameState.saveOnExit();
    }
  });

  window.addEventListener("beforeunload", () => {
    if (typeof GameState !== "undefined" && GameState.started && typeof GameState.saveOnExit === "function") {
      GameState.saveOnExit();
    }
  });

  document.addEventListener("pointermove", (e) => {
    if (typeof e.clientX === "number" && typeof e.clientY === "number") {
      lastPointerPos = { x: Math.round(e.clientX), y: Math.round(e.clientY) };
    }
  }, { passive: true });

  document.addEventListener("pointerdown", (e) => {
    if (typeof e.clientX === "number" && typeof e.clientY === "number") {
      lastPointerPos = { x: Math.round(e.clientX), y: Math.round(e.clientY) };
    }
  }, { passive: true });

  const offlineSecs = typeof GameState !== "undefined" && typeof GameState.load === "function"
    ? GameState.load()
    : 0;

  SoundSystem.syncAfterLoad();
  sanitizeNumbers();
  updateDemand();
  applyTheme(getPreferredThemeId(), false);

  if (typeof GameState !== "undefined" && GameState.started) {
    hideEl("title-intro-screen");
    hideEl("setup-modal");
    applySessionUI();
    if (offlineSecs > 5) {
      logMessage(`Welcome back! Simulated ${formatDuration(offlineSecs)} offline.`);
    } else {
      logMessage(`Loaded ${GameState.playerName || "Baker"} (${getActiveGameVersion()}).`);
    }
  } else {
    initSetupPicker();
    showEl("title-intro-screen");
  }

  refreshCloudMenuUI();

  if (typeof CloudSave !== "undefined" && CloudSave.init()) {
    const existingUser = await CloudSave.getSessionUser();
    if (existingUser) {
      await applyCloudUserSave(existingUser);
    }
  }

  if (typeof syncAndFetchLeaderboard === "function") {
    syncAndFetchLeaderboard(false);
  }

  render();
  requestAnimationFrame(gameLoop);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}