import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/fleetDashboard.css";

const FleetManagerDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeTrips: 0,
    totalVehicles: 0,
    activeDrivers: 0,
    averageTripRevenue: 0,
    topDriverName: "N/A",
    motivationalMessage: ""
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Fleet Manager";
    setUserName(name);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`http://localhost:8082/api/fleet/dashboard/test`);
      const data = response.data;
      setStats({
        totalRevenue: data.totalRevenue,
        activeTrips: data.activeTrips,
        totalVehicles: data.totalVehicles,
        activeDrivers: data.activeDrivers,
        averageTripRevenue: data.averageTripRevenue,
        topDriverName: data.topDriverName,
        motivationalMessage: data.motivationalMessage
      });
      setMonthlyRevenue(data.monthlyRevenue);
      setRecentTrips(data.recentTrips);
      setLoading(false);
    } catch (error) {
      console.log("Backend offline, showing empty state.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <h2 style={{ color: "#0f5132" }}>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", fontFamily: "Segoe UI, sans-serif" }}>

      {/* Top Navbar */}
      <nav style={{
        background: "#ffffff", padding: "1rem 2rem", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)", position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f5132" }}>NeuroFleetX</div>
        <ul style={{ display: "flex", listStyle: "none", gap: "1.8rem", margin: 0, padding: 0 }}>
          {[
            { label: "Dashboard",       path: "/manager",            active: true },
            { label: "Fleet",           path: "/manager/fleet" },
            { label: "Fleet Inventory", path: "/fleet-inventory" },
            { label: "Drivers",         path: "/manager/drivers" },
            { label: "Trips",           path: "/manager/trips" },
            { label: "Maintenance",     path: "/manager/maintenance" },
            { label: "Reports",         path: "/manager/reports" },
          ].map(({ label, path, active }) => (
            <li key={label} onClick={() => navigate(path)} style={{
              cursor: "pointer", fontWeight: 500,
              color: active ? "#198754" : "#555",
              transition: "color 0.2s"
            }}>
              {label}
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontWeight: 600, color: "#0f5132" }}>👤 {userName}</span>
          <button onClick={handleLogout} style={{
            background: "#dc3545", color: "white", border: "none",
            padding: "0.5rem 1.2rem", borderRadius: "8px", cursor: "pointer", fontWeight: 500
          }}>Logout</button>
        </div>
      </nav>

      {/* Page Content */}
      <div style={{ padding: "2rem" }}>

        {/* Welcome */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ margin: 0, fontSize: "2rem", color: "#0f5132", fontWeight: 700 }}>Fleet Manager Dashboard</h1>
          <p style={{ margin: "0.4rem 0 0", color: "#555" }}>Welcome back, {userName}! Manage your fleet efficiently.</p>
        </div>

        {/* Motivational Message */}
        {stats.motivationalMessage && (
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white", padding: "1rem 2rem", borderRadius: "12px",
            marginBottom: "1.5rem", textAlign: "center",
            fontSize: "1.2rem", fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            💡 {stats.motivationalMessage}
          </div>
        )}

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total Revenue",    value: `₹${stats.totalRevenue.toLocaleString()}` },
            { label: "Active Trips",     value: stats.activeTrips },
            { label: "Total Vehicles",   value: stats.totalVehicles },
            { label: "Active Drivers",   value: stats.activeDrivers },
            { label: "Avg Trip Revenue", value: `₹${stats.averageTripRevenue.toFixed(2)}` },
            { label: "Top Driver",       value: stats.topDriverName },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: "white", borderRadius: "14px", padding: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center"
            }}>
              <h3 style={{ margin: "0 0 0.5rem", color: "#666", fontSize: "0.95rem" }}>{label}</h3>
              <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#0f5132" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Analytics Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>

          {/* Monthly Revenue */}
          <div style={{ background: "white", borderRadius: "14px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h3 style={{ margin: "0 0 1rem" }}>Monthly Revenue</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {Object.keys(monthlyRevenue).length > 0 ? (
                Object.entries(monthlyRevenue).map(([month, revenue]) => (
                  <div key={month} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "0.5rem 0.75rem", borderRadius: "8px", background: "#f8f9fa"
                  }}>
                    <span style={{ fontWeight: 500, color: "#555" }}>{month}</span>
                    <span style={{ fontWeight: 700, color: "#198754" }}>₹{revenue.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", color: "#888" }}>No revenue data</p>
              )}
            </div>
          </div>

          {/* Traffic Analytics */}
          <div style={{ background: "white", borderRadius: "14px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h3 style={{ margin: "0 0 0.75rem" }}>Traffic Analytics</h3>
            <p style={{ color: "#555" }}>Trip performance insights & fleet efficiency analytics.</p>
            <button
              onClick={() => navigate("/manager/reports")}
              style={{
                background: "#198754", color: "white", border: "none",
                padding: "0.5rem 1.2rem", borderRadius: "8px",
                cursor: "pointer", fontWeight: 600, marginTop: "0.5rem"
              }}
            >
              View Details
            </button>
          </div>

        </div>

        {/* Recent Trips */}
        <div style={{ background: "white", borderRadius: "14px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin: "0 0 1rem" }}>Recent Trips</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Trip ID</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Driver</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Status</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.length > 0 ? (
                recentTrips.map((trip) => (
                  <tr key={trip.tripId} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "0.75rem" }}>{trip.tripId}</td>
                    <td style={{ padding: "0.75rem" }}>{trip.driverName}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <span className={`status-badge ${trip.status.toLowerCase()}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", fontWeight: 600, color: "#198754" }}>
                      ₹{trip.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", color: "#888", padding: "2rem" }}>
                    No trips available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default FleetManagerDashboard;