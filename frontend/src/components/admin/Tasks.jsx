// src/components/admin/Tasks.js
import React from "react";

export default function Tasks() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Tasks</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Assign work to staff</li>
        <li>Track task progress</li>
        <li>Manage deadlines</li>
      </ul>
    </div>
  );
}
