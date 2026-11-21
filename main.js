const Projects = [
  // Cash Upgrades
  {
    id: "manual_gloves",
    currency: "cash",
    title: "Asbestos Baker's Mitts",
    desc: "Bake 2 pretzels per click.",
    cost: 25,
    trigger: () => GameState.pretzels >= 20,
    effect: () => {
      GameState.clickPower = 2;
      logMessage("Upgraded: Manual baking doubled.");
    }
  },
  {
    id: "faster_extruders",
    currency: "cash",
    title: "High-Torque Dough Nozzles",
    desc: "Doubles Auto-Extruder output.",
    cost: 65,
    trigger: () => GameState.extruders >= 3,
    effect: () => {
      GameState.extruderSpeed *= 2;
      logMessage("Upgraded: Auto-Extruders now run at 2x speed.");
    }
  },
  {
    id: "unlock_trucks",
    currency: "cash",
    title: "Regional Delivery Fleet",
    desc: "Unlocks Delivery Trucks to move bulk inventory.",
    cost: 150,
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
    currency: "cash",
    title: "R&D Ballistic Test Range",
    desc: "Unlocks the target range mini-game to earn Research Points (RP).",
    cost: 220,
    trigger: () => GameState.pretzels >= 200,
    effect: () => {
      GameState.unlockedMinigame = true;
      showEl("rp-badge");
      showEl("panel-minigame");
      logMessage("R&D Test Range online! Shoot the target to earn RP.");
    }
  },
  {
    id: "industrial_ovens",
    currency: "cash",
    title: "Industrial Steam Ovens",
    desc: "Doubles Auto-Extruder speed again.",
    cost: 600,
    trigger: () => GameState.extruders >= 8,
    effect: () => {
      GameState.extruderSpeed *= 2;
      logMessage("Upgraded: Steam ovens installed.");
    }
  },
  {
    id: "turbo_dispatch",
    currency: "cash",
    title: "Turbocharged Route Dispatch",
    desc: "Doubles Delivery Truck capacity.",
    cost: 950,
    trigger: () => GameState.trucks >= 3,
    effect: () => {
      GameState.truckCapacity *= 2;
      logMessage("Upgraded: Delivery Trucks now haul 2x pretzels.");
    }
  },
  {
    id: "sea_salt_glaze",
    currency: "cash",
    title: "Artisanal Sea Salt Glaze",
    desc: "Permanently increases public demand by +35%.",
    cost: 2800,
    trigger: () => GameState.pretzels >= 2500,
    effect: () => {
      GameState.demandBonus += 0.35;
      updateDemand();
      logMessage("Upgraded: Customers are hooked on the sea salt glaze.");
    }
  },
  {
    id: "unlock_drones",
    currency: "cash",
    title: "Autonomous Drone Network",
    desc: "Unlocks high-speed Pretzel Drones.",
    cost: 3500,
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
    currency: "cash",
    title: "Insulated Warming Racks",
    desc: "Increases Delivery Truck capacity by 2.5x.",
    cost: 4200,
    trigger: () => GameState.trucks >= 8,
    effect: () => {
      GameState.truckCapacity = Math.round(GameState.truckCapacity * 2.5);
      logMessage("Upgraded: Trucks keep pretzels fresh across county lines.");
    }
  },
  {
    id: "lidar_drones",
    currency: "cash",
    title: "LIDAR Roof-Drop Guidance",
    desc: "Doubles Pretzel Drone delivery capacity.",
    cost: 18000,
    trigger: () => GameState.drones >= 3,
    effect: () => {
      GameState.droneCapacity *= 2;
      logMessage("Upgraded: Drones now fly precision roof-drop routes.");
    }
  },
  {
    id: "suborbital_pods",
    currency: "cash",
    title: "Sub-Orbital Pretzel Pods",
    desc: "Triples Pretzel Drone delivery capacity.",
    cost: 75000,
    trigger: () => GameState.drones >= 8,
    effect: () => {
      GameState.droneCapacity *= 3;
      logMessage("Upgraded: Sub-orbital pretzel drops active.");
    }
  },

  // Research Point (RP) Upgrades
  {
    id: "rp_cryo_extruder",
    currency: "rp",
    title: "Cryo-Cooled Extruder Cores",
    desc: "3x Auto-Extruder output speed.",
    cost: 15,
    trigger: () => GameState.unlockedMinigame,
    effect: () => {
      GameState.extruderSpeed *= 3;
      logMessage("RP Breakthrough: Auto-Extruders boosted by 3x!");
    }
  },
  {
    id: "rp_aero_trucks",
    currency: "rp",
    title: "Aerodynamic Truck Fairings",
    desc: "2x Delivery Truck hauling capacity.",
    cost: 30,
    trigger: () => GameState.unlockedMinigame && GameState.unlockedTrucks,
    effect: () => {
      GameState.truckCapacity *= 2;
      logMessage("RP Breakthrough: Delivery Trucks boosted by 2x!");
    }
  },
  {
    id: "rp_quantum_yeast",
    currency: "rp",
    title: "Quantum Yeast Catalyst",
    desc: "+50% public demand & 2x manual bake power.",
    cost: 50,
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
    currency: "rp",
    title: "Overclocked Drone Thrusters",
    desc: "3x Pretzel Drone delivery speed.",
    cost: 85,
    trigger: () => GameState.unlockedMinigame && GameState.unlockedDrones,
    effect: () => {
      GameState.droneCapacity *= 3;
      logMessage("RP Breakthrough: Drones boosted by 3x!");
    }
  }
];

let pendingSales = 0;

// Crosshair mini-game state (position 0 to 100%)
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
  if (!Number.isFinite(GameState.price) || GameState.price <= 0) GameState.price = 0.50;
  if (!Number.isFinite(GameState.demandBonus) || GameState.demandBonus <= 0) GameState.demandBonus = 1.0;
  if (!Number.isFinite(GameState.clickPower) || GameState.clickPower < 1) GameState.clickPower = 1;
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

function bakePretzels(amount) {
  GameState.pretzels += amount;
  GameState.inventory += amount;
}

function updateDemand() {
  const rawDemand = (0.50 / GameState.price) * 100 * GameState.demandBonus;
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
  if (now - lastShotTime < 140) return; // Prevents accidental double-frame bounce
  lastShotTime = now;

  const trackEl = document.getElementById("range-track");
  const distFromCenter = Math.abs(crosshairPos - 50);

  if (trackEl) {
    trackEl.classList.remove("flash-hit", "flash-miss");
    void trackEl.offsetWidth; // Reflow to restart flash animation
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

function startGameFromModal() {
  const inputEl = document.getElementById("input-player-name");
  const nameInput = inputEl ? inputEl.value.trim() : "";
  GameState.playerName = nameInput || "Baker";
  GameState.started = true;

  applySessionUI();
  GameState.save();
  logMessage(`Welcome, ${GameState.playerName}. Kitchen is open.`);
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
  onClick("btn-start-game", startGameFromModal);

  if (nameInput) {
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        startGameFromModal();
      }
    });
  }
}

function applySessionUI() {
  setText("display-player-name", GameState.playerName);
  setText("ascii-stage", getEvolvedAscii());
  hideEl("setup-modal");

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
    bakePretzels(GameState.clickPower);
    render();
  });

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
      if (document.activeElement && document.activeElement.tagName === "INPUT") return;
      e.preventDefault();
      shootTarget();
    }
  });
}

function canAffordProject(proj) {
  if (proj.currency === "rp") {
    return GameState.researchPoints >= proj.cost;
  }
  return GameState.funds >= proj.cost;
}

function formatProjectCost(proj) {
  if (proj.currency === "rp") {
    return `${proj.cost} RP`;
  }
  return `$${proj.cost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
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
        const card = document.createElement("div");
        card.className = "project-card" + (affordable ? "" : " locked") + (proj.currency === "rp" ? " rp-card" : "");
        card.id = `proj-${proj.id}`;
        card.innerHTML = `
          <p><strong>${proj.title}</strong> (${formatProjectCost(proj)})</p>
          <p class="subtext">${proj.desc}</p>
          <button id="btn-${proj.id}" ${affordable ? "" : "disabled"}>Research</button>
        `;
        projectsList.appendChild(card);

        onClick(`btn-${proj.id}`, () => {
          if (canAffordProject(proj)) {
            if (proj.currency === "rp") {
              GameState.researchPoints -= proj.cost;
            } else {
              GameState.funds -= proj.cost;
            }
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
  const bakeRate = GameState.extruders * GameState.extruderSpeed;
  const maxDelivery = 1 + (GameState.trucks * GameState.truckCapacity) + (GameState.drones * GameState.droneCapacity);
  const effectiveDelivery = maxDelivery * (GameState.demand / 100);

  setText("pretzels-total", Math.floor(GameState.pretzels).toLocaleString());
  setText("inventory", Math.floor(GameState.inventory).toLocaleString());
  setText("funds", GameState.funds.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  setText("rp-total", Math.floor(GameState.researchPoints).toLocaleString());
  setText("price", GameState.price.toFixed(2));
  setText("demand", GameState.demand);
  setText("click-power", GameState.clickPower);

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

    const bakeRate = GameState.extruders * GameState.extruderSpeed;
    if (bakeRate > 0) {
      bakePretzels(bakeRate / 10);
    }

    if (GameState.inventory > 0) {
      const maxDelivery = 1 + (GameState.trucks * GameState.truckCapacity) + (GameState.drones * GameState.droneCapacity);
      const demandFactor = GameState.demand / 100;
      pendingSales += (maxDelivery * demandFactor) / 10;

      if (pendingSales >= 1) {
        const wantToSell = Math.floor(pendingSales);
        const actualSold = Math.min(GameState.inventory, wantToSell);
        if (actualSold > 0) {
          GameState.inventory -= actualSold;
          GameState.funds += actualSold * GameState.price;
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