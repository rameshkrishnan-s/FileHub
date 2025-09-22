import React, { useState } from "react";

export default function ViewerDashboard() {
  const [files] = useState([
    { id: 1, name: "ProjectProposal.pdf", size: "1.2 MB" },
    { id: 2, name: "DesignMockup.png", size: "2.5 MB" },
    { id: 3, name: "MeetingNotes.docx", size: "0.8 MB" },
  ]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-8">Viewer Panel</h1>
          <nav className="flex flex-col space-y-4">
            <button className="p-2 rounded hover:bg-gray-200 font-semibold">
              📄 Files
            </button>
            <button className="p-2 rounded hover:bg-gray-200 mt-8 text-red-600">
              🚪 Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">Available Files</h2>
        <p className="mb-6">You can view but not edit files.</p>

        {/* File list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white p-4 rounded shadow hover:shadow-md transition cursor-pointer"
            >
              <div className="text-lg font-medium">{file.name}</div>
              <div className="text-gray-500 text-sm">{file.size}</div>
              <button className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                View
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}