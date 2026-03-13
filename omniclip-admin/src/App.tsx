import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { Copy, Users, MonitorSmartphone, Ticket, LogOut, ShieldAlert, Eye, EyeOff } from "lucide-react";
import Cookies from "js-cookie";
import "./App.css";

const API = "http://localhost:3000/api";

function authHeaders(): Record<string, string> {
  const token = Cookies.get("omni_admin_token");
  return { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
}

// ───────────────────────── LOGIN ─────────────────────────
function LoginPage({ onLogin }: { onLogin: (token: string, role: string, refresh: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setError(null);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = { error: text }; }
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (data.role !== "admin" && data.role !== "super_admin") throw new Error("Access Denied. Not an administrator.");
      onLogin(data.access_token, data.role, data.refresh_token || "");
    } catch (e: any) { setError(e.message); }
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") handle(); };

  return (
    <main className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-icon admin-icon"><ShieldAlert size={28} /></div>
          <h1>Admin Portal</h1>
          <p>Authorized Personnel Only</p>
        </div>
        <div className="form-group">
          <label>Master Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey} />
        </div>
        <div className="form-group">
          <label>Master Password</label>
          <div className="password-input-wrapper">
            <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey} />
            <button type="button" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {error && <div className="alert-msg error">{error}</div>}
        <button className="primary-btn" onClick={handle}>Log In</button>
      </div>
    </main>
  );
}

// ───────────────────────── MODAL ─────────────────────────
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ───────────────────────── USERS PAGE ─────────────────────────
function UsersPage({ role }: { role: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userDevices, setUserDevices] = useState<any[]>([]);
  const [promoteTarget, setPromoteTarget] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const res = await fetch(`${API}/admin/users`, { headers: authHeaders() });
    if (res.ok) setUsers(await res.json());
  };

  const openUser = async (user: any) => {
    setSelectedUser(user);
    const res = await fetch(`${API}/admin/users/${user.id}/devices`, { headers: authHeaders() });
    if (res.ok) setUserDevices(await res.json());
    else setUserDevices([]);
  };

  const confirmUpgrade = async () => {
    if (!promoteTarget) return;
    setLoading(true);
    await fetch(`${API}/admin/users/${promoteTarget.id}/upgrade`, { method: "PATCH", headers: authHeaders() });
    setLoading(false);
    setPromoteTarget(null);
    fetchUsers();
    if (selectedUser?.id === promoteTarget.id) setSelectedUser({ ...selectedUser, role: "admin" });
  };

  return (
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
              <td><button className="link-btn" onClick={() => openUser(u)}>{u.email}</button></td>
              <td><span className={`badge ${u.role}`}>{u.role}</span></td>
              <td>{u.max_allowed_devices}</td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td>
                {role === "super_admin" && u.role === "user" && (
                  <button className="sm-btn accent-btn" onClick={() => setPromoteTarget(u)}>Make Admin</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* User detail modal */}
      {selectedUser && (
        <Modal title={`User: ${selectedUser.email}`} onClose={() => setSelectedUser(null)}>
          <div className="user-detail">
            <div className="detail-row"><span>Role</span><span className={`badge ${selectedUser.role}`}>{selectedUser.role}</span></div>
            <div className="detail-row"><span>Plan</span><span>{selectedUser.plan_type}</span></div>
            <div className="detail-row"><span>Max Devices</span><span>{selectedUser.max_allowed_devices}</span></div>
            <div className="detail-row"><span>Joined</span><span>{new Date(selectedUser.created_at).toLocaleDateString()}</span></div>
          </div>
          <h3 className="modal-section-title">Linked Devices ({userDevices.length})</h3>
          {userDevices.length === 0
            ? <p className="muted-text">No devices linked to this account.</p>
            : <table className="data-table modal-table">
                <thead><tr><th>Name</th><th>OS</th><th>Last Sync</th></tr></thead>
                <tbody>
                  {userDevices.map(d => (
                    <tr key={d.id}>
                      <td>{d.name}</td>
                      <td><span className="badge neutral">{d.os}</span></td>
                      <td>{new Date(d.last_sync).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </Modal>
      )}

      {/* Promote confirm modal */}
      {promoteTarget && (
        <Modal title="⚠️ Confirm Promotion" onClose={() => setPromoteTarget(null)}>
          <div className="warning-box">
            <p><strong>Warning:</strong> This user will gain full Admin access to system configurations, user management, and promo codes.</p>
            <p className="muted-text mt-1">User: <strong>{promoteTarget.email}</strong></p>
          </div>
          <div className="modal-actions">
            <button className="sm-btn" onClick={() => setPromoteTarget(null)}>Cancel</button>
            <button className="sm-btn accent-btn" disabled={loading} onClick={confirmUpgrade}>
              {loading ? "Promoting..." : "Yes, Promote to Admin"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ───────────────────────── DEVICES PAGE ─────────────────────────
function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchDevices(); }, []);

  const fetchDevices = async () => {
    const res = await fetch(`${API}/admin/devices`, { headers: authHeaders() });
    if (res.ok) setDevices(await res.json());
  };

  const filtered = search.trim()
    ? devices.filter(d => d.user_email?.toLowerCase().includes(search.toLowerCase()))
    : devices;

  const sessionCount = search.trim() ? filtered.length : null;

  return (
    <div className="view-panel">
      <div className="panel-header flex-between">
        <div>
          <h1>Connected Devices</h1>
          <p>Active clip watcher instances globally.</p>
        </div>
      </div>
      <div className="search-bar-wrapper">
        <input
          className="search-input"
          type="text"
          placeholder="Filter by user email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {sessionCount !== null && (
          <span className="session-count">{sessionCount} active session{sessionCount !== 1 ? "s" : ""}</span>
        )}
      </div>
      <table className="data-table">
        <thead><tr><th>Name</th><th>OS</th><th>User Email</th><th>Last Sync</th></tr></thead>
        <tbody>
          {filtered.map(d => (
            <tr key={d.id}>
              <td>{d.name}</td>
              <td><span className="badge neutral">{d.os}</span></td>
              <td className="muted-text">{d.user_email}</td>
              <td>{new Date(d.last_sync).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ───────────────────────── PROMOS PAGE ─────────────────────────
function PromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [newCode, setNewCode] = useState("");
  const [newBoost, setNewBoost] = useState("5");
  const [newLimit, setNewLimit] = useState("100");
  const [newExpiry, setNewExpiry] = useState("");

  const [editLimit, setEditLimit] = useState("");
  const [editExpiry, setEditExpiry] = useState("");

  useEffect(() => { fetchPromos(); }, []);

  const fetchPromos = async () => {
    const res = await fetch(`${API}/admin/promo-codes`, { headers: authHeaders() });
    if (res.ok) setPromos(await res.json());
  };

  const createPromo = async () => {
    if (!newCode) return;
    setLoading(true);
    await fetch(`${API}/admin/promo-codes`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        code: newCode.toUpperCase(),
        device_boost_count: parseInt(newBoost),
        usage_limit: parseInt(newLimit),
        expiry_date: newExpiry ? new Date(newExpiry).toISOString() : null,
      }),
    });
    setLoading(false);
    setCreateModal(false);
    setNewCode(""); setNewBoost("5"); setNewLimit("100"); setNewExpiry("");
    fetchPromos();
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    setLoading(true);
    await fetch(`${API}/admin/promo-codes/${editTarget.code}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({
        usage_limit: editLimit ? parseInt(editLimit) : null,
        expiry_date: editExpiry ? new Date(editExpiry).toISOString() : null,
      }),
    });
    setLoading(false);
    setEditTarget(null);
    fetchPromos();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    await fetch(`${API}/admin/promo-codes/${deleteTarget.code}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    setLoading(false);
    setDeleteTarget(null);
    fetchPromos();
  };

  const openEdit = (p: any) => {
    setEditTarget(p);
    setEditLimit(String(p.usage_limit));
    setEditExpiry(p.expiry_date ? new Date(p.expiry_date).toISOString().slice(0, 16) : "");
  };

  return (
    <div className="view-panel">
      <div className="panel-header flex-between">
        <div>
          <h1>Promotional Codes</h1>
          <p>Issue device limit upgrades to users.</p>
        </div>
        <button className="primary-btn shrink" onClick={() => setCreateModal(true)}>+ Generate Promo</button>
      </div>
      <table className="data-table">
        <thead><tr><th>Code</th><th>Provides</th><th>Uses / Limit</th><th>Expires</th><th>Actions</th></tr></thead>
        <tbody>
          {promos.map(p => (
            <tr key={p.code}>
              <td className="mono font-bold text-accent">{p.code}</td>
              <td>+{p.device_boost_count} Devices</td>
              <td>{p.times_used} / {p.usage_limit}</td>
              <td>{p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : <span className="muted-text">Never</span>}</td>
              <td className="action-cell">
                <button className="sm-btn ghost-btn" onClick={() => openEdit(p)}>Edit</button>
                <button className="sm-btn danger-btn" onClick={() => setDeleteTarget(p)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create modal */}
      {createModal && (
        <Modal title="Generate Promo Code" onClose={() => setCreateModal(false)}>
          <div className="form-group"><label>Code</label><input value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="SUMMER-26" /></div>
          <div className="form-row">
            <div className="form-group"><label>Device Boost</label><input type="number" value={newBoost} onChange={e => setNewBoost(e.target.value)} /></div>
            <div className="form-group"><label>Usage Limit</label><input type="number" value={newLimit} onChange={e => setNewLimit(e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Expiry Date (optional)</label><input type="datetime-local" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} /></div>
          <div className="modal-actions">
            <button className="sm-btn" onClick={() => setCreateModal(false)}>Cancel</button>
            <button className="sm-btn accent-btn" disabled={loading || !newCode} onClick={createPromo}>Create</button>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {editTarget && (
        <Modal title={`Edit: ${editTarget.code}`} onClose={() => setEditTarget(null)}>
          <div className="form-group"><label>Usage Limit</label><input type="number" value={editLimit} onChange={e => setEditLimit(e.target.value)} /></div>
          <div className="form-group"><label>Expiry Date</label><input type="datetime-local" value={editExpiry} onChange={e => setEditExpiry(e.target.value)} /></div>
          <div className="modal-actions">
            <button className="sm-btn" onClick={() => setEditTarget(null)}>Cancel</button>
            <button className="sm-btn accent-btn" disabled={loading} onClick={saveEdit}>Save Changes</button>
          </div>
        </Modal>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <Modal title="🗑️ Delete Promo Code" onClose={() => setDeleteTarget(null)}>
          <div className="warning-box">
            <p>This will permanently revoke the promo code <strong>{deleteTarget.code}</strong>. Users will no longer be able to redeem it.</p>
          </div>
          <div className="modal-actions">
            <button className="sm-btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="sm-btn danger-btn" disabled={loading} onClick={confirmDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ───────────────────────── LAYOUT ─────────────────────────
function AdminLayout({ role, onLogout }: { role: string; onLogout: () => void }) {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Copy className="accent" size={24} />
          <h2>OmniClip Command</h2>
        </div>
        <nav className="nav-menu">
          <NavLink to="/users" className={({ isActive }) => isActive ? "active" : ""}><Users size={18} /> Users</NavLink>
          <NavLink to="/devices" className={({ isActive }) => isActive ? "active" : ""}><MonitorSmartphone size={18} /> Devices</NavLink>
          <NavLink to="/promos" className={({ isActive }) => isActive ? "active" : ""}><Ticket size={18} /> Promo Codes</NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="badge role-badge">{role}</div>
          <button className="logout-btn" onClick={onLogout}><LogOut size={16} /> Logout</button>
        </div>
      </aside>
      <main className="content-area">
        <Routes>
          <Route path="/users" element={<UsersPage role={role} />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/promos" element={<PromosPage />} />
          <Route path="*" element={<Navigate to="/users" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// ───────────────────────── ROOT ─────────────────────────
export default function App() {
  const [token, setToken] = useState<string | null>(Cookies.get("omni_admin_token") || null);
  const [role, setRole] = useState<string | null>(Cookies.get("omni_admin_role") || null);

  const handleLogin = (t: string, r: string, refresh: string) => {
    Cookies.set("omni_admin_token", t, { secure: true, sameSite: "strict" });
    Cookies.set("omni_admin_role", r, { secure: true, sameSite: "strict" });
    if (refresh) Cookies.set("omni_admin_refresh_token", refresh, { secure: true, sameSite: "strict" });
    setToken(t);
    setRole(r);
  };

  const handleLogout = () => {
    Cookies.remove("omni_admin_token");
    Cookies.remove("omni_admin_role");
    Cookies.remove("omni_admin_refresh_token");
    setToken(null);
    setRole(null);
  };

  if (!token || !role) return <BrowserRouter><LoginPage onLogin={handleLogin} /></BrowserRouter>;

  return (
    <BrowserRouter>
      <AdminLayout role={role} onLogout={handleLogout} />
    </BrowserRouter>
  );
}
