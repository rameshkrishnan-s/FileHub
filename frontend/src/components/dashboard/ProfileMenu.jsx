import React, { useState, useEffect } from "react";
import { User, LogOut, Settings, ArrowLeft } from "lucide-react";
import { logout as authLogout } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu({ authToken }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const id = localStorage.getItem("id"); // Ensure ID is set after login
        if (!id) return;

        const res = await fetch(`http://localhost:5000/api/admin/profile?id=${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${authToken}` }, // Optional if backend uses token
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
        } else {
          console.error("Failed to load profile:", data.message);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authToken]);

  const handleLogout = () => {
    authLogout();
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        <User size={24} className="text-gray-700" /> {/* Default person icon */}
        <span className="font-medium">{user?.name || (loading ? "Loading..." : "User")}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-xl border z-20">
          {loading ? (
            <div className="p-4">
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          ) : user ? (
            <>
              {/* User Info */}
              <div className="p-4 border-b border-gray-100">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-600">{user.position || "N/A"}</p>
                <p className="text-sm text-green-700 font-medium mt-1">Role: {user.role}</p>
              </div>
              
              {/* Menu Options */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate('/admin');
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-3" />
                  Back to Admin Dashboard
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    // Navigate to profile page if needed
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Profile Settings
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="p-4">
              <p className="text-sm text-gray-500">User not found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
