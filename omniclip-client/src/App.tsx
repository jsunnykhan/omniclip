import { useState, useEffect } from "react";
import { Copy, MonitorSmartphone, LogOut, Ticket, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import "./App.css";

const API_DEV_URL = "http://localhost:3000/api";

function App() {
  const [view, setView] = useState<"login" | "register" | "dashboard">("login");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("omniclip_access_token"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("omniclip_role"));
  
  const [promoCode, setPromoCode] = useState("");

  const [updateInfo, setUpdateInfo] = useState<{ version: string; notes: string } | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (accessToken) {
      setView("dashboard");
      startBackgroundSync(accessToken);
    }
  }, [accessToken]);

  // Listen for update-available event emitted by Rust on startup
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    import('@tauri-apps/api/event').then(({ listen }) => {
      listen<{ version: string; notes: string }>('update-available', (event) => {
        setUpdateInfo(event.payload);
      }).then(fn => { unlisten = fn; });
    }).catch(() => {});
    return () => { if (unlisten) unlisten(); };
  }, []);

  const startBackgroundSync = async (token: string) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const { listen } = await import('@tauri-apps/api/event');
      
      let devId = localStorage.getItem("omniclip_device_id");
      if (!devId) {
         devId = crypto.randomUUID();
         localStorage.setItem("omniclip_device_id", devId);
      }
      
      const deviceName = "Omni Desktop " + devId.substring(0, 4);
      const os = navigator.userAgent.includes("Win") ? "Windows" : navigator.userAgent.includes("Mac") ? "MacOS" : "Linux";
      
      await invoke('start_sync', {
         token,
         deviceId: devId,
         deviceName,
         os
      });

      listen("sync-error", (event) => {
         setError(event.payload as string);
         logout();
      });
    } catch (e) {
      console.log("Tauri environment not found or failed to start sync", e);
    }
  };

  const handleAuth = async (isLogin: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const res = await fetch(`${API_DEV_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data || "Authentication failed");
      }

      localStorage.setItem("omniclip_access_token", data.access_token);
      localStorage.setItem("omniclip_refresh_token", data.refresh_token);
      localStorage.setItem("omniclip_role", data.role);
      
      setAccessToken(data.access_token);
      localStorage.setItem("omniclip_refresh_token", data.refresh_token);
      setRole(data.role);
      
      setView("dashboard");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("omniclip_access_token");
    localStorage.removeItem("omniclip_refresh_token");
    localStorage.removeItem("omniclip_role");
    setAccessToken(null);
    setRole(null);
    setView("login");
  };

  const submitPromo = async () => {
    if (!promoCode) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_DEV_URL}/auth/promo`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ code: promoCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data || "Invalid Promo Code");

      setSuccess(`Success! Added ${data.added_devices} devices line.`);
      setPromoCode("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async () => {
    setUpdating(true);
    setError(null);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const result = await invoke<{ available: boolean; version?: string; notes?: string }>('check_for_update');
      if (result.available) {
        setSuccess(`Updated to v${result.version}! Restart to apply.`);
        setUpdateInfo(null);
      } else {
        setSuccess('You are already on the latest version.');
        setUpdateInfo(null);
      }
    } catch (e: any) {
      setError(e.toString());
    } finally {
      setUpdating(false);
    }
  };

  if (view === "dashboard") {
    return (
      <main className="dashboard-container">
        <header className="dashboard-header">
          <div className="branding">
            <div className="logo-icon"><Copy size={20} /></div>
            <h1>OmniClip</h1>
          </div>
          <div className="header-actions">
            <button onClick={handleUpdate} disabled={updating} className="icon-btn update-btn" title="Check for updates">
              <RefreshCw size={18} className={updating ? 'spinning' : ''} />
            </button>
            <button onClick={logout} className="icon-btn" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {updateInfo && (
          <div className="update-banner">
            <div className="update-banner-text">
              <strong>🎉 Update available: v{updateInfo.version}</strong>
              {updateInfo.notes && <span>{updateInfo.notes}</span>}
            </div>
            <button onClick={handleUpdate} disabled={updating} className="update-install-btn">
              {updating ? 'Installing...' : 'Install Now'}
            </button>
          </div>
        )}

        <section className="status-card active">
          <div className="status-indicator blur-pulse"></div>
          <div className="status-info">
            <h2>System Active</h2>
            <p>Monitoring clipboard events in the background</p>
          </div>
          <MonitorSmartphone size={32} className="accent-icon" />
        </section>

        {role === "super_admin" || role === "admin" ? (
          <div className="admin-badge">Admin Privileges Active</div>
        ) : null}

        <section className="card promo-section">
          <h3><Ticket size={18}/> Redeem Promo Code</h3>
          <p>Increase your maximum synced devices limit.</p>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="e.g. OMNI-2026" 
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button onClick={submitPromo} disabled={loading || !promoCode}>Apply</button>
          </div>
          {error && <div className="alert-msg error"><AlertCircle size={14}/> {error}</div>}
          {success && <div className="alert-msg success"><CheckCircle2 size={14}/> {success}</div>}
        </section>

      </main>
    );
  }

  return (
    <main className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-icon lg"><Copy size={28} /></div>
          <h1>{view === "login" ? "Welcome Back" : "Join OmniClip"}</h1>
          <p>The universal clipboard across all your devices.</p>
        </div>

        <div className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="alert-msg error"><AlertCircle size={14}/> {error}</div>}

          <button 
            className="primary-btn" 
            onClick={() => handleAuth(view === "login")}
            disabled={loading}
          >
            {loading ? "Authenticating..." : view === "login" ? "Log In" : "Register"}
          </button>
        </div>

        <div className="auth-footer">
          {view === "login" ? (
            <p>Don't have an account? <span onClick={() => setView("register")}>Register</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => setView("login")}>Log in</span></p>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
