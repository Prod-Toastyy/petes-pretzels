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
    check: (s) => (typeof s.getTotalLifetimePretzelsAllRuns === "function" ? s.getTotalLifetimePretzelsAllRuns() : ((s.lifetimePretzelsAllRuns || 0) + (s.pretzels || 0))) >= 10000000
  },
  {
    id: "first_conquest",
    icon: "[🌎]",
    title: "Beyond Borders",
    desc: "Conquer North America and expand to South America.",
    check: (s) => Math.max(s.continentIndex || 0, s.highestContinentReached || 0) >= 1
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
    check: (s) => (typeof s.getTotalLifetimePretzelsAllRuns === "function" ? s.getTotalLifetimePretzelsAllRuns() : ((s.lifetimePretzelsAllRuns || 0) + (s.pretzels || 0))) >= 100000000
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
    check: (s) => Math.max(s.continentIndex || 0, s.highestContinentReached || 0) >= 3
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
    check: (s) => (typeof s.getTotalLifetimePretzelsAllRuns === "function" ? s.getTotalLifetimePretzelsAllRuns() : ((s.lifetimePretzelsAllRuns || 0) + (s.pretzels || 0))) >= 1000000000
  },
  {
    id: "world_conqueror",
    icon: "[🌐]",
    title: "World Domination",
    desc: "Conquer all 7 continents and enter Global Franchise mode.",
    check: (s) => Math.max(s.continentIndex || 0, s.highestContinentReached || 0) >= 7
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
    check: (s) => (typeof s.getTotalLifetimePretzelsAllRuns === "function" ? s.getTotalLifetimePretzelsAllRuns() : ((s.lifetimePretzelsAllRuns || 0) + (s.pretzels || 0))) >= 10000000000
  }
];

const LEADERBOARD_VERSION = "BETA.14";
const OLD_SHOPS_KEY = "petes_pretzels_old_shops_v1";
const LEADERBOARD_MAX_ROWS = 10;
const LEADERBOARD_PUSH_INTERVAL_MS = 60 * 1000;   // post my score at most once a minute (only if it changed)
const LEADERBOARD_FETCH_INTERVAL_MS = 30 * 1000;  // refresh the board every 30s while the Trophy Room is open

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
// Modes: "pretzels" | "time" | "domination" | "gold"
let activeLeaderboardMode = "pretzels";
let liveLeaderboardRows = [];
let leaderboardFetching = false;
let leaderboardPushing = false;
let lastLeaderboardPushAt = 0;
let lastLeaderboardPushSig = "";
let lastLeaderboardSyncByMode = { pretzels: 0, time: 0, domination: 0, gold: 0 };
let cachedAnonLeaderboardClient = null;

function getLeaderboardClient() {
  if (typeof CloudSave !== "undefined" && CloudSave.client) return CloudSave.client;
  if (cachedAnonLeaderboardClient) return cachedAnonLeaderboardClient;
  if (typeof SUPABASE_URL !== "undefined" && typeof SUPABASE_ANON_KEY !== "undefined" && window.supabase?.createClient) {
    cachedAnonLeaderboardClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: "petes_pretzels_leaderboard_auth_v1"
      }
    });
    return cachedAnonLeaderboardClient;
  }
  return null;
}

function isLeaderboardVisible() {
  const modal = document.getElementById("achievements-modal");
  return Boolean(modal && !modal.classList.contains("hidden"));
}

function getCurrentShopSnapshot() {
  if (typeof GameState === "undefined" || !GameState.started) return null;
  const shopName = ((GameState.playerName || "").trim() || "Unnamed Pretzel Shop").slice(0, 28);
  const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shop";
  const pretzelsAllRuns = typeof GameState.getTotalLifetimePretzelsAllRuns === "function"
    ? Math.max(0, Math.floor(GameState.getTotalLifetimePretzelsAllRuns()))
    : Math.max(0, Math.floor((GameState.lifetimePretzelsAllRuns || 0) + (GameState.pretzels || 0)));

  const hasCompletedFullRun = Boolean(GameState.completedFullRun);
  const bestWinSeconds = (hasCompletedFullRun && (GameState.bestRunSeconds || 0) > 0)
    ? Math.floor(GameState.bestRunSeconds)
    : null;

  const lifetimeGold = typeof GameState.getLifetimeGoldenPretzels === "function"
    ? GameState.getLifetimeGoldenPretzels()
    : Math.max(0, Math.floor(GameState.goldenPretzels || 0));

  const fastestDomSeconds = (Math.max(GameState.continentIndex || 0, GameState.highestContinentReached || 0) >= 7 && (GameState.fastestDominationSeconds || 0) > 0)
    ? Math.floor(GameState.fastestDominationSeconds)
    : null;

  return {
    shopKey: slug,
    shopName,
    pretzelsAllRuns,
    completedFullRun: hasCompletedFullRun,
    bestWinSeconds,
    lifetimeGold,
    fastestDomSeconds
  };
}

async function pushLeaderboardRow(shop) {
  if (typeof CloudSave === "undefined" || !CloudSave.client || !CloudSave.user || !shop) return false;
  const client = CloudSave.client;
  const userId = CloudSave.user.id;

  const payload = {
    shop_key: shop.shopKey,
    shop_name: String(shop.shopName || "Unnamed Pretzel Shop").slice(0, 28),
    pretzels_all_runs: Math.max(0, Math.floor(shop.pretzelsAllRuns || 0)),
    completed_full_run: Boolean(shop.completedFullRun),
    best_win_seconds: (shop.completedFullRun && shop.bestWinSeconds) ? Math.floor(shop.bestWinSeconds) : null,
    game_version: LEADERBOARD_VERSION,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await client
    .from("shop_leaderboard")
    .update(payload)
    .eq("user_id", userId)
    .select("user_id");
  if (error) throw error;

  if (!data || data.length === 0) {
    const { error: insErr } = await client
      .from("shop_leaderboard")
      .insert({ user_id: userId, ...payload });
    if (insErr && insErr.code !== "23505") throw insErr;
  }
  return true;
}

async function syncAndFetchLeaderboard(force = false) {
  if (typeof GameState === "undefined") return;

  const now = Date.now();
  const signedIn = typeof CloudSave !== "undefined" && Boolean(CloudSave.user) && Boolean(CloudSave.client);
  const shop = getCurrentShopSnapshot();

  if (signedIn && shop && !leaderboardPushing) {
    const sig = `${shop.shopName}|${shop.pretzelsAllRuns}|${shop.completedFullRun}|${shop.bestWinSeconds}|${shop.lifetimeGold}|${shop.fastestDomSeconds}`;
    const pushDue = force || (now - lastLeaderboardPushAt >= LEADERBOARD_PUSH_INTERVAL_MS && sig !== lastLeaderboardPushSig);
    if (pushDue) {
      leaderboardPushing = true;
      try {
        await pushLeaderboardRow(shop);
        lastLeaderboardPushAt = Date.now();
        lastLeaderboardPushSig = sig;
      } catch (err) {
        console.warn("Leaderboard post failed:", err);
      } finally {
        leaderboardPushing = false;
      }
    }
  }

  const visible = isLeaderboardVisible();
  const lastFetch = lastLeaderboardSyncByMode[activeLeaderboardMode] || 0;
  const fetchDue = force || (visible && Date.now() - lastFetch >= LEADERBOARD_FETCH_INTERVAL_MS);
  if (!fetchDue || leaderboardFetching) {
    if (visible) renderLeaderboard();
    return;
  }

  leaderboardFetching = true;
  try {
    const client = getLeaderboardClient();
    if (client) {
      let query = client
        .from("shop_leaderboard")
        .select("user_id, shop_key, shop_name, pretzels_all_runs, best_win_seconds, completed_full_run")
        .limit(LEADERBOARD_MAX_ROWS);

      if (activeLeaderboardMode === "time" || activeLeaderboardMode === "domination") {
        query = query
          .eq("completed_full_run", true)
          .not("best_win_seconds", "is", null)
          .gt("best_win_seconds", 0)
          .order("best_win_seconds", { ascending: true });
      } else {
        query = query.order("pretzels_all_runs", { ascending: false });
      }

      const { data, error } = await query;
      if (error) {
        console.error("Leaderboard fetch error:", error);
      } else if (Array.isArray(data)) {
        lastLeaderboardSyncByMode[activeLeaderboardMode] = Date.now();
        const currentUserId = (typeof CloudSave !== "undefined" && CloudSave.user) ? CloudSave.user.id : null;
        liveLeaderboardRows = data.map(row => ({
          userId: row.user_id || "",
          shopKey: row.shop_key || "",
          shopName: row.shop_name || "Unnamed Pretzel Shop",
          pretzelsAllRuns: Number(row.pretzels_all_runs) || 0,
          completedFullRun: Boolean(row.completed_full_run),
          bestWinSeconds: (row.completed_full_run && row.best_win_seconds) ? Number(row.best_win_seconds) : null,
          lifetimeGold: 0,
          fastestDomSeconds: (row.completed_full_run && row.best_win_seconds) ? Number(row.best_win_seconds) : null,
          isUser: Boolean(currentUserId && row.user_id === currentUserId)
        }));
      }
    }
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
  } finally {
    leaderboardFetching = false;
    if (isLeaderboardVisible()) renderLeaderboard();
  }
}

function makeLeaderboardRow(rankText, nameText, statText, isPlayer) {
  const row = document.createElement("div");
  row.className = "leaderboard-row" + (isPlayer ? " is-player" : "");
  const left = document.createElement("span");
  const rankEl = document.createElement("strong");
  rankEl.textContent = rankText;
  left.appendChild(rankEl);
  left.appendChild(document.createTextNode(` ${nameText}`));
  const right = document.createElement("strong");
  right.textContent = statText;
  row.append(left, right);
  return row;
}

function renderLeaderboard() {
  const listEl = document.getElementById("leaderboard-list");
  if (!listEl || typeof GameState === "undefined") return;

  const fmtSecs = typeof formatDuration === "function" ? formatDuration : (s) => `${s}s`;
  const isSignedIn = typeof CloudSave !== "undefined" && Boolean(CloudSave.user);
  const currentUserId = isSignedIn ? CloudSave.user.id : null;
  const currentShop = getCurrentShopSnapshot();

  const statFor = (e) => {
    if (activeLeaderboardMode === "time") {
      return e.bestWinSeconds ? fmtSecs(e.bestWinSeconds) : "—";
    }
    if (activeLeaderboardMode === "domination") {
      const domSecs = e.fastestDomSeconds || e.bestWinSeconds;
      return domSecs ? fmtSecs(domSecs) : "—";
    }
    if (activeLeaderboardMode === "gold") {
      return `${Math.floor(e.lifetimeGold || 0).toLocaleString()} [🥨★]`;
    }
    return `${Math.floor(e.pretzelsAllRuns || 0).toLocaleString()} pretzels`;
  };

  const byAccount = new Map();
  for (const row of liveLeaderboardRows) {
    if (isSignedIn && currentShop && row.isUser) {
      byAccount.set(currentUserId, {
        ...row,
        shopKey: currentShop.shopKey,
        shopName: currentShop.shopName,
        pretzelsAllRuns: currentShop.pretzelsAllRuns,
        completedFullRun: currentShop.completedFullRun,
        bestWinSeconds: currentShop.bestWinSeconds,
        lifetimeGold: currentShop.lifetimeGold,
        fastestDomSeconds: currentShop.fastestDomSeconds || currentShop.bestWinSeconds,
        isUser: true
      });
    } else {
      const k = row.userId || `${row.shopKey}:${row.shopName}`;
      byAccount.set(k, { ...row });
    }
  }

  if (isSignedIn && currentShop && currentUserId && !byAccount.has(currentUserId)) {
    byAccount.set(currentUserId, { ...currentShop, userId: currentUserId, isUser: true });
  }

  let entries = Array.from(byAccount.values());
  if (activeLeaderboardMode === "time") {
    entries = entries.filter(e => e.completedFullRun && e.bestWinSeconds !== null && e.bestWinSeconds > 0);
    entries.sort((a, b) => a.bestWinSeconds - b.bestWinSeconds);
  } else if (activeLeaderboardMode === "domination") {
    entries = entries.filter(e => (e.fastestDomSeconds || e.bestWinSeconds) > 0);
    entries.sort((a, b) => (a.fastestDomSeconds || a.bestWinSeconds) - (b.fastestDomSeconds || b.bestWinSeconds));
  } else if (activeLeaderboardMode === "gold") {
    entries.sort((a, b) => (b.lifetimeGold || 0) - (a.lifetimeGold || 0));
  } else {
    entries.sort((a, b) => b.pretzelsAllRuns - a.pretzelsAllRuns);
  }

  const topTen = entries.slice(0, LEADERBOARD_MAX_ROWS);
  const frag = document.createDocumentFragment();

  if (topTen.length === 0) {
    const emptyRow = document.createElement("div");
    emptyRow.className = "leaderboard-row";
    const msg = document.createElement("span");
    msg.textContent = (activeLeaderboardMode === "time" || activeLeaderboardMode === "domination")
      ? "No full 7-continent run times posted yet."
      : "No scores posted yet.";
    const dash = document.createElement("strong");
    dash.textContent = "—";
    emptyRow.append(msg, dash);
    frag.appendChild(emptyRow);
  }

  let playerShown = false;
  topTen.forEach((entry, index) => {
    if (entry.isUser) playerShown = true;
    frag.appendChild(makeLeaderboardRow(
      `#${index + 1}`,
      `${entry.shopName}${entry.isUser ? " (Your Shop)" : ""}`,
      statFor(entry),
      entry.isUser
    ));
  });

  if (currentShop && !playerShown) {
    if (isSignedIn) {
      frag.appendChild(makeLeaderboardRow("—", `${currentShop.shopName} (Your Shop)`, statFor(currentShop), true));
    } else {
      frag.appendChild(makeLeaderboardRow("—", `${currentShop.shopName} (You, not signed in)`, statFor(currentShop), true));
    }
  }
  if (!isSignedIn) {
    const noticeRow = document.createElement("div");
    noticeRow.className = "leaderboard-row";
    const note = document.createElement("span");
    note.className = "subtext";
    note.textContent = "Sign in via Bakery Options to post your score. Your game keeps running either way.";
    noticeRow.appendChild(note);
    frag.appendChild(noticeRow);
  }

  listEl.replaceChildren(frag);
}

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

    const currentContIdx = GameState.continentIndex || 0;
    const availableProjects = (typeof Projects !== "undefined" && Array.isArray(Projects))
      ? Projects.filter(p => !p.minContinent || currentContIdx >= p.minContinent)
      : [];
    const totalProjects = availableProjects.length > 0 ? availableProjects.length : 1;
    const completedAvailable = availableProjects.filter(p => (GameState.completedProjects || []).includes(p.id)).length;
    const researchProg = Math.min(1, completedAvailable / totalProjects);

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
        if (typeof NewsSystem !== "undefined") NewsSystem.onAchievement(ach);
        newlyUnlocked = true;
      }
    });

    if (newlyUnlocked) {
      if (typeof triggerConfettiStarBurst === "function") {
        triggerConfettiStarBurst(window.innerWidth * 0.5, window.innerHeight * 0.75, 10);
      }
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

      if (window.SoundSystem) window.SoundSystem.playSfx("achievement");

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

    const totalAllContinentsSecs = Math.floor(GameState.totalPlaySecondsAllRuns || 0);
    const continentSecs = Math.floor(GameState.continentElapsedSeconds || 0);
    const bestEverSecs = GameState.completedFullRun ? Math.floor(GameState.bestRunSeconds || 0) : 0;
    const runPretzels = Math.floor(GameState.pretzels || 0);
    const bestPretzels = Math.max(Math.floor(GameState.bestRunPretzels || 0), runPretzels);
    const lifetimeTotal = typeof GameState.getTotalLifetimePretzelsAllRuns === "function"
      ? GameState.getTotalLifetimePretzelsAllRuns()
      : ((GameState.lifetimePretzelsAllRuns || 0) + runPretzels);

    const hubTotalTimeEl = document.getElementById("hub-total-time-all-continents");
    const hubContinentTimeEl = document.getElementById("hub-continent-time");
    const hubBestTimeEl = document.getElementById("hub-best-time-ever");
    const hubRunPretzEl = document.getElementById("hub-run-pretzels");
    const hubBestPretzEl = document.getElementById("hub-best-pretzels");
    const hubLifePretzEl = document.getElementById("hub-lifetime-pretzels");
    const hubGoldUiEl = document.getElementById("hub-gold-ui-status");

    const fmtSecs = typeof formatDuration === "function" ? formatDuration : (s) => `${s}s`;
    if (hubTotalTimeEl) hubTotalTimeEl.textContent = fmtSecs(totalAllContinentsSecs);
    if (hubContinentTimeEl) hubContinentTimeEl.textContent = fmtSecs(continentSecs);
    if (hubBestTimeEl) hubBestTimeEl.textContent = bestEverSecs > 0 ? fmtSecs(bestEverSecs) : "—";
    if (hubRunPretzEl) hubRunPretzEl.textContent = runPretzels.toLocaleString();
    if (hubBestPretzEl) hubBestPretzEl.textContent = bestPretzels.toLocaleString();
    if (hubLifePretzEl) hubLifePretzEl.textContent = lifetimeTotal.toLocaleString();
    if (hubGoldUiEl) hubGoldUiEl.textContent = GameState.goldUiUnlocked ? "Unlocked" : "Locked";

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

  setLeaderboardMode(mode) {
    const valid = ["pretzels", "time", "domination", "gold"];
    activeLeaderboardMode = valid.includes(mode) ? mode : "pretzels";
    const map = {
      pretzels: "btn-lb-pretzels",
      time: "btn-lb-time",
      domination: "btn-lb-domination",
      gold: "btn-lb-gold"
    };
    Object.entries(map).forEach(([k, id]) => {
      const btn = document.getElementById(id);
      if (btn) btn.classList.toggle("active", activeLeaderboardMode === k);
    });
    renderLeaderboard();
    syncAndFetchLeaderboard(false);
  },

  renderModal() {
    const listEl = document.getElementById("achievements-grid");
    if (!listEl) return;

    const unlocked = this.getUnlockedIds();
    this.updateButtonCount();
    renderContinentStatusChips();
    renderSpinningGlobe();
    renderLeaderboard();
    syncAndFetchLeaderboard(false);
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