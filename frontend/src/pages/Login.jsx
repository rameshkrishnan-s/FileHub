import React, { useState } from "react";
import API from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);

      if (res.data.role === 1) navigate("/admin");
      else if (res.data.role === 2) navigate("/user");
      else navigate("/viewer");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <>
      {/* Inline CSS */}
      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(to right, #a855f7, #ec4899, #ef4444);
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          border-radius: 30px;
          padding: 40px 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          text-align: center;
          transition: transform 0.3s ease;
        }

        .login-card:hover {
          transform: scale(1.03);
        }

        .login-title {
          font-size: 32px;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 30px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .input-group label {
          font-size: 14px;
          font-weight: 500;
          color: #4b5563;
          margin-bottom: 6px;
        }

        .input-group input {
          padding: 12px 15px;
          border: 1px solid #d1d5db;
          border-radius: 15px;
          font-size: 14px;
          outline: none;
          transition: 0.3s;
        }

        .input-group input:focus {
          border-color: #ec4899;
          box-shadow: 0 0 5px rgba(236, 72, 153, 0.5);
        }

        .login-btn {
          padding: 14px;
          background-color: #ec4899;
          color: #fff;
          font-weight: 700;
          border: none;
          border-radius: 15px;
          cursor: pointer;
          font-size: 16px;
          transition: 0.3s;
        }

        .login-btn:hover {
          background-color: #db2777;
          transform: scale(1.05);
        }

        .error-text {
          color: #ef4444;
          font-weight: 500;
          margin-top: 10px;
        }

        .signup-text {
          margin-top: 25px;
          font-size: 14px;
          color: #6b7280;
        }

        .signup-link {
          color: #db2777;
          font-weight: 600;
          cursor: pointer;
        }

        .signup-link:hover {
          text-decoration: underline;
        }
      `}</style>

      {/* Login UI */}
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">🔐 User Login</h2>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn">
              Login
            </button>

            {error && <p className="error-text">{error}</p>}
          </form>

          <p className="signup-text">
            Don’t have an account? <span className="signup-link">Sign up</span>
          </p>
        </div>
      </div>
    </>
  );
}
