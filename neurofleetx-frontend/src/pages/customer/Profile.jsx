import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "Customer",
    email: "customer@neurofleetx.com",
    phone: "",
    city: "",
    totalTrips: 31,
    totalSpent: 24500,
    memberSince: "December 2023"
  });

  useEffect(() => {
    // Only pull email from localStorage - name is always "Customer"
    const email = localStorage.getItem("userEmail") || "customer@neurofleetx.com";
    setProfile(prev => ({ ...prev, email }));
  }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    alert("Profile updated successfully!");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/customer")} className="back-btn">← Back</button>
        <h1>My Profile</h1>
      </div>

      {/* Profile Banner - always shows "Customer" */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem",
        display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap"
      }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          background: "rgba(255,255,255,0.3)", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: "2.2rem",
          border: "3px solid rgba(255,255,255,0.6)", flexShrink: 0
        }}>
          👤
        </div>
        <div style={{ color: "white" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Customer</h2>
          <p style={{ margin: "0.3rem 0 0", opacity: 0.85 }}>{profile.email}</p>
          <p style={{ margin: "0.2rem 0 0", opacity: 0.7, fontSize: "0.9rem" }}>📅 Member since {profile.memberSince}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "1rem", marginBottom: "1.5rem"
      }}>
        {[
          { icon: "🚗", label: "Total Trips",   value: profile.totalTrips },
          { icon: "💰", label: "Total Spent",   value: `₹${profile.totalSpent.toLocaleString()}` },
          { icon: "🌟", label: "Member Status", value: "Gold" },
          { icon: "📍", label: "City",          value: profile.city || "Hyderabad" },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{
            background: "white", borderRadius: "12px", padding: "1.2rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)", textAlign: "center"
          }}>
            <div style={{ fontSize: "1.6rem", marginBottom: "0.3rem" }}>{icon}</div>
            <p style={{ color: "#888", fontSize: "0.78rem", margin: "0 0 0.3rem", fontWeight: 600, textTransform: "uppercase" }}>{label}</p>
            <p style={{ color: "#1a1a1a", fontWeight: 700, margin: 0, fontSize: "1.1rem" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      <div style={{
        background: "white", borderRadius: "14px", padding: "2rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#333", borderBottom: "2px solid #f0f0f0", paddingBottom: "0.75rem" }}>
          ✏️ Edit Details
        </h3>
        <form onSubmit={handleUpdate}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            {[
              { label: "Phone Number", key: "phone", type: "tel" },
              { label: "City",         key: "city",  type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 600, color: "#555", fontSize: "0.9rem" }}>{label}</label>
                <input
                  type={type}
                  value={profile[key]}
                  onChange={e => setProfile({ ...profile, [key]: e.target.value })}
                  style={{
                    width: "100%", padding: "0.65rem 0.9rem", borderRadius: "8px",
                    border: "1.5px solid #e0e0e0", fontSize: "0.95rem", boxSizing: "border-box", outline: "none"
                  }}
                  onFocus={e => e.target.style.borderColor = "#667eea"}
                  onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>
            ))}
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 600, color: "#555", fontSize: "0.9rem" }}>Email (read-only)</label>
              <input
                type="email"
                value={profile.email}
                disabled
                style={{
                  width: "100%", padding: "0.65rem 0.9rem", borderRadius: "8px",
                  border: "1.5px solid #e0e0e0", fontSize: "0.95rem", boxSizing: "border-box",
                  background: "#f8f8f8", color: "#888"
                }}
              />
            </div>
          </div>
          <button type="submit" style={{
            marginTop: "1.5rem", padding: "0.75rem 2.5rem", borderRadius: "8px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "1rem"
          }}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;