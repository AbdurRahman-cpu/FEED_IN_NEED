import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Volunteerdashboard.css";
import dashboardBg from "../assets/Dashboard.mp4";

const API = "http://localhost:5000";

function VolunteerDashboard() {
    const navigate = useNavigate();
    const volunteerId   = localStorage.getItem("volunteer_id");
    const volunteerName = localStorage.getItem("volunteer_name");

    const [ngos, setNgos]             = useState([]);
    const [donations, setDonations]   = useState([]);
    const [loading, setLoading]       = useState(true);
    const [activeTab, setActiveTab]   = useState("tasks");
    const [claimingId, setClaimingId] = useState(null);
    const [toast, setToast]           = useState(null);

    useEffect(() => {
        if (!volunteerId) navigate("/login", { state: { role: "volunteer" } });
    }, [volunteerId, navigate]);

    const fetchData = () => {
        Promise.all([
            fetch(`${API}/api/ngos`).then(r => r.json()),
            fetch(`${API}/api/donations`).then(r => r.json())
        ])
            .then(([ngoData, donationData]) => {
                setNgos(ngoData);
                setDonations(donationData.filter(d => d.status !== "collected" && d.status !== "delivered"));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const showToast = (msg, success = true) => {
        setToast({ msg, success });
        setTimeout(() => setToast(null), 3000);
    };

    const handleClaim = async (donationId) => {
        setClaimingId(donationId);
        try {
            const res = await fetch(`${API}/api/donations/${donationId}/claim`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ volunteer_id: volunteerId, volunteer_name: volunteerName })
            });
            const result = await res.json();
            if (res.ok) {
                showToast('✅ Task claimed! NGO has been notified by email.');
                setDonations(prev =>
                    prev.map(d => d.id === donationId
                        ? { ...d, status: 'accepted', volunteer_id: volunteerId, volunteer_name: volunteerName }
                        : d
                    )
                );
            } else {
                showToast(result.error || 'Failed to claim task.', false);
            }
        } catch {
            showToast('Error connecting to server.', false);
        }
        setClaimingId(null);
    };

    const getInitials = (name) =>
        name?.split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

    const colors = ["#e74c3c","#3498db","#2ecc71","#f39c12","#9b59b6","#1abc9c"];
    const getColor = (name) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
        return colors[hash % colors.length];
    };

    const myTasks   = donations.filter(d => String(d.volunteer_id) === String(volunteerId));
    const openTasks = donations.filter(d => !d.volunteer_id);

    return (
        <div className="vold-container">

            {/* ── Background Video ── */}
            <video autoPlay loop muted playsInline className="vold-bg-video">
                <source src={dashboardBg} type="video/mp4" />
            </video>
            <div className="vold-bg-overlay" />

            {/* ── Sidebar ── */}
            <aside className="vold-sidebar">
                <div className="vold-brand"><span>🍽</span><span>Feed In Need</span></div>
                <div className="vold-profile">
                    <div className="vold-avatar">{getInitials(volunteerName || "V")}</div>
                    <p className="vold-name">{volunteerName}</p>
                    <span className="vold-badge">🙋 Volunteer</span>
                </div>
                <nav className="vold-nav">
                    <button className={activeTab === "tasks" ? "active" : ""} onClick={() => setActiveTab("tasks")}>
                        🚚 Open Pickups {openTasks.length > 0 && <span className="nav-count">{openTasks.length}</span>}
                    </button>
                    <button className={activeTab === "mine" ? "active" : ""} onClick={() => setActiveTab("mine")}>
                        📋 My Tasks {myTasks.length > 0 && <span className="nav-count">{myTasks.length}</span>}
                    </button>
                    <button className={activeTab === "ngos" ? "active" : ""} onClick={() => setActiveTab("ngos")}>🏢 NGO Directory</button>
                    <button className={activeTab === "about" ? "active" : ""} onClick={() => setActiveTab("about")}>ℹ️ How It Works</button>
                </nav>
                <button className="vold-logout" onClick={() => { localStorage.removeItem("volunteer_id"); localStorage.removeItem("volunteer_name"); navigate("/"); }}>
                    🚪 Logout
                </button>
            </aside>

            {/* ── Main ── */}
            <main className="vold-main">
                <div className="vold-header">
                    <div>
                        <h1>Hello, {volunteerName} 👋</h1>
                        <p>Help collect and deliver food donations to NGOs</p>
                    </div>
                    <div className="vold-stats-mini">
                        <div className="mini-stat"><h3>{openTasks.length}</h3><p>Open Tasks</p></div>
                        <div className="mini-stat"><h3>{myTasks.length}</h3><p>My Tasks</p></div>
                        <div className="mini-stat"><h3>{ngos.length}</h3><p>NGOs</p></div>
                    </div>
                </div>

                {/* Open Pickups Tab */}
                {activeTab === "tasks" && (
                    <div className="vold-section">
                        <h2>🚚 Open Pickups</h2>
                        <p className="section-sub">Unclaimed donations waiting for a volunteer</p>
                        {loading ? (
                            <div className="vold-loading"><div className="vold-spinner"></div><p>Loading...</p></div>
                        ) : openTasks.length === 0 ? (
                            <div className="vold-empty"><span>🎉</span><p>No open pickups right now!</p></div>
                        ) : (
                            <div className="vold-cards">
                                {openTasks.map(d => (
                                    <div className="vold-task-card" key={d.id}>
                                        <div className="task-header">
                                            <span className="task-badge">⏳ Unclaimed</span>
                                            <span className="task-date">{new Date(d.created_at).toLocaleDateString("en-IN")}</span>
                                        </div>
                                        <div className="task-body">
                                            <div className="task-row"><span>👤</span><div><p className="task-label">Donor</p><p className="task-value">{d.donor_name}</p></div></div>
                                            <div className="task-row"><span>📞</span><div><p className="task-label">Contact</p><p className="task-value">{d.phone}</p></div></div>
                                            <div className="task-row"><span>📍</span><div><p className="task-label">Pickup From</p><p className="task-value">{d.location}</p></div></div>
                                            <div className="task-row"><span>🍱</span><div><p className="task-label">Food</p><p className="task-value">{d.food_type || "—"} · {d.food_quantity}</p></div></div>
                                            <div className="task-row"><span>🏢</span><div><p className="task-label">Deliver To</p><p className="task-value">{d.ngo_name}</p></div></div>
                                        </div>
                                        <div className="task-actions">
                                            <a href={`tel:${d.phone}`} className="task-call-btn">📞 Call Donor</a>
                                            <button className="task-claim-btn" onClick={() => handleClaim(d.id)} disabled={claimingId === d.id}>
                                                {claimingId === d.id ? "Claiming..." : "✋ Accept Task"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* My Tasks Tab */}
                {activeTab === "mine" && (
                    <div className="vold-section">
                        <h2>📋 My Accepted Tasks</h2>
                        <p className="section-sub">Donations you have claimed</p>
                        {myTasks.length === 0 ? (
                            <div className="vold-empty"><span>📭</span><p>You haven't accepted any tasks yet.</p></div>
                        ) : (
                            <div className="vold-cards">
                                {myTasks.map(d => (
                                    <div className="vold-task-card claimed-card" key={d.id}>
                                        <div className="task-header">
                                            <span className="task-badge claimed-badge">🚚 You Accepted</span>
                                            <span className="task-date">{new Date(d.created_at).toLocaleDateString("en-IN")}</span>
                                        </div>
                                        <div className="task-body">
                                            <div className="task-row"><span>👤</span><div><p className="task-label">Donor</p><p className="task-value">{d.donor_name}</p></div></div>
                                            <div className="task-row"><span>📞</span><div><p className="task-label">Contact</p><p className="task-value">{d.phone}</p></div></div>
                                            <div className="task-row"><span>📍</span><div><p className="task-label">Pickup From</p><p className="task-value">{d.location}</p></div></div>
                                            <div className="task-row"><span>🍱</span><div><p className="task-label">Food</p><p className="task-value">{d.food_type || "—"} · {d.food_quantity}</p></div></div>
                                            <div className="task-row"><span>🏢</span><div><p className="task-label">Deliver To</p><p className="task-value">{d.ngo_name}</p></div></div>
                                        </div>
                                        <a href={`tel:${d.phone}`} className="task-call-btn" style={{margin: "0 16px 16px"}}>📞 Call Donor</a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* NGO Directory Tab */}
                {activeTab === "ngos" && (
                    <div className="vold-section">
                        <h2>🏢 NGO Directory</h2>
                        <p className="section-sub">All verified NGOs on this platform</p>
                        <div className="vold-ngo-list">
                            {ngos.map(ngo => (
                                <div className="vold-ngo-card" key={ngo.id}>
                                    <div className="vold-ngo-avatar" style={{ background: getColor(ngo.org_name) }}>{getInitials(ngo.org_name)}</div>
                                    <div className="vold-ngo-info">
                                        <h3>{ngo.org_name}</h3>
                                        <p>📍 {ngo.org_address}</p>
                                        <p>📧 {ngo.email}</p>
                                        <p>📞 {ngo.phone}</p>
                                    </div>
                                    <span className="vold-verified">✅ Verified</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* How It Works Tab */}
                {activeTab === "about" && (
                    <div className="vold-section">
                        <h2>ℹ️ How Volunteering Works</h2>
                        <div className="vold-steps">
                            <div className="step-card"><div className="step-num">1</div><h3>Check Open Pickups</h3><p>Browse donations waiting to be collected from donors.</p></div>
                            <div className="step-card"><div className="step-num">2</div><h3>Accept a Task</h3><p>Click "Accept Task" to claim it. The NGO gets notified by email automatically.</p></div>
                            <div className="step-card"><div className="step-num">3</div><h3>Call the Donor</h3><p>Contact the donor to confirm pickup time and location.</p></div>
                            <div className="step-card"><div className="step-num">4</div><h3>Deliver to NGO</h3><p>Collect the food and deliver it to the assigned NGO.</p></div>
                        </div>
                    </div>
                )}
            </main>

            {/* ── Toast ── */}
            {toast && (
                <div className={`vold-toast ${toast.success ? "toast-success" : "toast-error"}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}

export default VolunteerDashboard;