const SUPABASE_URL = "https://eefwqgonvdcvtghnaacr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZndxZ29udmRjdnRnaG5hYWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzMTkyNzAsImV4cCI6MjExMDg5NTI3MH0.xgaJykpiB8oeGUi1Gg1Bs_qaIn_zVurfm_Yr5ycjYps";
const AUTH_SESSION_STORAGE_KEY = "petes_pretzels_supabase_session_v1";

const CloudSave = {
  client: null,
  user: null,
  session: null,
  isConfigured: false,
  syncInFlight: false,

  hasValidCredentials() {
    return Boolean(
      SUPABASE_URL &&
      !SUPABASE_URL.includes("YOUR_PROJECT_ID") &&
      SUPABASE_ANON_KEY &&
      !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY")
    );
  },

  readStoredSession() {
    try {
      const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.access_token && parsed.user) {
        return parsed;
      }
    } catch (e) {
      console.error("Session read error:", e);
    }
    return null;
  },

  writeStoredSession(sessionObj) {
    try {
      if (!sessionObj) {
        localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
        return;
      }
      localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(sessionObj));
    } catch (e) {
      console.error("Session write error:", e);
    }
  },

  clearSessionState() {
    this.user = null;
    this.session = null;
    this.writeStoredSession(null);
    if (typeof refreshCloudMenuUI === "function") {
      refreshCloudMenuUI();
    }
  },

  init() {
    if (!this.hasValidCredentials()) {
      this.isConfigured = false;
      this.setStatus("Cloud: Keys Not Set", "offline");
      return false;
    }

    const stored = this.readStoredSession();
    if (stored && stored.user) {
      this.session = stored;
      this.user = stored.user;
    }

    if (typeof window.supabase !== "undefined" && typeof window.supabase.createClient === "function") {
      if (!this.client) {
        this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      }
      this.isConfigured = true;
      this.setStatus(this.user ? "Cloud: Synced" : "Cloud: Ready", "online");
      return true;
    }

    this.isConfigured = true;
    this.setStatus(this.user ? "Cloud: Synced" : "Cloud: Ready", "online");
    return true;
  },

  ensureReady() {
    if (this.isConfigured) return true;
    return this.init();
  },

  setStatus(text, stateClass = "") {
    const el = document.getElementById("cloud-status-pill");
    if (!el) return;
    el.textContent = text;
    el.classList.remove("cloud-online", "cloud-offline", "cloud-syncing");
    if (stateClass) el.classList.add(`cloud-${stateClass}`);
  },

  async refreshActiveSession() {
    if (!this.ensureReady()) return null;

    if (this.client && this.client.auth) {
      try {
        const { data: sessionData } = await this.client.auth.getSession();
        const activeSess = sessionData?.session || null;
        const nowSec = Math.floor(Date.now() / 1000);

        if (activeSess && (!activeSess.expires_at || activeSess.expires_at - nowSec > 45)) {
          this.session = activeSess;
          this.user = activeSess.user || null;
          if (this.session && this.user) {
            this.writeStoredSession({
              access_token: this.session.access_token,
              refresh_token: this.session.refresh_token || "",
              user: this.user
            });
          }
          return this.session;
        }

        const { data: refreshed, error: refreshErr } = await this.client.auth.refreshSession();
        if (!refreshErr && refreshed?.session) {
          this.session = refreshed.session;
          this.user = refreshed.session.user || null;
          this.writeStoredSession({
            access_token: this.session.access_token,
            refresh_token: this.session.refresh_token || "",
            user: this.user
          });
          return this.session;
        }
      } catch (e) {
        console.warn("SDK session refresh check:", e);
      }
    }

    const stored = this.readStoredSession();
    if (stored && stored.refresh_token) {
      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ refresh_token: stored.refresh_token })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.access_token && data.user) {
            const nextSession = {
              access_token: data.access_token,
              refresh_token: data.refresh_token || stored.refresh_token,
              user: data.user
            };
            this.session = nextSession;
            this.user = data.user;
            this.writeStoredSession(nextSession);
            return nextSession;
          }
        }
      } catch (e) {
        console.warn("REST refresh token check:", e);
      }
    }

    return null;
  },

  async authRestRequest(path, payload) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.msg || data.error_description || data.message || `Auth failed (${res.status})`;
      throw new Error(msg);
    }

    const sessionData = data.session || (data.access_token ? data : null);
    const userData = data.user || (sessionData && sessionData.user) || null;

    if (sessionData && userData) {
      const normalizedSession = {
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token || "",
        user: userData
      };
      this.session = normalizedSession;
      this.user = userData;
      this.writeStoredSession(normalizedSession);
    } else if (userData) {
      this.user = userData;
    }

    return { user: userData, session: sessionData };
  },

  async getSessionUser() {
    if (!this.ensureReady()) return null;

    const refreshed = await this.refreshActiveSession();
    if (refreshed && refreshed.user) {
      this.user = refreshed.user;
      return this.user;
    }

    if (this.client) {
      const { data, error } = await this.client.auth.getUser();
      if (!error && data?.user) {
        this.user = data.user;
        return this.user;
      }
    }

    this.clearSessionState();
    return null;
  },

  async signUp(email, password) {
    if (!this.ensureReady()) {
      throw new Error("Cloud save is not configured.");
    }

    if (this.client) {
      const { data, error } = await this.client.auth.signUp({ email, password });
      if (error) throw error;
      this.user = data.user || null;
      this.session = data.session || null;
      if (this.session && this.user) {
        this.writeStoredSession({
          access_token: this.session.access_token,
          refresh_token: this.session.refresh_token || "",
          user: this.user
        });
      }
      return data;
    }

    return this.authRestRequest("/signup", { email, password });
  },

  async signIn(email, password) {
    if (!this.ensureReady()) {
      throw new Error("Cloud save is not configured.");
    }

    if (this.client) {
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      this.user = data.user || null;
      this.session = data.session || null;
      if (this.session && this.user) {
        this.writeStoredSession({
          access_token: this.session.access_token,
          refresh_token: this.session.refresh_token || "",
          user: this.user
        });
      }
      return data;
    }

    return this.authRestRequest("/token?grant_type=password", { email, password });
  },

  async signOut() {
    this.user = null;
    this.session = null;
    this.writeStoredSession(null);

    if (this.client) {
      try {
        await this.client.auth.signOut();
      } catch (e) {
        console.error("Cloud sign out error:", e);
      }
    }
    this.setStatus("Cloud: Signed Out", "offline");
  },

  getBearerToken() {
    if (this.session && this.session.access_token) {
      return this.session.access_token;
    }
    const stored = this.readStoredSession();
    return stored ? stored.access_token : SUPABASE_ANON_KEY;
  },

  async loadFromCloud() {
    if (!this.ensureReady() || !this.user) return null;
    this.setStatus("Cloud: Loading...", "syncing");

    const activeSession = await this.refreshActiveSession();
    if (!activeSession || !activeSession.user) {
      this.clearSessionState();
      this.setStatus("Cloud: Signed Out", "offline");
      return null;
    }

    try {
      const token = activeSession.access_token || this.getBearerToken();
      const url = `${SUPABASE_URL}/rest/v1/player_saves?user_id=eq.${encodeURIComponent(activeSession.user.id)}&select=save_data,updated_at&limit=1`;
      const res = await fetch(url, {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        this.clearSessionState();
        this.setStatus("Cloud: Signed Out", "offline");
        return null;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();
      this.setStatus("Cloud: Synced", "online");
      return Array.isArray(rows) && rows[0] ? rows[0].save_data : null;
    } catch (error) {
      console.error("Cloud load error:", error);
      this.setStatus("Cloud: Load Error", "offline");
      return null;
    }
  },

  async pushToCloud(snapshotObj) {
    if (!this.ensureReady() || !this.user || this.syncInFlight) return;
    this.syncInFlight = true;
    this.setStatus("Cloud: Saving...", "syncing");

    try {
      let activeSession = await this.refreshActiveSession();
      if (!activeSession || !activeSession.user) {
        this.clearSessionState();
        this.setStatus("Cloud: Signed Out", "offline");
        return;
      }

      const rowPayload = {
        user_id: activeSession.user.id,
        player_name: snapshotObj.playerName || "Baker",
        save_data: snapshotObj,
        updated_at: new Date().toISOString()
      };

      let token = activeSession.access_token || this.getBearerToken();
      let res = await fetch(`${SUPABASE_URL}/rest/v1/player_saves?on_conflict=user_id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${token}`,
          "Prefer": "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify(rowPayload)
      });

      if (res.status === 401) {
        activeSession = await this.refreshActiveSession();
        if (activeSession && activeSession.access_token) {
          token = activeSession.access_token;
          res = await fetch(`${SUPABASE_URL}/rest/v1/player_saves?on_conflict=user_id`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": SUPABASE_ANON_KEY,
              "Authorization": `Bearer ${token}`,
              "Prefer": "resolution=merge-duplicates,return=minimal"
            },
            body: JSON.stringify({ ...rowPayload, user_id: activeSession.user.id })
          });
        }
      }

      if (res.status === 401) {
        this.clearSessionState();
        this.setStatus("Cloud: Signed Out", "offline");
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      this.setStatus("Cloud: Synced", "online");
    } catch (error) {
      console.error("Cloud save error:", error);
      this.setStatus("Cloud: Sync Error", "offline");
    } finally {
      this.syncInFlight = false;
    }
  }
};