// src/components/admin/Tasks.js
import React, { useState } from "react";
import { User } from "lucide-react"; // profile icon

export default function Tasks() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/users"); // change port if needed
      const data = await res.json();
      setUsers(data.users || []); // your API has { total, users }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Tasks</h2>

      {/* Navbar-style buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={fetchUsers}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Assign Tasks
        </button>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Track Progress
        </button>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Manage Deadlines
        </button>
      </div>

      {/* Loading State */}
      {loading && <p className="text-gray-500">Loading users...</p>}

      {/* Users List */}
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-sm"
          >
            {/* Left: Profile + Name + Role */}
            <div className="flex items-center space-x-4">
              <User className="w-8 h-8 text-gray-600" />
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.role}</p>
              </div>
            </div>

            {/* Right: Buttons */}
            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition">
                New Task
              </button>
              <button className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition">
                Existing Task
              </button>
            </div>
          </div>
        ))}

        {/* No users found */}
        {!loading && users.length === 0 && (
          <p className="text-gray-500">No users found.</p>
        )}
      </div>
    </div>
  );
}
