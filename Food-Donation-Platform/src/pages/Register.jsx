import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
    const location = useLocation();
    const navigate = useNavigate();
    const role = location.state?.role;

    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Form data state
    const [formData, setFormData] = useState({
        org_name: "",
        org_address: "",
        email: "",
        phone: "",
        password: "",
        fullName: "",
        city: "",
        state: "",
        certificate: null
    });

    // Handle text inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle file input
    const handleFileChange = (e) => {
        setFormData({ ...formData, certificate: e.target.files[0] });
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (role === "ngo" && formData.password.length !== 6) {
            setPopupMessage("Password must be exactly 6 digits!");
            setShowPopup(true);
            setLoading(false);
            return;
        }
        try {
            let response;

            if (role === "ngo") {
                // Use FormData for file upload
                const data = new FormData();
                data.append("org_name", formData.org_name);
                data.append("org_address", formData.org_address);
                data.append("email", formData.email);
                data.append("phone", formData.phone);
                data.append("password", formData.password);
                if (formData.certificate) {
                    data.append("certificate", formData.certificate);
                }

                response = await fetch("http://localhost:5000/api/ngos/register", {
                    method: "POST",
                    body: data
                });
            } else if (role === "volunteer") {
                // Volunteers don’t upload files, so JSON is fine
                response = await fetch("http://localhost:5000/api/volunteers/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fullName: formData.fullName,
                        phone: formData.phone,
                        city: formData.city,
                        state: formData.state
                    })
                });
            }

            const result = await response.json();

            if (response.ok) {
                setPopupMessage(`${role} Registered Successfully! ✅`);
                setShowPopup(true);
                setFormData({
                    org_name: "",
                    org_address: "",
                    email: "",
                    phone: "",
                    password: "",
                    fullName: "",
                    city: "",
                    state: "",
                    certificate: null
                });
            } else {
                setPopupMessage("Error: " + result.error);
                setShowPopup(true);
            }
        } catch (error) {
            setPopupMessage("Error connecting to server");
            setShowPopup(true);
        }

        setLoading(false);
        setTimeout(() => {
            setShowPopup(false);
            navigate("/");
        }, 3000);
    };

    return (
        <div className="register-container">
            <div className="register-card">
                {role === "ngo" && (
                    <>
                        <h2>NGO Registration</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="org_name"
                                placeholder="Organization Name"
                                value={formData.org_name}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="text"
                                name="org_address"
                                placeholder="Organization Address"
                                value={formData.org_address}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="file"
                                name="certificate"
                                onChange={handleFileChange}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Set Password (6 digits)"
                                value={formData.password}
                                onChange={handleInputChange}
                                minLength={6}
                                maxLength={6}
                                pattern="\d{6}"
                                title="Password must be exactly 6 digits"
                                required
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? "Registering..." : "Register"}
                            </button>
                        </form>
                    </>
                )}

                {role === "volunteer" && (
                    <>
                        <h2>Volunteer Registration</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="text"
                                name="state"
                                placeholder="State"
                                value={formData.state}
                                onChange={handleInputChange}
                                required
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? "Registering..." : "Register"}
                            </button>
                        </form>
                    </>
                )}
            </div>

            {showPopup && (
                <div
                    className={`popup ${
                        popupMessage.includes("Successfully") ? "success" : ""
                    }`}
                >
                    {popupMessage}
                </div>
            )}
        </div>
    );
}

export default Register;