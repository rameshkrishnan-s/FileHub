import React, { useState } from "react";

export default function ViewerDashboard() {
  const [files] = useState([
    { id: 1, name: "ProjectProposal.pdf", size: "1.2 MB" },
    { id: 2, name: "DesignMockup.png", size: "2.5 MB" },
    { id: 3, name: "MeetingNotes.docx", size: "0.8 MB" },
  ]);

  return (
    <>
      {/* Inline CSS */}
      <style>{`
        .viewer-container {
          display: flex;
          height: 100vh;
          background-color: #f3f4f6;
        }

        /* Sidebar */
        .sidebar {
          width: 250px;
          background-color: #ffffff;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
          padding: 30px 20px;
          box-sizing: border-box;
        }

        .sidebar h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 40px;
          color: #111827;
        }

        .sidebar nav {
          display: flex;
          flex-direction: column;
        }

        .sidebar button {
          padding: 10px 15px;
          margin-bottom: 10px;
          border: none;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: background 0.2s;
        }

        .sidebar button:hover {
          background-color: #e5e7eb;
        }

        .sidebar button.logout {
          margin-top: 40px;
          color: #dc2626;
        }

        /* Main content */
        .main-content {
          flex: 1;
          padding: 30px;
          overflow-y: auto;
        }

        .main-content h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #111827;
        }

        .main-content p {
          margin-bottom: 20px;
          color: #374151;
        }

        /* File grid */
        .file-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 20px;
        }

        @media(min-width: 768px) {
          .file-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media(min-width: 1024px) {
          .file-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .file-card {
          background-color: #ffffff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: box-shadow 0.2s;
          cursor: pointer;
        }

        .file-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }

        .file-name {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 5px;
          color: #111827;
        }

        .file-size {
          font-size: 14px;
          color: #6b7280;
        }

        .view-btn {
          margin-top: 10px;
          padding: 6px 12px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .view-btn:hover {
          background-color: #2563eb;
        }
      `}</style>

      {/* UI */}
      <div className="viewer-container">
        <aside className="sidebar">
          <h1>Viewer Panel</h1>
          <nav>
            <button>📄 Files</button>
            <button className="logout">🚪 Logout</button>
          </nav>
        </aside>

        <main className="main-content">
          <h2>Available Files</h2>
          <p>You can view but not edit files.</p>

          <div className="file-grid">
            {files.map((file) => (
              <div key={file.id} className="file-card">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{file.size}</div>
                <button className="view-btn">View</button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
