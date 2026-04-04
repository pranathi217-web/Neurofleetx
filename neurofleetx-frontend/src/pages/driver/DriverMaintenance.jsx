import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/pages.css";
import "../../styles/maintenancePage.css";

function DriverMaintenance() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('alerts');
  const [vehicleHealth, setVehicleHealth] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);

  // ✅ vehicleId stored in localStorage at registration / login
  const vehicleId = parseInt(localStorage.getItem("vehicleId"));
  const userId    = parseInt(localStorage.getItem("userId"));

  useEffect(() => {
    fetchVehicleAndHealth();
  }, []);

  const fetchVehicleAndHealth = async () => {
    try {
      const vehicleRes = await fetch(`http://localhost:8082/api/vehicles/test`);
      if (vehicleRes.ok) {
        const all = await vehicleRes.json();
        // Match by vehicleId (set at signup) or fall back to assignedDriverId
        const matched = all.find(v => v.id === vehicleId || v.assignedDriverId === userId);
        setVehicle(matched || null);

        if (matched) {
          const healthRes = await axios.get('http://localhost:8082/api/health/all');
          const myHealth = healthRes.data.find(h => h.vehicleId === matched.id);
          setVehicleHealth(myHealth || null);

          const alertRes = await axios.get('http://localhost:8082/api/health/alerts');
          const myAlerts = alertRes.data.filter(a =>
            a.vehicleId === matched.id || a.vehicleNumber === matched.vehicleNumber
          );
          setAlerts(myAlerts);
        }
      }
    } catch (error) {
      console.error('Error fetching vehicle health:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'alerts',     label: '🚨 My Alerts' },
    { key: 'parameters', label: '📊 Vehicle Health' },
  ];

  const getStatusColor = (value, type) => {
    if (type === 'engine') return value >= 70 ? '#2ecc71' : value >= 40 ? '#f39c12' : '#e74c3c';
    if (type === 'tire')   return value >= 30 ? '#2ecc71' : value >= 20 ? '#f39c12' : '#e74c3c';
    return value >= 50 ? '#2ecc71' : value >= 25 ? '#f39c12' : '#e74c3c';
  };

  const getStatusLabel = (value, type) => {
    if (type === 'engine') return value >= 70 ? 'Good' : value >= 40 ? 'Fair' : 'Critical';
    if (type === 'tire')   return value >= 30 ? 'Good' : value >= 20 ? 'Low' : 'Critical';
    return value >= 50 ? 'Good' : value >= 25 ? 'Low' : 'Critical';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Loading vehicle health...</h2>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="page-container">
        <div className="page-header">
          <button onClick={() => navigate("/driver")} className="back-btn">← Back</button>
          <h1>My Vehicle Health</h1>
        </div>
        <div style={{
          textAlign: 'center', padding: '3rem', background: '#fff3cd',
          borderRadius: '12px', margin: '2rem', border: '1px solid #ffc107'
        }}>
          <p style={{ fontSize: '1.2rem' }}>⚠️ No vehicle found for your account.</p>
          <p style={{ color: '#666' }}>
            Your Vehicle ID ({vehicleId || 'not set'}) could not be matched.<br />
            Please contact your Fleet Manager.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/driver")} className="back-btn">← Back</button>
        <h1>My Vehicle Health</h1>
        <span style={{
          background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
          color: 'white', padding: '4px 12px', borderRadius: '20px',
          fontSize: '0.75rem', fontWeight: '600', marginLeft: '12px'
        }}>DRIVER VIEW — READ ONLY</span>
      </div>

      {/* Vehicle banner */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white', padding: '1rem 1.5rem', borderRadius: '12px',
        marginBottom: '1.5rem', display: 'flex', gap: '2rem',
        alignItems: 'center', flexWrap: 'wrap'
      }}>
        <span>🚗 <strong>Vehicle:</strong> {vehicle.vehicleNumber}</span>
        <span>🏷️ <strong>Model:</strong> {vehicle.model}</span>
        <span>⚡ <strong>Battery:</strong> {vehicle.batteryPercentage}%</span>
        <span>⛽ <strong>Fuel:</strong> {vehicle.fuelPercentage}%</span>
        <span style={{
          marginLeft: 'auto', background: 'rgba(255,255,255,0.2)',
          padding: '2px 10px', borderRadius: '12px', fontSize: '0.85rem'
        }}>ID: {vehicle.id}</span>
      </div>

      <div className="maintenance-tabs">
        <div className="tabs-header">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >{tab.label}</button>
          ))}
        </div>

        <div className="tabs-content">

          {activeTab === 'alerts' && (
            <div className="tab-pane">
              {alerts.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '3rem', background: '#d4edda',
                  borderRadius: '12px', border: '1px solid #c3e6cb'
                }}>
                  <p style={{ fontSize: '1.5rem' }}>✅</p>
                  <p style={{ fontSize: '1.1rem', color: '#155724', fontWeight: '600' }}>No alerts for your vehicle!</p>
                  <p style={{ color: '#555' }}>Your vehicle is in good health.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {alerts.map((alert, idx) => (
                    <div key={idx} style={{
                      background: alert.severity === 'CRITICAL' ? '#ffeaea' : '#fff8e1',
                      border: `1px solid ${alert.severity === 'CRITICAL' ? '#e74c3c' : '#f39c12'}`,
                      borderLeft: `4px solid ${alert.severity === 'CRITICAL' ? '#e74c3c' : '#f39c12'}`,
                      borderRadius: '10px', padding: '1rem 1.5rem',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600' }}>
                          {alert.severity === 'CRITICAL' ? '🔴' : '🟡'} {alert.issue || alert.message}
                        </span>
                        <span style={{
                          background: alert.severity === 'CRITICAL' ? '#e74c3c' : '#f39c12',
                          color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600'
                        }}>{alert.severity}</span>
                      </div>
                      {alert.actionNeeded && (
                        <p style={{ margin: '0.5rem 0 0', color: '#555', fontSize: '0.9rem' }}>
                          📋 Action: {alert.actionNeeded}
                        </p>
                      )}
                      <p style={{ margin: '0.3rem 0 0', color: '#888', fontSize: '0.8rem' }}>
                        ℹ️ Inform your Fleet Manager about this issue.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'parameters' && (
            <div className="tab-pane">
              {!vehicleHealth ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>No health data available yet. Data is updated automatically.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {[
                    { label: 'Engine Health', value: vehicleHealth.engineHealth,                             unit: '%',    type: 'engine',  icon: '🔧' },
                    { label: 'Tire Pressure', value: vehicleHealth.tirePressure,                             unit: ' PSI', type: 'tire',    icon: '🛞' },
                    { label: 'Battery Level', value: vehicleHealth.batteryLevel ?? vehicle.batteryPercentage, unit: '%',   type: 'battery', icon: '⚡' },
                    { label: 'Fuel Level',    value: vehicleHealth.fuelLevel    ?? vehicle.fuelPercentage,    unit: '%',   type: 'fuel',    icon: '⛽' },
                    { label: 'Mileage',       value: vehicleHealth.mileage,                                  unit: ' km', type: 'mileage', icon: '🛣️' },
                  ].map((param, idx) => (
                    <div key={idx} style={{
                      background: 'white', borderRadius: '12px', padding: '1.2rem 1.5rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #eee'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '1rem' }}>{param.icon} {param.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{param.value}{param.unit}</span>
                          <span style={{
                            background: getStatusColor(param.value, param.type),
                            color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600'
                          }}>{getStatusLabel(param.value, param.type)}</span>
                        </div>
                      </div>
                      {param.type !== 'mileage' && (
                        <div style={{ background: '#f0f0f0', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(param.value, 100)}%`, height: '100%',
                            background: getStatusColor(param.value, param.type),
                            borderRadius: '8px', transition: 'width 0.5s ease'
                          }} />
                        </div>
                      )}
                    </div>
                  ))}
                  <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    🔒 Read-only view. Contact Fleet Manager for maintenance requests.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default DriverMaintenance;