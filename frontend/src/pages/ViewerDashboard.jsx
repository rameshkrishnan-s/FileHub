import React, { useState } from "react";
import Header from "../components/header";
import { Folder, FileText, MessageSquare } from "lucide-react";

export default function ViewerDashboard() {
  const [activeTab, setActiveTab] = useState("files");
  const [message, setMessage] = useState("");

  const [files] = useState([
    { id: 1, name: "ProjectProposal.pdf", size: "1.2 MB" },
    { id: 2, name: "DesignMockup.png", size: "2.5 MB" },
    { id: 3, name: "MeetingNotes.docx", size: "0.8 MB" },
  ]);

  const [folders] = useState([
    { id: 1, name: "ClientDocs" },
    { id: 2, name: "DesignAssets" },
    { id: 3, name: "Reports" },
  ]);

  const menuItems = [
    { key: "files", label: "Files", icon: FileText },
    { key: "folders", label: "Folders", icon: Folder },
    { key: "messages", label: "Messages", icon: MessageSquare },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "files":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-3">Files</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white shadow p-4 rounded-md hover:shadow-lg transition"
                >
                  <FileText className="text-blue-500 mb-2" size={24} />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{file.size}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "folders":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-3">Folders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="bg-white shadow p-4 rounded-md hover:shadow-lg transition"
                >
                  <Folder className="text-yellow-500 mb-2" size={24} />
                  <p className="font-medium">{folder.name}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "messages":
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

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Fixed Header (Company Banner) */}
      <Header />

      {/* ✅ Add top margin so sidebar starts below header */}
      <div className="flex mt-[0px]"> 
        {/* Sidebar */}
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

        {/* ✅ Main Content Area aligned below header */}
        <div className="flex-1 p-8 bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-900 capitalize mb-6">
            {menuItems.find((item) => item.key === activeTab)?.label || "Viewer"}
          </h2>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
