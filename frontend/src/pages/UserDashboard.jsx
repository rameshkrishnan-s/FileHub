import React, { useState, useEffect } from "react";
import API from "../services/api.js";

export default function UserDashboard() {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    API.get("/files")
      .then(res => setFiles(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File uploaded!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">User Dashboard</h1>
      <p className="mb-4">Upload, edit, and request file approvals.</p>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Upload
      </button>

      <h2 className="text-2xl mt-6">Your Files</h2>
      <ul className="list-disc ml-6">
        {files.map((f) => (
          <li key={f.id}>{f.filename}</li>
        ))}
      </ul>
    </div>
  );
}
