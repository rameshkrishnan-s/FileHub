import StatusBadge from "./StatusBadge";
import React from "react";
export default function TaskCard({
  task,
  activeTab,
  handleFileChange,
  handleUpload,
  uploading,
  updateTaskStatus,
  fetchTaskFiles,
  taskFiles,
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{task.task}</h3>
        <StatusBadge status={task.status} />
      </div>

      {task.file_or_folder_name && (
        <p className="text-sm text-gray-600">
          <strong>File/Folder:</strong> {task.file_or_folder_name}
        </p>
      )}
      {task.message && <p className="mt-2 text-gray-700">{task.message}</p>}
      <p className="text-xs text-gray-400 mt-2">
        Assigned on: {new Date(task.created_at).toLocaleDateString()}
      </p>

      {/* File Upload */}
      {task.file_or_folder_name && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Upload a file for this task
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              onChange={handleFileChange}
              className="border border-gray-300 p-2 rounded flex-1 max-w-[250px] 
+ focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
            />
            <button
              onClick={() => handleUpload(task.id, task.file_or_folder_name)}
              disabled={uploading}
              className={`px-4 py-2 rounded text-white ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons by Status */}
      {activeTab === "pending" && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => updateTaskStatus(task.id, "accepted")}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Accept
          </button>
          <button
            onClick={() => updateTaskStatus(task.id, "rejected")}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      )}

      {activeTab === "accepted" && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => updateTaskStatus(task.id, "completed")}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Mark as Completed
          </button>
          <button
            onClick={() => fetchTaskFiles(task.id, task.file_or_folder_name)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            View Directory Files
          </button>
        </div>
      )}

      {/* Show Files */}
      {taskFiles[task.id] && (
        <div className="mt-4">
          <h4 className="font-semibold">Files in {task.file_or_folder_name}:</h4>
          <ul className="list-disc pl-5">
            {taskFiles[task.id].map((f) => (
              <li key={f.id}>{f.originalName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
