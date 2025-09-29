import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api.js";
import Header from "../components/header";
import { getUserId, getUserRole } from "../services/authService.js";

export default function UserFolderView() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const folder = searchParams.get("folder")?.replace(/\\/g, '/').split('/').pop() || '';
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    if (folder) {
      setCurrentPath(folder);
      fetchUserPermissions();
    }
  }, [folder]);

  useEffect(() => {
    if (currentPath) {
      fetchFiles();
    }
  }, [currentPath]);

  const fetchUserPermissions = async () => {
    const userId = getUserId();
    if (userId) {
      try {
        const res = await API.get(`/api/admin/my-tasks/${userId}?status=accepted`);
        const permissions = res.data.permissions || [];
        console.log("Fetched permissions:", permissions);
        console.log("Current folder:", folder);
        setUserPermissions(permissions.map(perm => ({
          ...perm,
          file_or_folder: perm.file_or_folder.replace(/\\/g, '/').split('/').pop()
        })));
      } catch (err) {
        console.error("Error fetching permissions:", err);
      }
    }
  };

  const normalizePath = (p) => p.replace(/\\/g, '/');

  const hasPermission = (path, requiredPermission = 'read') => {
    const userRole = getUserRole();
    if (userRole === 1) { // Admin has full access
      return true;
    }

    // Check if user has permission for this folder or any parent folder
    const normPath = normalizePath(path);
    const permissionLevels = { 'read': 1, 'write': 2, 'admin': 3 };
    const requiredLevel = permissionLevels[requiredPermission] || 1;

    return userPermissions.some(perm => {
      const normPermPath = normalizePath(perm.file_or_folder);
      if (!normPath.startsWith(normPermPath)) return false;
      const userLevel = permissionLevels[perm.permission] || 0;
      return userLevel >= requiredLevel;
    });
  };

  const fetchFiles = async () => {
    if (!hasPermission(currentPath, 'read')) {
      console.log("No permission for path:", currentPath);
      setFiles([]);
      return;
    }

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

    if (!hasPermission(currentPath, 'write')) {
      alert("You don't have permission to create folders here.");
      return;
    }

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

    if (!hasPermission(currentPath, 'write')) {
      alert("You don't have permission to delete items here.");
      return;
    }

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

    if (!hasPermission(currentPath, 'write')) {
      alert("You don't have permission to rename items here.");
      return;
    }

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

    if (!hasPermission(currentPath, 'write')) {
      alert("You don't have permission to upload files here.");
      return;
    }

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
      if (hasPermission(newPath, 'read')) {
        setCurrentPath(newPath);
      } else {
        alert("You don't have permission to access this subfolder.");
      }
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
    if (hasPermission(newPath, 'read') || newPath === folder) {
      setCurrentPath(newPath);
    } else {
      alert("You don't have permission to go back to that folder.");
    }
  };

  const goToUserDashboard = () => {
    window.location.href = "/user";
  };

  if (!folder) {
    return (
      <div className="user-folder-view-container">
        <Header />
        <div className="error-message">
          <h2>No folder specified</h2>
          <button onClick={goToUserDashboard} className="btn btn-blue">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-folder-view-container">
      <Header />

      <div className="folder-header">
        <h2 className="page-title">Folder: {folder}</h2>
        <p className="current-path">Current Path: {currentPath || "Root"}</p>
      </div>

      <div className="action-buttons">
        <button onClick={addFolder} className="btn btn-purple">Add Folder</button>
        <input type="file" onChange={uploadFile} className="file-input" id="file-upload" />
        <label htmlFor="file-upload" className="btn btn-yellow">Upload File</label>
        {currentPath && currentPath !== folder && (
          <button onClick={goBack} className="btn btn-gray">Back</button>
        )}
      </div>

      <div className="files-list">
        {files.map((item) => (
          <div key={item.name} className="file-card">
            <span
              onClick={() => handleFileClick(item)}
              className={`file-name ${isLoading ? 'loading' : ''}`}
            >
              {item.type === "folder" ? "📁" : "📄"} {item.name}
            </span>
            <div className="file-actions">
              <button onClick={() => renameItem(item.name)} className="btn btn-blue btn-small">Rename</button>
              <button onClick={() => deleteItem(item.name)} className="btn btn-red btn-small">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <button className="link-btn" onClick={goToUserDashboard}>Back to User Dashboard</button>

      {/* Embedded CSS */}
      <style>{`
        .user-folder-view-container {
          text-align: center;
          padding: 30px;
          background: linear-gradient(135deg, #f0f4f8, #e0e7ff);
          min-height: 100vh;
        }

        .folder-header {
          margin-bottom: 20px;
        }

        .page-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
        }

        .current-path {
          font-size: 16px;
          color: #666;
        }

        .action-buttons {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .file-input {
          display: none;
        }

        .btn {
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .btn-purple {
          background-color: #6f42c1;
          color: #fff;
        }

        .btn-purple:hover {
          background-color: #5936a1;
        }

        .btn-yellow {
          background-color: #ffc107;
          color: #333;
        }

        .btn-yellow:hover {
          background-color: #e0a800;
        }

        .btn-gray {
          background-color: #6c757d;
          color: #fff;
        }

        .btn-gray:hover {
          background-color: #5a6268;
        }

        .btn-blue {
          background-color: #007bff;
          color: #fff;
        }

        .btn-blue:hover {
          background-color: #0056b3;
        }

        .btn-red {
          background-color: #dc3545;
          color: #fff;
        }

        .btn-red:hover {
          background-color: #bd2130;
        }

        .btn-small {
          padding: 6px 10px;
          font-size: 12px;
        }

        .file-card {
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 12px 16px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          transition: box-shadow 0.2s ease;
        }

        .file-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .file-name {
          cursor: pointer;
          font-weight: 500;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .file-name.loading {
          opacity: 0.7;
          cursor: wait;
        }

        .file-name.loading::after {
          content: '';
          width: 16px;
          height: 16px;
          border: 2px solid #ccc;
          border-top-color: #333;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .file-actions {
          display: flex;
          gap: 8px;
        }

        .link-btn {
          margin-top: 30px;
          background: none;
          color: #007bff;
          border: none;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
        }

        .link-btn:hover {
          color: #0056b3;
        }

        .error-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
        }

        .error-message h2 {
          color: #dc3545;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}
