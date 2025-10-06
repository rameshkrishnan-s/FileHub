import React, { useState, useEffect } from "react";
import { Building, Package, Plus, Edit, Trash2, Loader2, Search, X } from "lucide-react";

export default function Codes() {
  const [companies, setCompanies] = useState([]);
  const [assemblyCodes, setAssemblyCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [assemblyName, setAssemblyName] = useState("");
  const [assemblyCode, setAssemblyCode] = useState("");

  const [editingCompany, setEditingCompany] = useState(null);
  const [editingAssembly, setEditingAssembly] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterAssembly, setFilterAssembly] = useState("");

  // Show add forms
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddAssembly, setShowAddAssembly] = useState(false);

  const token = sessionStorage.getItem("token"); // Fetch token from sessionStorage

  useEffect(() => {
    fetchCompanies();
    fetchAssemblyCodes();
  }, []);

  // Fetch companies
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/company-codes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCompanies(data.codes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch assemblies
  const fetchAssemblyCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/assembly-codes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAssemblyCodes(data.codes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered lists
  const filteredCompanies = companies
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((c) => !filterCompany || c.code === filterCompany);

  const filteredAssemblies = assemblyCodes
    .filter(
      (a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((a) => !filterAssembly || a.code === filterAssembly);

  // Add functions
  const addCompany = async () => {
    if (!companyName || !companyCode) return alert("Please enter both name and code.");
    const res = await fetch("http://localhost:5000/api/admin/add-company", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: companyName, code: companyCode }),
    });
    if (res.ok) {
      fetchCompanies();
      setCompanyName("");
      setCompanyCode("");
      setShowAddCompany(false);
    }
  };

  const addAssembly = async () => {
    if (!assemblyName || !assemblyCode) return alert("Please enter both name and code.");
    const res = await fetch("http://localhost:5000/api/admin/add-assembly", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: assemblyName, code: assemblyCode }),
    });
    if (res.ok) {
      fetchAssemblyCodes();
      setAssemblyName("");
      setAssemblyCode("");
      setShowAddAssembly(false);
    }
  };

  // Delete functions
  const deleteCompany = async (code) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    const res = await fetch("http://localhost:5000/api/admin/delete-company", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code }),
    });
    if (res.ok) fetchCompanies();
  };

  const deleteAssembly = async (code) => {
    if (!window.confirm("Are you sure you want to delete this assembly?")) return;
    const res = await fetch("http://localhost:5000/api/admin/delete-assembly", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code }),
    });
    if (res.ok) fetchAssemblyCodes();
  };

  // Edit functions
  const editCompany = async () => {
    const { oldCode, name, code } = editingCompany;
    const res = await fetch("http://localhost:5000/api/admin/edit-company", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ oldCode, newName: name, newCode: code }),
    });
    if (res.ok) {
      fetchCompanies();
      setEditingCompany(null);
    }
  };

  const editAssembly = async () => {
    const { oldCode, name, code } = editingAssembly;
    const res = await fetch("http://localhost:5000/api/admin/edit-assembly", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ oldCode, newName: name, newCode: code }),
    });
    if (res.ok) {
      fetchAssemblyCodes();
      setEditingAssembly(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
          <Search className="h-6 w-6 mr-2 text-indigo-600" />
          Search & Filter
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Filter by Company Code</option>
            {companies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
          <select
            value={filterAssembly}
            onChange={(e) => setFilterAssembly(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Filter by Assembly Code</option>
            {assemblyCodes.map((a) => (
              <option key={a.code} value={a.code}>
                {a.code}
              </option>
            ))}
          </select>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterCompany("");
                setFilterAssembly("");
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Companies & Assemblies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Companies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Building className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-900">Companies</h2>
            </div>
            <button
              onClick={() => setShowAddCompany(!showAddCompany)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 flex items-center justify-center w-48"
            >
              {showAddCompany ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {showAddCompany ? "Cancel" : "Add Company"}
            </button>
          </div>

          {/* Add Company Form */}
          {showAddCompany && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
              />
              <input
                type="text"
                placeholder="Company Code"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
              />
              <div className="flex justify-center items-end">
                <button
                  onClick={addCompany}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 flex items-center"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Companies List */}
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-500">Try adjusting your search or filters, or add a new company.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCompanies.map((c) => (
                <div
                  key={c.code}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  {editingCompany?.oldCode === c.code ? (
                    <div className="flex gap-3 w-full items-center">
                      <input
                        value={editingCompany.name}
                        onChange={(e) =>
                          setEditingCompany({ ...editingCompany, name: e.target.value })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Company name"
                      />
                      <input
                        value={editingCompany.code}
                        onChange={(e) =>
                          setEditingCompany({ ...editingCompany, code: e.target.value })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Code"
                      />
                      <button
                        onClick={editCompany}
                        className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCompany(null)}
                        className="text-gray-500 hover:text-gray-700 px-3 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{c.name}</p>
                        <p className="text-sm text-gray-500">{c.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditingCompany({ oldCode: c.code, name: c.name, code: c.code })
                          }
                          className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteCompany(c.code)}
                          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assemblies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-900">Assemblies</h2>
            </div>
            <button
              onClick={() => setShowAddAssembly(!showAddAssembly)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 flex items-center justify-center w-48"
            >
              {showAddAssembly ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {showAddAssembly ? "Cancel" : "Add Assembly"}
            </button>
          </div>

          {/* Add Assembly Form */}
          {showAddAssembly && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder="Assembly Name"
                value={assemblyName}
                onChange={(e) => setAssemblyName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
              />
              <input
                type="text"
                placeholder="Assembly Code"
                value={assemblyCode}
                onChange={(e) => setAssemblyCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
              />
              <div className="flex justify-center items-end">
                <button
                  onClick={addAssembly}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 flex items-center"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Assemblies List */}
          {filteredAssemblies.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assemblies found</h3>
              <p className="text-gray-500">Try adjusting your search or filters, or add a new assembly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssemblies.map((a) => (
                <div
                  key={a.code}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  {editingAssembly?.oldCode === a.code ? (
                    <div className="flex gap-3 w-full items-center">
                      <input
                        value={editingAssembly.name}
                        onChange={(e) =>
                          setEditingAssembly({ ...editingAssembly, name: e.target.value })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Assembly name"
                      />
                      <input
                        value={editingAssembly.code}
                        onChange={(e) =>
                          setEditingAssembly({ ...editingAssembly, code: e.target.value })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Code"
                      />
                      <button
                        onClick={editAssembly}
                        className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAssembly(null)}
                        className="text-gray-500 hover:text-gray-700 px-3 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{a.name}</p>
                        <p className="text-sm text-gray-500">{a.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditingAssembly({ oldCode: a.code, name: a.name, code: a.code })
                          }
                          className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAssembly(a.code)}
                          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
