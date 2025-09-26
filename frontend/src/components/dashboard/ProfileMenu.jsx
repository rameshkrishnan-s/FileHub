import React, { useState, useEffect } from "react";
import { User } from "lucide-react"; // Default person icon

export default function ProfileMenu({ authToken }) {
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
        <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-xl border p-4 z-20">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : user ? (
            <>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-600">{user.position}</p>
              <p className="text-sm text-green-700 font-medium mt-1">Role: {user.role}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">User not found</p>
          )}
        </div>
      )}
    </div>
  );
}
