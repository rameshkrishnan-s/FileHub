import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Folder, 
  Code, 
  Settings, 
  BarChart3,
  ChevronRight,
  ChevronDown,
  Files
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3, color: "text-indigo-600" },
    { key: "users", label: "Users", icon: Users, color: "text-indigo-600" },
    { key: "tasks", label: "Tasks", icon: FileText, color: "text-indigo-600" },
    { key: "folders", label: "Folders", icon: Folder, color: "text-indigo-600" },
    { key: "codes", label: "Codes", icon: Code, color: "text-indigo-600" },
    { key: "settings", label: "Settings", icon: Settings, color: "text-indigo-600" },
    { key: "file-manager", label: "File Manager", icon: Files, color: "text-indigo-600", isRedirect: true },
  ];

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 min-h-screen ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo/Brand Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-lg font-bold text-gray-800">Admin Panel</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            
            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.isRedirect) {
                    navigate('/file-manager');
                  } else {
                    setActiveTab(item.key);
                  }
                }}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${item.color}`} />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      
    </div>
  );
};

export default AdminSidebar;
