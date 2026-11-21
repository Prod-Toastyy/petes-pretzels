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

window.startGameFromModal = function() {
  const inputEl = document.getElementById("input-player-name");
  const nameInput = inputEl ? inputEl.value.trim() : "";

  if (typeof GameState !== "undefined") {
    GameState.playerName = nameInput || "Baker";
    GameState.started = true;
    if (typeof GameState.save === "function") {
      GameState.save();
    }
  }

  const nameDisplay = document.getElementById("display-player-name");
  if (nameDisplay) nameDisplay.textContent = nameInput || "Baker";

  const modal = document.getElementById("setup-modal");
  if (modal) modal.classList.add("hidden");

  applySessionUI();
  logMessage(`Welcome, ${nameInput || "Baker"}. Kitchen is open.`);
  render();
};

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
    title: "Live Revenue Ticker",
    desc: "Displays real-time cash earned per second under Unsold Inventory.",
    cashCost: 40,
    rpCost: 0,
    trigger: () => GameState.pretzels >= 35,
    effect: () => {
      GameState.unlockedIncomeTicker = true;
      showEl("income-rate-line");
      logMessage("Upgraded: Live $/sec revenue ticker installed.");
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
      logMessage("R&D Test Range online! Shoot the target for RP.");
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

  // Hybrid Cash + Research Point (RP) Upgrades
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
  }
];

let pendingSales = 0;
let crosshairPos = 10;
let crosshairDir = 1;
let lastAnimTime = null;
let lastShotTime = 0;
let controlsBound = false;

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function showEl(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}

function hideEl(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

function setDisabled(id, isDisabled) {
  const el = document.getElementById(id);
  if (el) el.disabled = isDisabled;
}

function onClick(id, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", handler);
}

// Allows holding down a button (mouse or touch) to repeat rapidly
function bindHoldButton(id, actionFn) {
  const btn = document.getElementById(id);
  if (!btn) return;

  let holdDelayTimer = null;
  let repeatInterval = null;

  const stopHold = () => {
    clearTimeout(holdDelayTimer);
    clearInterval(repeatInterval);
    holdDelayTimer = null;
    repeatInterval = null;
  };

  const startHold = (e) => {
    if (e.type === "mousedown" && e.button !== 0) return;
    stopHold();
    actionFn();
    holdDelayTimer = setTimeout(() => {
      repeatInterval = setInterval(actionFn, 60);
    }, 280);
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

function logMessage(msg) {
  setText("console-log", `> ${msg}`);
}

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
  if (!Number.isFinite(GameState.pretzels)) GameState.pretzels = 0;
  if (!Number.isFinite(GameState.inventory)) GameState.inventory = 0;
  if (!Number.isFinite(GameState.funds)) GameState.funds = 0;
  if (!Number.isFinite(GameState.researchPoints)) GameState.researchPoints = 0;
  if (!Number.isFinite(GameState.dough)) GameState.dough = 200;
  if (!Number.isFinite(GameState.doughBatchSize) || GameState.doughBatchSize < 500) GameState.doughBatchSize = 500;
  if (!Number.isFinite(GameState.doughCost) || GameState.doughCost <= 0) GameState.doughCost = 12.00;
  if (!Number.isFinite(GameState.doughPurchases)) GameState.doughPurchases = 0;
  if (!Number.isFinite(GameState.kneadClicks)) GameState.kneadClicks = 0;
  if (!Number.isFinite(GameState.handMadeDoughTotal)) GameState.handMadeDoughTotal = 0;
  if (!Number.isFinite(GameState.promoLevel) || GameState.promoLevel < 1) GameState.promoLevel = 1;
  if (!Number.isFinite(GameState.promoCost) || GameState.promoCost <= 0) GameState.promoCost = 50.00;
  if (!Number.isFinite(GameState.price) || GameState.price <= 0) GameState.price = 0.50;
  if (!Number.isFinite(GameState.demandBonus) || GameState.demandBonus <= 0) GameState.demandBonus = 1.0;
  if (!Number.isFinite(GameState.dipBonus)) GameState.dipBonus = 0;
  if (!Number.isFinite(GameState.clickPower) || GameState.clickPower < 1) GameState.clickPower = 1;
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
  return Math.round(((GameState.price * r.priceMult) + (GameState.dipBonus || 0)) * achBonus * 100) / 100;
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
  return actualBaked;
}

window.handleManualBake = function() {
  if (typeof GameState === "undefined") return;
  if (GameState.dough < 1) {
    logMessage("Out of dough! Hand-knead flour or buy a fresh bag.");
    render();
    return;
  }
  bakePretzels(GameState.clickPower || 1);
  render();
};

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
      logMessage(`Restocked +${batchSize.toLocaleString()} lbs of fresh dough.`);
    }
    return true;
  }
  return false;
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
  const select = document.getElementById("select-recipe");
  if (!select) return;

  if (GameState.unlockedRecipes.length > 1) {
    showEl("recipe-box");
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

function updateDemand() {
  const recipe = getSafeRecipe();
  const promoMult = 1 + ((GameState.promoLevel - 1) * 0.20);
  const rawDemand = (0.50 / GameState.price) * 100 * GameState.demandBonus * recipe.demandMult * promoMult;
  GameState.demand = Math.max(5, Math.round(rawDemand));
}

function getEvolvedAscii() {
  const gallery = getGallery();
  const base = gallery[GameState.selectedAsciiIndex] || gallery[0];
  const total = GameState.pretzels;

  if (total >= 100000) return `★ ═══════════════ ★\n${base}\n★ ═══ EMPIRE ════ ★`;
  if (total >= 25000)  return `✦ ─────────────── ✦\n${base}\n✦ ─────────────── ✦`;
  if (total >= 5000)   return `.─────────────────.\n${base}\n'─────────────────'`;
  if (total >= 500)    return `  ·  *  ·  *  ·  \n${base}`;
  return base;
}

function shootTarget() {
  if (!GameState.started || !GameState.unlockedMinigame) return;

  const now = Date.now();
  if (now - lastShotTime < 140) return;
  lastShotTime = now;

  const trackEl = document.getElementById("range-track");
  const distFromCenter = Math.abs(crosshairPos - 50);

  if (trackEl) {
    trackEl.classList.remove("flash-hit", "flash-miss");
    void trackEl.offsetWidth;
  }

  if (distFromCenter <= 6) {
    GameState.researchPoints += 3;
    setText("range-feedback", "BULLSEYE! +3 RP");
    if (trackEl) trackEl.classList.add("flash-hit");
  } else if (distFromCenter <= 15) {
    GameState.researchPoints += 1;
    setText("range-feedback", "Nice graze! +1 RP");
    if (trackEl) trackEl.classList.add("flash-hit");
  } else {
    setText("range-feedback", "Missed! Keep firing.");
    if (trackEl) trackEl.classList.add("flash-miss");
  }

  render();
}

function initSetupPicker() {
  const grid = document.getElementById("ascii-picker-grid");
  const gallery = getGallery();

  if (grid) {
    grid.innerHTML = "";
    gallery.forEach((art, index) => {
      const card = document.createElement("div");
      card.className = "ascii-option" + (index === (GameState.selectedAsciiIndex || 0) ? " selected" : "");
      const pre = document.createElement("pre");
      pre.textContent = art;
      card.appendChild(pre);

      card.addEventListener("click", () => {
        document.querySelectorAll(".ascii-option").forEach(el => el.classList.remove("selected"));
        card.classList.add("selected");
        GameState.selectedAsciiIndex = index;
      });

      grid.appendChild(card);
    });
  }
}

function applySessionUI() {
  setText("display-player-name", GameState.playerName);
  setText("ascii-stage", getEvolvedAscii());
  hideEl("setup-modal");

  refreshRecipeDropdown();
  if (typeof AchievementManager !== "undefined") {
    AchievementManager.updateButtonCount();
  }

  if (GameState.unlockedIncomeTicker) showEl("income-rate-line");
  if (GameState.unlockedAutoDough) showEl("btn-toggle-autodough");
  if (GameState.unlockedAutomation) showEl("panel-automation");
  if (GameState.unlockedTrucks || GameState.unlockedDrones) showEl("system-delivery");
  if (GameState.unlockedTrucks) showEl("panel-trucks");
  if (GameState.unlockedDrones) showEl("panel-drones");
  if (GameState.unlockedMinigame) {
    showEl("rp-badge");
    showEl("panel-minigame");
  }
  if (GameState.completedProjects.length > 0 || GameState.pretzels >= 20) {
    showEl("panel-projects");
  }
}

function bindControls() {
  if (controlsBound) return;
  controlsBound = true;

  onClick("btn-bake", window.handleManualBake);

  onClick("btn-buy-dough", () => {
    if (buyDoughBatch(false)) {
      GameState.save();
      render();
    }
  });

  onClick("btn-toggle-autodough", () => {
    GameState.autoDoughEnabled = !GameState.autoDoughEnabled;
    render();
  });

  onClick("btn-knead-dough", () => {
    GameState.kneadClicks += 1;
    if (GameState.kneadClicks >= 30) {
      GameState.kneadClicks = 0;
      GameState.dough += 1;
      GameState.handMadeDoughTotal += 1;
      logMessage("Hand-kneaded +1 lb of emergency dough!");
    }
    render();
  });

  onClick("btn-open-achievements", () => {
    if (typeof AchievementManager !== "undefined") {
      AchievementManager.renderModal();
    }
    showEl("achievements-modal");
  });

  onClick("btn-close-achievements", () => {
    hideEl("achievements-modal");
  });

  onClick("player-badge", () => {
    showEl("restart-modal");
  });

  onClick("btn-close-restart", () => {
    hideEl("restart-modal");
  });

  onClick("btn-cancel-restart", () => {
    hideEl("restart-modal");
  });

  onClick("btn-confirm-restart", () => {
    if (typeof GameState !== "undefined" && typeof GameState.reset === "function") {
      GameState.reset();
    }
    pendingSales = 0;

    hideEl("restart-modal");
    hideEl("income-rate-line");
    hideEl("recipe-box");
    hideEl("btn-toggle-autodough");
    hideEl("panel-hand-dough");
    hideEl("panel-automation");
    hideEl("system-delivery");
    hideEl("panel-trucks");
    hideEl("panel-drones");
    hideEl("panel-projects");
    hideEl("rp-badge");
    hideEl("panel-minigame");

    const projectsList = document.getElementById("projects-list");
    if (projectsList) projectsList.innerHTML = "";

    const nameInput = document.getElementById("input-player-name");
    if (nameInput) nameInput.value = "";

    if (typeof AchievementManager !== "undefined") {
      AchievementManager.queue = [];
      AchievementManager.updateButtonCount();
    }

    initSetupPicker();
    showEl("setup-modal");
    render();
  });

  onClick("btn-buy-promo", () => {
    if (GameState.funds >= GameState.promoCost) {
      GameState.funds -= GameState.promoCost;
      GameState.promoLevel += 1;
      GameState.promoCost = Math.round(GameState.promoCost * 1.75 * 100) / 100;
      updateDemand();
      logMessage(`Marketing upgraded to Level ${GameState.promoLevel} (+20% Demand)!`);
      GameState.save();
      render();
    }
  });

  const recipeSelect = document.getElementById("select-recipe");
  if (recipeSelect) {
    recipeSelect.addEventListener("change", (e) => {
      GameState.activeRecipe = e.target.value;
      updateDemand();
      const r = getSafeRecipe();
      logMessage(`Switched ovens to ${r.name}.`);
      render();
    });
  }

  // Hold-to-repeat price buttons
  bindHoldButton("btn-price-up", () => {
    GameState.price = Math.round((GameState.price + 0.05) * 100) / 100;
    updateDemand();
    render();
  });

  bindHoldButton("btn-price-down", () => {
    if (GameState.price > 0.05) {
      GameState.price = Math.round((GameState.price - 0.05) * 100) / 100;
      updateDemand();
      render();
    }
  });

  onClick("btn-buy-extruder", () => {
    if (GameState.funds >= GameState.extruderCost) {
      GameState.funds -= GameState.extruderCost;
      GameState.extruders += 1;
      GameState.extruderCost = Math.round(GameState.extruderCost * 1.42 * 100) / 100;
      GameState.save();
      render();
    }
  });

  onClick("btn-buy-truck", () => {
    if (GameState.funds >= GameState.truckCost) {
      GameState.funds -= GameState.truckCost;
      GameState.trucks += 1;
      GameState.truckCost = Math.round(GameState.truckCost * 1.48 * 100) / 100;
      GameState.save();
      render();
    }
  });

  onClick("btn-buy-drone", () => {
    if (GameState.funds >= GameState.droneCost) {
      GameState.funds -= GameState.droneCost;
      GameState.drones += 1;
      GameState.droneCost = Math.round(GameState.droneCost * 1.55 * 100) / 100;
      GameState.save();
      render();
    }
  });

  onClick("btn-shoot-target", shootTarget);

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && GameState.started && GameState.unlockedMinigame) {
      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT")) return;
      e.preventDefault();
      shootTarget();
    }
  });
}

function canAffordProject(proj) {
  const hasCash = GameState.funds >= (proj.cashCost || 0);
  const hasRP = GameState.researchPoints >= (proj.rpCost || 0);
  return hasCash && hasRP;
}

function formatProjectCost(proj) {
  const parts = [];
  if (proj.cashCost > 0) {
    parts.push(`$${proj.cashCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
  }
  if (proj.rpCost > 0) {
    parts.push(`${proj.rpCost} RP`);
  }
  return parts.join(" + ");
}

function checkUnlocks() {
  if (!GameState.unlockedAutomation && GameState.funds >= 10) {
    GameState.unlockedAutomation = true;
    showEl("panel-automation");
    logMessage("Automation unlocked.");
  }

  const projectsList = document.getElementById("projects-list");
  if (!projectsList) return;

  Projects.forEach(proj => {
    if (!GameState.completedProjects.includes(proj.id) && proj.trigger()) {
      showEl("panel-projects");

      if (!document.getElementById(`proj-${proj.id}`)) {
        const affordable = canAffordProject(proj);
        const isHybridRP = proj.rpCost > 0;
        const card = document.createElement("div");
        card.className = "project-card" + (affordable ? "" : " locked") + (isHybridRP ? " rp-card" : "");
        card.id = `proj-${proj.id}`;
        card.innerHTML = `
          <p>${proj.icon || "[★]"} <strong>${proj.title}</strong> (${formatProjectCost(proj)})</p>
          <p class="subtext">${proj.desc}</p>
          <button id="btn-${proj.id}" ${affordable ? "" : "disabled"}>Research</button>
        `;
        projectsList.appendChild(card);

        onClick(`btn-${proj.id}`, () => {
          if (canAffordProject(proj)) {
            if (proj.cashCost > 0) GameState.funds -= proj.cashCost;
            if (proj.rpCost > 0) GameState.researchPoints -= proj.rpCost;
            GameState.completedProjects.push(proj.id);
            proj.effect();
            card.remove();
            GameState.save();
            render();
          }
        });
      }
    }
  });
}

function render() {
  const bakeRate = GameState.dough > 0 ? (GameState.extruders * GameState.extruderSpeed) : 0;
  const maxDelivery = 1 + (GameState.trucks * GameState.truckCapacity) + (GameState.drones * GameState.droneCapacity);
  const effectiveDelivery = maxDelivery * (GameState.demand / 100);
  const netPrice = getEffectivePriceSafe();
  const formattedFunds = GameState.funds.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const wholeInventory = Math.floor(GameState.inventory);
  const wholeDough = Math.floor(GameState.dough);
  const batchSize = GameState.doughBatchSize || 500;

  setText("top-funds", formattedFunds);
  setText("pretzels-total", Math.floor(GameState.pretzels).toLocaleString());
  setText("inventory", wholeInventory.toLocaleString());
  setText("rp-total", Math.floor(GameState.researchPoints).toLocaleString());
  setText("price", GameState.price.toFixed(2));
  setText("effective-price", netPrice.toFixed(2));
  setText("demand", GameState.demand);
  setText("click-power", GameState.clickPower);

  const invEl = document.getElementById("inventory");
  if (invEl) invEl.classList.toggle("zero-danger", wholeInventory <= 0);

  const doughEl = document.getElementById("dough-amount");
  if (doughEl) doughEl.classList.toggle("zero-danger", wholeDough <= 0);

  if (GameState.unlockedIncomeTicker) {
    showEl("income-rate-line");
    const sustainableSalesPerSec = wholeInventory > 0
      ? effectiveDelivery
      : Math.min(bakeRate, effectiveDelivery);
    const cashPerSec = sustainableSalesPerSec * netPrice;
    setText("income-per-sec", cashPerSec.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }

  const canAffordDough = GameState.funds >= GameState.doughCost;
  const isOutAndBroke = GameState.dough < 1 && !canAffordDough;
  if (isOutAndBroke) {
    showEl("panel-hand-dough");
  } else {
    hideEl("panel-hand-dough");
  }

  setText("dough-amount", wholeDough.toLocaleString());
  setText("dough-batch-size", batchSize.toLocaleString());
  setText("dough-cost", GameState.doughCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  setDisabled("btn-buy-dough", !canAffordDough);
  setDisabled("btn-bake", GameState.dough < 1);
  setText("knead-progress", GameState.kneadClicks);

  const doughStatus = document.getElementById("dough-status");
  if (doughStatus) {
    if (GameState.dough < 1 && canAffordDough) {
      doughStatus.textContent = "Out of dough! Click Buy above to restock.";
      doughStatus.style.color = "#e89f48";
    } else if (GameState.dough < 1) {
      doughStatus.textContent = "OUT OF DOUGH & FUNDS! Use Emergency Maker.";
      doughStatus.style.color = "#ff6b5b";
    } else if (GameState.dough < Math.max(50, batchSize * 0.2)) {
      doughStatus.textContent = "Low dough warning!";
      doughStatus.style.color = "#e89f48";
    } else {
      doughStatus.textContent = "1 lb dough = 1 pretzel";
      doughStatus.style.color = "#b59f8d";
    }
  }

  const autoBtn = document.getElementById("btn-toggle-autodough");
  if (autoBtn && GameState.unlockedAutoDough) {
    autoBtn.textContent = `Auto-Buyer: ${GameState.autoDoughEnabled ? "ON" : "OFF"}`;
  }

  setText("promo-level", GameState.promoLevel);
  setText("promo-cost", GameState.promoCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  setText("promo-bonus", `+${(GameState.promoLevel - 1) * 20}%`);
  setDisabled("btn-buy-promo", GameState.funds < GameState.promoCost);

  setText("bake-rate", bakeRate.toLocaleString());
  setText("sell-rate", effectiveDelivery.toFixed(1));

  setText("extruder-count", GameState.extruders);
  setText("extruder-cost", GameState.extruderCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  setText("extruder-rate", GameState.extruderSpeed);
  setDisabled("btn-buy-extruder", GameState.funds < GameState.extruderCost);

  setText("truck-count", GameState.trucks);
  setText("truck-cost", GameState.truckCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  setText("truck-rate", GameState.truckCapacity);
  setDisabled("btn-buy-truck", GameState.funds < GameState.truckCost);

  setText("drone-count", GameState.drones);
  setText("drone-cost", GameState.droneCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  setText("drone-rate", GameState.droneCapacity);
  setDisabled("btn-buy-drone", GameState.funds < GameState.droneCost);

  const asciiEl = document.getElementById("ascii-stage");
  if (asciiEl) {
    asciiEl.textContent = getEvolvedAscii();
    asciiEl.classList.toggle("ascii-sway", GameState.pretzels >= 25000);
  }

  Projects.forEach(proj => {
    const card = document.getElementById(`proj-${proj.id}`);
    const btn = document.getElementById(`btn-${proj.id}`);
    if (card && btn) {
      const unaffordable = !canAffordProject(proj);
      btn.disabled = unaffordable;
      card.classList.toggle("locked", unaffordable);
    }
  });
}

// Frame-rate independent crosshair sweep (identical speed on 60Hz, 144Hz, and 240Hz monitors)
function animateCrosshair(timestamp) {
  if (lastAnimTime === null) lastAnimTime = timestamp;
  const dt = Math.min((timestamp - lastAnimTime) / 1000, 0.1);
  lastAnimTime = timestamp;

  if (GameState.started && GameState.unlockedMinigame) {
    const speedPercentPerSec = 95; // Full sweep across track in ~0.9s regardless of monitor Hz
    crosshairPos += crosshairDir * speedPercentPerSec * dt;

    if (crosshairPos >= 94) {
      crosshairPos = 94;
      crosshairDir = -1;
    } else if (crosshairPos <= 6) {
      crosshairPos = 6;
      crosshairDir = 1;
    }

    const ch = document.getElementById("range-crosshair");
    if (ch) ch.style.left = `${crosshairPos}%`;
  }

  requestAnimationFrame(animateCrosshair);
}

function bootGame() {
  if (typeof GameState === "undefined") {
    logMessage("Error: state.js did not load. Check file folder.");
    return;
  }

  const offlineSeconds = GameState.load();
  sanitizeNumbers();
  updateDemand();
  initSetupPicker();
  bindControls();

  if (GameState.started) {
    applySessionUI();
    if (offlineSeconds > 5) {
      const cappedNote = offlineSeconds >= 86400 ? " (24h max)" : "";
      logMessage(`Welcome back, ${GameState.playerName}! Bakery ran for ${formatDuration(offlineSeconds)}${cappedNote} while away.`);
    } else {
      logMessage(`Welcome back, ${GameState.playerName}.`);
    }
  }

  render();
  requestAnimationFrame(animateCrosshair);

  // Game Loop (10 ticks per second)
  setInterval(() => {
    if (!GameState.started) return;

    const batchSize = GameState.doughBatchSize || 500;
    const autoThreshold = Math.max(100, batchSize * 0.25);
    if (GameState.unlockedAutoDough && GameState.autoDoughEnabled && GameState.dough < autoThreshold) {
      buyDoughBatch(true);
    }

    const rawBakeRate = GameState.extruders * GameState.extruderSpeed;
    if (rawBakeRate > 0 && GameState.dough > 0) {
      bakePretzels(rawBakeRate / 10);
    }

    if (GameState.inventory > 0) {
      const maxDelivery = 1 + (GameState.trucks * GameState.truckCapacity) + (GameState.drones * GameState.droneCapacity);
      const demandFactor = GameState.demand / 100;
      const netPrice = getEffectivePriceSafe();
      pendingSales += (maxDelivery * demandFactor) / 10;

      if (pendingSales >= 1) {
        const wantToSell = Math.floor(pendingSales);
        const actualSold = Math.min(GameState.inventory, wantToSell);
        if (actualSold > 0) {
          GameState.inventory -= actualSold;
          GameState.funds += actualSold * netPrice;
          pendingSales -= actualSold;
        }
      }
    } else {
      pendingSales = 0;
    }

    checkUnlocks();
    if (typeof AchievementManager !== "undefined") {
      AchievementManager.checkAll();
    }
    render();
  }, 100);

  setInterval(() => {
    if (GameState.started) GameState.save();
  }, 5000);

  window.addEventListener("beforeunload", () => {
    if (GameState.started) GameState.save();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootGame);
} else {
  bootGame();
}