// news.js
// News popup engine: queue, random headline timer, milestone checks.
// Requires news-data.js (loaded first) and state.js (GameState).

const NewsSystem = {
  queue: [],
  showing: false,
  lastShownAt: 0,
  randomTimer: null,
  hideTimer: null,
  lastRandomIdx: -1,

  _cfg() {
    return (typeof NEWS_CONFIG !== "undefined") ? NEWS_CONFIG : {
      randomMinMs: 150000, randomMaxMs: 300000, cooldownMs: 45000, displayMs: 6500, maxQueue: 4
    };
  },

  _now() {
    return Date.now();
  },

  _canRun() {
    if (typeof GameState === "undefined") return false;
    if (!GameState.started) return false;
    if (GameState._simulatingOffline) return false;
    return true;
  },

  // Public: display a headline. type: "random" | "milestone" | "achievement" | "continent"
  // Non-random headlines always queue. Random ones are dropped if the queue is busy.
  show(text, type) {
    if (typeof text !== "string" || !text.trim()) return false;
    if (GameState && GameState._simulatingOffline) return false;
    const kind = type || "random";
    if (kind === "random" && (this.showing || this.queue.length >= this._cfg().maxQueue)) {
      return false;
    }
    this.queue.push({ text: text.trim(), type: kind });
    this._processQueue();
    return true;
  },

  _processQueue() {
    if (this.showing || this.queue.length === 0) return;
    const item = this.queue.shift();
    this.showing = true;
    this.lastShownAt = this._now();

    const el = (typeof document !== "undefined") ? document.getElementById("news-popup") : null;
    const textEl = (typeof document !== "undefined") ? document.getElementById("news-popup-text") : null;
    const kickerEl = (typeof document !== "undefined") ? document.getElementById("news-popup-kicker") : null;

    if (!el || !textEl) {
      // No DOM (or markup missing): don't get stuck.
      this.showing = false;
      return;
    }

    const kickers = { random: "BREAKING NEWS", milestone: "MARKET WATCH", achievement: "SPECIAL REPORT", continent: "WORLD NEWS" };
    if (kickerEl) kickerEl.textContent = kickers[item.type] || "BREAKING NEWS";
    textEl.textContent = item.text;
    el.dataset.newsType = item.type;

    const box = document.getElementById("console-box");
    if (box) box.classList.add("news-active");
    el.classList.remove("hidden");
    void el.offsetWidth;
    el.classList.add("show");
    this._fitMarquee(textEl);

    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this._hideCurrent(), this._cfg().displayMs);
  },

  // If the headline is wider than the top bar, slowly scroll it (same idea as the console line).
  _fitMarquee(textEl) {
    textEl.classList.remove("marquee");
    textEl.style.removeProperty("--marquee-dist");
    textEl.style.removeProperty("--marquee-time");
    const viewport = textEl.parentElement;
    if (!viewport) return;
    const overflow = textEl.scrollWidth - viewport.clientWidth;
    if (overflow > 2) {
      const secs = Math.max(4, overflow / 40 + 2);
      textEl.style.setProperty("--marquee-dist", `-${Math.ceil(overflow + 4)}px`);
      textEl.style.setProperty("--marquee-time", `${secs.toFixed(1)}s`);
      void textEl.offsetWidth;
      textEl.classList.add("marquee");
    }
  },

  _hideCurrent() {
    const el = (typeof document !== "undefined") ? document.getElementById("news-popup") : null;
    if (el) el.classList.remove("show");
    setTimeout(() => {
      if (el) el.classList.add("hidden");
      const box = document.getElementById("console-box");
      if (box && this.queue.length === 0) box.classList.remove("news-active");
      this.showing = false;
      this.lastShownAt = this._now();
      this._processQueue();
    }, 350);
  },

  // Called when an achievement unlocks.
  onAchievement(ach) {
    if (!ach || !this._canRun()) return;
    const override = (typeof NEWS_ACHIEVEMENTS !== "undefined") ? NEWS_ACHIEVEMENTS[ach.id] : null;
    const text = override || (ach.title ? `Achievement: ${ach.title}` : "");
    this.show(text, "achievement");
  },

  _seen() {
    if (!GameState.newsSeen || typeof GameState.newsSeen !== "object" || Array.isArray(GameState.newsSeen)) {
      GameState.newsSeen = {};
    }
    return GameState.newsSeen;
  },

  // Run from the LIVE tick only. Each milestone fires once, ever (survives prestige).
  // For funds/pretzels, if several thresholds are crossed at once (old save, big jump)
  // only the highest one is shown and the lower ones are marked seen silently.
  checkMilestones() {
    if (!this._canRun()) return;
    if (typeof NEWS_MILESTONES === "undefined") return;
    const seen = this._seen();

    const funds = Number(GameState.funds) || 0;
    const lifetime = (Number(GameState.lifetimePretzelsAllRuns) || 0) + (Number(GameState.pretzels) || 0);
    const contIdx = GameState.continentIndex || 0;

    const bestByType = { funds: null, pretzels: null };
    for (const m of NEWS_MILESTONES) {
      if (seen[m.id]) continue;
      if (m.type === "funds" && funds >= m.at) {
        if (!bestByType.funds || m.at > bestByType.funds.at) bestByType.funds = m;
      } else if (m.type === "pretzels" && lifetime >= m.at) {
        if (!bestByType.pretzels || m.at > bestByType.pretzels.at) bestByType.pretzels = m;
      } else if (m.type === "continent" && contIdx >= m.at) {
        // Only announce the continent you are actually on; older ones are marked silently.
        seen[m.id] = true;
        if (contIdx === m.at) this.show(m.text, "continent");
      }
    }

    for (const type of ["funds", "pretzels"]) {
      const best = bestByType[type];
      if (!best) continue;
      for (const m of NEWS_MILESTONES) {
        if (m.type === type && m.at <= best.at) seen[m.id] = true;
      }
      this.show(best.text, "milestone");
    }
  },

  // Random headline timer. Reschedules itself.
  _pickRandom() {
    if (typeof NEWS_RANDOM === "undefined" || !NEWS_RANDOM.length) return null;
    const contIdx = (typeof GameState !== "undefined" && GameState.continentIndex) || 0;
    const pool = NEWS_RANDOM
      .map(h => (typeof h === "string" ? { text: h, minContinent: 0 } : h))
      .filter(h => h && h.text && (h.minContinent || 0) <= contIdx);
    if (!pool.length) return null;
    let idx = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && idx === this.lastRandomIdx) idx = (idx + 1) % pool.length;
    this.lastRandomIdx = idx;
    return pool[idx].text;
  },

  _scheduleRandom(delayMs) {
    clearTimeout(this.randomTimer);
    const cfg = this._cfg();
    const delay = (typeof delayMs === "number")
      ? delayMs
      : cfg.randomMinMs + Math.random() * Math.max(0, cfg.randomMaxMs - cfg.randomMinMs);
    this.randomTimer = setTimeout(() => this._randomTick(), delay);
  },

  _randomTick() {
    const cfg = this._cfg();
    const busy = this.showing || this.queue.length > 0;
    const cooling = (this._now() - this.lastShownAt) < cfg.cooldownMs;
    const hidden = (typeof document !== "undefined") && document.hidden;
    if (!this._canRun() || busy || cooling || hidden) {
      this._scheduleRandom(10000); // try again shortly
      return;
    }
    const text = this._pickRandom();
    if (text) this.show(text, "random");
    this._scheduleRandom();
  },

  init() {
    this._scheduleRandom();
  }
};

// Global convenience wrappers used by main.js
function showNews(text, type) { return NewsSystem.show(text, type); }
function checkNewsMilestones() { NewsSystem.checkMilestones(); }

if (typeof window !== "undefined") {
  window.NewsSystem = NewsSystem;
  window.showNews = showNews;
  window.checkNewsMilestones = checkNewsMilestones;
  NewsSystem.init();
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { NewsSystem, showNews, checkNewsMilestones };
}
