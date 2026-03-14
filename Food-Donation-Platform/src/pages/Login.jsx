import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Login.css";

const API = "http://localhost:5000";

function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    const role = location.state?.role;

    const [formData, setFormData] = useState({ email: "", phone: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupSuccess, setPopupSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const showMsg = (msg, success = false) => {
        setPopupMessage(msg);
        setPopupSuccess(success);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (role === "ngo") {
                const res = await fetch(`${API}/api/ngos/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: formData.email, password: formData.password }),
                });
                const result = await res.json();
                if (res.ok) {
                    localStorage.setItem("ngo_id", result.ngo_id);
                    localStorage.setItem("ngo_name", result.org_name);
                    showMsg(`Welcome back, ${result.org_name}! ✅`, true);
                    setTimeout(() => navigate("/ngo-dashboard"), 1500);
                } else {
                    showMsg("Error: " + result.error);
                }

            } else if (role === "volunteer") {
                const res = await fetch(`${API}/api/volunteers/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone: formData.phone }),
                });
                const result = await res.json();
                if (res.ok) {
                    // ✅ Handle both full_name and fullName from backend
                    const name = result.fullName || result.full_name || "Volunteer";
                    localStorage.setItem("volunteer_id", result.id);
                    localStorage.setItem("volunteer_name", name);
                    showMsg(`Welcome, ${name}! ✅`, true);
                    setTimeout(() => navigate("/volunteer-dashboard"), 1500);
                } else {
                    showMsg("Error: " + result.error);
                }
            }
        } catch {
            showMsg("Error connecting to server. Is the backend running?");
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <div className="login-icon">
                    {role === "ngo" ? "🏢" : "🙋"}
                </div>

                <h2>{role === "ngo" ? "NGO Login" : "Volunteer Login"}</h2>
                <p className="login-subtitle">
                    {role === "ngo"
                        ? "Access your NGO dashboard"
                        : "Welcome back, volunteer!"}
                </p>

                <form onSubmit={handleSubmit} className="login-form">

                    {role === "ngo" && (
                        <>
                            <div className="input-group">
                                <span className="input-icon">📧</span>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Registered Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="input-group">
                                <span className="input-icon">🔒</span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="6-digit Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    maxLength={6}
                                    minLength={6}
                                    pattern="\d{6}"
                                    title="Password must be exactly 6 digits"
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-pw"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </>
                    )}

                    {role === "volunteer" && (
                        <div className="input-group">
                            <span className="input-icon">📞</span>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Registered Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                                maxLength={10}
                                pattern="\d{10}"
                                title="Enter your 10-digit registered phone number"
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <span className="btn-loading">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </span>
                        ) : (
                            `Login as ${role === "ngo" ? "NGO" : "Volunteer"}`
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <span>Don't have an account?</span>
                    <button
                        className="link-btn"
                        onClick={() => navigate("/register", { state: { role } })}
                    >
                        Register here
                    </button>
                </div>

                <button className="back-btn" onClick={() => navigate("/")}>
                    ← Back to Home
                </button>
            </div>

            {showPopup && (
                <div className={`popup ${popupSuccess ? "success" : "error"}`}>
                    {popupMessage}
                </div>
            )}
        </div>
    );
}

export default Login;