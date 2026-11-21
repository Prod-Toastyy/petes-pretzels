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

  if (typeof applySessionUI === "function") applySessionUI();
  if (typeof logMessage === "function") {
    logMessage(`Welcome, ${nameInput || "Baker"}. Kitchen is open.`);
  }
  if (typeof render === "function") render();
};

const Projects = [
  // Early Production & Dough
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

  // Cheese Dips (Stackable +$ Per Pretzel)
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
    desc: "Unlocks Auto-Buyer to restock dough automatically below 100 lbs.",
    cashCost: 400,
    rpCost: 10,
    trigger: () => GameState.unlockedMinigame && (GameState.doughPurchases >= 1 || GameState.ranOutOfDoughOnce),
    effect: () => {
      GameState.unlockedAutoDough = true;
      GameState.autoDoughEnabled = true;
      showEl("btn-toggle-autodough");
      logMessage("Precision Auto-Dough Silo online!");
    }
  },

  // Unlockable Pretzel Varieties
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
let lastShotTime = 0;

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
  if (!Number.isFinite(GameState.pretzels)) GameState.pretzels = 0;
  if (!Number.isFinite(GameState.inventory)) GameState.inventory = 0;
  if (!Number.isFinite(GameState.funds)) GameState.funds = 0;
  if (!Number.isFinite(GameState.researchPoints)) GameState.researchPoints = 0;
  if (!Number.isFinite(GameState.dough)) GameState.dough = 200;
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
  return Math.round(((GameState.price * r.priceMult) + (GameState.dipBonus || 0)) * 100) / 100;
}

function triggerOutOfDoughCheck() {
  if (GameState.dough <= 0) {
    GameState.dough = 0;
    if (!GameState.ranOutOfDoughOnce) {
      GameState.ranOutOfDoughOnce = true;
      showEl("panel-hand-dough");
      logMessage("Out of dough! Emergency Hand-Kneader unlocked in Production.");
    }
  }
}

function bakePretzels(requestedAmount) {
  if (GameState.dough <= 0) {
    triggerOutOfDoughCheck();
    return 0;
  }
  const actualBaked = Math.min(GameState.dough, requestedAmount);
  GameState.dough -= actualBaked;
  GameState.pretzels += actualBaked;
  GameState.inventory += actualBaked;

  if (GameState.dough <= 0) {
    triggerOutOfDoughCheck();
  }
  return actualBaked;
}

function buyDoughBatch(isAuto = false) {
  if (GameState.funds >= GameState.doughCost) {
    GameState.funds -= GameState.doughCost;
    GameState.dough += 500;
    GameState.doughPurchases += 1;
    if (GameState.doughPurchases % 5 === 0) {
      GameState.doughCost = Math.round(GameState.doughCost * 1.15 * 100) / 100;
    }
    if (!isAuto) {
      logMessage("Restocked +500 lbs of fresh dough.");
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
  const gallery = typeof AsciiGallery !== "undefined" ? AsciiGallery : ["( X )"];
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
  const nameInput = document.getElementById("input-player-name");

  if (grid && typeof AsciiGallery !== "undefined") {
    grid.innerHTML = "";
    AsciiGallery.forEach((art, index) => {
      const card = document.createElement("div");
      card.className = "ascii-option" + (index === 0 ? " selected" : "");
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

  setDisabled("btn-start-game", false);
  onClick("btn-start-game", window.startGameFromModal);

  if (nameInput) {
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        window.startGameFromModal();
      }
    });
  }
}

function applySessionUI() {
  setText("display-player-name", GameState.playerName);
  setText("ascii-stage", getEvolvedAscii());
  hideEl("setup-modal");

  refreshRecipeDropdown();

  if (GameState.ranOutOfDoughOnce) showEl("panel-hand-dough");
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
  onClick("btn-bake", () => {
    if (GameState.dough <= 0) {
      triggerOutOfDoughCheck();
      logMessage("Out of dough! Hand-knead flour or buy a 500 lb bag.");
      render();
      return;
    }
    bakePretzels(GameState.clickPower);
    render();
  });

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

  onClick("btn-price-up", () => {
    GameState.price = Math.round((GameState.price + 0.05) * 100) / 100;
    updateDemand();
    render();
  });

  onClick("btn-price-down", () => {
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

  setText("top-funds", formattedFunds);
  setText("pretzels-total", Math.floor(GameState.pretzels).toLocaleString());
  setText("inventory", Math.floor(GameState.inventory).toLocaleString());
  setText("rp-total", Math.floor(GameState.researchPoints).toLocaleString());
  setText("price", GameState.price.toFixed(2));
  setText("effective-price", netPrice.toFixed(2));
  setText("demand", GameState.demand);
  setText("click-power", GameState.clickPower);

  // Dough & Hand-Kneader UI
  setText("dough-amount", Math.floor(GameState.dough).toLocaleString());
  setText("dough-cost", GameState.doughCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  setDisabled("btn-buy-dough", GameState.funds < GameState.doughCost);
  setDisabled("btn-bake", GameState.dough < 1);
  setText("knead-progress", GameState.kneadClicks);

  const doughStatus = document.getElementById("dough-status");
  if (doughStatus) {
    if (GameState.dough <= 0) {
      doughStatus.textContent = "OUT OF DOUGH! Restock or hand-knead.";
      doughStatus.style.color = "#e86848";
    } else if (GameState.dough < 50) {
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

  // Marketing / Promotion UI
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

function animateCrosshair() {
  if (GameState.started && GameState.unlockedMinigame) {
    crosshairPos += crosshairDir * 1.45;
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

    if (GameState.unlockedAutoDough && GameState.autoDoughEnabled && GameState.dough < 100) {
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