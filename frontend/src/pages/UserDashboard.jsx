import React, { useState, useEffect } from "react";
import API from "../services/api.js";
import Header from "../components/header";
import UserFolderNavigation from "../components/UserFolderNavigation";
import { Menu, Folder, FileText, Upload } from "lucide-react";
import { getUserId } from "../services/authService.js";

export default function UserDashboard() {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Get the saved tab from localStorage, default to "all"
    return localStorage.getItem('userActiveTab') || "all";
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Get the saved sidebar state from localStorage, default to false
    return localStorage.getItem('userSidebarOpen') === 'true' || false;
  });
  const [showProfile, setShowProfile] = useState(false);
  const [taskFiles, setTaskFiles] = useState({});
  const [currentPath, setCurrentPath] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [folderFiles, setFolderFiles] = useState([]);
  const [showFolderView, setShowFolderView] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      API.get(`/api/admin/profile?id=${userId}`)
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
          ? `/api/admin/my-tasks/${userId}?status=${status}`
          : `/api/admin/my-tasks/${userId}`;
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

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userActiveTab', activeTab);
  }, [activeTab]);

  // Save sidebarOpen to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userSidebarOpen', sidebarOpen.toString());
  }, [sidebarOpen]);

  // Fetch all files (if still needed for other purposes)
  useEffect(() => {
    API.get("/files")
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

  // Handle folder selection
  const handleFolderSelect = async (folderPath) => {
    setSelectedFolder(folderPath);
    setCurrentPath(folderPath);
    setShowFolderView(true);
    
    try {
      const response = await API.get(`/api/folder/list?path=${encodeURIComponent(folderPath)}`);
      setFolderFiles(response.data || []);
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      setFolderFiles([]);
    }
  };

  // Handle file upload to selected folder
  const handleFolderFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedFolder) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", selectedFolder);

    try {
      await API.post("/api/folder/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh folder contents
      handleFolderSelect(selectedFolder);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`File upload failed: ${error.response?.data?.message || "Unknown error"}`);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await API.put(`/api/admin/update-task-status/${taskId}`, { status });
      fetchTasks(activeTab === 'all' ? null : activeTab);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTaskFiles = async (taskId, folder) => {
    try {
      const res = await API.get(`/api/admin/files/folder/${folder}`);
      setTaskFiles(prev => ({ ...prev, [taskId]: res.data.files }));
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded">Pending</span>;
      case 'accepted':
        return <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded">Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded">Rejected</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded">Completed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* Main Company Header */}
      <Header />

      {/* Top Nav Bar with Task Tabs */}
      <div className="fixed top-[108px] left-0 p-4 bg-white border-b border-gray-200 shadow z-50 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-700 focus:outline-none mr-4"
            >
              <Menu size={28} />
            </button>
            <h1 className="text-xl font-semibold">User Dashboard</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === "pending" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("accepted")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === "accepted" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === "completed" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab("folders")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === "folders" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Folder className="w-4 h-4 mr-1 inline" />
              My Folders
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
                          <>
                            <button
                              onClick={() => window.location.href = `/user-folder?folder=${encodeURIComponent(task.file_or_folder_name)}`}
                              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                              Access Folder
                            </button>
                            <button
                              onClick={() => fetchTaskFiles(task.id, task.file_or_folder_name)}
                              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                              View Directory Files
                            </button>
                          </>
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

        {activeTab === "folders" && (
          <div className="flex h-full bg-gray-50">
            {/* Folder Navigation Sidebar */}
            <div className="w-1/3 min-w-80 bg-white border-r border-gray-200">
              <UserFolderNavigation 
                onFolderSelect={handleFolderSelect}
                currentPath={currentPath}
              />
            </div>

            {/* Folder Contents */}
            <div className="flex-1 p-6">
              {selectedFolder ? (
                <div className="h-full flex flex-col">
                  {/* Folder Header */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Folder className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selectedFolder.split('/').pop()}
                          </h2>
                          <p className="text-sm text-gray-500 font-mono">{selectedFolder}</p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleFolderSelect(selectedFolder)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Refresh
                        </button>
                        <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors flex items-center">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload File
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFolderFileUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Folder Contents */}
                  <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {folderFiles.length > 0 ? (
                      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                        {folderFiles.map((item, index) => (
                          <div key={index} className="p-4 hover:bg-gray-50 flex items-center group">
                            <div className="flex-shrink-0 mr-4">
                              {item.type === 'folder' ? (
                                <Folder className="w-6 h-6 text-blue-500" />
                              ) : (
                                <FileText className="w-6 h-6 text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{item.name}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="capitalize">{item.type}</span>
                                {item.createdAt && (
                                  <span>• {new Date(item.createdAt).toLocaleDateString()}</span>
                                )}
                                {item.size && (
                                  <span>• {(item.size / 1024).toFixed(1)} KB</span>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="text-gray-400 hover:text-gray-600 p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center text-gray-500">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <Folder className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Empty Folder</h3>
                        <p className="text-sm mb-4">This folder doesn't contain any files yet</p>
                        <label className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload your first file
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFolderFileUpload}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <Folder className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Your Folders</h3>
                    <p className="text-gray-500 mb-6 max-w-md">
                      Select a folder from the sidebar to view its contents and upload files. 
                      You can only access folders that have been assigned to you by the administrator.
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Click on any folder to get started</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
