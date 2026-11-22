const SUPABASE_URL = "https://eefwqgonvdcvtghnaacr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZndxZ29udmRjdnRnaG5hYWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzMTkyNzAsImV4cCI6MjExMDg5NTI3MH0.xgaJykpiB8oeGUi1Gg1Bs_qaIn_zVurfm_Yr5ycjYps";

const CloudSave = {
  client: null,
  user: null,
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

  init() {
    if (!this.hasValidCredentials()) {
      this.isConfigured = false;
      this.setStatus("Cloud: Keys Not Set", "offline");
      return false;
    }

    if (typeof window.supabase === "undefined" || typeof window.supabase.createClient !== "function") {
      this.isConfigured = false;
      this.setStatus("Cloud: SDK Blocked/Offline", "offline");
      return false;
    }

    if (!this.client) {
      this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    this.isConfigured = true;
    this.setStatus("Cloud: Ready", "online");
    return true;
  },

  ensureReady() {
    if (this.isConfigured && this.client) return true;
    return this.init();
  },

  setStatus(text, stateClass = "") {
    const el = document.getElementById("cloud-status-pill");
    if (!el) return;
    el.textContent = text;
    el.classList.remove("cloud-online", "cloud-offline", "cloud-syncing");
    if (stateClass) el.classList.add(`cloud-${stateClass}`);
  },

  async getSessionUser() {
    if (!this.ensureReady()) return null;
    const { data, error } = await this.client.auth.getUser();
    if (error || !data?.user) {
      this.user = null;
      return null;
    }
    this.user = data.user;
    return this.user;
  },

  async signUp(email, password) {
    if (!this.ensureReady()) {
      throw new Error(
        this.hasValidCredentials()
          ? "Supabase script didn't load (check internet/VPN/ad-blocker for jsdelivr.net)."
          : "Add your Supabase URL & Anon Key in supabase.js first."
      );
    }
    const { data, error } = await this.client.auth.signUp({ email, password });
    if (error) throw error;
    this.user = data.user;
    return data;
  },

  async signIn(email, password) {
    if (!this.ensureReady()) {
      throw new Error(
        this.hasValidCredentials()
          ? "Supabase script didn't load (check internet/VPN/ad-blocker for jsdelivr.net)."
          : "Add your Supabase URL & Anon Key in supabase.js first."
      );
    }
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.user = data.user;
    return data;
  },

  async signOut() {
    if (!this.ensureReady()) return;
    await this.client.auth.signOut();
    this.user = null;
    this.setStatus("Cloud: Signed Out", "offline");
  },

  async loadFromCloud() {
    if (!this.ensureReady() || !this.user) return null;
    this.setStatus("Cloud: Loading...", "syncing");

    const { data, error } = await this.client
      .from("player_saves")
      .select("save_data, updated_at")
      .eq("user_id", this.user.id)
      .maybeSingle();

    if (error) {
      console.error("Cloud load error:", error);
      this.setStatus("Cloud: Load Error", "offline");
      return null;
    }

    this.setStatus("Cloud: Synced", "online");
    return data ? data.save_data : null;
  },

  async pushToCloud(snapshotObj) {
    if (!this.ensureReady() || !this.user || this.syncInFlight) return;
    this.syncInFlight = true;
    this.setStatus("Cloud: Saving...", "syncing");

    try {
      const { error } = await this.client
        .from("player_saves")
        .upsert(
          {
            user_id: this.user.id,
            player_name: snapshotObj.playerName || "Baker",
            save_data: snapshotObj,
            updated_at: new Date().toISOString()
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Cloud save error:", error);
        this.setStatus("Cloud: Sync Error", "offline");
      } else {
        this.setStatus("Cloud: Synced", "online");
      }
    } finally {
      this.syncInFlight = false;
    }
  }
};