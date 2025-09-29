import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import API from "../services/api.js";
import logo from "../assets/logo.png";
import certs from "../assets/iso-certify-trans.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (loading) return;
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/api/auth/login", { email, password });

      // Save login details to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("id", res.data.id); 
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("userEmail", res.data.email); // <-- Added for profile

      if (res.data.role === 1) navigate("/admin");
      else if (res.data.role === 2) navigate("/user");
      else if (res.data.role === 3) navigate("/viewer");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 text-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center p-4">
          <img src={logo} alt="Company Logo" className="h-16 object-contain" />
          <img src={certs} alt="Certifications" className="h-12 object-contain" />
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transition-all">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-blue-500 outline-none transition-all"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6 relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-blue-500 outline-none transition-all pr-10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full p-3 rounded-lg text-white font-semibold flex items-center justify-center transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
