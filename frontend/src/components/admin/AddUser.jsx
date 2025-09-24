import React, { useState } from "react";

export default function AddUser() {
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
      } else {
        setMessage(data.message || "Failed to add user.");
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Add User</h2>
      {message && <div className="mb-4 text-red-600">{message}</div>}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="User Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl"
        />
        <input
          type="email"
          placeholder="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl"
        />
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl"
        >
          <option value="">Select Role</option>
          <option value="1">Admin</option>
          <option value="2">User</option>
          <option value="3">Viewer</option>
        </select>
        <input
          type="text"
          placeholder="Position (optional)"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
        >
          Add User
        </button>
      </form>
    </div>
  );
}
