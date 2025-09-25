import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Codes from "../components/admin/Codes";
import AddUser from "../components/admin/AddUser";
import Tasks from "../components/admin/Tasks";
import { Menu, X } from "lucide-react";

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("codes");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    if (activeTab === "codes") return <Codes />;
    if (activeTab === "users") return <AddUser />;
    if (activeTab === "tasks") return <Tasks />;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* Header */}
      <Header />

      {/* Top bar */}
      <div className="p-4 flex justify-between items-center bg-white border-b border-gray-200 shadow">
        {/* Hamburger Button */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="w-6 h-6 text-gray-800" />
          ) : (
            <Menu className="w-6 h-6 text-gray-800" />
          )}
        </button>

        <h1 className="text-xl font-semibold">Admin Panel</h1>

        <button
          onClick={() => navigate("/admin")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Body layout */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <div
          className={`fixed md:relative top-[88px] md:top-0 left-0 h-[calc(100%-88px)] md:h-auto w-64 bg-white shadow-lg border-r transform transition-transform duration-300 ease-in-out z-50 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <nav className="p-4 space-y-3">
            {[
              { key: "codes", label: "Codes" },
              { key: "users", label: "Add User" },
              { key: "tasks", label: "Tasks" },
            ].map((item) => (
              <div
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setSidebarOpen(false);
                }}
                className={`cursor-pointer px-4 py-2 rounded-lg font-medium flex items-center justify-between transition ${
                  activeTab === item.key
                    ? "bg-blue-600 text-white shadow"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
}
