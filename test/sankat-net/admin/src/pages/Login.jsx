import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Mail, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "grid", placeItems: "center",
      background: "radial-gradient(circle at 70% 20%, rgba(14,165,233,.12), transparent 40%), #07111f"
    }}>
      <div style={{
        width: "100%", maxWidth: "400px", padding: "40px",
        background: "linear-gradient(145deg,rgba(16,31,51,.95),rgba(10,24,41,.95))",
        border: "1px solid rgba(255,255,255,.08)", borderRadius: "18px",
        boxShadow: "0 24px 60px rgba(0,0,0,.4)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "14px", margin: "0 auto 16px",
            background: "linear-gradient(135deg,#0ea5e9,#2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(14,165,233,.3)"
          }}>
            <ShieldCheck size={26} color="white" />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#edf6ff", marginBottom: "6px" }}>
            Admin Control Center
          </h1>
          <p style={{ fontSize: "12px", color: "#8295aa" }}>
            Sankat-Net Environmental Intelligence Platform
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "12px 14px", borderRadius: "10px", marginBottom: "20px",
            background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)",
            color: "#fca5a5", fontSize: "13px"
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#8295aa", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#52667c" }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                style={{
                  width: "100%", padding: "11px 12px 11px 38px",
                  background: "#0c1a2b", border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: "10px", color: "#edf6ff", fontSize: "14px", outline: "none"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#8295aa", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#52667c" }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                style={{
                  width: "100%", padding: "11px 12px 11px 38px",
                  background: "#0c1a2b", border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: "10px", color: "#edf6ff", fontSize: "14px", outline: "none"
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px", padding: "13px",
              background: loading ? "#1e3a5f" : "linear-gradient(135deg,#0ea5e9,#2563eb)",
              border: "none", borderRadius: "10px",
              color: "#fff", fontWeight: "700", fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 8px 20px rgba(14,165,233,.25)"
            }}
          >
            {loading ? "Authenticating..." : "Sign In to Admin Panel"}
          </button>
        </form>

        <p style={{ marginTop: "20px", textAlign: "center", fontSize: "11px", color: "#52667c" }}>
          Admin & Operator roles only · Secured by JWT
        </p>
      </div>
    </div>
  );
}
