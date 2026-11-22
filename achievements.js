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
  }
];

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
    // Weighted regional dominance toward New Store / Continent Conquest ($50M + 10M pretzels + R&D + Supply Chain)
    const pretzelProg = Math.min(1, (GameState.pretzels || 0) / 10000000);
    const fundsProg = Math.min(1, (GameState.funds || 0) / 50000000);
    const totalProjects = (typeof Projects !== "undefined" && Projects.length > 0) ? Projects.length : 31;
    const researchProg = Math.min(1, (GameState.completedProjects?.length || 0) / totalProjects);
    const supplyUnits = (GameState.saltMines || 0) + (GameState.wheatFarms || 0) + (GameState.refineries || 0);
    const supplyProg = Math.min(1, supplyUnits / 30);

    const weighted = (pretzelProg * 0.35) + (fundsProg * 0.35) + (researchProg * 0.15) + (supplyProg * 0.15);
    return Math.min(100, Math.round(weighted * 100));
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

    const topDomEl = document.getElementById("top-dom-pct");
    const topAchEl = document.getElementById("top-ach-pct");
    const bonusEl = document.getElementById("ach-bonus-pct");

    if (topDomEl) topDomEl.textContent = `${domPct}%`;
    if (topAchEl) topAchEl.textContent = `${achPct}%`;
    if (bonusEl) bonusEl.textContent = `+${unlockedCount}%`;

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