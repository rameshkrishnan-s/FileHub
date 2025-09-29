import React, { useState, useEffect } from "react";
import { Plus, User, FileText } from "lucide-react";

export default function AddTask() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [showList, setShowList] = useState(false);
  const [message, setMessage] = useState("");

  // form state
  const [taskData, setTaskData] = useState({
    user_id: "",
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

  const fetchAllTasks = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/all-tasks");
      const data = await res.json();
      setAllTasks(data.tasks || []);
    } catch (err) {
      console.error("Error fetching all tasks:", err);
    }
  };

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const allocateTask = async () => {
    if (!taskData.user_id || !taskData.task || !taskData.file_or_folder_name) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/allocate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Task allocated successfully!");
        setTaskData({
          user_id: "",
          task: "",
          file_or_folder_name: "",
          message: "",
          permission: "read",
        });
        setShowList(true);
        fetchAllTasks(); // Fetch and show the updated list
      } else {
        setMessage(data.message || "Failed to allocate task.");
      }
    } catch (err) {
      console.error("Error allocating task:", err);
      setMessage("Something went wrong.");
    }
  };

  const resetForm = () => {
    setTaskData({
      user_id: "",
      task: "",
      file_or_folder_name: "",
      message: "",
      permission: "read",
    });
    setMessage("");
    setShowList(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Plus className="h-6 w-6 text-emerald-600 mr-2" />
        Assign New Task
      </h2>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes("successfully") || message.includes("allocated")
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {message}
        </div>
      )}

      {/* Task Assignment Form - Similar to AddUser style */}
      <form className="space-y-6 mb-8 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignee <span className="text-red-500">*</span>
          </label>
          <select
            name="user_id"
            value={taskData.user_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Choose a user...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.email} ({user.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="task"
            placeholder="What needs to be done?"
            value={taskData.task}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File or Folder <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="file_or_folder_name"
            placeholder="e.g., project-report.pdf or /documents/folder"
            value={taskData.file_or_folder_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            name="message"
            placeholder="Any extra instructions..."
            value={taskData.message}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Permission Level
          </label>
          <select
            name="permission"
            value={taskData.permission}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="read">Read Only</option>
            <option value="write">Read & Write</option>
            <option value="admin">Full Access</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={allocateTask}
            className="px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-200 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign Task
          </button>
        </div>
      </form>

      {/* Tasks List - Shown after adding a task */}
      {showList && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Recently Assigned Tasks
          </h3>
          {allTasks.length === 0 ? (
            <p className="text-gray-500">No tasks assigned yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTasks.map((task) => (
                <div key={task.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">{task.task}</h4>
                  <p className="text-sm text-gray-600 mb-2">{task.file_or_folder_name || 'No file specified'}</p>
                  <p className="text-xs text-gray-500 mb-2">Assigned to: {task.user_name}</p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
