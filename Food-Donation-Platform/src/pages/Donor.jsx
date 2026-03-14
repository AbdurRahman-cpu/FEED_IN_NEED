import React, { useState, useEffect } from "react";
import "./Donor.css";
import donorBg from "../assets/Donor_background.mp4";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

function DonorDashboard() {
    const navigate = useNavigate();
    const [ngos, setNgos] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedNgo, setSelectedNgo] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        donorName: "",
        phone: "",
        location: "",
        foodQuantity: "",
        foodType: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/api/ngos`)
            .then((res) => res.json())
            .then((data) => {
                setNgos(data);
                setLoading(false);
            })
            .catch(() => {
                setNgos([
                    {
                        id: 1,
                        org_name: "Feed The Future Foundation",
                        org_address: "12-3, Jubilee Hills, Hyderabad",
                        email: "feedfuture@gmail.com",
                        phone: "9876543210",
                        certificate_path: null,
                    },
                ]);
                setLoading(false);
            });
    }, []);

    const filtered = ngos.filter(
        (ngo) =>
            ngo.org_name.toLowerCase().includes(search.toLowerCase()) ||
            ngo.org_address.toLowerCase().includes(search.toLowerCase())
    );

    const handleDonateClick = (ngo) => {
        setSelectedNgo(ngo);
        setShowForm(true);
        setSubmitted(false);
        setSubmitting(false);
        setFormData({ donorName: "", phone: "", location: "", foodQuantity: "", foodType: "" });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Phone validation: must be exactly 10 digits
        if (!/^\d{10}$/.test(formData.phone)) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API}/api/donations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    ngo_id: selectedNgo.id,
                    ngo_name: selectedNgo.org_name,
                }),
            });

            if (!res.ok) throw new Error("Submission failed");

            setSubmitted(true);
            setTimeout(() => {
                setShowForm(false);
                setSelectedNgo(null);
            }, 2500);
        } catch (err) {
            alert("❌ Failed to submit donation. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const getColor = (name) => {
        const colors = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22"];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
        return colors[hash % colors.length];
    };

    // Safe: handles empty or single-word names
    const getInitials = (name) =>
        name?.split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

    return (
        <div className="donor-dashboard">

            {/* ── Background Video ── */}
            <video autoPlay loop muted playsInline className="dd-bg-video">
                <source src={donorBg} type="video/mp4" />
            </video>

            {/* ── Dark overlay over video ── */}
            <div className="dd-bg-overlay" />

            {/* ── Navbar ── */}
            <nav className="dd-navbar">
                <div className="dd-nav-brand">
                    <span className="dd-logo-icon">🍽</span>
                    <span className="dd-logo-text">Feed In Need</span>
                </div>
                <div className="dd-nav-center">
                    <div className="dd-search-wrap">
                        <span className="dd-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search NGOs by name or area..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="dd-search"
                        />
                        {search && (
                            <button className="dd-search-clear" onClick={() => setSearch("")}>✕</button>
                        )}
                    </div>
                </div>
                <div className="dd-nav-right">
                    <span className="dd-ngo-count">{filtered.length} NGOs</span>
                    {/* ✅ Use React Router navigate instead of window.location.href */}
                    <button className="dd-logout" onClick={() => navigate("/")}>
                        Home
                    </button>
                </div>
            </nav>

            {/* ── Page Header ── */}
            <div className="dd-header">
                <h1>Donate Food, Change Lives</h1>
                <p>Choose an NGO below and make a donation. Every meal counts.</p>
            </div>

            {/* ── NGO List ── */}
            <div className="dd-body">
                {loading ? (
                    <div className="dd-loading">
                        <div className="dd-spinner"></div>
                        <p>Loading NGOs...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="dd-empty">
                        <span>😔</span>
                        <p>No NGOs found matching "<strong>{search}</strong>"</p>
                    </div>
                ) : (
                    filtered.map((ngo) => (
                        <div className="dd-ngo-row" key={ngo.id}>
                            {/* ✅ Always show initials — certificate_path is a legal doc, not a profile photo */}
                            <div
                                className="dd-avatar"
                                style={{ background: getColor(ngo.org_name) }}
                            >
                                <span>{getInitials(ngo.org_name)}</span>
                            </div>

                            {/* NGO Info */}
                            <div className="dd-ngo-info">
                                <h3 className="dd-ngo-name">{ngo.org_name}</h3>
                                <div className="dd-ngo-details">
                                    <span className="dd-detail">
                                        <span className="dd-detail-icon">📍</span>
                                        {ngo.org_address}
                                    </span>
                                    <span className="dd-detail">
                                        <span className="dd-detail-icon">📧</span>
                                        {ngo.email}
                                    </span>
                                    <span className="dd-detail">
                                        <span className="dd-detail-icon">📞</span>
                                        {ngo.phone}
                                    </span>
                                </div>
                            </div>

                            {/* Verified Badge + Donate */}
                            <div className="dd-ngo-actions">
                                <span className="dd-verified">✅ Verified NGO</span>
                                <button
                                    className="dd-donate-btn"
                                    onClick={() => handleDonateClick(ngo)}
                                >
                                    Donate Food
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── Floating Donation Form ── */}
            {showForm && (
                <div className="dd-overlay" onClick={(e) => {
                    if (e.target.classList.contains("dd-overlay")) setShowForm(false);
                }}>
                    <div className="dd-modal">
                        {submitted ? (
                            <div className="dd-success">
                                <div className="dd-success-icon">🎉</div>
                                <h3>Donation Submitted!</h3>
                                <p>Thank you! <strong>{selectedNgo?.org_name}</strong> will be notified.</p>
                            </div>
                        ) : (
                            <>
                                <div className="dd-modal-header">
                                    <div>
                                        <h2>Donate to</h2>
                                        <h3 className="dd-modal-ngo">{selectedNgo?.org_name}</h3>
                                    </div>
                                    <button className="dd-modal-close" onClick={() => setShowForm(false)}>✕</button>
                                </div>

                                <form onSubmit={handleSubmit} className="dd-form">
                                    <div className="dd-form-group">
                                        <label>Your Name</label>
                                        <input
                                            type="text"
                                            name="donorName"
                                            placeholder="Enter your full name"
                                            value={formData.donorName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="dd-form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="Enter 10-digit phone number"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            maxLength={10}
                                            required
                                        />
                                    </div>

                                    <div className="dd-form-group">
                                        <label>Pickup Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            placeholder="Enter address for food pickup"
                                            value={formData.location}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="dd-form-row">
                                        <div className="dd-form-group">
                                            <label>Food Type</label>
                                            <input
                                                type="text"
                                                name="foodType"
                                                placeholder="e.g. Rice, Biryani, Roti"
                                                value={formData.foodType}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="dd-form-group">
                                            <label>Quantity</label>
                                            <input
                                                type="text"
                                                name="foodQuantity"
                                                placeholder="e.g. 5 kg / 20 plates"
                                                value={formData.foodQuantity}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* ✅ Disabled while submitting to prevent duplicate submissions */}
                                    <button
                                        type="submit"
                                        className="dd-submit-btn"
                                        disabled={submitting}
                                    >
                                        {submitting ? "Submitting..." : "🍱 Confirm Donation"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DonorDashboard;