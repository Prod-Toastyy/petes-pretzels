const SAVE_KEY = "petes_pretzels_save_v4";
const MAX_OFFLINE_SECONDS = 24 * 60 * 60; // 24 hours max AFK

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
    const rushMult = this.isGoldenRushActive() ? 2.0 : 1.0;
    return Math.round(baseNet * achBonus * rushMult * 100) / 100;
  },

  save() {
    this.lastTick = Date.now();
    const dataToSave = {};
    for (const key of Object.keys(DEFAULT_STATE)) {
      dataToSave[key] = this[key];
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
  },

  load() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return 0;

    try {
      const saved = JSON.parse(raw);
      for (const key of Object.keys(DEFAULT_STATE)) {
        if (saved[key] !== undefined) {
          this[key] = saved[key];
        }
      }

      const batchSize = this.doughBatchSize || 500;
      const now = Date.now();
      const rawElapsed = Math.floor((now - (this.lastTick || now)) / 1000);
      const elapsedSeconds = Math.min(Math.max(0, rawElapsed), MAX_OFFLINE_SECONDS);
      this.lastTick = now;

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

        return elapsedSeconds;
      }
    } catch (e) {
      console.error("Save load error:", e);
    }
    return 0;
  },

  reset() {
    localStorage.removeItem(SAVE_KEY);
    Object.assign(this, JSON.parse(JSON.stringify(DEFAULT_STATE)));
  }
};