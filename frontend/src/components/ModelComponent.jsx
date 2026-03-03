import React, { useState } from "react";

const FolderCreationModal = ({ isOpen, onClose, onCreate }) => {
  const [customName, setCustomName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!customName.trim()) {
      alert("Please enter a folder name");
      return;
    }

    setLoading(true);
    try {
      // Simplifed to just pass the custom name
      await onCreate(customName);

      // Reset and close
      setCustomName("");
      onClose();
    } catch (err) {
      console.error("Error creating folder:", err);
      alert("Error creating folder: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Create New Folder</h3>

        <input
          type="text"
          placeholder="Enter Folder Name"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          autoFocus
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !customName.trim()}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderCreationModal;