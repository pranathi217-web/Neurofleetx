import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";
import "../../styles/PlanTrip.css";

const VEHICLES = [
  { id: 1,  name: "Toyota Innova",    type: "SUV",      seats: 7, ev: false, price: 18, image: "🚐", available: true  },
  { id: 2,  name: "Maruti Ertiga",    type: "MPV",      seats: 7, ev: false, price: 14, image: "🚗", available: true  },
  { id: 3,  name: "Honda City",       type: "Sedan",    seats: 4, ev: false, price: 12, image: "🚗", available: true  },
  { id: 4,  name: "Hyundai Creta",    type: "SUV",      seats: 5, ev: false, price: 16, image: "🚙", available: true  },
  { id: 5,  name: "Tata Nexon EV",    type: "SUV",      seats: 5, ev: true,  price: 13, image: "⚡", available: true  },
  { id: 6,  name: "MG ZS EV",         type: "SUV",      seats: 5, ev: true,  price: 15, image: "⚡", available: true  },
  { id: 7,  name: "Tata Tigor EV",    type: "Sedan",    seats: 4, ev: true,  price: 10, image: "⚡", available: true  },
  { id: 8,  name: "Mahindra Scorpio", type: "SUV",      seats: 7, ev: false, price: 20, image: "🚙", available: false },
  { id: 9,  name: "Kia Seltos",       type: "SUV",      seats: 5, ev: false, price: 17, image: "🚙", available: true  },
  { id: 10, name: "Maruti Swift",     type: "Hatchback",seats: 4, ev: false, price: 9,  image: "🚗", available: true  },
  { id: 11, name: "BYD Atto 3",       type: "SUV",      seats: 5, ev: true,  price: 19, image: "⚡", available: true  },
  { id: 12, name: "Toyota Fortuner",  type: "SUV",      seats: 7, ev: false, price: 25, image: "🚐", available: true  },
];

function scoreVehicle(vehicle, filters) {
  let score = 0;
  if (filters.type === "All" || vehicle.type === filters.type) score += 40;
  const needed = parseInt(filters.seats);
  if (vehicle.seats >= needed) score += 30;
  if (vehicle.seats === needed) score += 10;
  if (filters.ev === "All")                        score += 10;
  else if (filters.ev === "EV"     && vehicle.ev)  score += 20;
  else if (filters.ev === "Non-EV" && !vehicle.ev) score += 20;
  if (vehicle.available) score += 5;
  return score;
}

const TIME_SLOTS = [
  { time: "06:00 AM", price: 0.8  },
  { time: "08:00 AM", price: 1.2  },
  { time: "10:00 AM", price: 1.0  },
  { time: "12:00 PM", price: 1.0  },
  { time: "02:00 PM", price: 0.9  },
  { time: "04:00 PM", price: 1.1  },
  { time: "06:00 PM", price: 1.3  },
  { time: "08:00 PM", price: 1.15 },
];

function PlanTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [filters, setFilters] = useState({ type: "All", seats: "1", ev: "All" });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDate,    setSelectedDate]    = useState("");
  const [selectedSlot,    setSelectedSlot]    = useState(null);
  const [generatedOtp,    setGeneratedOtp]    = useState("");
  const [enteredOtp,      setEnteredOtp]      = useState("");
  const [otpError,        setOtpError]        = useState("");
  const [bookingDone,     setBookingDone]     = useState(false);
  const [bookingId,       setBookingId]       = useState("");

  const scoredVehicles = VEHICLES
    .filter(v => {
      if (!v.available) return false;
      if (filters.type !== "All" && v.type !== filters.type) return false;
      if (v.seats < parseInt(filters.seats)) return false;
      if (filters.ev === "EV"     && !v.ev) return false;
      if (filters.ev === "Non-EV" &&  v.ev) return false;
      return true;
    })
    .map(v => ({ ...v, score: scoreVehicle(v, filters) }))
    .sort((a, b) => b.score - a.score);

  const maxScore = scoredVehicles.length > 0 ? scoredVehicles[0].score : 0;

  const totalPrice = selectedVehicle && selectedSlot
    ? (selectedVehicle.price * selectedSlot.price * 3).toFixed(0)
    : 0;

  const today = new Date().toISOString().split("T")[0];

  const handleBookNow = (vehicle) => { setSelectedVehicle(vehicle); setStep(2); };

  const handleProceedToSummary = () => {
    if (!selectedDate) { alert("Please select a date!"); return; }
    if (!selectedSlot) { alert("Please select a time slot!"); return; }
    setStep(3);
  };

  const handleProceedToOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    alert("Your OTP is: " + otp + "\n\n(In a real app this would be sent to your phone)");
    setStep(4);
  };

  // Save confirmed booking to localStorage so MyBookings reads it
  const saveBooking = (id) => {
    const newBooking = {
      id,
      vehicle:  selectedVehicle.name,
      type:     selectedVehicle.type,
      isEV:     selectedVehicle.ev,
      date:     new Date(selectedDate).toDateString(),
      timeSlot: selectedSlot.time,
      total:    parseInt(totalPrice),
      status:   "Confirmed"
    };
    const existing = JSON.parse(localStorage.getItem("myBookings") || "[]");
    localStorage.setItem("myBookings", JSON.stringify([newBooking, ...existing]));
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === generatedOtp) {
      const id = "BK" + Date.now().toString().slice(-6);
      setBookingId(id);
      setOtpError("");
      saveBooking(id);
      setBookingDone(true);
    } else {
      setOtpError("Incorrect OTP. Please try again.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => step === 1 ? navigate("/customer") : setStep(step - 1)} className="back-btn">
          Back
        </button>
        <h1>Plan Trip and Book</h1>
      </div>

      <div className="step-indicator">
        {["Select Vehicle", "Choose Slot", "Trip Summary", "Confirm OTP"].map((label, i) => (
          <div key={i} className={"step-item" + (step === i + 1 ? " active" : "") + (step > i + 1 ? " done" : "")}>
            <div className="step-circle">{step > i + 1 ? "done" : i + 1}</div>
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="step-content">
          <div className="filters-bar">
            <div className="filter-group">
              <label>Vehicle Type</label>
              <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
                <option value="All">All Types</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="MPV">MPV</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Min Seats</label>
              <select value={filters.seats} onChange={e => setFilters({ ...filters, seats: e.target.value })}>
                {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}+ seats</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>EV Preference</label>
              <select value={filters.ev} onChange={e => setFilters({ ...filters, ev: e.target.value })}>
                <option value="All">All</option>
                <option value="EV">EV Only</option>
                <option value="Non-EV">Non-EV Only</option>
              </select>
            </div>
          </div>

          <p className="results-count">Showing <strong>{scoredVehicles.length}</strong> vehicles</p>

          {scoredVehicles.length === 0 ? (
            <div className="empty-vehicles">
              <p>No vehicles match your filters.</p>
              <button className="action-btn secondary" onClick={() => setFilters({ type: "All", seats: "1", ev: "All" })}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="vehicles-grid">
              {scoredVehicles.map(vehicle => {
                const isRecommended = vehicle.score === maxScore && maxScore > 60;
                return (
                  <div key={vehicle.id} className={"vehicle-card" + (isRecommended ? " recommended" : "")}>
                    {isRecommended && <div className="recommended-badge">Recommended</div>}
                    <div className="vehicle-emoji">{vehicle.image}</div>
                    <div className="vehicle-info">
                      <h3>{vehicle.name}</h3>
                      <div className="vehicle-tags">
                        <span className="tag type-tag">{vehicle.type}</span>
                        <span className="tag seats-tag">{vehicle.seats} seats</span>
                        <span className={"tag ev-tag " + (vehicle.ev ? "ev" : "non-ev")}>
                          {vehicle.ev ? "EV" : "Non-EV"}
                        </span>
                      </div>
                      <div className="vehicle-price">
                        <span className="price">Rs.{vehicle.price}</span>
                        <span className="per">/hour</span>
                      </div>
                      <div className="score-bar-wrap">
                        <span className="score-label">Match</span>
                        <div className="score-bar">
                          <div className="score-fill" style={{ width: ((vehicle.score / 105) * 100) + "%" }} />
                        </div>
                        <span className="score-pct">{Math.round((vehicle.score / 105) * 100)}%</span>
                      </div>
                    </div>
                    <button className="book-btn" onClick={() => handleBookNow(vehicle)}>Book Now</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {step === 2 && selectedVehicle && (
        <div className="step-content">
          <div className="selected-vehicle-banner">
            <span>{selectedVehicle.image}</span>
            <div>
              <strong>{selectedVehicle.name}</strong>
              <span>{selectedVehicle.type} - {selectedVehicle.seats} seats - Rs.{selectedVehicle.price}/hr</span>
            </div>
          </div>
          <div className="slot-section">
            <div className="calendar-box">
              <h3>Select Date</h3>
              <input
                type="date" min={today} value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
                className="date-picker"
              />
              {selectedDate && <p className="selected-date-label">Selected: <strong>{new Date(selectedDate).toDateString()}</strong></p>}
            </div>
            {selectedDate && (
              <div className="slots-box">
                <h3>Select Time Slot</h3>
                <p className="slots-note">Base: Rs.{selectedVehicle.price}/hr x 3hrs. Prices vary by demand.</p>
                <div className="slots-grid">
                  {TIME_SLOTS.map((slot, idx) => {
                    const slotPrice = (selectedVehicle.price * slot.price * 3).toFixed(0);
                    const isSelected = selectedSlot && selectedSlot.time === slot.time;
                    return (
                      <div key={idx} className={"slot-card" + (isSelected ? " selected" : "")} onClick={() => setSelectedSlot(slot)}>
                        <span className="slot-time">{slot.time}</span>
                        <span className="slot-price">Rs.{slotPrice}</span>
                        {slot.price > 1.1 && <span className="surge">Peak</span>}
                        {slot.price < 0.9 && <span className="off-peak">Off-peak</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <button className="proceed-btn" onClick={handleProceedToSummary} disabled={!selectedDate || !selectedSlot}>
            Proceed to Summary
          </button>
        </div>
      )}

      {step === 3 && selectedVehicle && selectedSlot && (
        <div className="step-content">
          <div className="summary-card">
            <h2>Booking Summary</h2>
            <div className="summary-row"><span>Vehicle</span><strong>{selectedVehicle.name}</strong></div>
            <div className="summary-row"><span>Type</span><strong>{selectedVehicle.type}</strong></div>
            <div className="summary-row"><span>Seats</span><strong>{selectedVehicle.seats}</strong></div>
            <div className="summary-row"><span>Fuel Type</span><strong>{selectedVehicle.ev ? "Electric" : "Petrol/Diesel"}</strong></div>
            <div className="summary-row"><span>Date</span><strong>{new Date(selectedDate).toDateString()}</strong></div>
            <div className="summary-row"><span>Time Slot</span><strong>{selectedSlot.time}</strong></div>
            <div className="summary-row"><span>Duration</span><strong>3 Hours</strong></div>
            <div className="summary-divider" />
            <div className="summary-row total"><span>Total Amount</span><strong>Rs.{totalPrice}</strong></div>
            <p className="summary-note">An OTP will be generated to confirm your booking.</p>
            <button className="proceed-btn" onClick={handleProceedToOtp}>Get OTP and Confirm</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="step-content">
          {!bookingDone ? (
            <div className="otp-card">
              <div className="otp-icon">🔐</div>
              <h2>OTP Verification</h2>
              <p>Enter the 6-digit OTP to confirm your booking.</p>
              <div className="otp-input-row">
                <input
                  type="text" maxLength={6} placeholder="Enter 6-digit OTP"
                  value={enteredOtp}
                  onChange={e => { setEnteredOtp(e.target.value); setOtpError(""); }}
                  className="otp-input"
                />
              </div>
              {otpError && <p className="otp-error">{otpError}</p>}
              <button className="proceed-btn" onClick={handleVerifyOtp} disabled={enteredOtp.length !== 6}>
                Verify and Confirm Booking
              </button>
              <button className="resend-btn" onClick={() => {
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                setGeneratedOtp(otp);
                setEnteredOtp("");
                alert("New OTP: " + otp);
              }}>
                Resend OTP
              </button>
            </div>
          ) : (
            <div className="success-card">
              <div className="success-icon">✅</div>
              <h2>Booking Confirmed!</h2>
              <p>Your booking has been successfully confirmed.</p>
              <div className="booking-ref">
                <span>Booking ID:</span>
                <strong>{bookingId}</strong>
              </div>
              <div className="success-details">
                <div className="summary-row"><span>Vehicle</span><strong>{selectedVehicle.name}</strong></div>
                <div className="summary-row"><span>Date</span><strong>{new Date(selectedDate).toDateString()}</strong></div>
                <div className="summary-row"><span>Time</span><strong>{selectedSlot.time}</strong></div>
                <div className="summary-row total"><span>Amount Paid</span><strong>Rs.{totalPrice}</strong></div>
              </div>
              <button className="proceed-btn" onClick={() => navigate("/customer/my-bookings")}>
                View My Bookings
              </button>
              <button className="resend-btn" style={{ marginTop: "0.5rem" }} onClick={() => navigate("/customer")}>
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PlanTrip;