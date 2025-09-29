import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import API from '../services/api';

const UserFolderNavigation = ({ onFolderSelect, currentPath = '' }) => {
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserFolders();
  }, []);

  const fetchUserFolders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/folder/user-folders');
      setFolders(response.data.folders || []);
    } catch (err) {
      console.error('Error fetching user folders:', err);
      setError('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const getFolderIcon = (folderPath, isExpanded) => {
    if (isExpanded) {
      return <FolderOpen className="w-4 h-4 text-blue-500" />;
    }
    return <Folder className="w-4 h-4 text-gray-500" />;
  };

  const getPermissionBadge = (permission) => {
    const colors = {
      read: 'bg-gray-100 text-gray-800',
      write: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[permission] || colors.read}`}>
        {permission}
      </span>
    );
  };

  const renderFolderTree = (folderList, level = 0) => {
    const rootFolders = folderList.filter(folder => {
      const pathParts = folder.path.split('/').filter(Boolean);
      return pathParts.length === level + 1;
    });

    return rootFolders.map(folder => {
      const isExpanded = expandedFolders.has(folder.path);
      const hasChildren = folderList.some(f => 
        f.path.startsWith(folder.path + '/') && f.path !== folder.path
      );
      const isSelected = currentPath === folder.path;

      return (
        <div key={folder.path} className="select-none">
          <div
            className={`flex items-center py-2 px-3 hover:bg-gray-100 cursor-pointer rounded-md ${
              isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''
            }`}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
            onClick={() => {
              if (hasChildren) {
                toggleFolder(folder.path);
              }
              onFolderSelect(folder.path);
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 mr-2 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
              )
            ) : (
              <div className="w-4 h-4 mr-2" />
            )}
            
            {getFolderIcon(folder.path, isExpanded)}
            
            <span className="ml-2 flex-1 text-sm font-medium text-gray-700">
              {folder.path.split('/').pop()}
            </span>
            
            {getPermissionBadge(folder.permission)}
          </div>
          
          {isExpanded && hasChildren && (
            <div>
              {renderFolderTree(folderList, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={fetchUserFolders}
          className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="p-4 text-center">
        <Folder className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No folders available</p>
        <p className="text-gray-400 text-xs">Contact admin for folder access</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Your Folders</h3>
        <p className="text-xs text-gray-500 mt-1">
          {folders.length} folder{folders.length !== 1 ? 's' : ''} available
        </p>
      </div>
      
      <div className="py-2">
        {renderFolderTree(folders)}
      </div>
    </div>
  );
};

export default UserFolderNavigation;
