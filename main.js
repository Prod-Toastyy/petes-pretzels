const THEME_STORAGE_KEY = "petes_pretzels_theme";
const COLLAPSED_SECTIONS_KEY = "petes_pretzels_collapsed_sections_v1";

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
const lastPlinkoSignature = { value: "" };

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
}

function toggleSectionCollapsed(sectionId) {
  const sec = getEl(sectionId);
  if (!sec) return;
  const nextCollapsed = !sec.classList.contains("collapsed");
  setSectionCollapsed(sectionId, nextCollapsed, true);
}

function triggerScreenShake() {
  document.body.classList.remove("screen-shake");
  void document.body.offsetWidth;
  document.body.classList.add("screen-shake");
  setTimeout(() => document.body.classList.remove("screen-shake"), 300);
}

function triggerConfettiStarBurst(centerX = window.innerWidth * 0.5, centerY = window.innerHeight * 0.4, count = 12) {
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

function triggerLevel25Juice(elementId) {
  triggerScreenShake();
  const target = getEl(elementId);
  if (target) {
    const rect = target.getBoundingClientRect();
    triggerConfettiStarBurst(rect.left + rect.width * 0.5, rect.top + rect.height * 0.4, 14);
  } else {
    triggerConfettiStarBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 14);
  }
}

function getUnlockedThemeTier() {
  const currentIdx = typeof GameState !== "undefined" ? (GameState.continentIndex || 0) : 0;
  const highestIdx = typeof GameState !== "undefined" ? (GameState.highestContinentReached || 0) : 0;
  return Math.max(currentIdx, highestIdx);
}

function isThemeUnlocked(themeObj) {
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

function refreshThemeDropdown() {
  const select = getEl("select-theme");
  if (!select) return;

  const currentTheme = localStorage.getItem(THEME_STORAGE_KEY) || "espresso";
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
}

function applyTheme(themeId) {
  const themeObj = THEMES_CATALOG.find(t => t.id === themeId) || THEMES_CATALOG[0];
  const safeTheme = isThemeUnlocked(themeObj) ? themeObj : THEMES_CATALOG[0];

  document.body.classList.remove(...ALL_THEME_CLASSES);
  if (safeTheme.id !== "espresso") {
    document.body.classList.add(`theme-${safeTheme.id}`);
  }
  localStorage.setItem(THEME_STORAGE_KEY, safeTheme.id);
  refreshThemeDropdown();
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
      descEl.innerHTML = `Territory complete! <strong>Prestige</strong> claims +${pendingGold} pending Golden Pretzels (${totalAfter} total) and restarts in North America while keeping unlocked themes. <strong>Full Wipe</strong> erases everything.`;
    } else {
      descEl.innerHTML = `<strong>Prestige</strong> restarts in North America while keeping all ${currentGold.toLocaleString()} Golden Pretzels (+${currentGold * 25}% cash), unlocked themes &amp; achievements. <strong>Full Wipe</strong> erases everything.`;
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
      "Are you sure you want to wipe your entire save? This permanently erases all pretzels, funds, upgrades, continents, Golden Pretzels, and achievements and returns to the title screen."
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
  const activeTheme = localStorage.getItem(THEME_STORAGE_KEY) || "espresso";
  const canClaimPending = typeof AchievementManager !== "undefined" && AchievementManager.canExpandContinent();
  const { totalGold, bonusGold } = GameState.prestigeRestartRun(canClaimPending);

  resetRegionalPanelsUI();
  updateDemand();
  applyTheme(activeTheme);
  applySessionUI();
  hideEl("confirm-action-modal");
  hideEl("restart-modal");

  const bonusNote = bonusGold > 0 ? ` (+${bonusGold} newly claimed)` : "";
  logMessage(`PRESTIGE RUN STARTED! Fresh start in North America with ${totalGold.toLocaleString()} Golden Pretzels${bonusNote} (+${totalGold * 25}% cash)!`);
  render();
}

function executeFullWipe() {
  if (typeof GameState !== "undefined" && typeof GameState.reset === "function") {
    GameState.reset(true);
  }
  localStorage.removeItem(COLLAPSED_SECTIONS_KEY);
  applyTheme("espresso");
  resetRegionalPanelsUI();
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

  initSetupPicker();
  showEl("title-intro-screen");
  render();
}

async function applyCloudUserSave(user) {
  refreshCloudMenuUI();
  if (typeof CloudSave === "undefined" || !user) return;

  const cloudSave = await CloudSave.loadFromCloud();
  if (cloudSave && cloudSave.started) {
    GameState.applySaveObject(cloudSave);
    sanitizeNumbers();
    updateDemand();
    refreshThemeDropdown();
    applySessionUI();
    logMessage(`Cloud save loaded for ${GameState.playerName}.`);
    render();
  } else if (GameState.started) {
    GameState.save(true);
    logMessage("Current save uploaded to cloud.");
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
  if (box) {
    box.classList.remove("tier-1", "tier-2", "tier-3", "tier-4");
    if (info.tier > 0) box.classList.add(`tier-${info.tier}`);
  }
  if (badgeId) setText(badgeId, info.label);
  if (nextId) setText(nextId, info.next ? `Next: ${prefix}${info.next}` : "MAX TIER");
  if (asciiElId && artKey) {
    setText(asciiElId, getModuleAsciiStage(artKey, info.tier));
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
  const base = gallery[GameState.selectedAsciiIndex] || gallery[0];
  const domPct = getDominanceForStage();
  const sparkFrame = ["✦", "✧", "★", "·"][Math.floor(Date.now() / 350) % 4];

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
  const asciiEl = getEl("ascii-stage");
  if (!asciiEl) return;

  asciiEl.classList.remove("ascii-sway", "ascii-anim-tier-1", "ascii-anim-tier-2", "ascii-anim-tier-3", "ascii-anim-king");
  if (domPct >= 100) {
    asciiEl.classList.add("ascii-anim-king");
  } else if (domPct >= 75) {
    asciiEl.classList.add("ascii-anim-tier-3");
  } else if (domPct >= 40) {
    asciiEl.classList.add("ascii-anim-tier-2");
  } else if (domPct >= 15) {
    asciiEl.classList.add("ascii-anim-tier-1");
  }
}

window.startGameFromModal = function() {
  const inputEl = getEl("input-player-name");
  const nameInput = inputEl ? inputEl.value.trim() : "";

  if (typeof GameState !== "undefined") {
    GameState.playerName = nameInput || "Baker";
    GameState.started = true;
    if (!GameState.runStartTime) GameState.runStartTime = Date.now();
    if (typeof GameState.save === "function") {
      GameState.save(true);
    }
  }

  setText("display-player-name", nameInput || "Baker");
  hideEl("title-intro-screen");
  hideEl("setup-modal");

  applySessionUI();
  logMessage(`Welcome, ${nameInput || "Baker"}. Kitchen is open.`);
  render();
};

function openEndingModal(records = {}) {
  const goldCount = GameState.goldenPretzels || 0;
  const runSecs = Math.floor(GameState.elapsedRunSeconds || 0);
  const bestSecs = Math.floor(GameState.bestRunSeconds || runSecs);
  const runPretzels = Math.floor(GameState.pretzels || 0);
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
    desc: "Unlocks high-stakes Plinko in R&D to win Dough or a rare 30s Golden Rush!",
    cashCost: 1200,
    rpCost: 10,
    trigger: () => GameState.unlockedMinigame && GameState.pretzels >= 1500,
    effect: () => {
      GameState.unlockedPlinko = true;
      showEl("panel-plinko");
      renderPlinkoBoard(true);
      logMessage("ASCII Plinko unlocked! Hit exact center [★] for Golden Rush.");
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

function bindHoldButton(id, actionFn) {
  const btn = getEl(id);
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
  if (!Number.isFinite(GameState.continentIndex)) GameState.continentIndex = 0;
  if (!Number.isFinite(GameState.highestContinentReached)) GameState.highestContinentReached = 0;
  GameState.highestContinentReached = Math.max(GameState.continentIndex, GameState.highestContinentReached);
  if (!Number.isFinite(GameState.goldenPretzels)) GameState.goldenPretzels = 0;
  if (!Number.isFinite(GameState.lifetimePretzelsAllRuns)) GameState.lifetimePretzelsAllRuns = 0;
  if (!Number.isFinite(GameState.runStartTime)) GameState.runStartTime = Date.now();
  if (!Number.isFinite(GameState.elapsedRunSeconds)) GameState.elapsedRunSeconds = 0;
  if (!Number.isFinite(GameState.bestRunSeconds)) GameState.bestRunSeconds = 0;
  if (!Number.isFinite(GameState.bestRunPretzels)) GameState.bestRunPretzels = 0;
  if (typeof GameState.goldUiUnlocked !== "boolean") GameState.goldUiUnlocked = false;
  if (typeof GameState.endingSeenForRun !== "boolean") GameState.endingSeenForRun = false;

  if (!Number.isFinite(GameState.pretzels)) GameState.pretzels = 0;
  if (!Number.isFinite(GameState.inventory)) GameState.inventory = 0;
  if (!Number.isFinite(GameState.funds)) GameState.funds = 0;
  if (!Number.isFinite(GameState.researchPoints)) GameState.researchPoints = 0;
  if (!Number.isFinite(GameState.rangeTargetCount) || GameState.rangeTargetCount < 1) GameState.rangeTargetCount = 1;
  if (GameState.rangeTargetCount > 5) GameState.rangeTargetCount = 5;
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

function isSupplyChainActivelyRunning() {
  if (!GameState.unlockedSupplyChain || !GameState.supplyChainEnabled) return false;
  return getSupplyPayrollPerSec() <= 0 || GameState.funds > 0;
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
  return Math.round((GameState.saltMineCost / 1.45) * 0.60 * 100) / 100;
}

function getWheatFarmSellValue() {
  if (GameState.wheatFarms <= 0) return 0;
  return Math.round((GameState.wheatFarmCost / 1.45) * 0.60 * 100) / 100;
}

function getRefinerySellValue() {
  if (GameState.refineries <= 0) return 0;
  return Math.round((GameState.refineryCost / 1.50) * 0.60 * 100) / 100;
}

function getTruckSellValue() {
  if (GameState.trucks <= 0) return 0;
  const prevBuyCost = GameState.truckCost / 1.48;
  return Math.round(prevBuyCost * 0.60 * 100) / 100;
}

function getDroneSellValue() {
  if (GameState.drones <= 0) return 0;
  const prevBuyCost = GameState.droneCost / 1.55;
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

window.handleManualBake = function() {
  if (typeof GameState === "undefined") return;
  if (GameState.dough < 1) {
    logMessage("Out of dough! Hand-knead flour or buy a fresh bag.");
    render();
    return;
  }
  const baked = bakePretzels(GameState.clickPower || 1);
  recordManualBakeRate(baked);
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

function updateDemand() {
  const recipe = getSafeRecipe();
  const promoTierMult = getModuleTierInfo(GameState.promoLevel).mult;
  const promoMult = (1 + ((GameState.promoLevel - 1) * 0.20)) * promoTierMult;
  const priceElasticity = Math.pow(0.50 / GameState.price, 1.18);
  const rawDemand = priceElasticity * 100 * GameState.demandBonus * recipe.demandMult * promoMult;
  GameState.demand = Math.max(1, Math.round(rawDemand));
}

function getDominanceForStage() {
  if (typeof AchievementManager !== "undefined" && typeof AchievementManager.getDominancePercent === "function") {
    return AchievementManager.getDominancePercent();
  }
  return 0;
}

function getEvolvedAscii() {
  const gallery = getGallery();
  const base = gallery[GameState.selectedAsciiIndex] || gallery[0];
  const domPct = getDominanceForStage();
  const sparkFrame = ["✦", "✧", "★", "·"][Math.floor(Date.now() / 350) % 4];

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
  const asciiEl = getEl("ascii-stage");
  if (!asciiEl) return;

  asciiEl.classList.remove("ascii-sway", "ascii-anim-tier-1", "ascii-anim-tier-2", "ascii-anim-tier-3", "ascii-anim-king");
  if (domPct >= 100) {
    asciiEl.classList.add("ascii-anim-king");
  } else if (domPct >= 75) {
    asciiEl.classList.add("ascii-anim-tier-3");
  } else if (domPct >= 40) {
    asciiEl.classList.add("ascii-anim-tier-2");
  } else if (domPct >= 15) {
    asciiEl.classList.add("ascii-anim-tier-1");
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
      el.classList.remove("hidden");
      el.style.left = `${positions[i]}%`;
    } else {
      el.classList.add("hidden");
    }
  }
}

function buildPlinkoBucketRow() {
  const slots = Array(PLINKO_INNER_COLS).fill(" ");
  const putToken = (startIdx, token) => {
    for (let i = 0; i < token.length; i++) {
      const idx = startIdx + i;
      if (idx >= 0 && idx < PLINKO_INNER_COLS) {
        slots[idx] = token[i];
      }
    }
  };

  putToken(1, "[X]");
  putToken(4, "[🌾]");
  putToken(7, "[★]");
  putToken(10, "[🌾]");
  putToken(13, "[X]");

  return `|${slots.join("")}|`;
}

function renderPlinkoBoard(force = false) {
  const boardEl = getEl("plinko-board");
  if (!boardEl) return;

  const dropCol = Math.max(1, Math.min(PLINKO_COLS - 2, Math.round(plinkoDropperPos)));
  const ballRow = plinkoBall ? plinkoBall.row : -1;
  const ballCol = plinkoBall ? plinkoBall.col : -1;
  const signature = `${dropCol}:${ballRow}:${ballCol}`;

  if (!force && lastPlinkoSignature.value === signature) return;
  lastPlinkoSignature.value = signature;

  const lines = [];
  const topRow = Array(PLINKO_INNER_COLS).fill(" ");
  if (!plinkoBall) {
    topRow[dropCol - 1] = "▼";
  } else if (plinkoBall.row === 0) {
    topRow[plinkoBall.col - 1] = "@";
  }
  lines.push(` ${topRow.join("")} `);

  for (let r = 1; r < PLINKO_ROWS; r++) {
    const rowChars = Array(PLINKO_INNER_COLS).fill(" ");
    for (let c = 1; c < PLINKO_INNER_COLS - 1; c++) {
      if ((r + c) % 2 === 1) {
        rowChars[c] = "·";
      }
    }
    if (plinkoBall && plinkoBall.row === r) {
      rowChars[plinkoBall.col - 1] = "@";
    }
    lines.push(`|${rowChars.join("")}|`);
  }

  lines.push(buildPlinkoBucketRow());
  boardEl.textContent = lines.join("\n");
}

function dropPlinkoPretzel() {
  if (!GameState.started || !GameState.unlockedPlinko) return;
  if (plinkoBall) return;
  if (GameState.inventory < PLINKO_COST) {
    setText("plinko-feedback", `Need ${PLINKO_COST} unsold pretzels to drop!`);
    return;
  }

  GameState.inventory -= PLINKO_COST;
  plinkoBall = {
    row: 0,
    col: Math.max(1, Math.min(PLINKO_COLS - 2, Math.round(plinkoDropperPos)))
  };
  plinkoStepTimer = 0;
  setText("plinko-feedback", "Dropping pretzel...");
  renderPlinkoBoard(true);
  render();
}

function resolvePlinkoBucket(finalCol) {
  if (finalCol >= 8 && finalCol <= 10) {
    GameState.goldenRushEndTime = Date.now() + 30000;
    setText("plinko-feedback", "RARE JACKPOT [★]! 30s GOLDEN RUSH!");
    logMessage("GOLDEN RUSH! 2x Cash & rare Golden Pretzels for 30s!");
    spawnFallingGoldenPretzel();
  } else if ((finalCol >= 4 && finalCol <= 7) || (finalCol >= 11 && finalCol <= 14)) {
    const freeDough = Math.max(250, Math.round((GameState.doughBatchSize || 500) * 0.5));
    GameState.dough += freeDough;
    setText("plinko-feedback", `LANDED IN [🌾]: Won +${freeDough.toLocaleString()} lbs Dough!`);
    logMessage(`Plinko Winner! Won +${freeDough.toLocaleString()} lbs of fresh dough.`);
  } else {
    setText("plinko-feedback", "LANDED IN [X]: Burnt pretzel! Nothing won.");
    logMessage("Plinko: Pretzel landed in the burnt [X] slot.");
  }
  render();
}

function spawnFallingGoldenPretzel() {
  const sky = getEl("golden-sky-layer");
  if (!sky || !GameState.isGoldenRushActive()) return;
  if (sky.childElementCount >= MAX_FALLING_PRETZELS) return;

  const el = document.createElement("button");
  el.type = "button";
  el.className = "falling-gold-pretzel";
  el.textContent = "🥨";
  el.title = "Click for Golden Pretzel Bonus!";

  const leftPct = 10 + Math.random() * 80;
  el.style.left = `${leftPct}%`;
  sky.appendChild(el);

  let collected = false;
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    if (collected) return;
    collected = true;

    const bakeRate = getEffectiveBakeRate();
    const reward = Math.max(
      25,
      Math.round(bakeRate * 15),
      Math.round(GameState.pretzels * 0.12)
    );

    GameState.pretzels += reward;
    GameState.inventory += reward;
    logMessage(`CAUGHT GOLDEN PRETZEL! +${reward.toLocaleString()} pretzels added!`);
    el.remove();
    render();
  });

  setTimeout(() => {
    if (el.parentNode) el.remove();
  }, 4600);
}

function shootTarget() {
  if (!GameState.started || !GameState.unlockedMinigame) return;

  const now = Date.now();
  if (now - lastShotTime < 140) return;
  lastShotTime = now;

  const trackEl = getEl("range-track");
  const targets = getActiveRangeTargets();
  let bestReward = 0;

  targets.forEach(targetPos => {
    const dist = Math.abs(crosshairPos - targetPos);
    if (dist <= 5.5) {
      bestReward = Math.max(bestReward, 3);
    } else if (dist <= 12) {
      bestReward = Math.max(bestReward, 1);
    }
  });

  if (trackEl) {
    trackEl.classList.remove("flash-hit", "flash-miss");
    void trackEl.offsetWidth;
  }

  if (bestReward >= 3) {
    GameState.researchPoints += 3;
    setText("range-feedback", `BULLSEYE! +3 RP (${targets.length} targets active)`);
    if (trackEl) trackEl.classList.add("flash-hit");
  } else if (bestReward >= 1) {
    GameState.researchPoints += 1;
    setText("range-feedback", `Nice graze! +1 RP (${targets.length} targets active)`);
    if (trackEl) trackEl.classList.add("flash-hit");
  } else {
    setText("range-feedback", "Missed! Keep firing.");
    if (trackEl) trackEl.classList.add("flash-miss");
  }

  render();
}

function initSetupPicker() {
  const grid = getEl("ascii-picker-grid");
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

function resetRegionalPanelsUI() {
  pendingSales = 0;
  cashFlowHistory = [];
  liveCashPerSec = 0;
  manualBakeHistory = [];
  plinkoBall = null;
  lastPlinkoSignature.value = "";
  lastTextCache.clear();

  document.body.classList.remove("golden-rush-active");
  hideEl("golden-rush-badge");
  hideEl("income-rate-line");
  hideEl("recipe-box");
  hideEl("btn-toggle-autodough");
  hideEl("panel-hand-dough");
  hideEl("panel-automation");
  hideEl("system-supply-chain");
  hideEl("refinery-rate-wrap");
  hideEl("system-delivery");
  hideEl("panel-trucks");
  hideEl("panel-drones");
  hideEl("panel-projects");
  hideEl("rp-badge");
  hideEl("panel-minigame");
  hideEl("panel-plinko");

  const projectsList = getEl("projects-list");
  if (projectsList) projectsList.innerHTML = "";

  applySavedSectionCollapseStates();
}

function applySessionUI() {
  setText("display-player-name", GameState.playerName);
  const domPct = getDominanceForStage();
  setText("ascii-stage", getEvolvedAscii());
  applyStageAnimationTier(domPct);
  hideEl("title-intro-screen");
  hideEl("setup-modal");

  refreshThemeDropdown();
  refreshRecipeDropdown();
  applySavedSectionCollapseStates();
  if (typeof AchievementManager !== "undefined") {
    AchievementManager.updateButtonCount();
  }

  if (GameState.unlockedIncomeTicker) showEl("income-rate-line");
  if (GameState.unlockedAutoDough) showEl("btn-toggle-autodough");
  if (GameState.unlockedAutomation) showEl("panel-automation");
  if (GameState.unlockedSupplyChain) {
    showEl("system-supply-chain");
    if (GameState.refineries > 0) showEl("refinery-rate-wrap");
  }
  if (GameState.unlockedTrucks || GameState.unlockedDrones) showEl("system-delivery");
  if (GameState.unlockedTrucks) showEl("panel-trucks");
  if (GameState.unlockedDrones) showEl("panel-drones");
  if (GameState.unlockedMinigame) {
    showEl("rp-badge");
    showEl("panel-minigame");
    updateRangeTargetsUI();
  }
  if (GameState.unlockedPlinko) {
    showEl("panel-plinko");
    renderPlinkoBoard(true);
  }
  if (GameState.completedProjects.length > 0 || GameState.pretzels >= 20) {
    showEl("panel-projects");
  }
}

function completeContinentExpansion() {
  if (typeof AchievementManager === "undefined" || !AchievementManager.canExpandContinent()) return;

  const prevIdx = GameState.continentIndex || 0;
  const isFinalEarthContinent = prevIdx === (typeof CONTINENTS !== "undefined" ? CONTINENTS.length - 1 : 6);
  const recordsBeforeReset = isFinalEarthContinent ? GameState.finalizeRunRecords() : {};
  const { earnedGold, conqueringFinalWorld } = GameState.expandToNextContinent();
  const newCont = GameState.getCurrentContinent();

  resetRegionalPanelsUI();
  updateDemand();
  applySessionUI();
  hideEl("achievements-modal");

  if (conqueringFinalWorld) {
    const fastRunSecs = recordsBeforeReset.runSecs || Math.floor(GameState.bestRunSeconds || 0);
    if (fastRunSecs > 0 && fastRunSecs <= 3600) {
      applyTheme("diamond-sparkly");
      logMessage(`SUB-HOUR EARTH CONQUEST! Unlocked Diamond Sparkly theme & banked +${earnedGold} Golden Pretzels [🥨★]!`);
    } else {
      applyTheme("gold-solid");
      logMessage(`EARTH CONQUERED! Unlocked Solid Gold UI & banked +${earnedGold} Golden Pretzels [🥨★]! Pete Pretzel sent a letter.`);
    }
    render();
    openEndingModal(recordsBeforeReset);
    return;
  }

  const unlockedTheme = THEMES_CATALOG.find(t => !t.requiresGoldUi && !t.requiresAllAchievements && !t.requiresSubHourWin && t.minContinent === (GameState.continentIndex || 0));
  const themeNotice = unlockedTheme ? ` New Theme Unlocked: ${unlockedTheme.name}!` : "";
  logMessage(`EXPANDED TO ${newCont.name.toUpperCase()}! Banked +${earnedGold} Golden Pretzels [🥨★]!${themeNotice}`);
  render();
}

function bindControls() {
  if (controlsBound) return;
  controlsBound = true;

  COLLAPSIBLE_SECTION_IDS.forEach(secId => {
    onClick(`btn-collapse-${secId}`, () => toggleSectionCollapsed(secId));
  });

  onClick("intro-pretzel-trigger", () => {
    hideEl("title-intro-screen");
    initSetupPicker();
    showEl("setup-modal");
  });

  onClick("btn-continue-current-world", () => {
    hideEl("ending-modal");
  });

  onClick("btn-prestige-next-loop", () => {
    hideEl("ending-modal");
    applyTheme(hasSubHourFullRunWin() ? "diamond-sparkly" : "gold-solid");
    logMessage("New Earth Prestige Loop started with all Golden Pretzels and themes intact!");
    render();
  });

  onClick("btn-bake", window.handleManualBake);

  onClick("btn-cloud-login", async () => {
    const email = (getEl("cloud-email")?.value || "").trim();
    const password = getEl("cloud-password")?.value || "";
    if (!email || !password) {
      setText("cloud-menu-msg", "Enter email and password.");
      return;
    }
    try {
      setText("cloud-menu-msg", "Logging in...");
      const data = await CloudSave.signIn(email, password);
      if (data?.user) {
        setText("cloud-menu-msg", "Logged in.");
        await applyCloudUserSave(data.user);
      }
    } catch (err) {
      setText("cloud-menu-msg", err.message || "Login failed.");
    }
  });

  onClick("btn-cloud-signup", async () => {
    const email = (getEl("cloud-email")?.value || "").trim();
    const password = getEl("cloud-password")?.value || "";
    if (!email || password.length < 6) {
      setText("cloud-menu-msg", "Enter email and a 6+ char password.");
      return;
    }
    try {
      setText("cloud-menu-msg", "Creating account...");
      const data = await CloudSave.signUp(email, password);
      if (data?.user && data?.session) {
        setText("cloud-menu-msg", "Account created and synced.");
        await applyCloudUserSave(data.user);
      } else {
        setText("cloud-menu-msg", "Check email to confirm, then log in.");
      }
    } catch (err) {
      setText("cloud-menu-msg", err.message || "Sign up failed.");
    }
  });

  onClick("btn-cloud-sync-now", () => {
    if (GameState.started && typeof CloudSave !== "undefined" && CloudSave.user) {
      GameState.save(true);
      setText("cloud-menu-msg", "Synced to cloud.");
    }
  });

  onClick("btn-cloud-logout", async () => {
    if (GameState.started && typeof CloudSave !== "undefined" && CloudSave.user) {
      GameState.save(true);
    }
    await CloudSave.signOut();
    refreshCloudMenuUI();
    setText("cloud-menu-msg", "Signed out of cloud.");
  });

  onClick("btn-buy-dough", () => {
    if (buyDoughBatch(false)) {
      GameState.save(true);
      render();
    }
  });

  onClick("btn-toggle-autodough", () => {
    GameState.autoDoughEnabled = !GameState.autoDoughEnabled;
    render();
  });

  onClick("btn-toggle-supply", () => {
    GameState.supplyChainEnabled = !GameState.supplyChainEnabled;
    logMessage(`Supply Chain workers ${GameState.supplyChainEnabled ? "resumed" : "paused"}.`);
    render();
  });

  onClick("btn-buy-salt-mine", () => {
    if (GameState.funds >= GameState.saltMineCost) {
      const prevTier = getModuleTierInfo(GameState.saltMines).tier;
      GameState.funds -= GameState.saltMineCost;
      GameState.saltMines += 1;
      GameState.saltMineCost = Math.round(GameState.saltMineCost * 1.45 * 100) / 100;
      const newTierInfo = getModuleTierInfo(GameState.saltMines);
      if (newTierInfo.tier > prevTier) {
        logMessage(`MILESTONE! Rock Salt Mines reached ${newTierInfo.label} extraction!`);
        if (GameState.saltMines === 25) triggerLevel25Juice("module-salt-mine");
      }
      GameState.save(true);
      render();
    }
  });

  onClick("btn-sell-salt-mine", () => {
    if (GameState.saltMines > 0) {
      const refund = getSaltMineSellValue();
      GameState.saltMines -= 1;
      GameState.funds += refund;
      const baseCost = Math.round(2500.00 * GameState.getCurrentContinent().costScale * 100) / 100;
      GameState.saltMineCost = GameState.saltMines === 0
        ? baseCost
        : Math.round((GameState.saltMineCost / 1.45) * 100) / 100;
      logMessage(`Sold 1 Rock Salt Mine for +$${refund.toFixed(2)}.`);
      GameState.save(true);
      render();
    }
  });

  onClick("btn-buy-wheat-farm", () => {
    if (GameState.funds >= GameState.wheatFarmCost) {
      const prevTier = getModuleTierInfo(GameState.wheatFarms).tier;
      GameState.funds -= GameState.wheatFarmCost;
      GameState.wheatFarms += 1;
      GameState.wheatFarmCost = Math.round(GameState.wheatFarmCost * 1.45 * 100) / 100;
      const newTierInfo = getModuleTierInfo(GameState.wheatFarms);
      if (newTierInfo.tier > prevTier) {
        logMessage(`MILESTONE! Winter Wheat Fields reached ${newTierInfo.label} harvest!`);
        if (GameState.wheatFarms === 25) triggerLevel25Juice("module-wheat-farm");
      }
      GameState.save(true);
      render();
    }
  });

  onClick("btn-sell-wheat-farm", () => {
    if (GameState.wheatFarms > 0) {
      const refund = getWheatFarmSellValue();
      GameState.wheatFarms -= 1;
      GameState.funds += refund;
      const baseCost = Math.round(4000.00 * GameState.getCurrentContinent().costScale * 100) / 100;
      GameState.wheatFarmCost = GameState.wheatFarms === 0
        ? baseCost
        : Math.round((GameState.wheatFarmCost / 1.45) * 100) / 100;
      logMessage(`Sold 1 Winter Wheat Field for +$${refund.toFixed(2)}.`);
      GameState.save(true);
      render();
    }
  });

  onClick("btn-buy-refinery", () => {
    if (GameState.funds >= GameState.refineryCost) {
      const prevTier = getModuleTierInfo(GameState.refineries).tier;
      GameState.funds -= GameState.refineryCost;
      GameState.refineries += 1;
      GameState.refineryCost = Math.round(GameState.refineryCost * 1.50 * 100) / 100;
      const newTierInfo = getModuleTierInfo(GameState.refineries);
      if (newTierInfo.tier > prevTier) {
        logMessage(`MILESTONE! Dough Refineries reached ${newTierInfo.label} throughput!`);
        if (GameState.refineries === 25) triggerLevel25Juice("module-refinery");
      }
      showEl("refinery-rate-wrap");
      GameState.save(true);
      render();
    }
  });

  onClick("btn-sell-refinery", () => {
    if (GameState.refineries > 0) {
      const refund = getRefinerySellValue();
      GameState.refineries -= 1;
      GameState.funds += refund;
      const baseCost = Math.round(8500.00 * GameState.getCurrentContinent().costScale * 100) / 100;
      GameState.refineryCost = GameState.refineries === 0
        ? baseCost
        : Math.round((GameState.refineryCost / 1.50) * 100) / 100;
      if (GameState.refineries === 0) hideEl("refinery-rate-wrap");
      logMessage(`Sold 1 Dough Refinery for +$${refund.toFixed(2)}.`);
      GameState.save(true);
      render();
    }
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

  onClick("btn-expand-continent", completeContinentExpansion);

  onClick("player-badge", () => {
    refreshThemeDropdown();
    refreshCloudMenuUI();
    refreshPrestigeMenuUI();
    setText("cloud-menu-msg", "");
    showEl("restart-modal");
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
    showEl("restart-modal");
  });

  onClick("btn-execute-confirm-modal", () => {
    const action = pendingConfirmAction;
    pendingConfirmAction = null;
    if (action === "prestige") {
      executePrestigeRun();
    } else if (action === "wipe") {
      executeFullWipe();
    }
  });

  onClick("btn-close-restart", () => {
    hideEl("restart-modal");
  });

  onClick("btn-cancel-restart", () => {
    hideEl("restart-modal");
  });

  const themeSelect = getEl("select-theme");
  if (themeSelect) {
    themeSelect.addEventListener("change", (e) => {
      applyTheme(e.target.value);
    });
  }

  onClick("btn-buy-promo", () => {
    if (GameState.funds >= GameState.promoCost) {
      const prevTier = getModuleTierInfo(GameState.promoLevel).tier;
      GameState.funds -= GameState.promoCost;
      GameState.promoLevel += 1;
      GameState.promoCost = Math.round(GameState.promoCost * 1.75 * 100) / 100;
      const newTierInfo = getModuleTierInfo(GameState.promoLevel);
      updateDemand();
      if (newTierInfo.tier > prevTier) {
        logMessage(`MILESTONE! Marketing reached ${newTierInfo.label} Demand!`);
        if (GameState.promoLevel === 25) triggerLevel25Juice("module-promo");
      } else {
        logMessage(`Marketing upgraded to Level ${GameState.promoLevel}!`);
      }
      GameState.save(true);
      render();
    }
  });

  const recipeSelect = getEl("select-recipe");
  if (recipeSelect) {
    recipeSelect.addEventListener("change", (e) => {
      GameState.activeRecipe = e.target.value;
      updateDemand();
      const r = getSafeRecipe();
      logMessage(`Switched ovens to ${r.name}.`);
      render();
    });
  }

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
      const prevTier = getModuleTierInfo(GameState.extruders).tier;
      GameState.funds -= GameState.extruderCost;
      GameState.extruders += 1;
      GameState.extruderCost = Math.round(GameState.extruderCost * 1.42 * 100) / 100;
      const newTierInfo = getModuleTierInfo(GameState.extruders);
      if (newTierInfo.tier > prevTier) {
        logMessage(`MILESTONE! Auto-Extruders reached ${newTierInfo.label} output!`);
        if (GameState.extruders === 25) triggerLevel25Juice("panel-automation");
      }
      GameState.save(true);
      render();
    }
  });

  onClick("btn-buy-truck", () => {
    if (GameState.funds >= GameState.truckCost) {
      const prevTier = getModuleTierInfo(GameState.trucks).tier;
      GameState.funds -= GameState.truckCost;
      GameState.trucks += 1;
      GameState.truckCost = Math.round(GameState.truckCost * 1.48 * 100) / 100;
      const newTierInfo = getModuleTierInfo(GameState.trucks);
      if (newTierInfo.tier > prevTier) {
        logMessage(`MILESTONE! Delivery Trucks reached ${newTierInfo.label} capacity!`);
        if (GameState.trucks === 25) triggerLevel25Juice("panel-trucks");
      }
      GameState.save(true);
      render();
    }
  });

  onClick("btn-sell-truck", () => {
    if (GameState.trucks > 0) {
      const refund = getTruckSellValue();
      GameState.trucks -= 1;
      GameState.funds += refund;
      const baseCost = Math.round(250.00 * GameState.getCurrentContinent().costScale * 100) / 100;
      GameState.truckCost = GameState.trucks === 0
        ? baseCost
        : Math.round((GameState.truckCost / 1.48) * 100) / 100;
      logMessage(`Sold 1 Delivery Truck for +$${refund.toFixed(2)}.`);
      GameState.save(true);
      render();
    }
  });

  onClick("btn-buy-drone", () => {
    if (GameState.funds >= GameState.droneCost) {
      const prevTier = getModuleTierInfo(GameState.drones).tier;
      GameState.funds -= GameState.droneCost;
      GameState.drones += 1;
      GameState.droneCost = Math.round(GameState.droneCost * 1.55 * 100) / 100;
      const newTierInfo = getModuleTierInfo(GameState.drones);
      if (newTierInfo.tier > prevTier) {
        logMessage(`MILESTONE! Pretzel Drones reached ${newTierInfo.label} capacity!`);
        if (GameState.drones === 25) triggerLevel25Juice("panel-drones");
      }
      GameState.save(true);
      render();
    }
  });

  onClick("btn-sell-drone", () => {
    if (GameState.drones > 0) {
      const refund = getDroneSellValue();
      GameState.drones -= 1;
      GameState.funds += refund;
      const baseCost = Math.round(5000.00 * GameState.getCurrentContinent().costScale * 100) / 100;
      GameState.droneCost = GameState.drones === 0
        ? baseCost
        : Math.round((GameState.droneCost / 1.55) * 100) / 100;
      logMessage(`Sold 1 Pretzel Drone for +$${refund.toFixed(2)}.`);
      GameState.save(true);
      render();
    }
  });

  onClick("btn-shoot-target", shootTarget);
  onClick("btn-drop-plinko", dropPlinkoPretzel);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideEl("achievements-modal");
      hideEl("confirm-action-modal");
      hideEl("restart-modal");
      return;
    }
    if (e.code === "Space" && GameState.started && GameState.unlockedMinigame) {
      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT")) return;
      e.preventDefault();
      shootTarget();
    }
  });
}

function canAffordProject(proj) {
  const scale = typeof GameState.getCurrentContinent === "function" ? GameState.getCurrentContinent().costScale : 1;
  const scaledCash = Math.round((proj.cashCost || 0) * scale * 100) / 100;
  const hasCash = GameState.funds >= scaledCash;
  const hasRP = GameState.researchPoints >= (proj.rpCost || 0);
  return hasCash && hasRP;
}

function getScaledProjectCash(proj) {
  const scale = typeof GameState.getCurrentContinent === "function" ? GameState.getCurrentContinent().costScale : 1;
  return Math.round((proj.cashCost || 0) * scale * 100) / 100;
}

function formatProjectCost(proj) {
  const parts = [];
  const scaledCash = getScaledProjectCash(proj);
  if (scaledCash > 0) {
    parts.push(`$${scaledCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
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

  const projectsList = getEl("projects-list");
  if (!projectsList) return;

  Projects.forEach(proj => {
    const meetsContinent = !proj.minContinent || (GameState.continentIndex || 0) >= proj.minContinent;
    if (!GameState.completedProjects.includes(proj.id) && meetsContinent && proj.trigger()) {
      showEl("panel-projects");

      if (!getEl(`proj-${proj.id}`)) {
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
            const scaledCash = getScaledProjectCash(proj);
            if (scaledCash > 0) GameState.funds -= scaledCash;
            if (proj.rpCost > 0) GameState.researchPoints -= proj.rpCost;
            GameState.completedProjects.push(proj.id);
            proj.effect();
            card.remove();
            GameState.save(true);
            render();
          }
        });
      }
    }
  });
}

function render() {
  refreshThemeDropdown();

  const promoTier = applyModuleTierUI("module-promo", "promo-tier-badge", "promo-next", GameState.promoLevel, "Lvl ", "promo-ascii", "marketing");
  const extruderTier = applyModuleTierUI("panel-automation", "extruder-tier-badge", "extruder-next", GameState.extruders, "", "extruder-ascii", "extruder");
  const truckTier = applyModuleTierUI("panel-trucks", "truck-tier-badge", "truck-next", GameState.trucks, "", "truck-ascii", "truck");
  const droneTier = applyModuleTierUI("panel-drones", "drone-tier-badge", "drone-next", GameState.drones, "", "drone-ascii", "drone");

  const saltTier = applyModuleTierUI("module-salt-mine", "salt-mine-tier-badge", "salt-mine-next", GameState.saltMines, "", "salt-mine-ascii", "saltMine");
  const wheatTier = applyModuleTierUI("module-wheat-farm", "wheat-farm-tier-badge", "wheat-farm-next", GameState.wheatFarms, "", "wheat-farm-ascii", "wheatFarm");
  const refineryTier = applyModuleTierUI("module-refinery", "refinery-tier-badge", "refinery-next", GameState.refineries, "", "refinery-ascii", "refinery");

  if (typeof GameState.getCurrentContinent === "function") {
    const cont = GameState.getCurrentContinent();
    setText("header-continent-name", cont.name);
    const goldCount = GameState.goldenPretzels || 0;
    if (goldCount > 0) {
      showEl("header-gold-pill");
      setText("header-gold-count", goldCount.toLocaleString());
      setText("header-gold-bonus", `+${goldCount * 25}%`);
    } else {
      hideEl("header-gold-pill");
    }
  }

  const currentContIdx = GameState.continentIndex || 0;
  const availableProjects = Projects.filter(p => !p.minContinent || currentContIdx >= p.minContinent);
  const completedAvailableCount = availableProjects.filter(p => GameState.completedProjects.includes(p.id)).length;
  setText("rd-completed-count", completedAvailableCount);
  setText("rd-total-count", availableProjects.length);

  if (GameState.unlockedMinigame) {
    updateRangeTargetsUI();
  }

  const bakeRate = getEffectiveBakeRate();
  const maxDelivery = getEffectiveMaxDelivery();
  const effectiveDelivery = maxDelivery * (GameState.demand / 100);
  const netPrice = getEffectivePriceSafe();
  const formattedFunds = GameState.funds.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const wholeInventory = Math.floor(GameState.inventory);
  const wholeDough = Math.floor(GameState.dough);
  const batchSize = GameState.doughBatchSize || 500;

  const rushRemainingMs = (GameState.goldenRushEndTime || 0) - Date.now();
  if (rushRemainingMs > 0) {
    document.body.classList.add("golden-rush-active");
    showEl("golden-rush-badge");
    setText("golden-rush-timer", Math.ceil(rushRemainingMs / 1000));
  } else {
    document.body.classList.remove("golden-rush-active");
    hideEl("golden-rush-badge");
  }

  setText("top-funds", formattedFunds);
  setText("pretzels-total", Math.floor(GameState.pretzels).toLocaleString());
  setText("inventory", wholeInventory.toLocaleString());
  setText("rp-total", Math.floor(GameState.researchPoints).toLocaleString());
  setText("price", GameState.price.toFixed(2));
  setText("effective-price", netPrice.toFixed(2));
  setText("demand", GameState.demand);
  setText("click-power", GameState.clickPower);

  const invEl = getEl("inventory");
  if (invEl) invEl.classList.toggle("zero-danger", wholeInventory <= 0);

  const doughEl = getEl("dough-amount");
  if (doughEl) doughEl.classList.toggle("zero-danger", wholeDough <= 0);

  const incomeLineEl = getEl("income-rate-line");
  if (GameState.unlockedIncomeTicker && incomeLineEl) {
    showEl("income-rate-line");
    const isNeg = liveCashPerSec < -0.005;
    incomeLineEl.classList.toggle("negative-flow", isNeg);
    setText("income-sign", isNeg ? "-$" : "+$");
    setText("income-per-sec", Math.abs(liveCashPerSec).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }

  if (GameState.unlockedSupplyChain) {
    showEl("system-supply-chain");
    const totalPayroll = getSupplyPayrollPerSec();
    const { saltPerSec, wheatPerSec, doughPerSec } = getActiveSupplyRates();

    setText("salt-stock", Math.floor(GameState.salt).toLocaleString());
    setText("wheat-stock", Math.floor(GameState.wheat).toLocaleString());
    setText("salt-active-rate", Math.floor(saltPerSec).toLocaleString());
    setText("wheat-active-rate", Math.floor(wheatPerSec).toLocaleString());
    setText("dough-active-rate", Math.floor(doughPerSec).toLocaleString());
    setText("supply-payroll-badge", totalPayroll.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

    if (GameState.refineries > 0) {
      showEl("refinery-rate-wrap");
      setText("refinery-active-rate", Math.floor(doughPerSec).toLocaleString());
    } else {
      hideEl("refinery-rate-wrap");
    }

    const toggleSupplyBtn = getEl("btn-toggle-supply");
    if (toggleSupplyBtn) {
      toggleSupplyBtn.textContent = `Operations: ${GameState.supplyChainEnabled ? "ON" : "OFF"}`;
    }

    const saltPayroll = getFacilityPayrollPerSec(GameState.saltMines, SALT_BASE_PAYROLL);
    const effectiveSaltMult = saltTier.mult * (GameState.saltRateMult || 1);
    setText("salt-mine-count", GameState.saltMines);
    setText("salt-mine-cost", GameState.saltMineCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setText("salt-mine-sell-val", getSaltMineSellValue().toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setText("salt-mine-rate", (SALT_BASE_RATE * effectiveSaltMult).toLocaleString());
    setText("salt-mine-payroll", saltPayroll.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setDisabled("btn-buy-salt-mine", GameState.funds < GameState.saltMineCost);
    setDisabled("btn-sell-salt-mine", GameState.saltMines <= 0);

    const wheatPayroll = getFacilityPayrollPerSec(GameState.wheatFarms, WHEAT_BASE_PAYROLL);
    const effectiveWheatMult = wheatTier.mult * (GameState.wheatRateMult || 1);
    setText("wheat-farm-count", GameState.wheatFarms);
    setText("wheat-farm-cost", GameState.wheatFarmCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setText("wheat-farm-sell-val", getWheatFarmSellValue().toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setText("wheat-farm-rate", (WHEAT_BASE_RATE * effectiveWheatMult).toLocaleString());
    setText("wheat-farm-payroll", wheatPayroll.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setDisabled("btn-buy-wheat-farm", GameState.funds < GameState.wheatFarmCost);
    setDisabled("btn-sell-wheat-farm", GameState.wheatFarms <= 0);

    const refineryPayroll = getFacilityPayrollPerSec(GameState.refineries, REFINERY_BASE_PAYROLL);
    const effectiveRefineryMult = refineryTier.mult * (GameState.refineryRateMult || 1);
    setText("refinery-count", GameState.refineries);
    setText("refinery-cost", GameState.refineryCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setText("refinery-sell-val", getRefinerySellValue().toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setText("refinery-rate", (REFINERY_BASE_RATE * effectiveRefineryMult).toLocaleString());
    setText("refinery-payroll", refineryPayroll.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setDisabled("btn-buy-refinery", GameState.funds < GameState.refineryCost);
    setDisabled("btn-sell-refinery", GameState.refineries <= 0);
  }

  const canAffordDough = GameState.funds >= GameState.doughCost;
  const autoBuyerActive = Boolean(GameState.unlockedAutoDough && GameState.autoDoughEnabled);
  const isOutAndBroke = GameState.dough < 1 && !canAffordDough && !autoBuyerActive;
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

  setDisabled("btn-drop-plinko", Boolean(plinkoBall) || wholeInventory < PLINKO_COST);

  const doughStatus = getEl("dough-status");
  if (doughStatus) {
    if (autoBuyerActive) {
      doughStatus.textContent = "1 lb dough = 1 pretzel";
      doughStatus.style.color = "";
    } else if (GameState.dough < 1 && canAffordDough) {
      doughStatus.textContent = "Out of dough! Click Buy above to restock.";
      doughStatus.style.color = "#e89f48";
    } else if (GameState.dough < 1) {
      doughStatus.textContent = "OUT OF DOUGH & FUNDS! Use Emergency Maker.";
      doughStatus.style.color = "#ff6b5b";
    } else {
      doughStatus.textContent = "1 lb dough = 1 pretzel";
      doughStatus.style.color = "";
    }
  }

  const autoBtn = getEl("btn-toggle-autodough");
  if (autoBtn && GameState.unlockedAutoDough) {
    autoBtn.textContent = `Auto-Buyer: ${GameState.autoDoughEnabled ? "ON" : "OFF"}`;
  }

  const totalPromoPct = Math.round(((1 + (GameState.promoLevel - 1) * 0.20) * promoTier.mult - 1) * 100);
  setText("promo-level", GameState.promoLevel);
  setText("promo-cost", GameState.promoCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  setText("promo-bonus", `+${totalPromoPct}%`);
  setDisabled("btn-buy-promo", GameState.funds < GameState.promoCost);

  setText("bake-rate", bakeRate.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
  setText("sell-rate", effectiveDelivery.toFixed(1));

  setText("extruder-count", GameState.extruders);
  setText("extruder-cost", GameState.extruderCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  setText("extruder-rate", (GameState.extruderSpeed * extruderTier.mult).toLocaleString());
  setDisabled("btn-buy-extruder", GameState.funds < GameState.extruderCost);

  const truckSellVal = getTruckSellValue();
  setText("truck-count", GameState.trucks);
  setText("truck-cost", GameState.truckCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  setText("truck-sell-val", truckSellVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  setText("truck-rate", (GameState.truckCapacity * truckTier.mult).toLocaleString());
  setDisabled("btn-buy-truck", GameState.funds < GameState.truckCost);
  setDisabled("btn-sell-truck", GameState.trucks <= 0);

  const droneSellVal = getDroneSellValue();
  setText("drone-count", GameState.drones);
  setText("drone-cost", GameState.droneCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  setText("drone-sell-val", droneSellVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  setText("drone-rate", (GameState.droneCapacity * droneTier.mult).toLocaleString());
  setDisabled("btn-buy-drone", GameState.funds < GameState.droneCost);
  setDisabled("btn-sell-drone", GameState.drones <= 0);

  const domPct = getDominanceForStage();
  const asciiEl = getEl("ascii-stage");
  if (asciiEl) {
    const evolved = getEvolvedAscii();
    if (asciiEl.textContent !== evolved) asciiEl.textContent = evolved;
    applyStageAnimationTier(domPct);
  }

  Projects.forEach(proj => {
    const card = getEl(`proj-${proj.id}`);
    const btn = getEl(`btn-${proj.id}`);
    if (card && btn) {
      const unaffordable = !canAffordProject(proj);
      btn.disabled = unaffordable;
      card.classList.toggle("locked", unaffordable);
    }
  });
}

function animateMinigames(timestamp) {
  if (lastAnimTime === null) lastAnimTime = timestamp;
  const dt = Math.min((timestamp - lastAnimTime) / 1000, 0.05);
  lastAnimTime = timestamp;

  if (GameState.started) {
    if (GameState.unlockedMinigame) {
      rangeAnimClock += dt;
      const speedPercentPerSec = 95;
      crosshairPos += crosshairDir * speedPercentPerSec * dt;

      if (crosshairPos >= 94) {
        crosshairPos = 94;
        crosshairDir = -1;
      } else if (crosshairPos <= 6) {
        crosshairPos = 6;
        crosshairDir = 1;
      }

      const ch = getEl("range-crosshair");
      if (ch) {
        ch.style.left = `${crosshairPos}%`;
        ch.style.transform = "translate(-50%, -50%)";
      }
      updateRangeTargetsUI();
    }

    if (GameState.unlockedPlinko) {
      if (!plinkoBall) {
        const dropperSpeedColsPerSec = 17;
        plinkoDropperPos += plinkoDropperDir * dropperSpeedColsPerSec * dt;
        if (plinkoDropperPos >= PLINKO_COLS - 2) {
          plinkoDropperPos = PLINKO_COLS - 2;
          plinkoDropperDir = -1;
        } else if (plinkoDropperPos <= 1) {
          plinkoDropperPos = 1;
          plinkoDropperDir = 1;
        }
        renderPlinkoBoard();
      } else {
        plinkoStepTimer += dt;
        if (plinkoStepTimer >= 0.14) {
          plinkoStepTimer = 0;
          plinkoBall.row += 1;

          let leftChance = 0.5;
          if (plinkoBall.col >= 7 && plinkoBall.col <= 8) leftChance = 0.72;
          else if (plinkoBall.col >= 10 && plinkoBall.col <= 11) leftChance = 0.28;
          else if (plinkoBall.col < 7) leftChance = 0.60;
          else if (plinkoBall.col > 11) leftChance = 0.40;

          const nudge = Math.random() < leftChance ? -1 : 1;
          plinkoBall.col = Math.max(1, Math.min(PLINKO_COLS - 2, plinkoBall.col + nudge));
          renderPlinkoBoard();

          if (plinkoBall.row >= PLINKO_ROWS) {
            const landedCol = plinkoBall.col;
            plinkoBall = null;
            resolvePlinkoBucket(landedCol);
            renderPlinkoBoard(true);
          }
        }
      }
    }

    const achModal = getEl("achievements-modal");
    if (achModal && !achModal.classList.contains("hidden") && typeof renderSpinningGlobe === "function") {
      globeSpinTimer += dt;
      if (globeSpinTimer >= 0.16) {
        globeSpinTimer = 0;
        globeSpinOffset = (globeSpinOffset + 1) % 30;
        renderSpinningGlobe();
      }
    }
  }

  requestAnimationFrame(animateMinigames);
}

async function bootGame() {
  if (typeof GameState === "undefined") {
    logMessage("Error: state.js did not load. Check file folder.");
    return;
  }

  const offlineSeconds = GameState.load();
  sanitizeNumbers();

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "espresso";
  applyTheme(savedTheme);
  applySavedSectionCollapseStates();

  updateDemand();
  initSetupPicker();
  bindControls();

  if (typeof CloudSave !== "undefined") {
    CloudSave.init();
    const sessionUser = await CloudSave.getSessionUser();
    refreshCloudMenuUI();
    if (sessionUser) {
      await applyCloudUserSave(sessionUser);
    }
  }

  if (GameState.started) {
    applySessionUI();
    if (offlineSeconds > 5) {
      const cappedNote = offlineSeconds >= 86400 ? " (24h max)" : "";
      logMessage(`Welcome back, ${GameState.playerName}! Bakery ran for ${formatDuration(offlineSeconds)}${cappedNote} while away.`);
    } else {
      logMessage(`Welcome back, ${GameState.playerName}.`);
    }
  } else {
    hideEl("setup-modal");
    showEl("title-intro-screen");
  }

  render();
  renderPlinkoBoard(true);
  requestAnimationFrame(animateMinigames);

  let subsecondAccumulator = 0;

  setInterval(() => {
    if (!GameState.started) return;

    subsecondAccumulator += 0.1;
    if (subsecondAccumulator >= 1) {
      const wholeSecs = Math.floor(subsecondAccumulator);
      subsecondAccumulator -= wholeSecs;
      GameState.recordRunProgress(wholeSecs);
    }

    let tickNetCash = 0;
    let tickRefinedDough = 0;

    if (GameState.unlockedSupplyChain && GameState.supplyChainEnabled) {
      const tickPayroll = getSupplyPayrollPerSec() / 10;
      if (tickPayroll <= 0 || GameState.funds >= tickPayroll) {
        if (tickPayroll > 0) {
          GameState.funds -= tickPayroll;
          tickNetCash -= tickPayroll;
        }

        const saltMult = getModuleTierInfo(GameState.saltMines).mult * (GameState.saltRateMult || 1);
        const wheatMult = getModuleTierInfo(GameState.wheatFarms).mult * (GameState.wheatRateMult || 1);
        const refineryMult = getModuleTierInfo(GameState.refineries).mult * (GameState.refineryRateMult || 1);

        GameState.salt += (GameState.saltMines * SALT_BASE_RATE * saltMult) / 10;
        GameState.wheat += (GameState.wheatFarms * WHEAT_BASE_RATE * wheatMult) / 10;

        if (GameState.refineries > 0) {
          const maxRefineCapacity = (GameState.refineries * REFINERY_BASE_RATE * refineryMult) / 10;
          const actualRefined = Math.min(maxRefineCapacity, GameState.salt, GameState.wheat);
          if (actualRefined > 0) {
            GameState.salt -= actualRefined;
            GameState.wheat -= actualRefined;
            GameState.dough += actualRefined;
            tickRefinedDough = actualRefined;
          }
        }
      }
    }

    const batchSize = GameState.doughBatchSize || 500;
    const autoThreshold = Math.max(100, batchSize * 0.25);
    if (GameState.unlockedAutoDough && GameState.autoDoughEnabled && GameState.dough < autoThreshold) {
      buyDoughBatch(true);
    }

    const extruderMult = getModuleTierInfo(GameState.extruders).mult;
    const rawBakeRate = GameState.extruders * GameState.extruderSpeed * extruderMult;
    if (rawBakeRate > 0) {
      const requestedTickBake = rawBakeRate / 10;
      const fromExistingDough = Math.min(GameState.dough, requestedTickBake);
      if (fromExistingDough > 0) {
        bakePretzels(fromExistingDough);
      }
      const leftoverNeed = requestedTickBake - fromExistingDough;
      if (leftoverNeed > 0 && tickRefinedDough > 0) {
        bakePretzels(Math.min(GameState.dough, tickRefinedDough, leftoverNeed));
      }
    }

    if (GameState.inventory > 0) {
      const maxDelivery = getEffectiveMaxDelivery();
      const demandFactor = GameState.demand / 100;
      const netPrice = getEffectivePriceSafe();
      pendingSales += (maxDelivery * demandFactor) / 10;

      if (pendingSales >= 1) {
        const wantToSell = Math.floor(pendingSales);
        const actualSold = Math.min(GameState.inventory, wantToSell);
        if (actualSold > 0) {
          GameState.inventory -= actualSold;
          const salesCash = actualSold * netPrice;
          GameState.funds += salesCash;
          tickNetCash += salesCash;
          pendingSales -= actualSold;
        }
      }
    } else {
      pendingSales = 0;
    }

    GameState.recordRunProgress(0);

    const nowMs = Date.now();
    if (tickNetCash !== 0) {
      cashFlowHistory.push({ time: nowMs, amount: tickNetCash });
    }
    const windowMs = 4000;
    cashFlowHistory = cashFlowHistory.filter(entry => nowMs - entry.time <= windowMs);
    const totalWindowCash = cashFlowHistory.reduce((sum, entry) => sum + entry.amount, 0);
    const rawWindowRate = totalWindowCash / (windowMs / 1000);
    liveCashPerSec = (liveCashPerSec * 0.85) + (rawWindowRate * 0.15);

    if (GameState.isGoldenRushActive() && Math.random() < 0.025) {
      spawnFallingGoldenPretzel();
    }

    checkUnlocks();
    if (typeof AchievementManager !== "undefined") {
      AchievementManager.checkAll();
      AchievementManager.updateButtonCount();
    }
    render();
  }, 100);

  setInterval(() => {
    if (GameState.started) GameState.save(true);
  }, 15000);

  window.addEventListener("beforeunload", () => {
    if (GameState.started) GameState.save(true);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootGame);
} else {
  bootGame();
}