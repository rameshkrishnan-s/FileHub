import React, { useState, useEffect } from "react";
import { FileText, Plus, User, X } from "lucide-react";
import API from "../../services/api.js";

export default function Tasks({ searchQuery = "" }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // form state
  const [taskData, setTaskData] = useState({
    task: "",
    file_or_folder_name: "",
    message: "",
    permission: "read",
  });

  // fetch users and tasks when page loads
  useEffect(() => {
    fetchUsers();
    fetchAllTasks();
  }, []);

  // Filter tasks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTasks(allTasks);
    } else {
      const filtered = allTasks.filter(task => 
        task.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.file_or_folder_name && task.file_or_folder_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.message && task.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
        task.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTasks(filtered);
    }
  }, [searchQuery, allTasks]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const res = await API.get("/api/admin/all-tasks");
      setAllTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Error fetching all tasks:", err);
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
    setShowModal(true);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleEditTask = (task) => {
    setTaskData({
      id: task.id,
      task: task.task,
      file_or_folder_name: task.file_or_folder_name || "",
      message: task.message || "",
      permission: task.permission || "read",
    });
    setSelectedUser({ id: task.user_id, name: task.user_name });
    setIsEditing(true);
    setEditingTaskId(task.id);
    setShowModal(true);
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Are you sure you want to delete task "${task.task}"? This action cannot be undone.`)) {
      try {
        await API.delete(`/api/admin/tasks/${task.id}`);
        fetchAllTasks(); // Refresh the list
        alert('Task deleted successfully!');
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setTaskData({
      task: "",
      file_or_folder_name: "",
      message: "",
      permission: "read",
    });
    setSelectedUser(null);
    setIsEditing(false);
    setEditingTaskId(null);
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
      const isEdit = isEditing && editingTaskId;
      const url = isEdit ? `/api/admin/tasks/${editingTaskId}` : "/api/admin/allocate-task";
      const method = isEdit ? "put" : "post";
      
      const res = await API[method](url, {
        user_id: selectedUser.id,
        task: taskData.task,
        file_or_folder_name: taskData.file_or_folder_name,
        message: taskData.message,
        permission: taskData.permission,
      });

      if (res.status === 200) {
        alert(isEdit ? "Task updated successfully!" : res.data.message);
        setShowModal(false);
        resetForm();
        fetchAllTasks(); // Refresh the tasks list
      } else {
        alert(res.data.message || `Failed to ${isEdit ? 'update' : 'allocate'} task.`);
      }
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'allocating'} task:`, err);
      alert(`Something went wrong while ${isEditing ? 'updating' : 'allocating'} task.`);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-900">Tasks</h2>
        </div>
        <button
          onClick={openTaskModal}
          className="mt-4 sm:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Assign New Task
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              resetForm();
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-[500px] mx-4 max-h-[90vh] border-2 border-gray-300 animate-slideIn backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between p-8 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? "Update Task" : "Assign New Task"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="space-y-6">
                <select
                  onChange={(e) => {
                    const user = users.find(u => u.id == e.target.value);
                    handleUserSelect(user);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 relative z-50 bg-white"
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
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />

                    <input
                      type="text"
                      name="file_or_folder_name"
                      placeholder="File/Folder Name *"
                      value={taskData.file_or_folder_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />

                    <textarea
                      name="message"
                      placeholder="Additional Message"
                      value={taskData.message}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />

                    <select
                      name="permission"
                      value={taskData.permission}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="read">Read</option>
                      <option value="write">Write</option>
                      <option value="admin">Admin</option>
                    </select>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={allocateTask}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                      >
                        {isEditing ? "Update Task" : "Assign Task"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-3"></div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No tasks found' : 'No tasks yet'}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search terms.' : 'Assign your first task using the button above.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File/Folder</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{task.task}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.file_or_folder_name || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{task.message || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{task.user_name}</div>
                          <div className="text-xs text-gray-500">{task.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="Edit Task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
