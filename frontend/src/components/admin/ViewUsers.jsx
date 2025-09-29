import React, { useState, useEffect } from "react";
import { Plus, Users, X, FileText } from "lucide-react";
import createAPI from "../../services/api.js";
const API = createAPI();
import AddUser from "./AddUser";

export default function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // form state for task
  const [taskData, setTaskData] = useState({
    task: "",
    file_or_folder_name: "",
    message: "",
    permission: "read",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const openTaskModal = () => {
    setSelectedUser(null);
    setTaskData({
      task: "",
      file_or_folder_name: "",
      message: "",
      permission: "read",
    });
    setShowTaskModal(true);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleTaskChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const allocateTask = async () => {
    if (!selectedUser) {
      alert("Please select a user.");
      return;
    }

    if (!taskData.task || !taskData.file_or_folder_name) {
      alert("Please fill in task and file/folder name.");
      return;
    }

    try {
      const res = await API.post("/api/admin/allocate-task", {
        user_id: selectedUser.id,
        task: taskData.task,
        file_or_folder_name: taskData.file_or_folder_name,
        message: taskData.message,
        permission: taskData.permission,
      });

      if (res.status === 200) {
        alert(res.data.message);
        setShowTaskModal(false);
        setTaskData({
          task: "",
          file_or_folder_name: "",
          message: "",
          permission: "read",
        });
      } else {
        alert(res.data.message || "Failed to allocate task.");
      }
    } catch (err) {
      console.error("Error allocating task:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-900">Users</h2>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New User
          </button>
          <button
            onClick={openTaskModal}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-200 flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Assign Task
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <AddUser onUserAdded={() => { fetchUsers(); setShowModal(false); }} />
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Assign New Task</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <select
                  onChange={(e) => {
                    const user = users.find(u => u.id == e.target.value);
                    handleUserSelect(user);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select User to Assign Task</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>

                {selectedUser && (
                  <>
                    <input
                      type="text"
                      name="task"
                      placeholder="Task Description *"
                      value={taskData.task}
                      onChange={handleTaskChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />

                    <input
                      type="text"
                      name="file_or_folder_name"
                      placeholder="File/Folder Name *"
                      value={taskData.file_or_folder_name}
                      onChange={handleTaskChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />

                    <textarea
                      name="message"
                      placeholder="Additional Message"
                      value={taskData.message}
                      onChange={handleTaskChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />

                    <select
                      name="permission"
                      value={taskData.permission}
                      onChange={handleTaskChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="read">Read</option>
                      <option value="write">Write</option>
                      <option value="admin">Admin</option>
                    </select>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowTaskModal(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={allocateTask}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                      >
                        Assign Task
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-3"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
            <p className="text-gray-500">Add your first user using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.position || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'Admin' ? 'bg-indigo-100 text-indigo-800' :
                        user.role === 'User' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
