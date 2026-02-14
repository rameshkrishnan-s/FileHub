import React from "react";
export default function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-200 text-yellow-800",
    accepted: "bg-green-200 text-green-800",
    rejected: "bg-red-200 text-red-800",
    completed: "bg-blue-200 text-blue-800",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded ${styles[status] || "bg-gray-200 text-gray-700"}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
