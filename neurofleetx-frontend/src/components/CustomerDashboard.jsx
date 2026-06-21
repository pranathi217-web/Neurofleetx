import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/customerDashboard.css";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [stats] = useState({
    activeBookings: 4, totalTrips: 31, totalSpent: 24500,
    amountSaved: 2100, upcomingTrips: 4, favouriteRoute: "Hyderabad to Warangal"
  });

  const [upcomingTrips, setUpcomingTrips] = useState([
    { id: "TRP3001", date: "2 March",  route: "Hyderabad to Warangal"  },
    { id: "TRP3002", date: "5 March",  route: "Hyderabad to Vijayawada" },
    { id: "TRP3003", date: "8 March",  route: "Hyderabad to Nizamabad"  },
    { id: "TRP3004", date: "10 March", route: "Hyderabad to Karimnagar" }
  ]);

  const [pastTrips] = useState([
    { id: "TRP2901", route: "Hyderabad to Nizamabad",   date: "20 Feb", fare: 850 },
    { id: "TRP2880", route: "Hyderabad to Khammam",     date: "18 Feb", fare: 720 },
    { id: "TRP2850", route: "Hyderabad to Warangal",    date: "15 Feb", fare: 500 },
    { id: "TRP2820", route: "Hyderabad to Vijayawada",  date: "12 Feb", fare: 750 },
    { id: "TRP2800", route: "Hyderabad to Karimnagar",  date: "10 Feb", fare: 300 },
    { id: "TRP2780", route: "Hyderabad to Nalgonda",    date: "8 Feb",  fare: 600 },
    { id: "TRP2760", route: "Hyderabad to Mahbubnagar", date: "5 Feb",  fare: 550 }
  ]);

  const handleCancelTrip = (tripId) => {
    if (window.confirm("Are you sure you want to cancel trip " + tripId + "?")) {
      setUpcomingTrips(upcomingTrips.filter(trip => trip.id !== tripId));
      alert("Trip " + tripId + " has been cancelled successfully.");
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>

      {/* Navbar */}
      <nav style={{
        background: "#ffffff", padding: "1rem 2rem", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#667eea" }}>NeuroFleetX</div>
        <ul style={{ display: "flex", listStyle: "none", gap: "2rem", margin: 0, padding: 0 }}>
          {[
            { label: "Dashboard",        path: "/customer",            active: true },
            { label: "Plan Trip & Book", path: "/customer/plan-trip" },
            { label: "My Bookings",      path: "/customer/my-bookings" },
            { label: "My Trips",         path: "/customer/my-trips" },
            { label: "Profile",          path: "/customer/profile" },
          ].map(({ label, path, active }) => (
            <li key={label} onClick={() => navigate(path)} style={{
              cursor: "pointer", fontWeight: 500,
              color: active ? "#667eea" : "#555",
              transition: "color 0.2s"
            }}>
              {label}
            </li>
          ))}
        </ul>
        <button onClick={handleLogout} style={{
          background: "#dc3545", color: "white", border: "none",
          padding: "0.5rem 1.5rem", borderRadius: "8px",
          cursor: "pointer", fontWeight: 500
        }}>Logout</button>
      </nav>

      {/* Content */}
      <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>

        {/* Welcome — always fixed, never changes */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", color: "white", margin: 0, fontWeight: 700 }}>
            Welcome to Customer Dashboard
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "0.5rem", fontSize: "1rem" }}>
            Manage your trips and bookings efficiently
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem", marginBottom: "2rem"
        }}>
          {[
            { icon: "📋", label: "Active Bookings",  value: stats.activeBookings },
            { icon: "🚗", label: "Total Trips",       value: stats.totalTrips },
            { icon: "💰", label: "Total Spent",       value: `₹${stats.totalSpent.toLocaleString()}` },
            { icon: "💵", label: "Amount Saved",      value: `₹${stats.amountSaved.toLocaleString()}` },
            { icon: "📅", label: "Upcoming Trips",    value: stats.upcomingTrips },
            { icon: "⭐", label: "Favourite Route",   value: stats.favouriteRoute, small: true },
          ].map(({ icon, label, value, small }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,0.95)", padding: "1.5rem",
              borderRadius: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              display: "flex", alignItems: "center", gap: "1rem",
              transition: "transform 0.2s"
            }}
              onMouseOver={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <span style={{ fontSize: "2.2rem" }}>{icon}</span>
              <div>
                <div style={{ fontSize: small ? "0.95rem" : "1.7rem", fontWeight: 700, color: "#667eea" }}>
                  {value}
                </div>
                <div style={{ color: "#666", fontSize: "0.85rem", marginTop: "0.2rem" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: "rgba(255,255,255,0.95)", padding: "2rem",
          borderRadius: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          marginBottom: "2rem"
        }}>
          <h2 style={{ color: "#333", marginTop: 0, marginBottom: "1.5rem" }}>Quick Actions</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/customer/plan-trip")} style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white", border: "none", padding: "0.75rem 2rem",
              borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "1rem"
            }}>Plan Trip</button>
            <button onClick={() => navigate("/customer/my-bookings")} style={{
              background: "#6c757d", color: "white", border: "none",
              padding: "0.75rem 2rem", borderRadius: "8px",
              fontWeight: 600, cursor: "pointer", fontSize: "1rem"
            }}>My Bookings</button>
          </div>
        </div>

        {/* Upcoming Trips */}
        <div style={{
          background: "rgba(255,255,255,0.95)", padding: "2rem",
          borderRadius: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          marginBottom: "2rem"
        }}>
          <h2 style={{ color: "#333", marginTop: 0, marginBottom: "1.5rem" }}>Upcoming Trips</h2>
          {upcomingTrips.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
              <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>No upcoming trips scheduled</p>
              <button onClick={() => navigate("/customer/plan-trip")} style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white", border: "none", padding: "0.75rem 2rem",
                borderRadius: "8px", fontWeight: 600, cursor: "pointer"
              }}>Plan Your First Trip</button>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem"
            }}>
              {upcomingTrips.map(trip => (
                <div key={trip.id} style={{
                  background: "#f8f9fa", padding: "1.5rem", borderRadius: "10px",
                  borderLeft: "4px solid #667eea", display: "flex",
                  flexDirection: "column", gap: "1rem"
                }}>
                  <div>
                    <h3 style={{ color: "#333", margin: "0 0 0.5rem", fontSize: "1.05rem" }}>{trip.id}</h3>
                    <p style={{ color: "#666", margin: "0.25rem 0", fontSize: "0.95rem" }}>📅 {trip.date}</p>
                    <p style={{ color: "#666", margin: "0.25rem 0", fontSize: "0.95rem" }}>📍 {trip.route}</p>
                  </div>
                  <button onClick={() => handleCancelTrip(trip.id)} style={{
                    background: "#dc3545", color: "white", border: "none",
                    padding: "0.5rem 1rem", borderRadius: "6px",
                    cursor: "pointer", fontWeight: 500
                  }}>Cancel Trip</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Trips */}
        <div style={{
          background: "rgba(255,255,255,0.95)", padding: "2rem",
          borderRadius: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
        }}>
          <h2 style={{ color: "#333", marginTop: 0, marginBottom: "1.5rem" }}>Past Trips</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  <th style={{ padding: "1rem", textAlign: "left", color: "#333", fontWeight: 600, borderBottom: "2px solid #dee2e6" }}>Trip ID</th>
                  <th style={{ padding: "1rem", textAlign: "left", color: "#333", fontWeight: 600, borderBottom: "2px solid #dee2e6" }}>Route</th>
                  <th style={{ padding: "1rem", textAlign: "left", color: "#333", fontWeight: 600, borderBottom: "2px solid #dee2e6" }}>Date</th>
                  <th style={{ padding: "1rem", textAlign: "left", color: "#333", fontWeight: 600, borderBottom: "2px solid #dee2e6" }}>Fare</th>
                </tr>
              </thead>
              <tbody>
                {pastTrips.map(trip => (
                  <tr key={trip.id} style={{ borderBottom: "1px solid #dee2e6" }}
                    onMouseOver={e => e.currentTarget.style.background = "#f8f9fa"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "1rem", color: "#555" }}>{trip.id}</td>
                    <td style={{ padding: "1rem", color: "#555" }}>{trip.route}</td>
                    <td style={{ padding: "1rem", color: "#555" }}>{trip.date}</td>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "#28a745" }}>₹{trip.fare}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CustomerDashboard;