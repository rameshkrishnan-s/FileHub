import React, { useState, useEffect } from "react";

export default function ProfileMenu({ authToken }) {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const email = localStorage.getItem("userEmail"); // make sure this is set in login
        if (!email) return;

        const res = await fetch(`http://localhost:5000/api/profile?email=${encodeURIComponent(email)}`, {
          headers: { Authorization: `Bearer ${authToken}` }, // optional if backend needs token
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
        <span className="font-medium">{user?.name || (loading ? "Loading..." : "User")}</span>
        <img
          src={`https://ui-avatars.com/api/?name=${user?.name || "U"}&background=16a34a&color=fff`}
          alt="avatar"
          className="w-8 h-8 rounded-full"
        />
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
