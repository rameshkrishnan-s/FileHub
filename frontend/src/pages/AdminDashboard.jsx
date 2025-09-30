import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import AdminSidebar from "../components/AdminSidebar";
import Codes from "../components/admin/Codes";
import Tasks from "../components/admin/Tasks";
import ViewUsers from "../components/admin/ViewUsers";
import Folders from "../components/admin/Folders";
import { 
  User, 
  LogOut, 
  Settings,
  Bell,
  Search,
  FileText,
  Folder,
  Loader2
} from "lucide-react";
import { logout as authLogout, getUserName, getUserEmail } from "../services/authService.js";
import API from "../services/api.js";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    // Get the saved tab from localStorage, default to "dashboard"
    return localStorage.getItem('adminActiveTab') || "dashboard";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Get the saved sidebar state from localStorage, default to false
    return localStorage.getItem('adminSidebarCollapsed') === 'true' || false;
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    rejectedTasks: 0,
    totalFolders: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    authLogout();
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersResponse = await API.get("/api/admin/users");
      const totalUsers = usersResponse.data.total || 0;

      // Fetch tasks
      const tasksResponse = await API.get("/api/admin/all-tasks");
      const tasks = tasksResponse.data.tasks || [];
      
      const activeTasks = tasks.filter(task => task.status === 'accepted').length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;
      const rejectedTasks = tasks.filter(task => task.status === 'rejected').length;

      // Fetch folders (we'll use the folder list endpoint)
      let totalFolders = 0;
      try {
        const foldersResponse = await API.get("/api/folder/list?path=");
        totalFolders = foldersResponse.data.filter(item => item.type === 'folder').length;
      } catch (error) {
        console.log("Could not fetch folders:", error);
      }

      // Recent activity (last 5 tasks)
      const recentActivity = tasks
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(task => ({
          id: task.id,
          type: 'task',
          message: `Task "${task.task}" assigned to ${task.user_name}`,
          status: task.status,
          createdAt: task.created_at,
          user: task.user_name
        }));

      setDashboardData({
        totalUsers,
        activeTasks,
        completedTasks,
        pendingTasks,
        rejectedTasks,
        totalFolders,
        recentActivity
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  // Save sidebarCollapsed to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  // Fetch data on component mount
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboardData();
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading dashboard data...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Dashboard Cards */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                        <p className="text-3xl font-bold text-blue-600">{dashboardData.totalUsers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">Active Tasks</h3>
                        <p className="text-3xl font-bold text-green-600">{dashboardData.activeTasks}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <FileText className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">Pending Tasks</h3>
                        <p className="text-3xl font-bold text-yellow-600">{dashboardData.pendingTasks}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">Rejected Tasks</h3>
                        <p className="text-3xl font-bold text-red-600">{dashboardData.rejectedTasks}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Folder className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">Total Folders</h3>
                        <p className="text-3xl font-bold text-purple-600">{dashboardData.totalFolders}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Status Overview */}
                <div className="mt-8">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{dashboardData.completedTasks}</div>
                        <div className="text-sm text-green-700">Completed</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{dashboardData.pendingTasks}</div>
                        <div className="text-sm text-yellow-700">Pending</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{dashboardData.activeTasks}</div>
                        <div className="text-sm text-blue-700">In Progress</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{dashboardData.rejectedTasks}</div>
                        <div className="text-sm text-red-700">Rejected</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="p-6">
                      {dashboardData.recentActivity.length > 0 ? (
                        <div className="space-y-4">
                          {dashboardData.recentActivity.map((activity, index) => (
                            <div key={activity.id} className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                activity.status === 'completed' ? 'bg-green-500' :
                                activity.status === 'pending' ? 'bg-yellow-500' :
                                activity.status === 'accepted' ? 'bg-blue-500' : 'bg-gray-500'
                              }`}></div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">{activity.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(activity.createdAt).toLocaleDateString()} at {new Date(activity.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                activity.status === 'accepted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {activity.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>No recent activity</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      case "users":
        return <ViewUsers searchQuery={searchQuery} />;
      case "tasks":
        return <Tasks searchQuery={searchQuery} />;
      case "folders":
        return <Folders searchQuery={searchQuery} />;
      case "codes":
        return <Codes searchQuery={searchQuery} />;
      case "settings":
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
              <p className="text-gray-500">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Navigation Bar */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {activeTab === 'dashboard' ? 'Dashboard' : 
                   activeTab === 'users' ? 'Users' :
                   activeTab === 'tasks' ? 'Tasks' :
                   activeTab === 'folders' ? 'Folders' :
                   activeTab === 'codes' ? 'Codes' :
                   activeTab === 'settings' ? 'Settings' : 'Admin Panel'}
                </h1>
              </div>

              {/* Right side - Search and Profile */}
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
                  />
                </div>

                {/* Notifications */}
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                </button>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">{getUserName() || 'Admin'}</div>
                      <div className="text-xs text-gray-500">{getUserEmail() || 'admin@example.com'}</div>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/profile');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/admin');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        File Manager
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-gray-50 min-h-screen">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
}
