// src/components/admin/Tasks.js
import React, { useState, useEffect } from "react";
import { User } from "lucide-react";

export default function Tasks() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // form state
  const [taskData, setTaskData] = useState({
    task: "",
    file_or_folder_name: "",
    message: "",
    permission: "read",
  });

  // fetch users when page loads
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const openTaskForm = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const allocateTask = async () => {
    if (!selectedUser) return;

    if (!taskData.task || !taskData.file_or_folder_name) {
      alert("Please fill in task and file/folder name.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/allocate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUser.id,
          task: taskData.task,
          file_or_folder_name: taskData.file_or_folder_name,
          message: taskData.message,
          permission: taskData.permission,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setShowForm(false);
        setTaskData({
          task: "",
          file_or_folder_name: "",
          message: "",
          permission: "read",
        });
      } else {
        alert(data.message || "Failed to allocate task.");
      }
    } catch (err) {
      console.error("Error allocating task:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md min-h-screen">
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
            className="bg-gray-100 p-4 rounded-lg shadow-sm"
          >
            {/* Top: User info and buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <User className="w-8 h-8 text-gray-600" />
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => openTaskForm(user)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
                >
                  New Task
                </button>
                <button className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition">
                  Existing Task
                </button>
              </div>
            </div>

            {/* Inline Task Form (appears below selected user) */}
            {showForm && selectedUser?.id === user.id && (
              <div className="mt-4 bg-white p-6 rounded-xl shadow-lg border">
                <h3 className="text-lg font-semibold mb-4">
                  Assign Task to {selectedUser?.name}
                </h3>

                <input
                  type="text"
                  name="task"
                  placeholder="Task"
                  value={taskData.task}
                  onChange={handleChange}
                  className="w-full mb-2 p-2 border rounded"
                />

                <input
                  type="text"
                  name="file_or_folder_name"
                  placeholder="File/Folder Name"
                  value={taskData.file_or_folder_name}
                  onChange={handleChange}
                  className="w-full mb-2 p-2 border rounded"
                />

                <textarea
                  name="message"
                  placeholder="Message"
                  value={taskData.message}
                  onChange={handleChange}
                  className="w-full mb-2 p-2 border rounded"
                />

                <select
                  name="permission"
                  value={taskData.permission}
                  onChange={handleChange}
                  className="w-full mb-4 p-2 border rounded"
                >
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                  <option value="admin">Admin</option>
                </select>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={allocateTask}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Assign
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {!loading && users.length === 0 && (
          <p className="text-gray-500">No users found.</p>
        )}
      </div>
    </div>
  );
}