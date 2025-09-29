import React, { useState, useEffect } from "react";
import API from "../../services/api.js";

export default function Folders() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentPath !== undefined) {
      fetchFiles();
    }
  }, [currentPath]);

  const fetchFiles = async () => {
    try {
      const res = await API.get(`/api/folder/list?path=${encodeURIComponent(currentPath)}`);
      setFiles(res.data);
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    }
  };

  const addFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
      await API.post("/api/folder/create-folder", { folderName, path: currentPath });
      fetchFiles();
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Error creating folder.");
    }
  };

  const deleteItem = async (name) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await API.post("/api/folder/delete", { name, path: currentPath });
      fetchFiles();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item.");
    }
  };

  const renameItem = async (oldName) => {
    const newName = prompt("Enter new name:");
    if (!newName) return;

    try {
      await API.post("/api/folder/rename", { oldName, newName, path: currentPath });
      fetchFiles();
    } catch (error) {
      console.error("Error renaming item:", error);
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
      await API.post("/api/folder/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      fetchFiles();
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file.");
    }
  };

  const handleFileClick = async (item) => {
    if (item.type === "folder") {
      const newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      setCurrentPath(newPath);
    } else {
      setIsLoading(true);
      try {
        const filePath = currentPath ? `${currentPath}/${item.name}` : item.name;
        const response = await API.get(`/api/folder/open?filePath=${encodeURIComponent(filePath)}`);
        console.log('File opened successfully:', response.data);
      } catch (error) {
        console.error("Error opening file:", error);
        alert(`Error opening file: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const goBack = () => {
    if (!currentPath) return;
    const pathArray = currentPath.split("/").filter(Boolean);
    pathArray.pop();
    const newPath = pathArray.join("/");
    setCurrentPath(newPath);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Folder Management</h2>

      <div className="folder-header mb-4">
        <p className="current-path">Current Path: {currentPath || "Root"}</p>
      </div>

      <div className="action-buttons mb-4 flex gap-4">
        <button onClick={addFolder} className="btn btn-purple">Add Folder</button>
        <input type="file" onChange={uploadFile} className="file-input" id="file-upload" />
        <label htmlFor="file-upload" className="btn btn-yellow">Upload File</label>
        {currentPath && (
          <button onClick={goBack} className="btn btn-gray">Back</button>
        )}
      </div>

      <div className="files-list">
        {files.map((item) => (
          <div key={item.name} className="file-card flex justify-between items-center p-4 border border-gray-200 rounded mb-2">
            <span
              onClick={() => handleFileClick(item)}
              className={`file-name cursor-pointer ${isLoading ? 'opacity-50' : ''}`}
            >
              {item.type === "folder" ? "📁" : "📄"} {item.name}
            </span>
            <div className="file-actions flex gap-2">
              <button onClick={() => renameItem(item.name)} className="btn btn-blue btn-small">Rename</button>
              <button onClick={() => deleteItem(item.name)} className="btn btn-red btn-small">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .btn {
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .btn-purple { background-color: #6f42c1; color: #fff; }
        .btn-purple:hover { background-color: #5936a1; }
        .btn-yellow { background-color: #ffc107; color: #333; }
        .btn-yellow:hover { background-color: #e0a800; }
        .btn-gray { background-color: #6c757d; color: #fff; }
        .btn-gray:hover { background-color: #5a6268; }
        .btn-blue { background-color: #007bff; color: #fff; }
        .btn-blue:hover { background-color: #0056b3; }
        .btn-red { background-color: #dc3545; color: #fff; }
        .btn-red:hover { background-color: #bd2130; }
        .btn-small { padding: 4px 8px; font-size: 12px; }
        .file-input { display: none; }
      `}</style>
    </div>
  );
}
