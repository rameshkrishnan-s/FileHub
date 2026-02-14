import TaskCard from "./TaskCard";
import React from "react";
export default function TaskList({
  tasks,
  activeTab,
  loading,
  handleFileChange,
  handleUpload,
  uploading,
  updateTaskStatus,
  fetchTaskFiles,
  taskFiles,
}) {
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tasks
      </h2>
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              activeTab={activeTab}
              handleFileChange={handleFileChange}
              handleUpload={handleUpload}
              uploading={uploading}
              updateTaskStatus={updateTaskStatus}
              fetchTaskFiles={fetchTaskFiles}
              taskFiles={taskFiles}
            />
          ))
        ) : (
          <p>You have no {activeTab} tasks.</p>
        )}
      </div>
    </div>
  );
}
