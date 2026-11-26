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

const LEADERBOARD_VERSION = "BETA.10";
const OLD_SHOPS_KEY = "petes_pretzels_old_shops_v1";
const LEADERBOARD_MAX_ROWS = 10;
const LEADERBOARD_SYNC_INTERVAL_MS = 5 * 60 * 1000;

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
let activeLeaderboardMode = "pretzels";
let liveLeaderboardRows = [];
let leaderboardFetching = false;
let lastLeaderboardSyncByMode = { pretzels: 0, time: 0 };
let cachedAnonLeaderboardClient = null;

function getLeaderboardClient() {
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

function readOldShops() {
  try {
    const raw = localStorage.getItem(OLD_SHOPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function recordCurrentShopSnapshot() {
  if (typeof GameState === "undefined" || !GameState.started) return readOldShops();
  const shopName = (GameState.playerName || "").trim() || "Unnamed Pretzel Shop";
  const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shop";
  const pretzelsAllRuns = typeof GameState.getTotalLifetimePretzelsAllRuns === "function"
    ? Math.floor(GameState.getTotalLifetimePretzelsAllRuns())
    : Math.floor((GameState.lifetimePretzelsAllRuns || 0) + (GameState.pretzels || 0));

  const hasCompletedFullRun = Boolean(GameState.completedFullRun);
  const bestWinSeconds = (hasCompletedFullRun && (GameState.bestRunSeconds || 0) > 0)
    ? Math.floor(GameState.bestRunSeconds)
    : null;

  const shops = readOldShops();
  const existingIdx = shops.findIndex(s => s.shopKey === slug || s.shopName === shopName);

  if (existingIdx >= 0) {
    const prev = shops[existingIdx];
    shops[existingIdx] = {
      shopKey: slug,
      shopName,
      pretzelsAllRuns: Math.max(Number(prev.pretzelsAllRuns) || 0, pretzelsAllRuns),
      completedFullRun: Boolean(prev.completedFullRun || hasCompletedFullRun),
      bestWinSeconds: (hasCompletedFullRun && Number(prev.bestWinSeconds) > 0 && bestWinSeconds > 0)
        ? Math.min(Number(prev.bestWinSeconds), bestWinSeconds)
        : (bestWinSeconds || null)
    };
  } else {
    shops.push({
      shopKey: slug,
      shopName,
      pretzelsAllRuns,
      completedFullRun: hasCompletedFullRun,
      bestWinSeconds
    });
  }

  shops.sort((a, b) => (Number(b.pretzelsAllRuns) || 0) - (Number(a.pretzelsAllRuns) || 0));
  const trimmed = shops.slice(0, LEADERBOARD_MAX_ROWS);
  try {
    localStorage.setItem(OLD_SHOPS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error("Failed to save old shops:", e);
  }
  return trimmed;
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

async function syncAndFetchLeaderboard(force = false) {
  if (leaderboardFetching || typeof GameState === "undefined") return;

  const now = Date.now();
  const lastSync = lastLeaderboardSyncByMode[activeLeaderboardMode] || 0;
  if (!force && now - lastSync < LEADERBOARD_SYNC_INTERVAL_MS) {
    renderLeaderboard();
    return;
  }

  leaderboardFetching = true;

  try {
    const savedShops = recordCurrentShopSnapshot();
    const isSignedIn = typeof CloudSave !== "undefined" && Boolean(CloudSave.user) && Boolean(CloudSave.client);

    if (isSignedIn) {
      const session = await CloudSave.refreshActiveSession();
      if (session && session.user) {
        for (const shop of savedShops) {
          if ((shop.pretzelsAllRuns || 0) > 0 || (shop.completedFullRun && (shop.bestWinSeconds || 0) > 0)) {
            const { error: upsertErr } = await CloudSave.client
              .from("shop_leaderboard")
              .upsert({
                user_id: session.user.id,
                shop_key: shop.shopKey,
                shop_name: shop.shopName,
                pretzels_all_runs: Math.floor(shop.pretzelsAllRuns || 0),
                completed_full_run: Boolean(shop.completedFullRun),
                best_win_seconds: (shop.completedFullRun && shop.bestWinSeconds) ? Math.floor(shop.bestWinSeconds) : null,
                game_version: LEADERBOARD_VERSION,
                updated_at: new Date().toISOString()
              }, { onConflict: "user_id,shop_key" });
            if (upsertErr) console.error("Leaderboard upsert error:", upsertErr);
          }
        }
      }
    }

    const client = getLeaderboardClient();
    if (client) {
      let query = client
        .from("shop_leaderboard")
        .select("user_id, shop_key, shop_name, pretzels_all_runs, best_win_seconds, completed_full_run")
        .eq("game_version", LEADERBOARD_VERSION)
        .limit(LEADERBOARD_MAX_ROWS);

      if (activeLeaderboardMode === "time") {
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
        const myKeys = new Set(savedShops.map(s => s.shopKey));
        liveLeaderboardRows = data.map(row => ({
          shopKey: row.shop_key || "",
          shopName: row.shop_name || "Unnamed Pretzel Shop",
          pretzelsAllRuns: Number(row.pretzels_all_runs) || 0,
          completedFullRun: Boolean(row.completed_full_run),
          bestWinSeconds: (row.completed_full_run && row.best_win_seconds) ? Number(row.best_win_seconds) : null,
          isUser: Boolean(currentUserId && row.user_id === currentUserId && myKeys.has(row.shop_key))
        }));
      }
    }
  } catch (err) {
    console.error("Leaderboard sync/fetch error:", err);
  } finally {
    leaderboardFetching = false;
    renderLeaderboard();
  }
}

function renderLeaderboard() {
  const listEl = document.getElementById("leaderboard-list");
  if (!listEl || typeof GameState === "undefined") return;

  const fmtSecs = typeof formatDuration === "function" ? formatDuration : (s) => `${s}s`;
  const isSignedIn = typeof CloudSave !== "undefined" && Boolean(CloudSave.user);
  const savedShops = isSignedIn ? recordCurrentShopSnapshot() : [];

  const byKey = new Map();

  for (const row of liveLeaderboardRows) {
    const k = `${row.shopKey || row.shopName}:${row.isUser ? "me" : "other"}`;
    byKey.set(k, { ...row });
  }

  if (isSignedIn) {
    for (const shop of savedShops) {
      const k = `${shop.shopKey}:me`;
      const existing = byKey.get(k);
      if (!existing) {
        byKey.set(k, { ...shop, isUser: true });
      } else {
        const completedRun = Boolean(existing.completedFullRun || shop.completedFullRun);
        byKey.set(k, {
          ...existing,
          pretzelsAllRuns: Math.max(Number(existing.pretzelsAllRuns) || 0, Number(shop.pretzelsAllRuns) || 0),
          completedFullRun: completedRun,
          bestWinSeconds: completedRun
            ? ((Number(existing.bestWinSeconds) > 0 && Number(shop.bestWinSeconds) > 0)
                ? Math.min(Number(existing.bestWinSeconds), Number(shop.bestWinSeconds))
                : (Number(shop.bestWinSeconds) > 0 ? Number(shop.bestWinSeconds) : (Number(existing.bestWinSeconds) > 0 ? Number(existing.bestWinSeconds) : null)))
            : null,
          isUser: true
        });
      }
    }
  }

  let entries = Array.from(byKey.values());

  if (activeLeaderboardMode === "time") {
    entries = entries.filter(e => e.completedFullRun && e.bestWinSeconds !== null && e.bestWinSeconds > 0);
    entries.sort((a, b) => a.bestWinSeconds - b.bestWinSeconds);
  } else {
    entries.sort((a, b) => b.pretzelsAllRuns - a.pretzelsAllRuns);
  }

  const topTen = entries.slice(0, LEADERBOARD_MAX_ROWS);

  listEl.innerHTML = "";

  if (!isSignedIn) {
    const noticeRow = document.createElement("div");
    noticeRow.className = "leaderboard-row";
    noticeRow.innerHTML = `<span class="subtext">Sign in via Bakery Options to post your shop to the Top 10 (updates every 5 min).</span>`;
    listEl.appendChild(noticeRow);
  }

  if (topTen.length === 0) {
    const emptyRow = document.createElement("div");
    emptyRow.className = "leaderboard-row";
    emptyRow.innerHTML = activeLeaderboardMode === "time"
      ? `<span>No full 7-continent run times posted yet in ${LEADERBOARD_VERSION}.</span><strong>—</strong>`
      : `<span>No ${LEADERBOARD_VERSION} account scores posted yet.</span><strong>—</strong>`;
    listEl.appendChild(emptyRow);
    return;
  }

  topTen.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "leaderboard-row" + (entry.isUser ? " is-player" : "");

    const statDisplay = activeLeaderboardMode === "time"
      ? fmtSecs(entry.bestWinSeconds)
      : `${Math.floor(entry.pretzelsAllRuns).toLocaleString()} pretzels`;

    row.innerHTML = `
      <span><strong>#${index + 1}</strong> ${entry.shopName}${entry.isUser ? " (Your Shop)" : ""}</span>
      <strong>${statDisplay}</strong>
    `;
    listEl.appendChild(row);
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
    const bestEverSecs = GameState.completedFullRun ? Math.floor(GameState.bestRunSeconds || 0) : 0;
    const runPretzels = Math.floor(GameState.pretzels || 0);
    const bestPretzels = Math.max(Math.floor(GameState.bestRunPretzels || 0), runPretzels);
    const lifetimeTotal = typeof GameState.getTotalLifetimePretzelsAllRuns === "function"
      ? GameState.getTotalLifetimePretzelsAllRuns()
      : ((GameState.lifetimePretzelsAllRuns || 0) + runPretzels);

    const hubTotalTimeEl = document.getElementById("hub-total-time-all-continents");
    const hubBestTimeEl = document.getElementById("hub-best-time-ever");
    const hubRunPretzEl = document.getElementById("hub-run-pretzels");
    const hubBestPretzEl = document.getElementById("hub-best-pretzels");
    const hubLifePretzEl = document.getElementById("hub-lifetime-pretzels");
    const hubGoldUiEl = document.getElementById("hub-gold-ui-status");

    const fmtSecs = typeof formatDuration === "function" ? formatDuration : (s) => `${s}s`;
    if (hubTotalTimeEl) hubTotalTimeEl.textContent = fmtSecs(totalAllContinentsSecs);
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
    activeLeaderboardMode = mode === "time" ? "time" : "pretzels";
    const pretzelsBtn = document.getElementById("btn-lb-pretzels");
    const timeBtn = document.getElementById("btn-lb-time");
    if (pretzelsBtn) pretzelsBtn.classList.toggle("active", activeLeaderboardMode === "pretzels");
    if (timeBtn) timeBtn.classList.toggle("active", activeLeaderboardMode === "time");
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