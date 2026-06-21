import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";

const INITIAL_USERS = [
  { id: 1, name: "Rajesh Kumar", email: "rajesh@example.com", role: "DRIVER", status: "Active" },
  { id: 2, name: "Priya Sharma", email: "priya@example.com", role: "CUSTOMER", status: "Active" },
  { id: 3, name: "Ravi Patel", email: "ravi@example.com", role: "MANAGER", status: "Active" },
  { id: 4, name: "Ananya Singh", email: "ananya@example.com", role: "CUSTOMER", status: "Active" },
  { id: 5, name: "Vikram Reddy", email: "vikram@example.com", role: "DRIVER", status: "Active" },
  { id: 6, name: "Suresh Kumar", email: "suresh@example.com", role: "DRIVER", status: "Inactive" },
  { id: 7, name: "Meera Nair", email: "meera@example.com", role: "CUSTOMER", status: "Active" },
  { id: 8, name: "Amit Verma", email: "amit@example.com", role: "MANAGER", status: "Active" },
  { id: 9, name: "Kiran Kumar", email: "kiran@example.com", role: "DRIVER", status: "Active" },
  { id: 10, name: "Deepa Rao", email: "deepa@example.com", role: "CUSTOMER", status: "Active" },
  { id: 11, name: "Sanjay Gupta", email: "sanjay@example.com", role: "DRIVER", status: "Active" },
  { id: 12, name: "Lakshmi Iyer", email: "lakshmi@example.com", role: "CUSTOMER", status: "Active" },
  { id: 13, name: "Arun Krishnan", email: "arun@example.com", role: "MANAGER", status: "Active" },
  { id: 14, name: "Pooja Desai", email: "pooja@example.com", role: "CUSTOMER", status: "Active" },
  { id: 15, name: "Ramesh Babu", email: "ramesh@example.com", role: "DRIVER", status: "Active" }
];

const EMPTY_FORM = { name: "", email: "", role: "CUSTOMER", status: "Active" };

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState(INITIAL_USERS);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Name and Email are required.");
      return;
    }
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      const newId = Math.max(...users.map(u => u.id)) + 1;
      setUsers([...users, { id: newId, ...formData }]);
    }
    setShowModal(false);
  };

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers(users.filter(u => u.id !== user.id));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/admin")} className="back-btn">← Back</button>
        <h1>Manage Users</h1>
        <button className="primary-btn" onClick={openAddModal}>+ Add New User</button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className="role-badge">{user.role}</span></td>
                <td>
                  <span className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <button className="view-btn" onClick={() => openEditModal(user)}>Edit</button>
                  <button
                    style={{
                      background: "transparent",
                      color: "#dc3545",
                      border: "1.5px solid #dc3545",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                      fontSize: "0.85rem",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={e => { e.target.style.background = "#dc3545"; e.target.style.color = "white"; }}
                    onMouseOut={e => { e.target.style.background = "transparent"; e.target.style.color = "#dc3545"; }}
                    onClick={() => handleDelete(user)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "white", borderRadius: "14px", padding: "2rem",
            width: "420px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
          }}>
            <h2 style={{ marginBottom: "1.5rem", color: "#1a1a1a" }}>
              {editingUser ? "Edit User" : "Add New User"}
            </h2>

            {[
              { label: "Name", key: "name", type: "text" },
              { label: "Email", key: "email", type: "email" },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 600, color: "#444" }}>{label}</label>
                <input
                  type={type}
                  value={formData[key]}
                  onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                  style={{
                    width: "100%", padding: "0.6rem 0.9rem", borderRadius: "8px",
                    border: "1.5px solid #ddd", fontSize: "0.95rem", boxSizing: "border-box"
                  }}
                />
              </div>
            ))}

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 600, color: "#444" }}>Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                style={{
                  width: "100%", padding: "0.6rem 0.9rem", borderRadius: "8px",
                  border: "1.5px solid #ddd", fontSize: "0.95rem"
                }}
              >
                {["CUSTOMER", "DRIVER", "MANAGER"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 600, color: "#444" }}>Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: "100%", padding: "0.6rem 0.9rem", borderRadius: "8px",
                  border: "1.5px solid #ddd", fontSize: "0.95rem"
                }}
              >
                {["Active", "Inactive"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "0.6rem 1.4rem", borderRadius: "8px",
                  border: "1.5px solid #ddd", background: "white",
                  cursor: "pointer", fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: "0.6rem 1.4rem", borderRadius: "8px",
                  background: "#667eea", color: "white",
                  border: "none", cursor: "pointer", fontWeight: 600
                }}
              >
                {editingUser ? "Save Changes" : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;