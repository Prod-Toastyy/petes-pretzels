const ACHIEVEMENTS_LIST = [
  {
    id: "first_pretzel",
    icon: "[🥨]",
    title: "First Twist",
    desc: "Bake your very first pretzel.",
    check: (s) => s.pretzels >= 1
  },
  {
    id: "scrape_the_barrel",
    icon: "[👐]",
    title: "Scrape the Barrel",
    desc: "Run completely out of dough and hand-knead 1 lb of emergency dough.",
    check: (s) => s.handMadeDoughTotal >= 1
  },
  {
    id: "hundred_club",
    icon: "[🔥]",
    title: "Warming Up the Ovens",
    desc: "Bake 100 total pretzels.",
    check: (s) => s.pretzels >= 100
  },
  {
    id: "first_extruder",
    icon: "[⚙️]",
    title: "Hands-Free Dough",
    desc: "Purchase your first Auto-Extruder.",
    check: (s) => s.extruders >= 1
  },
  {
    id: "hype_machine",
    icon: "[📣]",
    title: "Word on the Street",
    desc: "Reach Marketing Promotion Level 3.",
    check: (s) => s.promoLevel >= 3
  },
  {
    id: "fleet_commander",
    icon: "[🚚]",
    title: "Local Logistics",
    desc: "Own 3 Delivery Trucks.",
    check: (s) => s.trucks >= 3
  },
  {
    id: "ballistic_scientist",
    icon: "[◎]",
    title: "Dough Ballistics",
    desc: "Earn 15 Research Points on the test range.",
    check: (s) => s.researchPoints >= 15
  },
  {
    id: "gourmet_menu",
    icon: "[🍯]",
    title: "Sweet & Savory",
    desc: "Unlock Cinnamon Sugar or Bavarian pretzels.",
    check: (s) => s.unlockedRecipes.length >= 2
  },
  {
    id: "cheese_connoisseur",
    icon: "[🧀]",
    title: "Liquid Gold",
    desc: "Unlock at least two cheese dip upgrades.",
    check: (s) => s.dipBonus >= 1.00
  },
  {
    id: "sky_delivery",
    icon: "[🛸]",
    title: "Airspace Dominance",
    desc: "Deploy your first Pretzel Drone.",
    check: (s) => s.drones >= 1
  },
  {
    id: "thousand_aire",
    icon: "[💵]",
    title: "Bakery Bankroll",
    desc: "Hold $5,000.00 in cash at once.",
    check: (s) => s.funds >= 5000
  },
  {
    id: "pretzel_tycoon",
    icon: "[★]",
    title: "Pretzel Empire",
    desc: "Bake 25,000 total pretzels.",
    check: (s) => s.pretzels >= 25000
  },
  {
    id: "pretzel_baron",
    icon: "[👑]",
    title: "Pretzel Baron",
    desc: "Bake 100,000 total pretzels.",
    check: (s) => s.pretzels >= 100000
  },
  {
    id: "pretzel_singularity",
    icon: "[🌌]",
    title: "Pretzel Singularity",
    desc: "Bake 1,000,000 total pretzels.",
    check: (s) => s.pretzels >= 1000000
  },

  // Late-Game & Multi-Continent Conquest Achievements
  {
    id: "millionaire_baker",
    icon: "[💰]",
    title: "Seven-Figure Baker",
    desc: "Hold $1,000,000.00 in cash at once.",
    check: (s) => s.funds >= 1000000
  },
  {
    id: "supply_magnate",
    icon: "[⛓️]",
    title: "Vertical Monopoly",
    desc: "Own at least 10 Salt Mines, 10 Wheat Fields, and 10 Dough Refineries.",
    check: (s) => s.saltMines >= 10 && s.wheatFarms >= 10 && s.refineries >= 10
  },
  {
    id: "golden_standard",
    icon: "[✨]",
    title: "Solid Gold Hardware",
    desc: "Upgrade any bakery or supply module to Tier IV Gold (100+ owned).",
    check: (s) => s.extruders >= 100 || s.trucks >= 100 || s.drones >= 100 || s.promoLevel >= 100 || s.saltMines >= 100 || s.wheatFarms >= 100 || s.refineries >= 100
  },
  {
    id: "ten_million_club",
    icon: "[🏭]",
    title: "Continental Producer",
    desc: "Bake 10,000,000 lifetime pretzels across all territories.",
    check: (s) => ((s.lifetimePretzelsAllRuns || 0) + (s.pretzels || 0)) >= 10000000
  },
  {
    id: "first_conquest",
    icon: "[🌎]",
    title: "Beyond Borders",
    desc: "Conquer North America and expand to South America.",
    check: (s) => (s.continentIndex || 0) >= 1
  },
  {
    id: "golden_hoard_10",
    icon: "[🥨★]",
    title: "Gilded Twist",
    desc: "Accumulate 10 permanent Golden Pretzels.",
    check: (s) => (s.goldenPretzels || 0) >= 10
  },
  {
    id: "hundred_million_club",
    icon: "[🚀]",
    title: "Hundred-Million Twist",
    desc: "Bake 100,000,000 lifetime pretzels across all territories.",
    check: (s) => ((s.lifetimePretzelsAllRuns || 0) + (s.pretzels || 0)) >= 100000000
  },
  {
    id: "hundred_million_cash",
    icon: "[🏦]",
    title: "Pretzel Hedge Fund",
    desc: "Hold $100,000,000.00 in cash at once.",
    check: (s) => s.funds >= 100000000
  },
  {
    id: "four_continents",
    icon: "[🧭]",
    title: "Hemisphere Hegemon",
    desc: "Reach the 4th territory (Africa) in your global conquest.",
    check: (s) => (s.continentIndex || 0) >= 3
  },
  {
    id: "golden_hoard_30",
    icon: "[👑★]",
    title: "Sovereign of Salt",
    desc: "Accumulate 30 permanent Golden Pretzels.",
    check: (s) => (s.goldenPretzels || 0) >= 30
  },
  {
    id: "billion_pretzels",
    icon: "[☄️]",
    title: "One Billion Knots",
    desc: "Bake 1,000,000,000 lifetime pretzels across all territories.",
    check: (s) => ((s.lifetimePretzelsAllRuns || 0) + (s.pretzels || 0)) >= 1000000000
  },
  {
    id: "world_conqueror",
    icon: "[🌐]",
    title: "World Domination",
    desc: "Conquer all 7 continents and enter Global Franchise mode.",
    check: (s) => (s.continentIndex || 0) >= 7
  },
  {
    id: "ten_billion_cash",
    icon: "[💎]",
    title: "Decabillionaire Baker",
    desc: "Hold $10,000,000,000.00 in cash at once.",
    check: (s) => s.funds >= 10000000000
  },
  {
    id: "ten_billion_pretzels",
    icon: "[🪐]",
    title: "Galactic Dough Singularity",
    desc: "Bake 10,000,000,000 lifetime pretzels across all territories.",
    check: (s) => ((s.lifetimePretzelsAllRuns || 0) + (s.pretzels || 0)) >= 10000000000
  }
];

// Spinning ASCII Globe (30x11 cylindrical map projected onto a sphere)
// Continent codes: 0=NA, 1=SA, 2=EU, 3=AF, 4=AS, 5=OC, 6=AN, .=Ocean
const GLOBE_MAP = [
  "..............................",
  "..000000.......2222..4444444..",
  ".00000000.....22222.444444444.",
  "..000000.......222..44444444..",
  "...0000........3333..444444...",
  ".....1111.....333333..4444....",
  ".....11111....333333..........",
  "......1111.....3333......555..",
  "......111.......33.......5555.",
  "..............................",
  "......666666666666666666......"
];

let globeSpinOffset = 0;

function renderSpinningGlobe() {
  const globeEl = document.getElementById("ascii-globe");
  if (!globeEl) return;

  const conqueredIdx = typeof GameState !== "undefined" ? (GameState.continentIndex || 0) : 0;
  const rows = GLOBE_MAP.length;
  const mapW = GLOBE_MAP[0].length;
  const radius = 5.2;
  const outLines = [];

  for (let y = 0; y < rows; y++) {
    const dy = (y - (rows - 1) / 2) / ((rows - 1) / 2);
    if (Math.abs(dy) > 1) continue;
    const halfWidth = Math.round(Math.sqrt(Math.max(0, 1 - dy * dy)) * radius * 2.1);
    const pad = " ".repeat(Math.max(0, 11 - halfWidth));
    let lineHtml = pad;

    for (let x = -halfWidth; x <= halfWidth; x++) {
      const normX = halfWidth > 0 ? (x / halfWidth) : 0;
      const angle = Math.asin(Math.max(-1, Math.min(1, normX)));
      const mapCol = Math.floor(((angle / Math.PI + 0.5) * (mapW * 0.55) + globeSpinOffset) % mapW + mapW) % mapW;
      const ch = GLOBE_MAP[y][mapCol];

      if (x === -halfWidth || x === halfWidth) {
        lineHtml += `<span class="globe-ocean">|</span>`;
      } else if (ch === ".") {
        lineHtml += `<span class="globe-ocean">·</span>`;
      } else {
        const contId = parseInt(ch, 10);
        if (contId < conqueredIdx) {
          lineHtml += `<span class="globe-owned">#</span>`;
        } else if (contId === conqueredIdx) {
          lineHtml += `<span class="globe-active">@</span>`;
        } else {
          lineHtml += `<span class="globe-rival">%</span>`;
        }
      }
    }
    outLines.push(lineHtml);
  }

  globeEl.innerHTML = outLines.join("\n");
}

function renderContinentStatusChips() {
  const wrap = document.getElementById("continent-status-pills");
  if (!wrap || typeof CONTINENTS === "undefined") return;

  const conqueredIdx = typeof GameState !== "undefined" ? (GameState.continentIndex || 0) : 0;
  wrap.innerHTML = "";

  CONTINENTS.forEach((c, idx) => {
    const chip = document.createElement("span");
    let cls = "rival";
    let prefix = "✖";
    if (idx < conqueredIdx) {
      cls = "owned";
      prefix = "✔";
    } else if (idx === conqueredIdx) {
      cls = "active";
      prefix = "★";
    }
    chip.className = `cont-chip ${cls}`;
    chip.textContent = `${prefix} ${c.name}`;
    wrap.appendChild(chip);
  });
}

const AchievementManager = {
  queue: [],
  showing: false,

  getUnlockedIds() {
    if (!Array.isArray(GameState.unlockedAchievements)) {
      GameState.unlockedAchievements = [];
    }
    return GameState.unlockedAchievements;
  },

  getIncomeMultiplier() {
    return 1 + (this.getUnlockedIds().length * 0.01);
  },

  getAchievementPercent() {
    if (ACHIEVEMENTS_LIST.length === 0) return 0;
    return Math.min(100, Math.round((this.getUnlockedIds().length / ACHIEVEMENTS_LIST.length) * 100));
  },

  getDominancePercent() {
    if (typeof GameState === "undefined") return 0;
    const cont = typeof GameState.getCurrentContinent === "function"
      ? GameState.getCurrentContinent()
      : { cashReq: 50000000, pretzelReq: 10000000 };

    const pretzelProg = Math.min(1, (GameState.pretzels || 0) / cont.pretzelReq);
    const fundsProg = Math.min(1, (GameState.funds || 0) / cont.cashReq);
    const totalProjects = (typeof Projects !== "undefined" && Projects.length > 0) ? Projects.length : 31;
    const researchProg = Math.min(1, (GameState.completedProjects?.length || 0) / totalProjects);
    const supplyUnits = (GameState.saltMines || 0) + (GameState.wheatFarms || 0) + (GameState.refineries || 0);
    const supplyProg = Math.min(1, supplyUnits / 30);

    const weighted = (pretzelProg * 0.35) + (fundsProg * 0.35) + (researchProg * 0.15) + (supplyProg * 0.15);
    return Math.min(100, Math.round(weighted * 100));
  },

  canExpandContinent() {
    if (typeof GameState === "undefined" || typeof GameState.getCurrentContinent !== "function") return false;
    const cont = GameState.getCurrentContinent();
    return this.getDominancePercent() >= 100
      && (GameState.funds || 0) >= cont.cashReq
      && (GameState.pretzels || 0) >= cont.pretzelReq;
  },

  playDing() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const notes = [659.25, 987.77];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.11);

        gain.gain.setValueAtTime(0.001, now + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.14, now + idx * 0.11 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.11 + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.7);
      });
    } catch (e) {
      // Ignore if browser blocks audio before interaction
    }
  },

  spawnSparks(container) {
    const sparkChars = ["✦", "✧", "*", "•", "★"];
    for (let i = 0; i < 14; i++) {
      const spark = document.createElement("span");
      spark.className = "ach-spark";
      spark.textContent = sparkChars[i % sparkChars.length];

      const angle = (Math.PI * 2 * i) / 14;
      const distance = 45 + Math.random() * 45;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 18;

      spark.style.setProperty("--dx", `${dx.toFixed(1)}px`);
      spark.style.setProperty("--dy", `${dy.toFixed(1)}px`);
      container.appendChild(spark);

      setTimeout(() => spark.remove(), 850);
    }
  },

  checkAll() {
    if (!GameState.started) return;
    const unlocked = this.getUnlockedIds();
    let newlyUnlocked = false;

    ACHIEVEMENTS_LIST.forEach(ach => {
      if (!unlocked.includes(ach.id) && ach.check(GameState)) {
        unlocked.push(ach.id);
        this.queue.push(ach);
        newlyUnlocked = true;
      }
    });

    if (newlyUnlocked) {
      this.updateButtonCount();
      this.processQueue();
    }
  },

  processQueue() {
    if (this.showing || this.queue.length === 0) return;
    this.showing = true;

    const ach = this.queue.shift();
    const toast = document.getElementById("achievement-toast");
    const titleEl = document.getElementById("ach-toast-title");
    const descEl = document.getElementById("ach-toast-desc");

    if (toast && titleEl && descEl) {
      titleEl.textContent = `${ach.icon} ${ach.title}`;
      descEl.textContent = `${ach.desc} (+1% Income)`;
      toast.classList.remove("hidden");
      void toast.offsetWidth;
      toast.classList.add("show");

      this.playDing();
      this.spawnSparks(toast);

      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
          toast.classList.add("hidden");
          this.showing = false;
          this.processQueue();
        }, 300);
      }, 3600);
    } else {
      this.showing = false;
    }
  },

  updateButtonCount() {
    const unlockedCount = this.getUnlockedIds().length;
    const achPct = this.getAchievementPercent();
    const domPct = this.getDominancePercent();
    const readyExpand = this.canExpandContinent();

    const goldCount = GameState.goldenPretzels || 0;
    const goldBonusPct = goldCount * 25;
    const totalBonusPct = unlockedCount + goldBonusPct;

    const topDomEl = document.getElementById("top-dom-pct");
    const topAchEl = document.getElementById("top-ach-pct");
    const topBtn = document.getElementById("btn-open-achievements");
    const bonusEl = document.getElementById("ach-bonus-pct");

    if (topDomEl) topDomEl.textContent = `${domPct}%`;
    if (topAchEl) topAchEl.textContent = `${achPct}%`;
    if (topBtn) topBtn.classList.toggle("ready-to-expand", readyExpand);
    if (bonusEl) bonusEl.textContent = `+${totalBonusPct}%`;

    // Conquest Card UI inside Modal
    if (typeof GameState.getCurrentContinent === "function") {
      const cont = GameState.getCurrentContinent();
      const nextName = GameState.getNextContinentName();
      const stepNum = Math.min(7, (GameState.continentIndex || 0) + 1);
      const pendingGold = GameState.calculatePendingGoldenPretzels();

      const stepEl = document.getElementById("modal-continent-step");
      const nameEl = document.getElementById("modal-continent-name");
      const goldEl = document.getElementById("modal-gold-pretzels");
      const goldBonusEl = document.getElementById("modal-gold-bonus");
      const reqEl = document.getElementById("modal-conquest-reqs");
      const btnExpand = document.getElementById("btn-expand-continent");

      if (stepEl) stepEl.textContent = (GameState.continentIndex || 0) < 7 ? `${stepNum}/7` : `LOOP ${(GameState.continentIndex || 0) - 5}`;
      if (nameEl) nameEl.textContent = `[🌎] ${cont.name}`;
      if (goldEl) goldEl.textContent = goldCount.toLocaleString();
      if (goldBonusEl) goldBonusEl.textContent = `+${goldBonusPct}%`;
      if (reqEl) {
        reqEl.innerHTML = `Requirements to expand to <strong>${nextName}</strong>: 100% Dominance, <strong>$${cont.cashReq.toLocaleString()}</strong> Cash &amp; <strong>${cont.pretzelReq.toLocaleString()}</strong> Pretzels.`;
      }
      if (btnExpand) {
        btnExpand.disabled = !readyExpand;
        btnExpand.textContent = `Expand to ${nextName} (+${pendingGold} [🥨★])`;
      }
    }

    const modalDomPct = document.getElementById("modal-dom-pct");
    const modalDomFill = document.getElementById("modal-dom-fill");
    const modalAchPct = document.getElementById("modal-ach-pct");
    const modalAchFill = document.getElementById("modal-ach-fill");
    const countModal = document.getElementById("ach-count-modal");
    const totalModal = document.getElementById("ach-total-modal");

    if (modalDomPct) modalDomPct.textContent = `${domPct}%`;
    if (modalDomFill) modalDomFill.style.width = `${domPct}%`;
    if (modalAchPct) modalAchPct.textContent = `${achPct}%`;
    if (modalAchFill) modalAchFill.style.width = `${achPct}%`;
    if (countModal) countModal.textContent = unlockedCount;
    if (totalModal) totalModal.textContent = ACHIEVEMENTS_LIST.length;
  },

  renderModal() {
    const listEl = document.getElementById("achievements-grid");
    if (!listEl) return;

    const unlocked = this.getUnlockedIds();
    this.updateButtonCount();
    renderContinentStatusChips();
    renderSpinningGlobe();
    listEl.innerHTML = "";

    ACHIEVEMENTS_LIST.forEach(ach => {
      const isUnlocked = unlocked.includes(ach.id);
      const card = document.createElement("div");
      card.className = "ach-card " + (isUnlocked ? "unlocked" : "locked");
      card.innerHTML = `
        <div class="ach-card-title">${isUnlocked ? ach.icon : "[?]"} <strong>${isUnlocked ? ach.title : "Locked"}</strong></div>
        <p class="subtext">${isUnlocked ? ach.desc : "Keep baking to discover this milestone."}</p>
      `;
      listEl.appendChild(card);
    });
  }
};