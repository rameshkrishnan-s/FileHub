import React, { useState, useEffect } from "react";
import API from "../../services/api.js";
import Header from "../../components/header";
import { User } from "lucide-react";
import { getUserId } from "../../services/authService.js";
import { useNavigate } from "react-router-dom";
import ProfileSection from "./ProfileSection";
import TaskList from "./TaskList";

export default function UserDashboard() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [taskFiles, setTaskFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      API.get(`/api/user/profile?id=${userId}`)
        .then((res) => setUser(res.data.user))
        .catch((err) => console.error(err));
    }
  }, []);

  // Fetch tasks
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
    fetchTasks(activeTab === "all" ? null : activeTab);
  }, [activeTab]);

  // File Upload
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (taskId, folderName) => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    const userId = getUserId();
    const formData = new FormData();
    formData.append("task_id", taskId);
    formData.append("file", file);
    formData.append("folderName", folderName);
    formData.append("userId", userId);

    setUploading(true);
    try {
      await API.post("/api/user/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File uploaded successfully!");
      setFile(null);
      fetchTaskFiles(taskId, folderName);
    } catch (err) {
      console.error(err);
      alert("File upload failed!");
    }
    setUploading(false);
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await API.put(`/api/user/update-task-status/${taskId}`, { status });
      fetchTasks(activeTab === "all" ? null : activeTab);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTaskFiles = async (taskId, folder) => {
    try {
      const res = await API.get(`/api/user/files/folder/${folder}`);
      setTaskFiles((prev) => ({ ...prev, [taskId]: res.data.files }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white shadow">
        <Header />
      </div>

      {/* Top Nav Bar */}
      <div className="fixed top-[108px] left-0 p-4 bg-white border-b shadow z-50 w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">User Dashboard</h1>
          <div className="flex items-center space-x-2">
            {["all", "pending", "accepted", "completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Tasks
              </button>
            ))}
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="ml-4 p-2 rounded-full hover:bg-gray-200"
            >
              <User size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 p-6 pt-36">
        {showProfile && user && <ProfileSection user={user} navigate={navigate} />}

        {/* Task Lists */}
        <TaskList
          tasks={tasks}
          activeTab={activeTab}
          loading={loading}
          handleFileChange={handleFileChange}
          handleUpload={handleUpload}
          uploading={uploading}
          updateTaskStatus={updateTaskStatus}
          fetchTaskFiles={fetchTaskFiles}
          taskFiles={taskFiles}
        />
      </main>
    </div>
  );
}
