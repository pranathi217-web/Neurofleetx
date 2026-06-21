import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/driverDashboard.css";

function DriverDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [driverId, setDriverId] = useState(null);

  const DEMO_VEHICLE = {
    id: 1, vehicleNumber: "TS09AB1234", model: "Tata Nexon EV",
    status: "ACTIVE", batteryPercentage: 87, fuelPercentage: 72
  };

  const [assignedVehicle, setAssignedVehicle] = useState(DEMO_VEHICLE);
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripDuration, setTripDuration] = useState("0 min");
  const [tripMessage, setTripMessage] = useState(null); // { type: "success"|"error", text }

  const [stats] = useState({
    todayEarnings: 3100, totalTrips: 187, rating: 4.7,
    completedTrips: 180, hoursOnline: 9, weeklyEarnings: 10500
  });

  const [recentTrips] = useState([
    { id: "TRP2101", route: "Hyderabad → Warangal",   status: "Completed", earnings: 500 },
    { id: "TRP2102", route: "Hyderabad → Vijayawada", status: "Completed", earnings: 750 },
    { id: "TRP2103", route: "Hyderabad → Karimnagar", status: "Active",    earnings: 300 },
    { id: "TRP2104", route: "Hyderabad → Nizamabad",  status: "Completed", earnings: 450 },
    { id: "TRP2105", route: "Warangal → Hyderabad",   status: "Completed", earnings: 500 },
    { id: "TRP2106", route: "Hyderabad → Khammam",    status: "Completed", earnings: 400 },
    { id: "TRP2107", route: "Vijayawada → Hyderabad", status: "Completed", earnings: 750 }
  ]);

  const [weeklyEarnings] = useState([650, 850, 1400, 1100, 1700, 1300, 1900]);

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Driver";
    const userId = localStorage.getItem("userId");
    setUserName(name);
    setDriverId(userId);
    if (userId) fetchAssignedVehicle(userId);
  }, []);

  // Trip duration timer
  useEffect(() => {
    if (activeTrip && activeTrip.startTime) {
      const interval = setInterval(() => {
        setTripDuration(calculateDuration(activeTrip.startTime));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTrip]);

  const calculateDuration = (startTime) => {
    if (!startTime) return "0 min";
    const diffMins = Math.floor((new Date() - new Date(startTime)) / 60000);
    const h = Math.floor(diffMins / 60), m = diffMins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const showMessage = (type, text) => {
    setTripMessage({ type, text });
    setTimeout(() => setTripMessage(null), 3000);
  };

  const fetchAssignedVehicle = async (userId) => {
    try {
      const response = await fetch("http://localhost:8082/api/vehicles/test");
      if (response.ok) {
        const vehicles = await response.json();
        const assigned = vehicles.find(v => v.assignedDriverId === parseInt(userId));
        if (assigned) setAssignedVehicle(assigned);
      }
    } catch {
      // Backend offline — keep demo vehicle
    }
  };

  // Start trip - works in demo mode if backend is offline
  const handleStartTrip = async () => {
    if (assignedVehicle.status === "MAINTENANCE") {
      showMessage("error", "❌ Vehicle is under maintenance. Cannot start trip.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8082/api/trips/test/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, vehicleId: assignedVehicle.id })
      });
      if (response.ok) {
        const trip = await response.json();
        setActiveTrip(trip);
        showMessage("success", "✅ Trip started successfully!");
      } else {
        throw new Error("API error");
      }
    } catch {
      // Backend offline → start demo trip
      const demoTrip = { id: "DEMO-001", startTime: new Date().toISOString() };
      setActiveTrip(demoTrip);
      showMessage("success", "✅ Trip started (demo mode)!");
    }
  };

  // End trip - works in demo mode if backend is offline
  const handleEndTrip = async () => {
    if (!activeTrip) {
      showMessage("error", "❌ No active trip to end.");
      return;
    }
    try {
      if (!activeTrip.id.startsWith("DEMO")) {
        await fetch(`http://localhost:8082/api/trips/test/end/${activeTrip.id}`, { method: "PUT" });
      }
    } catch {
      // Backend offline — just clear the trip locally
    }
    setActiveTrip(null);
    showMessage("success", "✅ Trip ended successfully!");
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div className="driver-dashboard">
      <nav className="dashboard-navbar">
        <div className="navbar-brand">NeuroFleetX</div>
        <ul className="navbar-menu">
          <li className="active" onClick={() => navigate("/driver")}>Dashboard</li>
          <li onClick={() => navigate("/driver/my-trips")}>My Trips</li>
          <li onClick={() => navigate("/driver/navigation")}>Route Navigation</li>
          <li onClick={() => navigate("/driver/earnings")}>Earnings</li>
          <li onClick={() => navigate("/driver/schedule")}>Schedule</li>
          <li onClick={() => navigate("/driver/maintenance")}>Vehicle Health</li>
          <li onClick={() => navigate("/driver/profile")}>Profile</li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>

      <div className="dashboard-content">

        <div className="welcome-section">
          <h1>Driver Dashboard</h1>
          <p>Welcome back, {userName}! Ready to hit the road?</p>
        </div>

        {/* Toast-style message */}
        {tripMessage && (
          <div style={{
            padding: "0.9rem 1.5rem", borderRadius: "10px", marginBottom: "1rem",
            fontWeight: 600, fontSize: "1rem",
            background: tripMessage.type === "success" ? "#d1fae5" : "#fee2e2",
            color: tripMessage.type === "success" ? "#065f46" : "#991b1b",
            border: `1.5px solid ${tripMessage.type === "success" ? "#6ee7b7" : "#fca5a5"}`
          }}>
            {tripMessage.text}
          </div>
        )}

        {/* Assigned Vehicle */}
        <div className="assigned-vehicle-section">
          <h2>🚗 Your Assigned Vehicle</h2>
          <div className="vehicle-info-card">
            <div className="vehicle-details">
              <div className="detail-row">
                <span className="label">Vehicle Number:</span>
                <span className="value">{assignedVehicle.vehicleNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Model:</span>
                <span className="value">{assignedVehicle.model}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`status-badge ${assignedVehicle.status.toLowerCase()}`}>
                  {assignedVehicle.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Battery:</span>
                <span className="value">{assignedVehicle.batteryPercentage}%</span>
              </div>
              <div className="detail-row">
                <span className="label">Fuel:</span>
                <span className="value">{assignedVehicle.fuelPercentage}%</span>
              </div>
              {activeTrip && (
                <>
                  <div className="detail-row">
                    <span className="label">Trip Status:</span>
                    <span className="trip-active">ACTIVE</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Duration:</span>
                    <span className="value trip-duration">{tripDuration}</span>
                  </div>
                </>
              )}
            </div>
            <div className="trip-controls">
              <button
                className="action-btn secondary"
                style={{ marginBottom: "0.5rem", width: "100%" }}
                onClick={() => navigate("/driver/maintenance")}
              >
                🔧 Check Vehicle Health
              </button>
              {!activeTrip ? (
                <button
                  className="action-btn primary trip-btn"
                  onClick={handleStartTrip}
                  disabled={assignedVehicle.status === "MAINTENANCE"}
                >
                  🚀 Start Trip
                </button>
              ) : (
                <button
                  className="action-btn danger trip-btn"
                  onClick={handleEndTrip}
                >
                  🏁 End Trip
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: "💵", label: "Today's Earnings",  value: `₹${stats.todayEarnings}` },
            { icon: "🚗", label: "Total Trips",        value: stats.totalTrips },
            { icon: "⭐", label: "Rating",             value: stats.rating },
            { icon: "✅", label: "Completed Trips",    value: stats.completedTrips },
            { icon: "⏰", label: "Hours Online",       value: `${stats.hoursOnline}h` },
            { icon: "💰", label: "Weekly Earnings",    value: `₹${stats.weeklyEarnings}` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon">{icon}</div>
              <div className="stat-info">
                <h3>{value}</h3>
                <p>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Earnings Chart */}
        <div className="live-tracking">
          <h2>Weekly Earnings Chart</h2>
          <div className="earnings-chart">
            <div className="chart-bars">
              {weeklyEarnings.map((earning, index) => {
                const maxEarning = Math.max(...weeklyEarnings);
                const height = (earning / maxEarning) * 100;
                const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                return (
                  <div key={index} className="bar-container">
                    <div className="bar" style={{ height: `${height}%` }}>
                      <span className="bar-value">₹{earning}</span>
                    </div>
                    <span className="bar-label">{days[index]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="actions-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn secondary" onClick={() => navigate("/driver/schedule")}>View Schedule</button>
            <button className="action-btn secondary" onClick={() => navigate("/driver/earnings")}>Earnings Report</button>
            <button className="action-btn secondary" onClick={() => navigate("/driver/maintenance")}>🔧 Vehicle Health</button>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="recent-trips">
          <h2>Recent Trips</h2>
          <div className="trips-table-container">
            <table className="trips-table">
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Earnings</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td>{trip.id}</td>
                    <td>{trip.route}</td>
                    <td>
                      <span className={`status-badge ${trip.status.toLowerCase()}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="earnings">₹{trip.earnings}</td>
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

export default DriverDashboard;