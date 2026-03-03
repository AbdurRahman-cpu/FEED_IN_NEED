import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

// Background hero video
import bgVideo from "./assets/background_homepage.mp4";

// Scroll section video (different video)
import scrollVideo from "./assets/Food_Donation.mp4";

function Home() {
    const [selectedRole, setSelectedRole] = useState("");
    const [startIndex, setStartIndex] = useState(0);
    const navigate = useNavigate();

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
    };

    const handleRegister = () => {
        navigate("/register", { state: { role: selectedRole } });
    };

    const cards = [
        { title: "Reduce Waste", desc: "Minimizing food wastage." },
        { title: "NGO Network", desc: "Connecting verified NGOs." },
        { title: "Live Tracking", desc: "Track donations in real time." },
        { title: "Volunteer Support", desc: "Helping deliver food." },
        { title: "Secure Platform", desc: "Safe & transparent system." },
        { title: "Community Growth", desc: "Building hunger-free society." }
    ];

    // Rotate cards every 2 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setStartIndex((prev) => (prev + 1) % cards.length);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const visibleCards = [
        cards[startIndex % cards.length],
        cards[(startIndex + 1) % cards.length],
        cards[(startIndex + 2) % cards.length]
    ];

    return (
        <div className="home-container">

            {/* ===== Background Hero Video ===== */}
            <video autoPlay loop muted playsInline className="background-video">
                <source src={bgVideo} type="video/mp4" />
            </video>

            {/* ===== Navbar ===== */}
            <nav className="navbar">
                <h2 className="logo">🍽 Food Donation Platform</h2>
                <div>
                    {(selectedRole === "ngo" || selectedRole === "volunteer") && (
                        <>
                            <button className="nav-btn">Login</button>
                            <button className="nav-btn" onClick={handleRegister}>
                                Register
                            </button>
                        </>
                    )}
                </div>
            </nav>

            {/* ===== Hero Section ===== */}
            <section className="hero">
                <div className="hero-overlay">
                    <h1>Reduce Food Waste. Feed the Needy.</h1>

                    <div className="role-selection">
                        <button
                            className={`role-btn ${selectedRole === "donor" ? "active" : ""}`}
                            onClick={() => handleRoleSelect("donor")}
                        >
                            I am a Donor
                        </button>

                        <button
                            className={`role-btn ${selectedRole === "ngo" ? "active" : ""}`}
                            onClick={() => handleRoleSelect("ngo")}
                        >
                            I am an NGO
                        </button>

                        <button
                            className={`role-btn ${selectedRole === "volunteer" ? "active" : ""}`}
                            onClick={() => handleRoleSelect("volunteer")}
                        >
                            I am a Volunteer
                        </button>
                    </div>
                </div>
            </section>

            {/* ===== Rotating Cards Section ===== */}
            <section className="rotating-section">
                <div className="card-row">
                    {visibleCards.map((card, index) => (
                        <div className="rotating-card" key={index}>
                            <h3>{card.title}</h3>
                            <p>{card.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== Large Scroll Video Section ===== */}
            <section className="scroll-video-section">
                <video
                    className="scroll-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                >
                    <source src={scrollVideo} type="video/mp4" />
                </video>
            </section>

            {/* ===== Footer ===== */}
            <footer className="footer">
                <p>© {new Date().getFullYear()} Food Donation Platform</p>
            </footer>

        </div>
    );
}

export default Home;