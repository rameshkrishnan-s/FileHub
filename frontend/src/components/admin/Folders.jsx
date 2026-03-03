import React, { useState, useEffect } from "react";
import API from "../../services/api.js";
import FolderCreationModal from "../ModelComponent";

export default function Folders() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const res = await API.get(
        `/api/folder/list?path=${encodeURIComponent(currentPath)}`
      );
      setFiles(res.data);
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (folderName) => {
    await API.post("/api/folder/create-folder", {
      folderName,
      path: currentPath,
    });
    fetchFiles();
  };

  const deleteItem = async (name) => {
    if (!window.confirm("Are you sure you want to delete this item?"))
      return;

    try {
      await API.post("/api/folder/delete", { name, path: currentPath });
      fetchFiles();
    } catch (error) {
      alert("Error deleting item.");
    }
  };

  const renameItem = async (oldName) => {
    const newName = prompt("Enter new name:");
    if (!newName) return;

    try {
      await API.post("/api/folder/rename", {
        oldName,
        newName,
        path: currentPath,
      });
      fetchFiles();
    } catch (error) {
      alert("Error renaming item.");
    }
  };

  const uploadFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", currentPath);

    try {
      await API.post("/api/folder/upload", formData);
      fetchFiles();
    } catch (error) {
      alert("Upload failed.");
    }
  };

  const handleFileClick = (item) => {
    if (item.type === "folder") {
      const newPath = currentPath
        ? `${currentPath}/${item.name}`
        : item.name;
      setCurrentPath(newPath);
    }
  };

  const goBack = () => {
    if (!currentPath) return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    setCurrentPath(parts.join("/"));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Folder Management
        </h2>

        {/* Current Path */}
        <div className="mb-4 text-gray-600">
          <span className="font-medium">Current Path:</span>{" "}
          {currentPath || "Root"}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            + Add kk Folder
          </button>

          <label className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all cursor-pointer">
            Upload File
            <input type="file" hidden onChange={uploadFile} />
          </label>

          {currentPath && (
            <button
              onClick={goBack}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all"
            >
              Back
            </button>
          )}
        </div>

        {/* Files List (Old Structure Style) */}
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : files.length === 0 ? (
            <p className="text-center text-gray-400">No files found</p>
          ) : (
            files.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <span
                  onClick={() => handleFileClick(item)}
                  className="cursor-pointer text-gray-800 font-medium"
                >
                  {item.type === "folder" ? "📁" : "📄"} {item.name}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => renameItem(item.name)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition"
                  >
                    Rename
                  </button>

                  <button
                    onClick={() => deleteItem(item.name)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Folder Modal */}
      <FolderCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateFolder}
        currentPath={currentPath}
      />
    </div>
  );
}
