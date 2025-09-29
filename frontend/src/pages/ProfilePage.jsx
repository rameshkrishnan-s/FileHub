import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api.js";
import Header from "../components/header";
import { getUserId, logout } from "../services/authService.js";
import { User, LogOut } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      API.get(`/api/admin/profile?id=${userId}`)
        .then((res) => setUser(res.data.user))
        .catch((err) => {
          console.error(err);
          navigate("/");
        });
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />

      <div className="max-w-4xl mx-auto p-6 pt-24">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-8">
            <User className="w-16 h-16 text-blue-600 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
              <p className="text-gray-600">Manage your account details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Personal Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg text-gray-800">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg text-gray-800">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Position</label>
                  <p className="text-lg text-gray-800">{user.position || "Not specified"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Role</label>
                  <p className="text-lg text-gray-800">{user.role}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Account Actions</h2>
              <div className="space-y-4">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                >
                  <User className="w-5 h-5 mr-2" />
                  Back to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition duration-200 flex items-center justify-center"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
