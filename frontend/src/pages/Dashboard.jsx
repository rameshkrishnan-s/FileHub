import React, { useState, useEffect } from "react";
import Header from "../components/header";
import RenameModal from "../components/RenameModal";
import ModelComponent from "../components/ModelComponent";
import SearchAndFilters from "../components/dashboard/SearchAndFilters.jsx";
import FileGrid from "../components/dashboard/FileGrid.jsx";
import Breadcrumb from "../components/dashboard/Breadcrumb.jsx";
import ActionButtons from "../components/dashboard/ActionButtons.jsx";

export default function Dashboard({ authToken, setPage }) {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState(() => {
    const storedPath = localStorage.getItem("currentPath");
    return storedPath || "";
  });
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);
  const [yearFilter, setYearFilter] = useState("");
  const [companyCodeFilter, setCompanyCodeFilter] = useState("");
  const [assemblyCodeFilter, setAssemblyCodeFilter] = useState("");
  const [companies, setCompanies] = useState([]);
  const [assemblyCodes, setAssemblyCodes] = useState([]);

  useEffect(() => {
    fetchFiles();
    fetchCompanies();
    fetchAssemblyCodes();
  }, []);

  useEffect(() => {
    if (currentPath !== undefined) {
      localStorage.setItem("currentPath", currentPath);
      fetchFiles();
    }
  }, [currentPath]);

  useEffect(() => {
    setSearchQuery("");
    setSearchResults([]);
    setYearFilter("");
    setCompanyCodeFilter("");
    setAssemblyCodeFilter("");
  }, [currentPath]);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentPath");
    setCurrentPath("");
    setPage("login");
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/folder/list?path=${encodeURIComponent(
          currentPath
        )}`
      );
      const data = await response.json();
      if (response.ok) {
        setFiles(data);
      } else {
        setError("Failed to load files.");
      }
    } catch (err) {
      setError("Error fetching files.");
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/company-codes"
      );
      const data = await response.json();
      setCompanies(data.codes || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  const fetchAssemblyCodes = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/assembly-codes"
      );
      const data = await response.json();
      setAssemblyCodes(data.codes || []);
    } catch (err) {
      console.error("Error fetching assembly codes:", err);
    }
  };

  const addFolder = async (year, companyCode, assemblyCode) => {
    const folderName =
      companyCode && assemblyCode
        ? `${year}-${companyCode}-${assemblyCode}`
        : year;

    try {
      const response = await fetch(
        "http://localhost:5000/api/folder/create-folder",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderName, path: currentPath }),
        }
      );

      if (response.ok) {
        await fetchFiles();
      } else {
        const data = await response.json();
        alert(`Folder creation failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error during folder creation:", error);
      alert("An unexpected error occurred while creating the folder.");
    }
  };

  const deleteItem = async (name) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const response = await fetch("http://localhost:5000/api/folder/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, path: currentPath }),
      });

      if (response.ok) {
        fetchFiles();
      } else {
        alert("Failed to delete item.");
      }
    }
  };

  const renameItem = (oldName) => {
    setItemToRename(oldName);
    setIsRenameModalOpen(true);
  };

  const handleRename = async (oldName, newName) => {
    const response = await fetch("http://localhost:5000/api/folder/rename", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldName, newName, path: currentPath }),
    });

    if (response.ok) {
      fetchFiles();
    } else {
      alert("Failed to rename.");
    }
  };

  const handleSearch = async (page = 1) => {
    if (
      !searchQuery.trim() &&
      !yearFilter &&
      !companyCodeFilter &&
      !assemblyCodeFilter
    ) {
      setSearchResults([]);
      setCurrentPage(1);
      setTotalPages(1);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const queryParams = new URLSearchParams({
        query: searchQuery,
        year: yearFilter,
        companyCode: companyCodeFilter,
        assemblyCode: assemblyCodeFilter,
        page,
        limit: 20,
      });

      const response = await fetch(
        `http://localhost:5000/api/folder/search?${queryParams.toString()}`
      );

      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.results);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.page);
      } else {
        setSearchError(data.message || "Error searching files");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching files:", error);
      setSearchError("Error searching files");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    handleSearch(newPage);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, yearFilter, companyCodeFilter, assemblyCodeFilter]);

  const uploadFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", currentPath);

    const response = await fetch("http://localhost:5000/api/folder/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      fetchFiles();
      alert("File uploaded successfully!");
    } else {
      alert("File upload failed.");
    }
  };

  const navigateToFolder = (folderPath) => {
    if (searchQuery) {
      setCurrentPath(folderPath);
      setSearchQuery("");
      setSearchResults([]);
    } else {
      setCurrentPath(currentPath ? `${currentPath}/${folderPath}` : folderPath);
    }
  };

  const handleFileClick = async (item) => {
    if (item.type === "folder") {
      if (searchQuery) {
        navigateToFolder(item.path);
      } else {
        navigateToFolder(item.name);
      }
    } else {
      const shouldOpen = window.confirm(`Do you want to open ${item.name}?`);
      if (!shouldOpen) return;

      setIsSearching(true);
      try {
        const filePath = searchQuery
          ? item.path
          : currentPath
          ? `${currentPath}/${item.name}`
          : item.name;

        const response = await fetch(
          `http://localhost:5000/api/folder/open?filePath=${encodeURIComponent(
            filePath
          )}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to open file");
        }

        console.log("File opened successfully:", data);
      } catch (error) {
        console.error("Error opening file:", error);
        alert(
          `Error opening file: ${error.message}\n\nPlease check the console for more details.`
        );
      } finally {
        setIsSearching(false);
      }
    }
  };

  const goBack = () => {
    if (!currentPath) return;
    const pathArray = currentPath.split("/").filter(Boolean);
    pathArray.pop();
    setCurrentPath(pathArray.join("/"));
  };

  const goToAdminPage = () => {
    setPage("admin");
  };

  const navigateToPathSegment = (index) => {
    const pathArray = currentPath.split("/").filter(Boolean);
    const newPath = pathArray.slice(0, index + 1).join("/");
    setCurrentPath(newPath);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <>
      <style>{`
        .dashboard-container {
          min-height: 100vh;
          background-color: #f3f4f6;
          color: #111827;
        }
        .top-bar {
          position: sticky;
          top: 0;
          background: white;
          border-bottom: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          z-index: 10;
        }
        .top-bar h1 {
          font-size: 18px;
          font-weight: bold;
        }
        .top-buttons {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-green {
          background: #16a34a;
          color: white;
        }
        .btn-green:hover { background: #15803d; }
        .btn-red {
          background: #dc2626;
          color: white;
        }
        .btn-red:hover { background: #b91c1c; }
        .filters-actions {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          padding: 20px;
        }
        .breadcrumb-container {
          padding: 0 20px 15px 20px;
        }
        .file-grid-container {
          padding: 20px;
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
        }
        .pagination button {
          padding: 6px 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          background: white;
          cursor: pointer;
        }
        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="dashboard-container">
        <Header />

        {/* Top Bar */}
        <div className="top-bar">
          <h1>File Manager</h1>
          <div className="top-buttons">
            <span>Welcome, User</span>
            <button onClick={goToAdminPage} className="btn btn-green">
              Admin
            </button>
            <button onClick={logout} className="btn btn-red">
              Logout
            </button>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="filters-actions">
          <SearchAndFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
            companyCodeFilter={companyCodeFilter}
            setCompanyCodeFilter={setCompanyCodeFilter}
            assemblyCodeFilter={assemblyCodeFilter}
            setAssemblyCodeFilter={setAssemblyCodeFilter}
            companies={companies}
            assemblyCodes={assemblyCodes}
            isSearching={isSearching}
            years={years}
          />
          <ActionButtons setIsModalOpen={setIsModalOpen} uploadFile={uploadFile} />
        </div>

        {/* Path Breadcrumb */}
        <div className="breadcrumb-container">
          <Breadcrumb
            currentPath={currentPath}
            goBack={goBack}
            setCurrentPath={setCurrentPath}
            navigateToPathSegment={navigateToPathSegment}
          />
        </div>

        {/* Files */}
        <div className="file-grid-container">
          {searchError && (
            <div style={{ background: "#fee2e2", padding: "10px", color: "#b91c1c", borderRadius: "6px", marginBottom: "10px" }}>
              {searchError}
            </div>
          )}

          {(searchQuery.trim() || yearFilter || companyCodeFilter || assemblyCodeFilter) ? (
            <>
              <FileGrid
                items={searchResults}
                isSearching={isSearching}
                navigateToFolder={handleFileClick}
                renameItem={renameItem}
                deleteItem={deleteItem}
                isSearchResults={true}
              />
              {totalPages > 1 && (
                <div className="pagination">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isSearching}>
                    Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isSearching}>
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <FileGrid
              items={files}
              isSearching={isSearching}
              navigateToFolder={handleFileClick}
              renameItem={renameItem}
              deleteItem={deleteItem}
            />
          )}
        </div>

        {/* Modals */}
        <ModelComponent
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={addFolder}
        />
        <RenameModal
          isOpen={isRenameModalOpen}
          onClose={() => setIsRenameModalOpen(false)}
          onRename={handleRename}
          oldName={itemToRename}
        />
      </div>
    </>
  );
}
