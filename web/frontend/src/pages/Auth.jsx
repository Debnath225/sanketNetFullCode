import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Mail, Lock, User } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "20px" }}>
      <div className="card" style={{ width: "100%", maxWidth: "420px", padding: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div className="logo-icon" style={{ margin: "0 auto 20px" }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p style={{ color: "var(--muted)", fontSize: "13px", margin: "5px 0 0" }}>
            {isLogin ? "Sign in to access your dashboard" : "Sign up to start monitoring"}
          </p>
        </div>

        {error && (
          <div className="alert danger" style={{ padding: "15px", minHeight: "auto", marginBottom: "20px", borderRadius: "10px", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: "13px", color: "var(--red)", textAlign: "center" }}>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {!isLogin && (
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", margin: "0 0 5px", textTransform: "uppercase" }}>Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  style={{ width: "100%", background: "#0c1a2b", border: "1px solid var(--border)", padding: "12px 12px 12px 40px", borderRadius: "10px", color: "#fff", outline: "none" }}
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            </div>
          )}
          
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", margin: "0 0 5px", textTransform: "uppercase" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                style={{ width: "100%", background: "#0c1a2b", border: "1px solid var(--border)", padding: "12px 12px 12px 40px", borderRadius: "10px", color: "#fff", outline: "none" }}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", margin: "0 0 5px", textTransform: "uppercase" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                style={{ width: "100%", background: "#0c1a2b", border: "1px solid var(--border)", padding: "12px 12px 12px 40px", borderRadius: "10px", color: "#fff", outline: "none" }}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg, #0ea5e9, #2563eb)", color: "#fff", padding: "14px", borderRadius: "10px", fontWeight: "bold", border: "none", cursor: loading ? "not-allowed" : "pointer", marginTop: "10px", boxShadow: "0 8px 25px rgba(14,165,233,0.2)" }}>
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "25px", fontSize: "13px", color: "var(--muted)" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: "none", border: "none", color: "var(--blue)", cursor: "pointer", fontWeight: "bold" }}>
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
