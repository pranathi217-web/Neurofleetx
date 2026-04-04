import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/customerDashboard.css";

function CustomerDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
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

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Customer";
    setUserName(name);
  }, []);

  const handleCancelTrip = (tripId) => {
    if (window.confirm("Are you sure you want to cancel trip " + tripId + "?")) {
      setUpcomingTrips(upcomingTrips.filter(trip => trip.id !== tripId));
      alert("Trip " + tripId + " has been cancelled successfully.");
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div className="customer-dashboard">
      <nav className="dashboard-navbar">
        <div className="navbar-brand">NeuroFleetX</div>
        <ul className="navbar-menu">
          <li className="active" onClick={() => navigate("/customer")}>Dashboard</li>
          <li onClick={() => navigate("/customer/plan-trip")}>Plan Trip and Book</li>
          <li onClick={() => navigate("/customer/my-bookings")}>My Bookings</li>
          <li onClick={() => navigate("/customer/my-trips")}>My Trips</li>
          <li onClick={() => navigate("/customer/profile")}>Profile</li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome back, {userName}!</h1>
          <p>Manage your trips and bookings efficiently</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-info"><h3>{stats.activeBookings}</h3><p>Active Bookings</p></div></div>
          <div className="stat-card"><div className="stat-icon">🚗</div><div className="stat-info"><h3>{stats.totalTrips}</h3><p>Total Trips</p></div></div>
          <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-info"><h3>Rs.{stats.totalSpent}</h3><p>Total Spent</p></div></div>
          <div className="stat-card"><div className="stat-icon">💵</div><div className="stat-info"><h3>Rs.{stats.amountSaved}</h3><p>Amount Saved</p></div></div>
          <div className="stat-card"><div className="stat-icon">📅</div><div className="stat-info"><h3>{stats.upcomingTrips}</h3><p>Upcoming Trips</p></div></div>
          <div className="stat-card"><div className="stat-icon">⭐</div><div className="stat-info"><h3 style={{fontSize:"0.95rem"}}>{stats.favouriteRoute}</h3><p>Favourite Route</p></div></div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn primary"   onClick={() => navigate("/customer/plan-trip")}>Plan Trip</button>
            <button className="action-btn secondary" onClick={() => navigate("/customer/plan-trip")}>Book Cab</button>
          </div>
        </div>

        <div className="upcoming-trips-section">
          <h2>Upcoming Trips</h2>
          {upcomingTrips.length === 0 ? (
            <div className="empty-state">
              <p>No upcoming trips scheduled</p>
              <button className="action-btn primary" onClick={() => navigate("/customer/plan-trip")}>Plan Your First Trip</button>
            </div>
          ) : (
            <div className="trips-list">
              {upcomingTrips.map(trip => (
                <div key={trip.id} className="trip-card">
                  <div className="trip-info">
                    <h3>{trip.id}</h3>
                    <p className="trip-date">📅 {trip.date}</p>
                    <p className="trip-route">📍 {trip.route}</p>
                  </div>
                  <button className="cancel-btn" onClick={() => handleCancelTrip(trip.id)}>Cancel Trip</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="past-trips-section">
          <h2>Past Trips</h2>
          <div className="trips-table-container">
            <table className="trips-table">
              <thead><tr><th>Trip ID</th><th>Route</th><th>Date</th><th>Fare</th></tr></thead>
              <tbody>
                {pastTrips.map(trip => (
                  <tr key={trip.id}>
                    <td>{trip.id}</td><td>{trip.route}</td><td>{trip.date}</td>
                    <td className="fare">Rs.{trip.fare}</td>
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