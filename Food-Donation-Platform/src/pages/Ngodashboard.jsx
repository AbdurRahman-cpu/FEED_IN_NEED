import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./NgoDashboard.css";
import dashboardBg from "../assets/Dashboard.mp4";

const API = "http://localhost:5000";

function NgoDashboard() {
    const navigate = useNavigate();
    const ngoId   = localStorage.getItem("ngo_id");
    const ngoName = localStorage.getItem("ngo_name");

    const [donations, setDonations] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [activeTab, setActiveTab] = useState("donations");

    useEffect(() => {
        if (!ngoId) navigate("/login", { state: { role: "ngo" } });
    }, [ngoId, navigate]);

    const fetchDonations = () => {
        fetch(`${API}/api/donations`)
            .then(res => res.json())
            .then(data => {
                const mine = data.filter(d => String(d.ngo_id) === String(ngoId));
                setDonations(mine);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        if (!ngoId) return;
        fetchDonations();
    }, [ngoId]);

    const handleCollect = async (donationId) => {
        try {
            const res = await fetch(`${API}/api/donations/${donationId}/collect`, {
                method: 'PATCH'
            });
            if (res.ok) {
                setDonations(prev =>
                    prev.map(d => d.id === donationId ? { ...d, status: 'collected' } : d)
                );
            }
        } catch {
            alert('Failed to update status. Try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("ngo_id");
        localStorage.removeItem("ngo_name");
        navigate("/");
    };

    const stats = {
        total:   donations.length,
        pending: donations.filter(d => !d.status || d.status === "pending").length,
        claimed: donations.filter(d => d.status === "claimed" || d.status === "accepted").length,
        done:    donations.filter(d => d.status === "collected" || d.status === "delivered").length,
    };

    return (
        <div className="ngod-container">

            {/* ── Background Video ── */}
            <video autoPlay loop muted playsInline className="ngod-bg-video">
                <source src={dashboardBg} type="video/mp4" />
            </video>
            <div className="ngod-bg-overlay" />

            {/* ── Sidebar ── */}
            <aside className="ngod-sidebar">
                <div className="ngod-brand">
                    <span>🍽</span>
                    <span>Feed In Need</span>
                </div>
                <div className="ngod-profile">
                    <div className="ngod-avatar">
                        {ngoName?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "NG"}
                    </div>
                    <p className="ngod-name">{ngoName}</p>
                    <span className="ngod-badge">✅ Verified NGO</span>
                </div>
                <nav className="ngod-nav">
                    <button className={activeTab === "donations" ? "active" : ""} onClick={() => setActiveTab("donations")}>📦 Donations</button>
                    <button className={activeTab === "stats" ? "active" : ""} onClick={() => setActiveTab("stats")}>📊 Statistics</button>
                </nav>
                <button className="ngod-logout" onClick={handleLogout}>🚪 Logout</button>
            </aside>

            {/* ── Main ── */}
            <main className="ngod-main">
                <div className="ngod-header">
                    <div>
                        <h1>Welcome, {ngoName} 👋</h1>
                        <p>Manage your incoming food donations</p>
                    </div>
                    <div className="ngod-date">
                        {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </div>
                </div>

                {/* Stats */}
                <div className="ngod-stats">
                    <div className="ngod-stat-card total">
                        <span className="stat-icon">📦</span>
                        <div><h3>{stats.total}</h3><p>Total Donations</p></div>
                    </div>
                    <div className="ngod-stat-card pending">
                        <span className="stat-icon">⏳</span>
                        <div><h3>{stats.pending}</h3><p>Pending</p></div>
                    </div>
                    <div className="ngod-stat-card claimed">
                        <span className="stat-icon">🚚</span>
                        <div><h3>{stats.claimed}</h3><p>Volunteer Claimed</p></div>
                    </div>
                    <div className="ngod-stat-card done">
                        <span className="stat-icon">✅</span>
                        <div><h3>{stats.done}</h3><p>Collected</p></div>
                    </div>
                </div>

                {/* Donations Tab */}
                {activeTab === "donations" && (
                    <div className="ngod-section">
                        <h2>📋 Incoming Donations</h2>
                        {loading ? (
                            <div className="ngod-loading"><div className="ngod-spinner"></div><p>Loading...</p></div>
                        ) : donations.length === 0 ? (
                            <div className="ngod-empty"><span>🍱</span><p>No donations yet.</p></div>
                        ) : (
                            <div className="ngod-table-wrap">
                                <table className="ngod-table">
                                    <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Donor</th>
                                        <th>Phone</th>
                                        <th>Food</th>
                                        <th>Quantity</th>
                                        <th>Location</th>
                                        <th>Volunteer</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {donations.map((d, i) => (
                                        <tr key={d.id}>
                                            <td>{i + 1}</td>
                                            <td><strong>{d.donor_name}</strong></td>
                                            <td>{d.phone}</td>
                                            <td>{d.food_type || "—"}</td>
                                            <td>{d.food_quantity}</td>
                                            <td>{d.location}</td>
                                            <td>{d.volunteer_name || <span style={{opacity:0.4}}>Not assigned</span>}</td>
                                            <td>{new Date(d.created_at).toLocaleDateString("en-IN")}</td>
                                            <td>
                                                    <span className={`ngod-status ${
                                                        d.status === "collected" || d.status === "delivered" ? "collected" :
                                                            d.status === "claimed"   || d.status === "accepted"  ? "claimed"   : "pending"
                                                    }`}>
                                                        {d.status === "collected" || d.status === "delivered" ? "✅ Collected" :
                                                            d.status === "claimed"   || d.status === "accepted"  ? "🚚 On the way" : "⏳ Pending"}
                                                    </span>
                                            </td>
                                            <td>
                                                {d.status !== "collected" && d.status !== "delivered" && (
                                                    <button className="ngod-collect-btn" onClick={() => handleCollect(d.id)}>
                                                        ✅ Mark Collected
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Stats Tab */}
                {activeTab === "stats" && (
                    <div className="ngod-section">
                        <h2>📊 Your Impact</h2>
                        <div className="ngod-impact">
                            <div className="impact-card"><span>🍱</span><h3>{stats.total}</h3><p>Total Donations</p></div>
                            <div className="impact-card"><span>👥</span><h3>{new Set(donations.map(d => d.phone)).size}</h3><p>Unique Donors</p></div>
                            <div className="impact-card"><span>🚚</span><h3>{new Set(donations.filter(d => d.volunteer_id).map(d => d.volunteer_id)).size}</h3><p>Volunteers Helped</p></div>
                            <div className="impact-card"><span>✅</span><h3>{stats.done}</h3><p>Successfully Collected</p></div>
                        </div>
                        {donations.length > 0 && (
                            <div className="ngod-recent">
                                <h3>🕐 Most Recent Donation</h3>
                                <div className="recent-card">
                                    <p><strong>From:</strong> {donations[0].donor_name}</p>
                                    <p><strong>Food:</strong> {donations[0].food_type || "—"} — {donations[0].food_quantity}</p>
                                    <p><strong>Location:</strong> {donations[0].location}</p>
                                    <p><strong>Volunteer:</strong> {donations[0].volunteer_name || "Not assigned yet"}</p>
                                    <p><strong>Date:</strong> {new Date(donations[0].created_at).toLocaleString("en-IN")}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default NgoDashboard;