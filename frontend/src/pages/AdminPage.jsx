import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Codes from "../components/admin/Codes";
import Tasks from "../components/admin/Tasks";
import ViewUsers from "../components/admin/ViewUsers";
import Folders from "../components/admin/Folders";
import { Menu, X, Code, Users, FileText, Folder, BarChart3, Settings } from "lucide-react";

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("codes");

  const renderContent = () => {
    return (
      <div className="w-full">
        {activeTab === "codes" && <Codes />}
        {activeTab === "view-users" && <ViewUsers />}
        {activeTab === "tasks" && <Tasks />}
        {activeTab === "folders" && <Folders />}
      </div>
    );
  };

  const menuItems = [
    { key: "codes", label: "Codes", icon: Code, color: "text-indigo-600" },
    { key: "view-users", label: "Users", icon: Users, color: "text-indigo-600" },
    { key: "tasks", label: "Tasks", icon: FileText, color: "text-indigo-600" },
    { key: "folders", label: "Folders", icon: Folder, color: "text-indigo-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
          <div className="flex items-center justify-center h-16 bg-indigo-600">
            <h1 className="text-white text-xl font-bold">Admin Panel</h1>
          </div>
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                      activeTab === item.key
                        ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mr-3 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={() => navigate("/admin")}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1">
          {/* Top Bar */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 md:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900 capitalize">
                {menuItems.find(item => item.key === activeTab)?.label || 'Admin'}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Welcome, Admin
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 md:p-8 bg-gray-50">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
