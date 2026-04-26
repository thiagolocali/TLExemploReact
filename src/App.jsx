import { useState, useEffect, useCallback } from "react";

const API_URL = "https://jsonplaceholder.typicode.com/users";

const fetchUsers = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Erro ao buscar usuários");
  const data = await res.json();
  return data.slice(0, 8).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    company: u.company.name,
  }));
};

const createUser = async (user) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Erro ao criar usuário");
  const data = await res.json();
  return { ...user, id: Date.now() };
};

const updateUser = async (user) => {
  const res = await fetch(`${API_URL}/${user.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Erro ao atualizar usuário");
  return user;
};

const deleteUser = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao deletar usuário");
};

const EMPTY_FORM = { name: "", email: "", phone: "", company: "" };

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 9999,
      background: type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#2563eb",
      color: "#fff", padding: "14px 24px", borderRadius: 12,
      fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500,
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      animation: "slideUp 0.3s cubic-bezier(.4,0,.2,1)",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span>{type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>
      {message}
    </div>
  );
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(10,10,20,0.55)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.2s ease"
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "36px 40px",
        minWidth: 420, maxWidth: 520, width: "90%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        animation: "scaleIn 0.25s cubic-bezier(.4,0,.2,1)"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#0f172a" }}>{title}</h2>
          <button onClick={onClose} style={{
            background: "#f1f5f9", border: "none", borderRadius: 8, width: 34, height: 34,
            cursor: "pointer", fontSize: 18, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center"
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function UserForm({ initial = EMPTY_FORM, onSubmit, loading }) {
  const [form, setForm] = useState(initial);
  useEffect(() => setForm(initial), [initial]);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const fields = [
    { key: "name", label: "Nome completo", placeholder: "Ex: Maria Silva", type: "text" },
    { key: "email", label: "E-mail", placeholder: "maria@email.com", type: "email" },
    { key: "phone", label: "Telefone", placeholder: "(11) 99999-0000", type: "text" },
    { key: "company", label: "Empresa", placeholder: "Nome da empresa", type: "text" },
  ];
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };
  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {fields.map(({ key, label, placeholder, type }) => (
        <label key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
          <input
            type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} required
            style={{
              padding: "11px 16px", border: "1.5px solid #e2e8f0", borderRadius: 10,
              fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#0f172a",
              outline: "none", transition: "border-color 0.2s",
              background: "#f8fafc"
            }}
            onFocus={e => e.target.style.borderColor = "#6366f1"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </label>
      ))}
      <button type="submit" disabled={loading} style={{
        marginTop: 8, padding: "13px 0", background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        color: "#fff", border: "none", borderRadius: 12, fontFamily: "'DM Sans', sans-serif",
        fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1, transition: "all 0.2s", letterSpacing: "0.02em"
      }}>
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}

function Avatar({ name }) {
  const initials = name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  const hue = (name.charCodeAt(0) * 37 + name.charCodeAt(1) * 13) % 360;
  return (
    <div style={{
      width: 44, height: 44, borderRadius: "50%",
      background: `hsl(${hue}, 60%, 60%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15,
      color: "#fff", flexShrink: 0, letterSpacing: "0.04em"
    }}>{initials}</div>
  );
}

function UserCard({ user, onEdit, onDelete }) {
  const [hovering, setHovering] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        background: "#fff", borderRadius: 18, padding: "22px 24px",
        boxShadow: hovering ? "0 12px 40px rgba(99,102,241,0.13)" : "0 2px 12px rgba(0,0,0,0.06)",
        border: hovering ? "1.5px solid #c7d2fe" : "1.5px solid #f1f5f9",
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        transform: hovering ? "translateY(-3px)" : "none",
        display: "flex", flexDirection: "column", gap: 14,
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar name={user.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6366f1", fontWeight: 500 }}>{user.company}</div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
        {[
          { icon: "✉", val: user.email },
          { icon: "☎", val: user.phone },
        ].map(({ icon, val }) => (
          <div key={val} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#475569" }}>
            <span style={{ fontSize: 14, opacity: 0.6 }}>{icon}</span>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{val}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
        <button onClick={() => onEdit(user)} style={{
          flex: 1, padding: "9px 0", background: "#eef2ff", color: "#6366f1",
          border: "none", borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.15s"
        }}>Editar</button>
        <button onClick={() => onDelete(user.id)} style={{
          flex: 1, padding: "9px 0", background: "#fef2f2", color: "#dc2626",
          border: "none", borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.15s"
        }}>Excluir</button>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{
      background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
      borderRadius: 18, height: 200
    }} />
  );
}

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      notify("Erro ao carregar usuários", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const user = await createUser(form);
      setUsers(u => [user, ...u]);
      setModal(null);
      notify("Usuário criado com sucesso!");
    } catch { notify("Erro ao criar usuário", "error"); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      const user = await updateUser({ ...form, id: editing.id });
      setUsers(u => u.map(x => x.id === user.id ? user : x));
      setModal(null);
      notify("Usuário atualizado!");
    } catch { notify("Erro ao atualizar", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await deleteUser(id);
      setUsers(u => u.filter(x => x.id !== id));
      notify("Usuário removido!");
    } catch { notify("Erro ao excluir", "error"); }
  };

  const openEdit = (user) => { setEditing(user); setModal("edit"); };
  const openCreate = () => { setEditing(null); setModal("create"); };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8f8ff; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes spinIn { from { transform: rotate(-180deg) scale(0.5); opacity: 0; } to { transform: rotate(0) scale(1); opacity: 1; } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 3px; }
      `}</style>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        padding: "40px 0 100px", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.12,
          backgroundImage: "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)",
        }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#a5b4fc", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Painel de Gestão</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, color: "#fff", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
                Usuários
              </h1>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#a5b4fc", marginTop: 6 }}>
                {users.length} usuários cadastrados via API
              </p>
            </div>
            <button onClick={openCreate} style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", border: "none", borderRadius: 14, padding: "14px 28px",
              fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700,
              cursor: "pointer", boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
              display: "flex", alignItems: "center", gap: 8,
              transition: "transform 0.15s, box-shadow 0.15s"
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(99,102,241,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.4)"; }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>+</span> Novo Usuário
            </button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: 1100, margin: "-60px auto 0", padding: "0 28px 60px", position: "relative" }}>
        {/* SEARCH BAR */}
        <div style={{
          background: "#fff", borderRadius: 18, padding: "18px 22px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.1)", marginBottom: 32,
          display: "flex", alignItems: "center", gap: 12,
          border: "1.5px solid #e2e8f0"
        }}>
          <span style={{ fontSize: 18, opacity: 0.4 }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, e-mail ou empresa..."
            style={{
              flex: 1, border: "none", outline: "none",
              fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#0f172a",
              background: "transparent"
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              background: "#f1f5f9", border: "none", borderRadius: 8, padding: "4px 10px",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#64748b"
            }}>Limpar</button>
          )}
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total", value: users.length, color: "#6366f1" },
            { label: "Resultado busca", value: filtered.length, color: "#8b5cf6" },
            { label: "API", value: "JSONPlaceholder", color: "#0ea5e9", isText: true },
          ].map(({ label, value, color, isText }) => (
            <div key={label} style={{
              background: "#fff", borderRadius: 14, padding: "18px 22px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: `1.5px solid ${color}22`
            }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              <div style={{ fontFamily: isText ? "'DM Sans', sans-serif" : "'Playfair Display', serif", fontSize: isText ? 15 : 28, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
          {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />) :
            filtered.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", fontSize: 17 }}>
                Nenhum usuário encontrado.
              </div>
            ) :
              filtered.map(user => (
                <UserCard key={user.id} user={user} onEdit={openEdit} onDelete={handleDelete} />
              ))
          }
        </div>
      </div>

      {/* MODAL CRIAR */}
      <Modal open={modal === "create"} title="Novo Usuário" onClose={() => setModal(null)}>
        <UserForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      {/* MODAL EDITAR */}
      <Modal open={modal === "edit"} title="Editar Usuário" onClose={() => setModal(null)}>
        {editing && <UserForm initial={editing} onSubmit={handleUpdate} loading={saving} />}
      </Modal>

      {/* TOAST */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* FOOTER */}
      <div style={{ textAlign: "center", padding: "0 0 32px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94a3b8" }}>
        Fake API via <a href="https://jsonplaceholder.typicode.com" target="_blank" rel="noreferrer" style={{ color: "#6366f1", textDecoration: "none" }}>JSONPlaceholder</a> · CRUD Completo
      </div>
    </>
  );
}
