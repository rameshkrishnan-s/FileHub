import React, { useState, useEffect } from "react";
import API from "../services/api.js";
import Header from "../components/header";
import { Menu } from "lucide-react";

export default function UserDashboard() {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch files
  useEffect(() => {
    API.get("/files")
      .then((res) => setFiles(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch user details
  useEffect(() => {
    API.get("/user/profile")
      .then((res) => setUser(res.data))
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* Main Company Header */}
      <Header />

      {/* Hamburger Menu and Dashboard Title (Fixed and positioned below the header) */}
      <div className="fixed top-[108px] left-0 p-4 flex items-center bg-white border-b border-gray-200 shadow z-50 w-full">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-700 focus:outline-none"
        >
          <Menu size={28} />
        </button>
        <h1 className="ml-4 text-xl font-semibold">User Dashboard</h1>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-30 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg p-4 transform transition-transform duration-300 z-40 pt-16
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <h2 className="text-lg font-bold mb-4"> Menu</h2>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`w-full text-left px-5 py-2 rounded-lg ${
                activeTab === "tasks" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
            >
               Tasks
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("pending")}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                activeTab === "pending" ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`}
            >
               Pending Works
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("completed")}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                activeTab === "completed" ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`}
            >
               Completed Works
            </button>
          </li>
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
        {/* Profile */}
        {showProfile && user && (
          <div className="bg-gray-100 p-4 rounded mb-4 shadow">
            <h2 className="text-xl font-semibold mb-2">Profile Details</h2>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === "tasks" && (
          <div>
            <h2 className="text-xl font-semibold mb-4"> Your Tasks</h2>
            <p className="text-gray-600 mb-4 ">
              Upload, view, and manage your assigned tasks here.
            </p>
            <div className="mb-4">
              <label className="bg-blue-500 text-white p-2 rounded cursor-pointer">
                Choose File
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleUpload}
                className="bg-green-500 text-white p-2 rounded ml-2"
              >
                Upload
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
            <ul className="list-disc ml-6">
              {files.map((f) => (
                <li key={f.id}>{f.filename}</li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "pending" && (
          <div>
            <h2 className="text-xl font-semibold mb-4"> Pending Works</h2>
            <ul className="list-disc ml-6">
              <li>Approval needed for uploaded file XYZ.pdf</li>
              <li>Waiting for review of ABC.docx</li>
            </ul>
          </div>
        )}

        {activeTab === "completed" && (
          <div>
            <h2 className="text-xl font-semibold mb-4"> Completed Works</h2>
            <ul className="list-disc ml-6">
              <li>Final report submitted ✔</li>
              <li>Project documentation approved ✔</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}