import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  File,
  MessageSquare,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import Header from "../components/header";

export default function ViewerDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [fileStructure] = useState([
    { id: 1, name: "Project_Assets", type: "folder", size: "" },
    { id: 2, name: "ProjectProposal.pdf", type: "file", size: "1.2 MB" },
    { id: 3, name: "DesignMockup.png", type: "file", size: "2.5 MB" },
    { id: 4, name: "MeetingNotes", type: "folder", size: "" },
    { id: 5, name: "Summary_Report.docx", type: "file", size: "0.8 MB" },
  ]);

  // Messages state
  const [messages, setMessages] = useState([
    { sender: "Admin", text: "Please review the latest PDF.", color: "text-blue-600" },
    { sender: "System", text: "DesignMockup.png uploaded.", color: "text-green-600" },
    { sender: "Manager", text: "Meeting scheduled tomorrow at 11 AM.", color: "text-purple-600" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    setMessages([...messages, { sender: "Viewer", text: newMessage, color: "text-gray-700" }]);
    setNewMessage("");
  };

  // Sidebar
  const Sidebar = () => (
    <div
      className={`fixed md:sticky md:top-[120px] left-0 h-full w-64 bg-white shadow-lg border-r transform transition-transform duration-300 ease-in-out z-30 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <nav className="p-4 space-y-3">
        {[
          { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { key: "files", label: "Files & Tasks", icon: Folder },
          { key: "messages", label: "Messages", icon: MessageSquare },
        ].map((item) => (
          <div
            key={item.key}
            onClick={() => {
              setActiveView(item.key);
              setSidebarOpen(false);
            }}
            className={`cursor-pointer px-4 py-2 rounded-lg font-medium flex items-center transition ${
              activeView === item.key
                ? "bg-blue-600 text-white shadow"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </div>
        ))}
      </nav>
    </div>
  );

  // Content
  const MainContent = () => {
    switch (activeView) {
      case "files":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Files & Tasks List</h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              {fileStructure.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    {item.type === "folder" ? (
                      <Folder className="w-5 h-5 text-yellow-500 mr-3" />
                    ) : (
                      <File className="w-5 h-5 text-blue-500 mr-3" />
                    )}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{item.size}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case "messages":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Message Field</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-lg text-gray-700 mb-4">Welcome to the Message Center!</p>

              {/* Messages Area */}
              <div className="h-64 border border-gray-300 bg-gray-50 p-4 rounded-lg overflow-y-auto mb-4">
                {messages.map((msg, index) => (
                  <div key={index} className="mb-2 text-sm">
                    <span className={`font-bold ${msg.color}`}>{msg.sender}:</span> {msg.text}
                  </div>
                ))}
              </div>

              {/* Input field (enabled now) */}
              <div className="flex">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white p-2 rounded-r-lg font-medium hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        );
      case "dashboard":
      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">Viewer Dashboard</h1>
            <p className="text-gray-600 mb-6">
              Welcome back! Use the navigation on the left to view files and messages.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Header */}
      <Header />

      {/* Dashboard Header Bar */}
      <div className="sticky top-[80px] z-40 p-4 flex justify-between items-center bg-white border-b border-gray-200 shadow">
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <h1 className="text-xl font-semibold">Viewer Dashboard</h1>

        <button
          onClick={() => navigate("/")}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ← Logout
        </button>
      </div>

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-40 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <div className="flex-1 overflow-y-auto p-6">{MainContent()}</div>
      </div>
    </div>
  );
}
