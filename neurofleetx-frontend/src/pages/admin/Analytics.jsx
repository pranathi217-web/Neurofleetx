import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/adminAnalytics.css";
// ── Dummy Data ─────────────────────────────────────────────────────────────

const KPI_DATA = {
  totalFleet: 48,
  tripsToday: 34,
  activeRoutes: 12,
  totalRevenue: 325000,
  avgTripDuration: 42,
  fleetUtilization: 78,
};

const HOURLY_ACTIVITY = [
  { hour: "6AM",  trips: 4  },
  { hour: "7AM",  trips: 9  },
  { hour: "8AM",  trips: 18 },
  { hour: "9AM",  trips: 22 },
  { hour: "10AM", trips: 15 },
  { hour: "11AM", trips: 12 },
  { hour: "12PM", trips: 20 },
  { hour: "1PM",  trips: 17 },
  { hour: "2PM",  trips: 13 },
  { hour: "3PM",  trips: 16 },
  { hour: "4PM",  trips: 21 },
  { hour: "5PM",  trips: 26 },
  { hour: "6PM",  trips: 24 },
  { hour: "7PM",  trips: 19 },
  { hour: "8PM",  trips: 11 },
  { hour: "9PM",  trips: 7  },
];

// Hyderabad zones with lat/lng and activity intensity
const HEATMAP_ZONES = [
  { name: "Hitech City",    x: 22, y: 30, intensity: 95, trips: 58, vehicles: 14 },
  { name: "Gachibowli",     x: 18, y: 38, intensity: 88, trips: 52, vehicles: 12 },
  { name: "Banjara Hills",  x: 35, y: 42, intensity: 75, trips: 44, vehicles: 10 },
  { name: "Jubilee Hills",  x: 30, y: 36, intensity: 70, trips: 41, vehicles: 9  },
  { name: "Secunderabad",   x: 58, y: 22, intensity: 82, trips: 49, vehicles: 11 },
  { name: "Begumpet",       x: 50, y: 28, intensity: 65, trips: 38, vehicles: 8  },
  { name: "Ameerpet",       x: 44, y: 35, intensity: 60, trips: 35, vehicles: 8  },
  { name: "Kukatpally",     x: 28, y: 20, intensity: 72, trips: 43, vehicles: 10 },
  { name: "LB Nagar",       x: 62, y: 68, intensity: 48, trips: 28, vehicles: 6  },
  { name: "Dilsukhnagar",   x: 58, y: 58, intensity: 55, trips: 32, vehicles: 7  },
  { name: "Charminar",      x: 50, y: 62, intensity: 42, trips: 24, vehicles: 5  },
  { name: "Abids",          x: 46, y: 55, intensity: 45, trips: 26, vehicles: 6  },
  { name: "Uppal",          x: 72, y: 50, intensity: 38, trips: 22, vehicles: 5  },
  { name: "Kompally",       x: 40, y: 10, intensity: 30, trips: 17, vehicles: 4  },
  { name: "Miyapur",        x: 14, y: 18, intensity: 52, trips: 30, vehicles: 7  },
  { name: "KPHB",           x: 20, y: 14, intensity: 58, trips: 34, vehicles: 8  },
];

const VEHICLE_STATUS = [
  { status: "Active",      count: 34, color: "#22c55e" },
  { status: "Idle",        count: 8,  color: "#f59e0b" },
  { status: "Maintenance", count: 4,  color: "#ef4444" },
  { status: "Offline",     count: 2,  color: "#6b7280" },
];

const REPORT_ROWS = [
  { id: "TRP1041", driver: "Rajesh Kumar",  zone: "Hitech City",   time: "09:14 AM", dist: "12.4 km", fare: "₹340", status: "Completed" },
  { id: "TRP1042", driver: "Amit Singh",    zone: "Gachibowli",    time: "09:32 AM", dist: "8.1 km",  fare: "₹220", status: "Completed" },
  { id: "TRP1043", driver: "Vikram Rao",    zone: "Banjara Hills", time: "10:05 AM", dist: "15.7 km", fare: "₹430", status: "Active"    },
  { id: "TRP1044", driver: "Suresh Naidu",  zone: "Secunderabad",  time: "10:22 AM", dist: "6.3 km",  fare: "₹175", status: "Completed" },
  { id: "TRP1045", driver: "Kiran Kumar",   zone: "Ameerpet",      time: "11:00 AM", dist: "9.9 km",  fare: "₹270", status: "Active"    },
  { id: "TRP1046", driver: "Prasad Reddy",  zone: "Kukatpally",    time: "11:30 AM", dist: "11.2 km", fare: "₹305", status: "Completed" },
  { id: "TRP1047", driver: "Naresh Goud",   zone: "LB Nagar",      time: "12:15 PM", dist: "7.5 km",  fare: "₹205", status: "Completed" },
  { id: "TRP1048", driver: "Srinivas M",    zone: "Dilsukhnagar",  time: "12:45 PM", dist: "5.8 km",  fare: "₹160", status: "Active"    },
  { id: "TRP1049", driver: "Ravi Shankar",  zone: "Jubilee Hills", time: "01:10 PM", dist: "13.3 km", fare: "₹365", status: "Completed" },
  { id: "TRP1050", driver: "Deepak Varma",  zone: "Miyapur",       time: "01:55 PM", dist: "10.6 km", fare: "₹290", status: "Cancelled" },
];

// ── Colour helpers ──────────────────────────────────────────────────────────

function intensityColor(v) {
  // 0-100 → blue → orange → red
  if (v >= 80) return { bg: "rgba(239,68,68,0.85)",  ring: "#ef4444" };
  if (v >= 60) return { bg: "rgba(249,115,22,0.80)", ring: "#f97316" };
  if (v >= 40) return { bg: "rgba(234,179,8,0.75)",  ring: "#eab308" };
  return           { bg: "rgba(34,197,94,0.65)",   ring: "#22c55e" };
}

// ── Export helpers ──────────────────────────────────────────────────────────

function exportCSV(rows) {
  const headers = ["Trip ID","Driver","Zone","Time","Distance","Fare","Status"];
  const lines = [
    headers.join(","),
    ...rows.map(r =>
      [r.id, r.driver, r.zone, r.time, r.dist, r.fare.replace("₹","Rs "), r.status].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "NeuroFleetX_TripReport.csv";
  a.click();
}
function exportPDF(rows, kpi) {
  const { jsPDF } = window.jspdf || {};
  
  import("jspdf").then(({ jsPDF }) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(13, 110, 253);
    doc.text("NeuroFleetX - Analytics Report", 14, 20);
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 28);
    
    // KPI Section
    doc.setFontSize(13);
    doc.setTextColor(30);
    doc.text("KPI Summary", 14, 40);
    
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(`Total Fleet: ${kpi.totalFleet}`, 14, 50);
    doc.text(`Trips Today: ${kpi.tripsToday}`, 70, 50);
    doc.text(`Active Routes: ${kpi.activeRoutes}`, 130, 50);
    doc.text(`Total Revenue: Rs.${kpi.totalRevenue.toLocaleString("en-IN")}`, 14, 58);
    doc.text(`Fleet Utilization: ${kpi.fleetUtilization}%`, 70, 58);
    
    // Table header
    doc.setFontSize(13);
    doc.setTextColor(30);
    doc.text("Trip Report", 14, 72);
    
    const headers = [["Trip ID","Driver","Zone","Time","Distance","Fare","Status"]];
    const data = rows.map(r => [r.id, r.driver, r.zone, r.time, r.dist, r.fare, r.status]);
    
    // Simple table
    let y = 80;
    doc.setFontSize(9);
    doc.setFillColor(13, 110, 253);
    doc.setTextColor(255);
    doc.rect(14, y, 182, 7, "F");
    const cols = [14, 36, 68, 100, 122, 144, 162];
    headers[0].forEach((h, i) => doc.text(h, cols[i], y + 5));
    
    y += 10;
    doc.setTextColor(40);
    data.forEach((row, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(240, 244, 255);
        doc.rect(14, y - 4, 182, 7, "F");
      }
      row.forEach((cell, i) => doc.text(String(cell), cols[i], y));
      y += 8;
    });
    
    doc.save("NeuroFleetX_Analytics_Report.pdf");
  });
}
// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Admin");
  const [tooltip, setTooltip] = useState(null); // { zone, x, y }
  const [animatedBars, setAnimatedBars] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview | trips
  const mapRef = useRef(null);

  const maxTrips = Math.max(...HOURLY_ACTIVITY.map(h => h.trips));

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Admin");
    // trigger bar animation after mount
    const t = setTimeout(() => setAnimatedBars(true), 200);
    return () => clearTimeout(t);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Tooltip position: keep it inside the map box
  const handleZoneEnter = (e, zone) => {
    const rect = mapRef.current.getBoundingClientRect();
    const ex = e.clientX - rect.left;
    const ey = e.clientY - rect.top;
    setTooltip({ zone, x: ex, y: ey });
  };

  return (
    <div className="an-page">

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="an-navbar">
        <div className="an-brand">NeuroFleetX</div>
        <ul className="an-nav-menu">
          <li onClick={() => navigate("/admin")}>Dashboard</li>
          <li onClick={() => navigate("/admin/users")}>Users</li>
          <li onClick={() => navigate("/admin/drivers")}>Drivers</li>
          <li className="active">Analytics</li>
          <li onClick={() => navigate("/admin/maintenance")}>Maintenance</li>
        </ul>
        <button className="an-logout" onClick={handleLogout}>Logout</button>
      </nav>

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="an-content">
        <div className="an-header">
          <div>
            <h1>Urban Mobility Insights</h1>
            <p>Real-time fleet intelligence for {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</p>
          </div>
          <div className="an-export-btns">
            <button className="an-btn-csv" onClick={() => exportCSV(REPORT_ROWS)}>
              ⬇ Export CSV
            </button>
            <button className="an-btn-pdf" onClick={() => exportPDF(REPORT_ROWS, KPI_DATA)}>
              🖨 Export PDF
            </button>
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="an-tabs">
          <button className={activeTab === "overview" ? "an-tab active" : "an-tab"} onClick={() => setActiveTab("overview")}>Overview</button>
          <button className={activeTab === "trips"    ? "an-tab active" : "an-tab"} onClick={() => setActiveTab("trips")}>Trip Reports</button>
        </div>

        {activeTab === "overview" && (
          <>
            {/* ── KPI Cards ──────────────────────────────────────────────── */}
            <div className="an-kpi-grid">
              <div className="an-kpi-card blue">
                <div className="an-kpi-icon">🚌</div>
                <div>
                  <div className="an-kpi-value">{KPI_DATA.totalFleet}</div>
                  <div className="an-kpi-label">Total Fleet</div>
                </div>
              </div>
              <div className="an-kpi-card green">
                <div className="an-kpi-icon">🛣️</div>
                <div>
                  <div className="an-kpi-value">{KPI_DATA.tripsToday}</div>
                  <div className="an-kpi-label">Trips Today</div>
                </div>
              </div>
              <div className="an-kpi-card orange">
                <div className="an-kpi-icon">📍</div>
                <div>
                  <div className="an-kpi-value">{KPI_DATA.activeRoutes}</div>
                  <div className="an-kpi-label">Active Routes</div>
                </div>
              </div>
              <div className="an-kpi-card purple">
                <div className="an-kpi-icon">💰</div>
                <div>
                  <div className="an-kpi-value">₹{(KPI_DATA.totalRevenue/1000).toFixed(0)}k</div>
                  <div className="an-kpi-label">Total Revenue</div>
                </div>
              </div>
              <div className="an-kpi-card teal">
                <div className="an-kpi-icon">⏱️</div>
                <div>
                  <div className="an-kpi-value">{KPI_DATA.avgTripDuration} min</div>
                  <div className="an-kpi-label">Avg Trip Duration</div>
                </div>
              </div>
              <div className="an-kpi-card red">
                <div className="an-kpi-icon">📊</div>
                <div>
                  <div className="an-kpi-value">{KPI_DATA.fleetUtilization}%</div>
                  <div className="an-kpi-label">Fleet Utilization</div>
                </div>
              </div>
            </div>

            {/* ── Heatmap + Vehicle Status ────────────────────────────────── */}
            <div className="an-row">

              {/* Heatmap */}
              <div className="an-card an-heatmap-card">
                <div className="an-card-title">
                  🗺️ Real-Time Fleet Distribution — Hyderabad
                  <span className="an-legend-row">
                    <span className="an-dot" style={{background:"#22c55e"}}/>Low
                    <span className="an-dot" style={{background:"#eab308"}}/>Medium
                    <span className="an-dot" style={{background:"#f97316"}}/>High
                    <span className="an-dot" style={{background:"#ef4444"}}/>Critical
                  </span>
                </div>
                <div
                  className="an-map"
                  ref={mapRef}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {/* City grid lines */}
                  <svg className="an-map-grid" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {[20,40,60,80].map(v => (
                      <g key={v}>
                        <line x1={v} y1="0" x2={v} y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4"/>
                        <line x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.08)" strokeWidth="0.4"/>
                      </g>
                    ))}
                    {/* Outer Ring Road outline (decorative) */}
                    <ellipse cx="45" cy="45" rx="38" ry="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 2"/>
                  </svg>

                  {HEATMAP_ZONES.map((zone) => {
                    const col = intensityColor(zone.intensity);
                    const size = 18 + zone.intensity * 0.22; // px radius
                    return (
                      <div
                        key={zone.name}
                        className="an-zone-bubble"
                        style={{
                          left: `${zone.x}%`,
                          top:  `${zone.y}%`,
                          width:  `${size}px`,
                          height: `${size}px`,
                          background: col.bg,
                          boxShadow: `0 0 ${size * 0.8}px ${col.ring}88`,
                          border: `2px solid ${col.ring}`,
                        }}
                        onMouseEnter={(e) => handleZoneEnter(e, zone)}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <span className="an-zone-label">{zone.vehicles}🚌</span>
                      </div>
                    );
                  })}

                  {/* Tooltip */}
                  {tooltip && (
                    <div
                      className="an-tooltip"
                      style={{
                        left: tooltip.x + 14,
                        top:  tooltip.y - 10,
                      }}
                    >
                      <div className="an-tt-name">{tooltip.zone.name}</div>
                      <div>🚌 Vehicles: <b>{tooltip.zone.vehicles}</b></div>
                      <div>🛣️ Trips: <b>{tooltip.zone.trips}</b></div>
                      <div>🔥 Density: <b>{tooltip.zone.intensity}%</b></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Status Donut-style */}
              <div className="an-card an-status-card">
                <div className="an-card-title">🚗 Fleet Status Breakdown</div>
                <div className="an-status-list">
                  {VEHICLE_STATUS.map((s) => (
                    <div key={s.status} className="an-status-row">
                      <div className="an-status-info">
                        <span className="an-status-dot" style={{background: s.color}}/>
                        <span className="an-status-name">{s.status}</span>
                      </div>
                      <div className="an-status-bar-wrap">
                        <div
                          className="an-status-bar"
                          style={{
                            width: animatedBars ? `${(s.count / KPI_DATA.totalFleet) * 100}%` : "0%",
                            background: s.color,
                          }}
                        />
                      </div>
                      <span className="an-status-count">{s.count}</span>
                    </div>
                  ))}
                </div>

                {/* Mini summary */}
                <div className="an-status-summary">
                  <div className="an-mini-kpi" style={{borderColor:"#22c55e"}}>
                    <b style={{color:"#22c55e"}}>{KPI_DATA.fleetUtilization}%</b>
                    <span>Utilization</span>
                  </div>
                  <div className="an-mini-kpi" style={{borderColor:"#ef4444"}}>
                    <b style={{color:"#ef4444"}}>4</b>
                    <span>In Maintenance</span>
                  </div>
                  <div className="an-mini-kpi" style={{borderColor:"#3b82f6"}}>
                    <b style={{color:"#3b82f6"}}>48</b>
                    <span>Total Vehicles</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Hourly Bar Chart ──────────────────────────────────────────── */}
            <div className="an-card">
              <div className="an-card-title">⏰ Hourly Rental Activity — Today</div>
              <div className="an-bar-chart">
                {HOURLY_ACTIVITY.map((h, i) => {
                  const pct = (h.trips / maxTrips) * 100;
                  const isPeak = h.trips >= 20;
                  return (
                    <div key={h.hour} className="an-bar-col">
                      <div className="an-bar-wrap">
                        <div
                          className={`an-bar-fill ${isPeak ? "peak" : ""}`}
                          style={{ height: animatedBars ? `${pct}%` : "0%" }}
                          title={`${h.hour}: ${h.trips} trips`}
                        >
                          <span className="an-bar-tip">{h.trips}</span>
                        </div>
                      </div>
                      <span className="an-bar-label">{h.hour}</span>
                    </div>
                  );
                })}
              </div>
              <div className="an-chart-legend">
                <span><span className="an-dot" style={{background:"#0d6efd"}}/>Normal</span>
                <span><span className="an-dot" style={{background:"#f97316"}}/>Peak Hour (20+ trips)</span>
              </div>
            </div>
          </>
        )}

        {/* ── Trip Reports Tab ──────────────────────────────────────────────── */}
        {activeTab === "trips" && (
          <div className="an-card">
            <div className="an-card-title" style={{justifyContent:"space-between"}}>
              📋 Today's Trip Log
              <div style={{display:"flex",gap:"0.75rem"}}>
                <button className="an-btn-csv" onClick={() => exportCSV(REPORT_ROWS)}>⬇ CSV</button>
                <button className="an-btn-pdf" onClick={() => exportPDF(REPORT_ROWS, KPI_DATA)}>🖨 PDF</button>
              </div>
            </div>
            <div className="an-table-wrap">
              <table className="an-table">
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Driver</th>
                    <th>Zone</th>
                    <th>Time</th>
                    <th>Distance</th>
                    <th>Fare</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {REPORT_ROWS.map((r) => (
                    <tr key={r.id}>
                      <td><span className="an-trip-id">{r.id}</span></td>
                      <td>{r.driver}</td>
                      <td>{r.zone}</td>
                      <td>{r.time}</td>
                      <td>{r.dist}</td>
                      <td><b>{r.fare}</b></td>
                      <td>
                        <span className={`an-badge ${r.status.toLowerCase()}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}