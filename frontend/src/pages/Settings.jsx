import React, { useEffect, useState } from "react";

const Settings = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [payFrequency, setPayFrequency] = useState("");
    const [nextPayday, setNextPayday] = useState("");
    const [startingAmount, setStartingAmount] = useState(0);
    const [responsiveMode, setResponsiveMode] = useState(1);
    const [layoutPhone, setLayoutPhone] = useState("cards");
    const [layoutTablet, setLayoutTablet] = useState("compact");
    const [layoutDesktop, setLayoutDesktop] = useState("full");
    const [layoutGlobal, setLayoutGlobal] = useState("full");
    const [reserveAmount, setReserveAmount] = useState(0);
    const [message, setMessage] = useState("");

    const API = "http://127.0.0.1/bill/backend/api";

    useEffect(() => {
        if (!user?.id) return;

        fetch(`${API}/settings.php?user_id=${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.settings) {
                    const s = data.settings;

                    setPayFrequency(s.pay_frequency || "");
                    setNextPayday(s.next_payday || "");
                    setStartingAmount(s.starting_amount || 0);
                    setReserveAmount(s.reserve_amount || 0);

                    // NEW LAYOUT SETTINGS (fallbacks for older DB rows)
                    setResponsiveMode(s.responsive_mode ?? 1);
                    setLayoutPhone(s.layout_phone || "cards");
                    setLayoutTablet(s.layout_tablet || "compact");
                    setLayoutDesktop(s.layout_desktop || "full");
                    setLayoutGlobal(s.layout_global || "full");
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user]);

    const saveSettings = () => {
        if (!user?.id) return;

        setSaving(true);
        setMessage("");

        const payload = {
            user_id: user.id,
            pay_frequency: payFrequency,
            next_payday: nextPayday || null,
            starting_amount: startingAmount,
            reserve_amount: reserveAmount,
            responsive_mode: responsiveMode,
            layout_phone: layoutPhone,
            layout_tablet: layoutTablet,
            layout_desktop: layoutDesktop,
            layout_global: layoutGlobal
        };

        fetch(`${API}/settings.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMessage("Settings saved successfully.");
                } else {
                    setMessage("Error saving settings.");
                }
                setSaving(false);
            })
            .catch(() => {
                setMessage("Error saving settings.");
                setSaving(false);
            });
    };

    if (loading) return <div>Loading settings…</div>;

    return (
        <div className="settings-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2>Settings</h2>

            {message && (
                <div style={{ marginBottom: "10px", color: "green" }}>
                    {message}
                </div>
            )}

            {/* Starting Amount */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>Starting Amount (Cash on Hand)</label>
                <input
                    type="number"
                    step="0.01"
                    value={startingAmount}
                    onChange={(e) => setStartingAmount(e.target.value)}
                    className="form-control"
                />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>Reserve Amount (Cash Buffer)</label>
                <input
                    type="number"
                    step="0.01"
                    value={reserveAmount}
                    onChange={(e) => setReserveAmount(e.target.value)}
                    className="form-control"
                />
            </div>

            {/* Pay Frequency */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>Pay Frequency</label>
                <select
                    value={payFrequency}
                    onChange={(e) => setPayFrequency(e.target.value)}
                    className="form-control"
                >
                    <option value="">Select…</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="semimonthly">Semi‑Monthly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </div>

            {/* Next Payday */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>Next Payday</label>
                <input
                    type="date"
                    value={nextPayday || ""}
                    onChange={(e) => setNextPayday(e.target.value)}
                    className="form-control"
                />
            </div>

            {/* Responsive Mode */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>Responsive Layout Mode</label>
                <select
                    value={responsiveMode}
                    onChange={(e) => setResponsiveMode(parseInt(e.target.value))}
                    className="form-control"
                >
                    <option value={1}>Responsive (Phone / Tablet / Desktop)</option>
                    <option value={0}>Fixed Layout (Use one layout everywhere)</option>
                </select>
            </div>

            {/* Layout Options */}
            {responsiveMode === 1 ? (
                <>
                    <div className="form-group" style={{ marginBottom: "20px" }}>
                        <label>Phone Layout</label>
                        <select
                            value={layoutPhone}
                            onChange={(e) => setLayoutPhone(e.target.value)}
                            className="form-control"
                        >
                            <option value="cards">Cards</option>
                            <option value="compact">Compact Table</option>
                            <option value="standard">Standard Table</option>
                            <option value="full">Full Table</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: "20px" }}>
                        <label>Tablet Layout</label>
                        <select
                            value={layoutTablet}
                            onChange={(e) => setLayoutTablet(e.target.value)}
                            className="form-control"
                        >
                            <option value="cards">Cards</option>
                            <option value="compact">Compact Table</option>
                            <option value="standard">Standard Table</option>
                            <option value="full">Full Table</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: "20px" }}>
                        <label>Desktop Layout</label>
                        <select
                            value={layoutDesktop}
                            onChange={(e) => setLayoutDesktop(e.target.value)}
                            className="form-control"
                        >
                            <option value="cards">Cards</option>
                            <option value="compact">Compact Table</option>
                            <option value="standard">Standard Table</option>
                            <option value="full">Full Table</option>
                        </select>
                    </div>
                </>
            ) : (
                <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label>Layout for All Devices</label>
                    <select
                        value={layoutGlobal}
                        onChange={(e) => setLayoutGlobal(e.target.value)}
                        className="form-control"
                    >
                        <option value="cards">Cards</option>
                        <option value="compact">Compact Table</option>
                        <option value="standard">Standard Table</option>
                        <option value="full">Full Table</option>
                    </select>
                </div>
            )}

            <button
                onClick={saveSettings}
                disabled={saving}
                className="btn btn-primary"
            >
                {saving ? "Saving…" : "Save Settings"}
            </button>
        </div>
    );
};

export default Settings;
