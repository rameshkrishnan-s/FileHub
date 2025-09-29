import React, { useState } from "react";

export default function AddUser({ onUserAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(""); // 1 = Admin, 2 = User, 3 = Viewer
  const [position, setPosition] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !roleId) {
      setMessage("Please fill in all required fields!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role_id: roleId,
          position,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "User added successfully!");
        setName("");
        setEmail("");
        setPassword("");
        setRoleId("");
        setPosition("");
        if (onUserAdded) onUserAdded();
      } else {
        setMessage(data.message || "Failed to add user.");
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New User</h2>
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes("successfully") || message.includes("added") 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {message}
        </div>
      )}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            placeholder="Enter secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select role</option>
            <option value="1">Admin</option>
            <option value="2">User</option>
            <option value="3">Viewer</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Software Engineer"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setName("");
              setEmail("");
              setPassword("");
              setRoleId("");
              setPosition("");
              setMessage("");
            }}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-200"
          >
            Add User
          </button>
        </div>
      </form>
    </div>
  );
}
