import React, { useState } from "react";
import API from "../../services/api";

export default function AddUser({ onUserAdded, initialData = null, isEditing = false }) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(initialData?.role_id?.toString() || "");
  const [position, setPosition] = useState(initialData?.position || "");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !roleId) {
      setMessage("Please fill in all required fields!");
      return;
    }

    // For editing, password is optional
    if (!isEditing && !password) {
      setMessage("Please fill in all required fields!");
      return;
    }

    try {
      const userData = {
        name,
        email,
        role_id: roleId,
        position,
      };

      // Only include password if it's provided (for new users or when updating password)
      if (password) {
        userData.password = password;
      }

      let res;
      if (isEditing && initialData?.id) {
        // Update existing user
        res = await API.put(`/api/admin/users/${initialData.id}`, userData);
      } else {
        // Create new user
        res = await API.post("/api/admin/add-user", userData);
      }

      setMessage(res.data.message || (isEditing ? "User updated successfully!" : "User added successfully!"));
      
      if (!isEditing) {
        setName("");
        setEmail("");
        setPassword("");
        setRoleId("");
        setPosition("");
      }
      
      if (onUserAdded) onUserAdded();
    } catch (err) {
      console.error("Error:", err);
      setMessage(err.response?.data?.message || "Server error. Try again later.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {message && (
        <div className={`p-3 rounded-md mb-4 ${
          message.includes("successfully") || message.includes("added") 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {message}
        </div>
      )}
      <form className="flex flex-col flex-1 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password {!isEditing && <span className="text-red-500">*</span>}
            {isEditing && <span className="text-gray-500 text-sm">(Optional - leave blank to keep current password)</span>}
          </label>
          <input
            type="password"
            placeholder={isEditing ? "Enter new password (optional)" : "Enter secure password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <div className="flex justify-center pt-6 mt-auto">
          <button
            type="submit"
            className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-200 font-medium"
          >
            Add User
          </button>
        </div>
      </form>
    </div>
  );
}
