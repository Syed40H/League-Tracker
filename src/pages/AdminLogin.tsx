import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AdminLogin = () => {
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await login(email, password);
    if (error) setErrorMsg(error);
    else navigate("/");
  };

  if (isAdmin) {
    navigate("/");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0b0f",
        color: "white",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "24px",
          borderRadius: "12px",
          background: "#15151c",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", marginBottom: "16px", textAlign: "center" }}>
          Admin Login
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #444",
              background: "#0f0f15",
              color: "white",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #444",
              background: "#0f0f15",
              color: "white",
            }}
          />

          {errorMsg && (
            <p style={{ color: "#f97373", fontSize: "0.9rem" }}>{errorMsg}</p>
          )}

          <button
            type="submit"
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              background: "#ea4335",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
