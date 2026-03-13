import { useState, useEffect } from "react";
import "./App.css";
import { Copy, Users, MonitorSmartphone, Ticket, LogOut, ShieldAlert, Eye, EyeOff } from "lucide-react";
import Cookies from "js-cookie";

const API_DEV_URL = "http://localhost:3000/api";

export default function App() {
  const [token, setToken] = useState<string | null>(Cookies.get("omni_admin_token") || null);
  const [role, setRole] = useState<string | null>(Cookies.get("omni_admin_role") || null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"users" | "devices" | "promos">("users");

  const [users, setUsers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    if (token) {
      if (activeTab === "users") fetchUsers();
      if (activeTab === "devices") fetchDevices();
      if (activeTab === "promos") fetchPromos();
    }
  }, [token, activeTab]);

  const handleLogin = async () => {
    setError(null);
    try {
      const res = await fetch(`${API_DEV_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { error: text };
      }

      if (!res.ok) {
        throw new Error(data.error || data || "Login failed");
      }

      if (data.role !== "admin" && data.role !== "super_admin") {
        throw new Error("Access Denied. You are not an administrator.");
      }

      setToken(data.access_token);
      setRole(data.role);
      Cookies.set("omni_admin_token", data.access_token, { secure: true, sameSite: 'strict' });
      Cookies.set("omni_admin_role", data.role, { secure: true, sameSite: 'strict' });
      if (data.refresh_token) {
        Cookies.set("omni_admin_refresh_token", data.refresh_token, { secure: true, sameSite: 'strict' });
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    Cookies.remove("omni_admin_token");
    Cookies.remove("omni_admin_role");
    Cookies.remove("omni_admin_refresh_token");
  };

  const authHeaders = { "Authorization": `Bearer ${token}` };

  const fetchUsers = async () => {
    const res = await fetch(`${API_DEV_URL}/admin/users`, { headers: authHeaders });
    if (res.ok) setUsers(await res.json());
  };

  const fetchDevices = async () => {
    const res = await fetch(`${API_DEV_URL}/admin/devices`, { headers: authHeaders });
    if (res.ok) setDevices(await res.json());
  };

  const fetchPromos = async () => {
    const res = await fetch(`${API_DEV_URL}/admin/promo-codes`, { headers: authHeaders });
    if (res.ok) setPromos(await res.json());
  };

  const upgradeUser = async (userId: string) => {
    if (!confirm("Are you sure you want to promote this user to Admin?")) return;
    setLoadingAction(true);
    await fetch(`${API_DEV_URL}/admin/users/${userId}/upgrade`, { method: "PATCH", headers: authHeaders });
    setLoadingAction(false);
    fetchUsers();
  };

  const createPromo = async () => {
    const code = prompt("Enter new Promo Code (e.g. SUMMER-26):");
    if (!code) return;
    const boost = prompt("How many extra devices?", "1");
    if (!boost) return;
    
    setLoadingAction(true);
    await fetch(`${API_DEV_URL}/admin/promo-codes`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ 
        code, 
        device_boost_count: parseInt(boost), 
        usage_limit: 100, 
        expiry_date: null 
      })
    });
    setLoadingAction(false);
    fetchPromos();
  };

  if (!token) {
    return (
      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-icon admin-icon"><ShieldAlert size={28}/></div>
            <h1>Admin Portal</h1>
            <p>Authorized Personnel Only</p>
          </div>
          <div className="form-group">
            <label>Master Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Master Password</label>
            <div className="password-input-wrapper">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <div className="alert-msg error">{error}</div>}
          <button className="primary-btn" onClick={handleLogin}>Log In</button>
        </div>
      </main>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Copy className="accent" size={24}/>
          <h2>OmniClip Command</h2>
        </div>
        
        <nav className="nav-menu">
          <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}><Users size={18}/> Users</button>
          <button className={activeTab === "devices" ? "active" : ""} onClick={() => setActiveTab("devices")}><MonitorSmartphone size={18}/> Devices</button>
          <button className={activeTab === "promos" ? "active" : ""} onClick={() => setActiveTab("promos")}><Ticket size={18}/> Promo Codes</button>
        </nav>

        <div className="sidebar-footer">
          <div className="badge role-badge">{role}</div>
          <button className="logout-btn" onClick={logout}><LogOut size={16}/> Logout</button>
        </div>
      </aside>

      <main className="content-area">
        {activeTab === "users" && (
          <div className="view-panel">
            <div className="panel-header">
              <h1>User Directory</h1>
              <p>Manage all registered clip clients.</p>
            </div>
            <table className="data-table">
              <thead><tr><th>Email</th><th>Role</th><th>Max Devices</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                    <td>{u.max_allowed_devices}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      {role === "super_admin" && u.role === "user" && (
                        <button disabled={loadingAction} className="sm-btn accent-btn" onClick={() => upgradeUser(u.id)}>Make Admin</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "devices" && (
          <div className="view-panel">
             <div className="panel-header">
              <h1>Connected Devices</h1>
              <p>Active clip watcher instances globally.</p>
            </div>
            <table className="data-table">
              <thead><tr><th>Name</th><th>OS</th><th>User ID</th><th>Last Sync</th></tr></thead>
              <tbody>
                {devices.map(d => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td><span className="badge neutral">{d.os}</span></td>
                    <td className="mono">{d.user_id.substring(0, 8)}...</td>
                    <td>{new Date(d.last_sync).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "promos" && (
          <div className="view-panel">
            <div className="panel-header flex-between">
              <div>
                <h1>Promotional Codes</h1>
                <p>Issue device limit upgrades to users.</p>
              </div>
              <button disabled={loadingAction} className="primary-btn shrink" onClick={createPromo}>+ Generate Promo</button>
            </div>
            <table className="data-table">
              <thead><tr><th>Code</th><th>Provides</th><th>Uses</th><th>Limit</th></tr></thead>
              <tbody>
                {promos.map(p => (
                  <tr key={p.code}>
                    <td className="mono font-bold text-accent">{p.code}</td>
                    <td>+{p.device_boost_count} Devices</td>
                    <td>{p.times_used}</td>
                    <td>{p.usage_limit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
