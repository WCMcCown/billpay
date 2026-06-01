import React, { useEffect, useState } from "react";

const Settings = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [payFrequency, setPayFrequency] = useState("");
    const [nextPayday, setNextPayday] = useState("");

    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!user?.id) return;

        fetch(`http://127.0.0.1/api/settings.php?user_id=${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.settings) {
                    setPayFrequency(data.settings.pay_frequency || "");
                    setNextPayday(data.settings.next_payday || "");
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
            next_payday: nextPayday || null
        };

        fetch("http://127.0.0.1/api/settings.php", {
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
