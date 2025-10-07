import React, { useState, useEffect } from "react";
import API from "../services/api.js";
import Header from "../components/header";
import { Menu, User } from "lucide-react";
import { getUserId } from "../services/authService.js";
import { useNavigate } from "react-router-dom";


export default function UserDashboard() {
   const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [taskFiles, setTaskFiles] = useState({});

  // Fetch user profile
  useEffect(() => {
    const userId = getUserId();
    console.log("Fetched userId (Profile):", userId); 
    if (userId) {
      API.get(`/api/user/profile?id=${userId}`)
        .then((res) => setUser(res.data.user))
        .catch((err) => console.error(err));
    }
  }, []);

  // Fetch tasks based on active tab
  const fetchTasks = async (status = null) => {
    setLoading(true);
    const userId = getUserId();
    if (userId) {
      try {
        const url = status 
          ? `/api/user/my-tasks/${userId}?status=${status}`
          : `/api/user/my-tasks/${userId}`;
        const res = await API.get(url);
        setTasks(res.data.tasks);
      } catch (err) {
        console.error(err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks(activeTab === 'all' ? null : activeTab);
  }, [activeTab]);

  // Fetch all files (if still needed for other purposes)
  useEffect(() => {
    API.get("/api/user/files")
      .then((res) => setFiles(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File uploaded!");
      setFile(null);
      const res = await API.get("/files");
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await API.put(`/api/user/update-task-status/${taskId}`, { status });
      fetchTasks(activeTab === "all" ? null : activeTab);
    } catch (err) {
      console.error(err);
    }
  };
  const handleLogout = () => {
    sessionStorage.removeItem("token");  
    sessionStorage.removeItem("user");   
    navigate("/"); // redirect to landing page
  };

  const fetchTaskFiles = async (taskId, folder) => {
    try {
      const res = await API.get(`/api/user/files/folder/${folder}`);
      setTaskFiles(prev => ({ ...prev, [taskId]: res.data.files }));
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded">
            Pending
          </span>
        );
      case "accepted":
        return (
          <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded">
            Accepted
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded">
            Rejected
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* Main Company Header */}
     <div className="sticky top-0 z-50">
  <Header />
</div>


{/* Top Nav Bar with Task Tabs */}
<div className="fixed top-[108px] left-0 p-4 bg-white border-b border-gray-200 shadow z-50 w-full">
  <div className="flex items-center justify-between">
    <h1 className="text-xl font-semibold">User Dashboard</h1>

    <div className="flex space-x-2 items-center">
      <button
        onClick={() => setActiveTab("all")}
        className={`px-4 py-2 rounded-lg text-sm font-medium ${
          activeTab === "all"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        All Tasks
      </button>
      <button
        onClick={() => setActiveTab("pending")}
        className={`px-4 py-2 rounded-lg text-sm font-medium ${
          activeTab === "pending"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Pending
      </button>
      <button
        onClick={() => setActiveTab("accepted")}
        className={`px-4 py-2 rounded-lg text-sm font-medium ${
          activeTab === "accepted"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Accepted
      </button>
      <button
        onClick={() => setActiveTab("completed")}
        className={`px-4 py-2 rounded-lg text-sm font-medium ${
          activeTab === "completed"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Completed
      </button>

      {/* Profile Icon */}
      <button
        onClick={() => setShowProfile(!showProfile)}
        className="ml-3 p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
      >
        <User size={22} />
      </button>
    </div>
  </div>
</div>



      {/* Sidebar with only Profile */}
      <aside
        className={`fixed top-[108px] left-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg p-4 transform transition-transform duration-300 z-40 pt-16 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-lg font-bold mb-4">Menu</h2>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              Profile
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 p-6 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        } pt-36`}
      >
        {/* Profile Section */}
        {showProfile && user && (
  <div className="bg-gray-100 p-4 rounded mb-4 shadow">
    <h2 className="text-xl font-semibold mb-2">Profile Details</h2>
    <p><strong>Name:</strong> {user.name}</p>
    <p><strong>Email:</strong> {user.email}</p>
    <p><strong>Role:</strong> {user.role}</p>
    <p><strong>Position:</strong> {user.position}</p>

    {/* Logout Button */}
    <button
      onClick={handleLogout}
      className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Logout
    </button>
  </div>
)}

        {/* Content based on active tab */}
        {activeTab === "all" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">All Tasks</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{task.task}</h3>
                        {getStatusBadge(task.status)}
                      </div>
                      {task.file_or_folder_name && (
                        <p className="text-sm text-gray-600">
                          <strong>File/Folder:</strong> {task.file_or_folder_name}
                        </p>
                      )}
                      {task.message && (
                        <p className="mt-2 text-gray-700">{task.message}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Assigned on: {new Date(task.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>You have no tasks assigned.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "pending" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Pending Tasks</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{task.task}</h3>
                        {getStatusBadge(task.status)}
                      </div>
                      {task.file_or_folder_name && (
                        <p className="text-sm text-gray-600">
                          <strong>File/Folder:</strong> {task.file_or_folder_name}
                        </p>
                      )}
                      {task.message && (
                        <p className="mt-2 text-gray-700">{task.message}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Assigned on: {new Date(task.created_at).toLocaleDateString()}
                      </p>
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => updateTaskStatus(task.id, 'accepted')}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateTaskStatus(task.id, 'rejected')}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>You have no pending tasks.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "accepted" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Accepted Tasks</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{task.task}</h3>
                        {getStatusBadge(task.status)}
                      </div>
                      {task.file_or_folder_name && (
                        <p className="text-sm text-gray-600">
                          <strong>File/Folder:</strong> {task.file_or_folder_name}
                        </p>
                      )}
                      {task.message && (
                        <p className="mt-2 text-gray-700">{task.message}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Assigned on: {new Date(task.created_at).toLocaleDateString()}
                      </p>
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Mark as Completed
                        </button>
                        {task.file_or_folder_name && (
                          <button
                            onClick={() => fetchTaskFiles(task.id, task.file_or_folder_name)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                          >
                            View Directory Files
                          </button>
                        )}
                      </div>
                      {taskFiles[task.id] && (
                        <div className="mt-4">
                          <h4 className="font-semibold">Files in {task.file_or_folder_name}:</h4>
                          <ul className="list-disc pl-5">
                            {taskFiles[task.id].map(file => <li key={file.id}>{file.originalName}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>You have no accepted tasks.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "completed" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Completed Tasks</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{task.task}</h3>
                        {getStatusBadge(task.status)}
                      </div>
                      {task.file_or_folder_name && (
                        <p className="text-sm text-gray-600">
                          <strong>File/Folder:</strong> {task.file_or_folder_name}
                        </p>
                      )}
                      {task.message && (
                        <p className="mt-2 text-gray-700">{task.message}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Assigned on: {new Date(task.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>You have no completed tasks.</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}