import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./index.css";
import "leaflet/dist/leaflet.css";

function Root() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#07111f", color: "#8295aa", fontSize: "14px" }}>
      Loading session...
    </div>
  );
  return user ? <App /> : <Login />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>
);