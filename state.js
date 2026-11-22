const SAVE_KEY = "petes_pretzels_save_v4";
const MAX_OFFLINE_SECONDS = 24 * 60 * 60; // 24 hours max AFK

const CONTINENTS = [
  { id: "na", name: "North America", cashReq: 50000000, pretzelReq: 10000000, costScale: 1.0, baseReward: 4 },
  { id: "sa", name: "South America", cashReq: 100000000, pretzelReq: 25000000, costScale: 1.6, baseReward: 6 },
  { id: "eu", name: "Europe", cashReq: 200000000, pretzelReq: 60000000, costScale: 2.5, baseReward: 9 },
  { id: "af", name: "Africa", cashReq: 400000000, pretzelReq: 150000000, costScale: 4.0, baseReward: 13 },
  { id: "as", name: "Asia", cashReq: 800000000, pretzelReq: 400000000, costScale: 6.5, baseReward: 18 },
  { id: "oc", name: "Oceania", cashReq: 1600000000, pretzelReq: 1000000000, costScale: 10.0, baseReward: 25 },
  { id: "an", name: "Antarctica", cashReq: 3200000000, pretzelReq: 2500000000, costScale: 16.0, baseReward: 35 }
];

const RECIPES = {
  classic: {
    id: "classic",
    name: "Classic Salted",
    priceMult: 1.0,
    demandMult: 1.0
  },
  cinnamon: {
    id: "cinnamon",
    name: "Cinnamon Sugar",
    priceMult: 1.6,
    demandMult: 1.15
  },
  bavarian: {
    id: "bavarian",
    name: "Bavarian Lye-Dipped",
    priceMult: 2.5,
    demandMult: 1.25
  },
  jalapeno: {
    id: "jalapeno",
    name: "Jalapeño Cheddar",
    priceMult: 4.0,
    demandMult: 1.40
  }
};

const DEFAULT_STATE = {
  started: false,
  playerName: "",
  selectedAsciiIndex: 0,
  lastTick: Date.now(),

  // Run & Best Records
  runStartTime: 0,
  elapsedRunSeconds: 0,
  bestRunSeconds: 0,
  bestRunPretzels: 0,
  goldUiUnlocked: false,
  endingSeenForRun: false,

  // Global Conquest Prestige
  continentIndex: 0,
  goldenPretzels: 0,
  lifetimePretzelsAllRuns: 0,

  pretzels: 0,
  inventory: 0,
  funds: 0.0,
  researchPoints: 0,

  dough: 200,
  doughBatchSize: 500,
  doughCost: 12.00,
  doughPurchases: 0,
  unlockedAutoDough: false,
  autoDoughEnabled: false,
  kneadClicks: 0,
  handMadeDoughTotal: 0,

  // Vertical Supply Chain (Late-Game In-House Dough)
  unlockedSupplyChain: false,
  supplyChainEnabled: true,
  salt: 0,
  wheat: 0,
  saltMines: 0,
  saltMineCost: 2500.00,
  wheatFarms: 0,
  wheatFarmCost: 4000.00,
  refineries: 0,
  refineryCost: 8500.00,

  promoLevel: 1,
  promoCost: 50.00,

  price: 0.50,
  demand: 100,
  demandBonus: 1.0,
  dipBonus: 0.0,
  clickPower: 1,

  activeRecipe: "classic",
  unlockedRecipes: ["classic"],

  extruders: 0,
  extruderCost: 15.00,
  extruderSpeed: 1,

  trucks: 0,
  truckCost: 250.00,
  truckCapacity: 8,

  drones: 0,
  droneCost: 5000.00,
  droneCapacity: 75,

  unlockedAutomation: false,
  unlockedTrucks: false,
  unlockedDrones: false,
  unlockedMinigame: false,
  unlockedPlinko: false,
  goldenRushEndTime: 0,
  unlockedIncomeTicker: false,
  completedProjects: [],
  unlockedAchievements: []
};

const GameState = {
  ...JSON.parse(JSON.stringify(DEFAULT_STATE)),

  getCurrentContinent() {
    const idx = Math.max(0, this.continentIndex || 0);
    if (idx < CONTINENTS.length) {
      return CONTINENTS[idx];
    }
    const extraLoops = idx - CONTINENTS.length + 1;
    const base = CONTINENTS[CONTINENTS.length - 1];
    const loopMult = Math.pow(2.5, extraLoops);
    return {
      id: `global_${extraLoops}`,
      name: `Global Franchise +${extraLoops}`,
      cashReq: Math.round(base.cashReq * loopMult),
      pretzelReq: Math.round(base.pretzelReq * loopMult),
      costScale: Math.round(base.costScale * Math.pow(1.6, extraLoops) * 10) / 10,
      baseReward: base.baseReward + (extraLoops * 12)
    };
  },

  getNextContinentName() {
    const nextIdx = (this.continentIndex || 0) + 1;
    if (nextIdx < CONTINENTS.length) return CONTINENTS[nextIdx].name;
    const extraLoops = nextIdx - CONTINENTS.length + 1;
    return `Global Franchise +${extraLoops}`;
  },

  getGoldenPretzelMultiplier() {
    return 1 + ((this.goldenPretzels || 0) * 0.25);
  },

  calculatePendingGoldenPretzels() {
    const cont = this.getCurrentContinent();
    const cashBonus = Math.floor(Math.max(0, (this.funds || 0) - cont.cashReq) / cont.cashReq) * 2;
    const pretzelBonus = Math.floor(Math.max(0, (this.pretzels || 0) - cont.pretzelReq) / cont.pretzelReq) * 2;
    return cont.baseReward + cashBonus + pretzelBonus;
  },

  getBakeRate() {
    if (this.dough <= 0) return 0;
    return this.extruders * this.extruderSpeed;
  },

  getMaxDeliveryRate() {
    return 1 + (this.trucks * this.truckCapacity) + (this.drones * this.droneCapacity);
  },

  isGoldenRushActive() {
    return Date.now() < (this.goldenRushEndTime || 0);
  },

  getEffectivePrice() {
    const recipe = RECIPES[this.activeRecipe] || RECIPES.classic;
    const baseNet = (this.price * recipe.priceMult) + this.dipBonus;
    const achBonus = 1 + ((this.unlockedAchievements?.length || 0) * 0.01);
    const goldBonus = this.getGoldenPretzelMultiplier();
    const rushMult = this.isGoldenRushActive() ? 2.0 : 1.0;
    return Math.round(baseNet * achBonus * goldBonus * rushMult * 100) / 100;
  },

  recordRunProgress(addSeconds = 0) {
    if (addSeconds > 0) {
      this.elapsedRunSeconds = (this.elapsedRunSeconds || 0) + addSeconds;
    }
    const runPretzels = Math.floor(this.pretzels || 0);
    if (runPretzels > (this.bestRunPretzels || 0)) {
      this.bestRunPretzels = runPretzels;
    }
  },

  finalizeRunRecords() {
    this.recordRunProgress(0);
    const currentSecs = Math.floor(this.elapsedRunSeconds || 0);
    let isNewBestTime = false;
    let isNewBestPretzels = false;

    if (currentSecs > 0 && ((this.bestRunSeconds || 0) === 0 || currentSecs < this.bestRunSeconds)) {
      this.bestRunSeconds = currentSecs;
      isNewBestTime = true;
    }
    const runPretzels = Math.floor(this.pretzels || 0);
    if (runPretzels >= (this.bestRunPretzels || 0) && runPretzels > 0) {
      this.bestRunPretzels = runPretzels;
      isNewBestPretzels = true;
    }

    return { isNewBestTime, isNewBestPretzels };
  },

  expandToNextContinent() {
    const prevContinentIdx = this.continentIndex || 0;
    const conqueringFinalWorld = prevContinentIdx === CONTINENTS.length - 1;
    const earnedGold = this.calculatePendingGoldenPretzels();

    const preservedName = this.playerName;
    const preservedAscii = this.selectedAsciiIndex;
    const preservedAchievements = Array.isArray(this.unlockedAchievements) ? [...this.unlockedAchievements] : [];
    const totalLifetime = (this.lifetimePretzelsAllRuns || 0) + (this.pretzels || 0);
    const nextContinentIdx = prevContinentIdx + 1;
    const totalGold = (this.goldenPretzels || 0) + earnedGold;
    const unlockedGoldUi = Boolean(this.goldUiUnlocked || conqueringFinalWorld);

    const runSecs = Math.floor(this.elapsedRunSeconds || 0);
    const runPretzels = Math.floor(this.pretzels || 0);
    let nextBestSecs = this.bestRunSeconds || 0;
    if (conqueringFinalWorld && runSecs > 0 && (nextBestSecs === 0 || runSecs < nextBestSecs)) {
      nextBestSecs = runSecs;
    }
    const nextBestPretzels = Math.max(this.bestRunPretzels || 0, runPretzels);

    Object.assign(this, JSON.parse(JSON.stringify(DEFAULT_STATE)));

    this.started = true;
    this.playerName = preservedName;
    this.selectedAsciiIndex = preservedAscii;
    this.unlockedAchievements = preservedAchievements;
    this.lifetimePretzelsAllRuns = totalLifetime;
    this.continentIndex = nextContinentIdx;
    this.goldenPretzels = totalGold;
    this.goldUiUnlocked = unlockedGoldUi;
    this.bestRunSeconds = nextBestSecs;
    this.bestRunPretzels = nextBestPretzels;
    this.runStartTime = Date.now();
    this.elapsedRunSeconds = 0;

    const scale = this.getCurrentContinent().costScale;
    this.doughCost = Math.round(12.00 * scale * 100) / 100;
    this.promoCost = Math.round(50.00 * scale * 100) / 100;
    this.extruderCost = Math.round(15.00 * scale * 100) / 100;
    this.truckCost = Math.round(250.00 * scale * 100) / 100;
    this.droneCost = Math.round(5000.00 * scale * 100) / 100;
    this.saltMineCost = Math.round(2500.00 * scale * 100) / 100;
    this.wheatFarmCost = Math.round(4000.00 * scale * 100) / 100;
    this.refineryCost = Math.round(8500.00 * scale * 100) / 100;

    this.save(true);
    return { earnedGold, conqueringFinalWorld };
  },

  prestigeRestartRun(claimPendingGold = false) {
    const bonusGold = claimPendingGold ? this.calculatePendingGoldenPretzels() : 0;

    const preservedName = this.playerName;
    const preservedAscii = this.selectedAsciiIndex;
    const preservedAchievements = Array.isArray(this.unlockedAchievements) ? [...this.unlockedAchievements] : [];
    const totalLifetime = (this.lifetimePretzelsAllRuns || 0) + (this.pretzels || 0);
    const totalGold = (this.goldenPretzels || 0) + bonusGold;
    const unlockedGoldUi = Boolean(this.goldUiUnlocked);
    const nextBestSecs = this.bestRunSeconds || 0;
    const nextBestPretzels = Math.max(this.bestRunPretzels || 0, Math.floor(this.pretzels || 0));

    Object.assign(this, JSON.parse(JSON.stringify(DEFAULT_STATE)));

    this.started = true;
    this.playerName = preservedName;
    this.selectedAsciiIndex = preservedAscii;
    this.unlockedAchievements = preservedAchievements;
    this.lifetimePretzelsAllRuns = totalLifetime;
    this.continentIndex = 0;
    this.goldenPretzels = totalGold;
    this.goldUiUnlocked = unlockedGoldUi;
    this.bestRunSeconds = nextBestSecs;
    this.bestRunPretzels = nextBestPretzels;
    this.runStartTime = Date.now();
    this.elapsedRunSeconds = 0;

    this.save(true);
    return { totalGold, bonusGold };
  },

  getSnapshot() {
    this.lastTick = Date.now();
    const snapshot = {};
    for (const key of Object.keys(DEFAULT_STATE)) {
      snapshot[key] = this[key];
    }
    return snapshot;
  },

  applySaveObject(saved) {
    if (!saved || typeof saved !== "object") return 0;
    for (const key of Object.keys(DEFAULT_STATE)) {
      if (saved[key] !== undefined) {
        this[key] = saved[key];
      }
    }

    if (!this.runStartTime) this.runStartTime = Date.now();

    const batchSize = this.doughBatchSize || 500;
    const now = Date.now();
    const rawElapsed = Math.floor((now - (this.lastTick || now)) / 1000);
    const elapsedSeconds = Math.min(Math.max(0, rawElapsed), MAX_OFFLINE_SECONDS);
    this.lastTick = now;

    if (this.started && elapsedSeconds > 0) {
      this.recordRunProgress(elapsedSeconds);
    }

    if (this.started && elapsedSeconds > 5) {
      const potentialBake = this.extruders * this.extruderSpeed * elapsedSeconds;
      if (this.unlockedAutoDough && this.autoDoughEnabled) {
        const batchesNeeded = Math.ceil(Math.max(0, potentialBake - this.dough) / batchSize);
        const affordableBatches = Math.min(batchesNeeded, Math.floor(this.funds / this.doughCost));
        this.funds -= affordableBatches * this.doughCost;
        this.dough += affordableBatches * batchSize;
      }

      const produced = Math.min(this.dough, potentialBake);
      this.dough -= produced;
      this.pretzels += produced;
      this.inventory += produced;

      const demandFactor = this.demand / 100;
      const maxSell = this.getMaxDeliveryRate() * demandFactor * elapsedSeconds;
      const sold = Math.min(this.inventory, maxSell);
      this.inventory -= sold;
      this.funds += sold * this.getEffectivePrice();
      this.recordRunProgress(0);

      return elapsedSeconds;
    }
    return 0;
  },

  save(syncCloud = false) {
    const snapshot = this.getSnapshot();
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
    if (syncCloud && typeof CloudSave !== "undefined" && CloudSave.user) {
      CloudSave.pushToCloud(snapshot);
    }
  },

  load() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return 0;

    try {
      return this.applySaveObject(JSON.parse(raw));
    } catch (e) {
      console.error("Save load error:", e);
    }
    return 0;
  },

  reset(syncCloud = false) {
    localStorage.removeItem(SAVE_KEY);
    Object.assign(this, JSON.parse(JSON.stringify(DEFAULT_STATE)));
    if (syncCloud && typeof CloudSave !== "undefined" && CloudSave.user) {
      CloudSave.pushToCloud(this.getSnapshot());
    }
  }
};