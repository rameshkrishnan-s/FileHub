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
    return (
      <div className="w-full max-w-4xl mx-auto">
        {activeTab === "codes" && <Codes />}
        {activeTab === "users" && <AddUser />}
        {activeTab === "tasks" && <Tasks />}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Header */}
      <Header />

      {/* Admin Panel Bar */}
      <div className="sticky top-0 z-40 p-4 flex justify-between items-center bg-white border-b border-gray-200 shadow">
        {/* Hamburger */}
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

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed md:sticky md:top-[72px] left-0 h-full w-64 bg-white shadow-lg border-r transform transition-transform duration-300 ease-in-out z-30 ${
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
                className={`cursor-pointer px-4 py-2 rounded-lg font-medium flex items-center transition ${
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
            className="fixed inset-0 bg-black opacity-40 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 flex justify-center">
          {/* Centered content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
