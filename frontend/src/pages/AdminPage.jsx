import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Codes from "../components/admin/Codes";
import AddUser from "../components/admin/AddUser";
import Tasks from "../components/admin/Tasks";

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
      <Header />

      {/* Top bar */}
      <div className="p-4 flex justify-between items-center bg-white border-b border-gray-200 shadow">
        <button
          className="md:hidden p-2 bg-gray-200 rounded-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <button
          onClick={() => navigate("/admin")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <div
          className={`fixed md:relative top-0 left-0 h-full w-64 bg-white shadow-md border-r transform transition-transform duration-300 z-50 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex justify-end p-2 md:hidden">
            <button onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <div className="p-4 border-b font-bold text-lg">Options</div>
          <ul className="p-4 space-y-2">
            <li
              className={`cursor-pointer p-2 rounded-lg ${
                activeTab === "codes" ? "bg-blue-100 font-semibold" : ""
              }`}
              onClick={() => {
                setActiveTab("codes");
                setSidebarOpen(false);
              }}
            >
              Codes
            </li>
            <li
              className={`cursor-pointer p-2 rounded-lg ${
                activeTab === "users" ? "bg-blue-100 font-semibold" : ""
              }`}
              onClick={() => {
                setActiveTab("users");
                setSidebarOpen(false);
              }}
            >
              Add User
            </li>
            <li
              className={`cursor-pointer p-2 rounded-lg ${
                activeTab === "tasks" ? "bg-blue-100 font-semibold" : ""
              }`}
              onClick={() => {
                setActiveTab("tasks");
                setSidebarOpen(false);
              }}
            >
              Tasks
            </li>
          </ul>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main content */}
        <div className="flex-1 p-6 overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
}
