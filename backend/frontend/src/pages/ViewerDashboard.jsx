import React, { useState } from "react";

export default function ViewerDashboard() {
  const [files] = useState([
    { id: 1, name: "ProjectProposal.pdf", size: "1.2 MB" },
    { id: 2, name: "DesignMockup.png", size: "2.5 MB" },
    { id: 3, name: "MeetingNotes.docx", size: "0.8 MB" },
  ]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Viewer Dashboard</h1>
      <p>View files only.</p>
    </div>
  );
}