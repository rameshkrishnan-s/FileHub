import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/header";
import { Folder, FileText, MessageSquare } from "lucide-react";

export default function ViewerDashboard() {
  const [activeTab, setActiveTab] = useState("files");
  const [message, setMessage] = useState("");
  const [filesData, setFilesData] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user tasks/permissions first
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    const fetchPermissions = async () => {
      try {
        const res = await axios.get(`/api/user/my-tasks/${userId}`);
        setPermissions(res.data.permissions || []);
        setUser(res.data.user || null);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPermissions();
  }, []);

  // Fetch files/folders for the user from /list API
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        const res = await axios.get("/api/user/list", {
          params: { path: "", user_id: userId }, // send user_id to get only permitted files
        });
        setFilesData(res.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Error fetching files");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  // Helper to check if user has permission for a file/folder
  const hasPermission = (filePath) => {
    return permissions.some((p) =>
      filePath.startsWith(p.file_or_folder)
    );
  };

  const menuItems = [
    { key: "files", label: "Files", icon: FileText },
    { key: "folders", label: "Folders", icon: Folder },
    { key: "messages", label: "Messages", icon: MessageSquare },
  ];

  const renderItem = (item) => {
    const allowed = hasPermission(item.path);
    const Icon = item.type === "file" ? FileText : Folder;
    const color = item.type === "file" ? "text-blue-500" : "text-yellow-500";

    return (
      <div
        key={item.path}
        className={`bg-white shadow p-4 rounded-md transition ${
          !allowed ? "text-red-500 text-center" : "hover:shadow-lg"
        }`}
      >
        {!allowed ? (
          <p>Access Denied</p>
        ) : (
          <>
            <Icon className={`${color} mb-2`} size={24} />
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-500">
              Permission:{" "}
              {permissions.find((p) =>
                item.path.startsWith(p.file_or_folder)
              )?.permission || "none"}
            </p>
          </>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === "messages") {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-3">Messages</h2>
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 h-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={() => {
              alert(`Message sent: ${message}`);
              setMessage("");
            }}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      );
    }

    if (loading) return <p>Loading files...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!filesData.length) return <p>No files or folders available.</p>;

    const files = filesData.filter((f) => f.type === "file");
    const folders = filesData.filter((f) => f.type === "folder");

    if (activeTab === "files") {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-3">Files</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map(renderItem)}
          </div>
        </div>
      );
    }

    if (activeTab === "folders") {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-3">Folders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map(renderItem)}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex mt-[0px]">
        <div className="w-64 bg-white shadow-lg min-h-[calc(100vh-90px)]">
          <div className="flex items-center justify-center h-16 bg-blue-600">
            <h1 className="text-white text-xl font-bold">Viewer Panel</h1>
          </div>
          <nav className="mt-4">
            <div className="px-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                      activeTab === item.key
                        ? "bg-blue-50 text-blue-700 border-r-4 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3 text-blue-600" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
        <div className="flex-1 p-8 bg-gray-50">{renderContent()}</div>
      </div>
    </div>
  );
}
