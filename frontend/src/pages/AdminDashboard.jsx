import React, { useState } from "react";
import { FiUsers, FiFolder, FiFileText, FiLogOut } from "react-icons/fi";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
            <p>Here you can view, add, or remove users.</p>
            {/* Add your user table or CRUD UI here */}
          </div>
        );
      case "folders":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Manage Folders</h2>
            <p>Here you can create, edit, or delete folders.</p>
            {/* Add folder management UI here */}
          </div>
        );
      case "files":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Manage Files</h2>
            <p>Here you can upload, download, or delete files.</p>
            {/* Add file management UI here */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
          <nav className="flex flex-col space-y-4">
            <button
              className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
                activeTab === "users" ? "bg-gray-200 font-semibold" : ""
              }`}
              onClick={() => setActiveTab("users")}
            >
              <FiUsers />
              <span>Users</span>
            </button>
            <button
              className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
                activeTab === "folders" ? "bg-gray-200 font-semibold" : ""
              }`}
              onClick={() => setActiveTab("folders")}
            >
              <FiFolder />
              <span>Folders</span>
            </button>
            <button
              className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
                activeTab === "files" ? "bg-gray-200 font-semibold" : ""
              }`}
              onClick={() => setActiveTab("files")}
            >
              <FiFileText />
              <span>Files</span>
            </button>
            <button className="flex items-center space-x-2 p-2 rounded hover:bg-gray-200 mt-8 text-red-600">
              <FiLogOut />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}