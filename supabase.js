const SUPABASE_URL = "https://eefwqgonvdcvtghnaacr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZndxZ29udmRjdnRnaG5hYWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzMTkyNzAsImV4cCI6MjExMDg5NTI3MH0.xgaJykpiB8oeGUi1Gg1Bs_qaIn_zVurfm_Yr5ycjYps";
const AUTH_STORAGE_KEY = "petes_pretzels_cloud_auth_v1";
const LEGACY_SESSION_KEY = "petes_pretzels_supabase_session_v1";
const CLOUD_PUSH_MIN_INTERVAL_MS = 20000;

// BETA.14: the Supabase SDK is now the ONLY thing that owns the login session.
// (An earlier version also refreshed the same refresh-token by hand, and the two paths
// fought each other, which signed people out at random.)
const CloudSave = {
  client: null,
  user: null,
  session: null,
  isConfigured: false,
  syncInFlight: false,
  _lastPushAt: 0,
  _pendingSnapshot: null,
  _pushTimer: null,

  hasValidCredentials() {
    return Boolean(
      SUPABASE_URL &&
      !SUPABASE_URL.includes("YOUR_PROJECT_ID") &&
      SUPABASE_ANON_KEY &&
      !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY")
    );
  },

  setStatus(text, stateClass = "") {
    const el = document.getElementById("cloud-status-pill");
    if (!el) return;
    el.textContent = text;
    el.classList.remove("cloud-online", "cloud-offline", "cloud-syncing");
    if (stateClass) el.classList.add(`cloud-${stateClass}`);
  },

  init() {
    if (this.isConfigured && this.client) return true;

    if (!this.hasValidCredentials()) {
      this.isConfigured = false;
      this.setStatus("Cloud: Keys Not Set", "offline");
      return false;
    }

    if (!(window.supabase && typeof window.supabase.createClient === "function")) {
      this.isConfigured = false;
      this.setStatus("Cloud: Unavailable", "offline");
      return false;
    }

    try { localStorage.removeItem(LEGACY_SESSION_KEY); } catch (e) { /* ignore */ }

    this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: AUTH_STORAGE_KEY
      }
    });

    // Keep user/session in sync with the SDK. Do NOT call other supabase
    // methods in here, only set plain state.
    this.client.auth.onAuthStateChange((event, session) => {
      this.session = session || null;
      this.user = session && session.user ? session.user : null;
      if (event === "SIGNED_OUT") {
        this.setStatus("Cloud: Signed Out", "offline");
      } else if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        this.setStatus(this.user ? "Cloud: Synced" : "Cloud: Ready", "online");
      }
      if (typeof refreshCloudMenuUI === "function") refreshCloudMenuUI();
    });

    this.isConfigured = true;
    this.setStatus("Cloud: Ready", "online");
    return true;
  },

  ensureReady() {
    if (this.isConfigured && this.client) return true;
    return this.init();
  },

  async getSessionUser() {
    if (!this.ensureReady()) return null;
    try {
      const { data, error } = await this.client.auth.getSession();
      if (!error && data && data.session) {
        this.session = data.session;
        this.user = data.session.user || null;
        this.setStatus("Cloud: Synced", "online");
        return this.user;
      }
    } catch (e) {
      console.warn("Session check failed:", e);
    }
    return this.user;
  },

  // Kept so older callers keep working.
  async refreshActiveSession() {
    if (!this.ensureReady()) return null;
    try {
      const { data } = await this.client.auth.getSession();
      if (data && data.session) {
        this.session = data.session;
        this.user = data.session.user || null;
        return data.session;
      }
    } catch (e) {
      console.warn("Session refresh failed:", e);
    }
    return null;
  },

  async signUp(email, password) {
    if (!this.ensureReady()) throw new Error("Cloud save is not configured.");
    const { data, error } = await this.client.auth.signUp({ email, password });
    if (error) throw error;
    this.user = data.user || null;
    this.session = data.session || null;
    return data;
  },

  async signIn(email, password) {
    if (!this.ensureReady()) throw new Error("Cloud save is not configured.");
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.user = data.user || null;
    this.session = data.session || null;
    return data;
  },

  async signOut() {
    if (this._pushTimer) { clearTimeout(this._pushTimer); this._pushTimer = null; }
    this._pendingSnapshot = null;
    if (this.client) {
      try {
        await this.client.auth.signOut();
      } catch (e) {
        console.error("Cloud sign out error:", e);
      }
    }
    this.user = null;
    this.session = null;
    this.setStatus("Cloud: Signed Out", "offline");
  },

  async loadFromCloud() {
    if (!this.ensureReady() || !this.user) return null;
    this.setStatus("Cloud: Loading...", "syncing");
    try {
      const { data, error } = await this.client
        .from("player_saves")
        .select("save_data,updated_at")
        .eq("user_id", this.user.id)
        .maybeSingle();
      if (error) throw error;
      this.setStatus("Cloud: Synced", "online");
      return data ? data.save_data : null;
    } catch (error) {
      console.error("Cloud load error:", error);
      this.setStatus("Cloud: Load Error", "offline");
      return null;
    }
  },

  // Throttled save: at most one upload every ~20s (latest snapshot wins).
  queuePush(snapshotObj) {
    if (!this.user || !snapshotObj) return;
    this._pendingSnapshot = snapshotObj;
    const wait = Math.max(0, CLOUD_PUSH_MIN_INTERVAL_MS - (Date.now() - this._lastPushAt));
    if (wait === 0 && !this.syncInFlight) {
      this._flushPending();
      return;
    }
    if (!this._pushTimer) {
      this._pushTimer = setTimeout(() => {
        this._pushTimer = null;
        this._flushPending();
      }, Math.max(wait, 500));
    }
  },

  _flushPending() {
    const snap = this._pendingSnapshot;
    this._pendingSnapshot = null;
    if (snap) this.pushToCloud(snap);
  },

  async _upsertSave(rowPayload) {
    return this.client
      .from("player_saves")
      .upsert(rowPayload, { onConflict: "user_id" });
  },

  // Immediate save (prestige, sign-in, "Sync Now", etc).
  async pushToCloud(snapshotObj) {
    if (!this.ensureReady() || !this.user || !snapshotObj) return;
    if (this.syncInFlight) {
      this._pendingSnapshot = snapshotObj;
      return;
    }
    this.syncInFlight = true;
    this._lastPushAt = Date.now(); // start the 20s window now, so bursts collapse into one trailing save
    this.setStatus("Cloud: Saving...", "syncing");

    try {
      const rowPayload = {
        user_id: this.user.id,
        player_name: snapshotObj.playerName || "Baker",
        save_data: snapshotObj,
        updated_at: new Date().toISOString()
      };

      let { error } = await this._upsertSave(rowPayload);

      // Expired token? Refresh once and retry. Never sign the player out here.
      if (error && (error.status === 401 || /jwt/i.test(error.message || ""))) {
        const { data: refreshed } = await this.client.auth.refreshSession();
        if (refreshed && refreshed.session) {
          this.session = refreshed.session;
          this.user = refreshed.session.user || this.user;
          rowPayload.user_id = this.user.id;
          ({ error } = await this._upsertSave(rowPayload));
        }
      }

      if (error) throw error;
      this.setStatus("Cloud: Synced", "online");
    } catch (error) {
      console.error("Cloud save error:", error);
      this.setStatus("Cloud: Sync Error", "offline");
    } finally {
      this.syncInFlight = false;
      this._lastPushAt = Date.now();
      if (this._pendingSnapshot) this.queuePush(this._pendingSnapshot);
    }
  },

  // Last-chance save when the tab is hidden/closed (fetch keepalive survives unload).
  flushOnExit(snapshotObj) {
    try {
      if (!this.user || !this.session || !this.session.access_token || !snapshotObj) return;
      const body = JSON.stringify({
        user_id: this.user.id,
        player_name: snapshotObj.playerName || "Baker",
        save_data: snapshotObj,
        updated_at: new Date().toISOString()
      });
      if (body.length > 60000) return;
      fetch(`${SUPABASE_URL}/rest/v1/player_saves?on_conflict=user_id`, {
        method: "POST",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${this.session.access_token}`,
          "Prefer": "resolution=merge-duplicates,return=minimal"
        },
        body
      }).catch(() => {});
    } catch (e) { /* ignore */ }
  }
};