const SAVE_KEY = "petes_pretzels_save_v2";
const MAX_OFFLINE_SECONDS = 24 * 60 * 60; // 24 hours max AFK

const DEFAULT_STATE = {
  started: false,
  playerName: "",
  selectedAsciiIndex: 0,
  lastTick: Date.now(),

  pretzels: 0,
  inventory: 0,
  funds: 0.0,
  researchPoints: 0,
  price: 0.50,
  demand: 100,
  demandBonus: 1.0,
  clickPower: 1,

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
  completedProjects: []
};

const GameState = {
  ...JSON.parse(JSON.stringify(DEFAULT_STATE)),

  getBakeRate() {
    return this.extruders * this.extruderSpeed;
  },

  getMaxDeliveryRate() {
    return 1 + (this.trucks * this.truckCapacity) + (this.drones * this.droneCapacity);
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

      const now = Date.now();
      const rawElapsed = Math.floor((now - (this.lastTick || now)) / 1000);
      const elapsedSeconds = Math.min(Math.max(0, rawElapsed), MAX_OFFLINE_SECONDS);
      this.lastTick = now;

      if (this.started && elapsedSeconds > 5) {
        const produced = this.getBakeRate() * elapsedSeconds;
        this.pretzels += produced;
        this.inventory += produced;

        const demandFactor = this.demand / 100;
        const maxSell = this.getMaxDeliveryRate() * demandFactor * elapsedSeconds;
        const sold = Math.min(this.inventory, maxSell);
        this.inventory -= sold;
        this.funds += sold * this.price;

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