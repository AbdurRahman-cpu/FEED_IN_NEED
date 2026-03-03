import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
    const location = useLocation();
    const navigate = useNavigate();
    const role = location.state?.role;

    const [showPopup, setShowPopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowPopup(true);

        setTimeout(() => {
            setShowPopup(false);
            navigate("/");
        }, 2000);
    };

    return (
        <div className="register-container">
            <div className="register-card">

                {role === "ngo" && (
                    <>
                        <h2>NGO Registration</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" placeholder="Organization Name" required />
                            <input type="text" placeholder="Organization Address" required />
                            <input type="email" placeholder="Email" required />
                            <input type="tel" placeholder="Phone Number" required />
                            <input type="file" required />
                            <input type="file" multiple required />
                            <input type="password" placeholder="Set Password" required />
                            <button type="submit">Register</button>
                        </form>
                    </>
                )}

                {role === "volunteer" && (
                    <>
                        <h2>Volunteer Registration</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" placeholder="Full Name" required />
                            <input type="tel" placeholder="Phone Number" required />
                            <input type="text" placeholder="City" required />
                            <input type="text" placeholder="State" required />
                            <button type="submit">Register</button>
                        </form>
                    </>
                )}

            </div>

            {showPopup && (
                <div className="popup">
                    Successfully Registered ✅
                </div>
            )}
        </div>
    );
}

export default Register;