const pool = require('../db/db');

const checkFolderPermission = (requiredPermission = 'read') => {
  return async (req, res, next) => {
    try {
      console.log('Permission check - User:', req.user);
      console.log('Permission check - Requested path:', req.query.path || req.body.path || '');
      console.log('Permission check - Required permission:', requiredPermission);
      
      const userId = req.user.id;
      const requestedPath = req.query.path || req.body.path || '';

      // Admin has full access
      if (parseInt(req.user.role) === 1) { // Assuming role 1 is admin
        console.log('Admin user, allowing access');
        return next();
      }

      // Get all user permissions
      console.log('Fetching permissions for user ID:', userId);
      const [userPermissions] = await pool.execute(
        "SELECT file_or_folder, permission FROM user_files WHERE user_id = ?",
        [userId]
      );
      console.log('User permissions found:', userPermissions);

      if (userPermissions.length === 0) {
        return res.status(403).json({ message: 'Access denied. You do not have permission for this folder.' });
      }

      // Check if user has permission for this folder or any parent folder
      const permissionLevels = { 'read': 1, 'write': 2, 'admin': 3 };
      const requiredLevel = permissionLevels[requiredPermission] || 1;

      const hasAccess = userPermissions.some(perm => {
        // Normalize paths (remove drive letter and replace backslashes with forward slashes)
        const normRequested = requestedPath.replace(/^[A-Z]:[\/\\]?/, '').replace(/\\/g, '/');
        const normPerm = perm.file_or_folder.replace(/^[A-Z]:[\/\\]?/, '').replace(/\\/g, '/');
        
        // Check if the requested path starts with the permitted path
        if (normRequested.startsWith(normPerm)) {
          const userLevel = permissionLevels[perm.permission] || 0;
          return userLevel >= requiredLevel;
        }
        return false;
      });

      if (!hasAccess) {
        return res.status(403).json({ message: `Access denied. ${requiredPermission} permission required for this folder.` });
      }

      // Attach the highest permission level found
      const highestPerm = userPermissions
        .filter(perm => {
          const normRequested = requestedPath.replace(/^[A-Z]:[\/\\]?/, '').replace(/\\/g, '/');
          const normPerm = perm.file_or_folder.replace(/^[A-Z]:[\/\\]?/, '').replace(/\\/g, '/');
          return normRequested.startsWith(normPerm);
        })
        .reduce((max, perm) => {
          const level = permissionLevels[perm.permission] || 0;
          return level > max.level ? { permission: perm.permission, level } : max;
        }, { level: 0 });

      req.folderPermission = highestPerm.permission;
      req.allowedFolder = userPermissions.find(perm => requestedPath.startsWith(perm.file_or_folder))?.file_or_folder;

      next();
    } catch (error) {
      console.error('Error checking folder permissions:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userId: req.user?.id,
        requestedPath: req.query.path || req.body.path || ''
      });
      res.status(500).json({ message: 'Error checking permissions.' });
    }
  };
};

module.exports = { checkFolderPermission };
