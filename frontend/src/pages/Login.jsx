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
      const res = await API.post("/auth/login", { email, password });
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
          height: 100vh;
          background: #f3f4f6;
        }
        .login-box {
          width: 100%;
          max-width: 380px;
          background: #ffffff;
          border: 1px solid #ddd;
          border-radius: 12px;
          box-shadow: 0px 4px 10px rgba(0,0,0,0.1);
          padding: 32px;
        }
        .login-form {
          display: flex;
          flex-direction: column;
        }
        .login-title {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          color: #374151;
          margin-bottom: 24px;
        }
        .login-form label {
          font-size: 14px;
          font-weight: 500;
          color: #4b5563;
          margin-bottom: 6px;
        }
        .login-input {
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 12px;
          font-size: 14px;
          margin-bottom: 16px;
          outline: none;
          transition: 0.2s;
        }
        .login-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 4px rgba(59, 130, 246, 0.5);
        }
        .login-btn {
          background: #3b82f6;
          color: #fff;
          font-weight: 600;
          font-size: 16px;
          padding: 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.2s;
        }
        .login-btn:hover {
          background: #2563eb;
          transform: scale(1.02);
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
        }
        .error-text {
          color: #ef4444;
          text-align: center;
          margin-top: 12px;
          font-weight: 500;
        }
        .signup-text {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #6b7280;
        }
        .signup-link {
          color: #2563eb;
          font-weight: 600;
          cursor: pointer;
        }
        .signup-link:hover {
          text-decoration: underline;
        }
      `}</style>

      {/* UI */}
      <div className="login-container">
        <div className="login-box">
          <form onSubmit={handleLogin} className="login-form">
            <h2 className="login-title">🔐 User Login</h2>

            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="login-btn">
              Login
            </button>

            {error && <p className="error-text">{error}</p>}

            <p className="signup-text">
              Don’t have an account?{" "}
              <span className="signup-link">Sign up</span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}