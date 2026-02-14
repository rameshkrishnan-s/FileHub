const express = require("express");
const fs = require("fs");
const fsPromises = require("fs").promises;

const path = require("path");
const multer = require("multer");
const pool = require("../db/db");
const { exec } = require('child_process');
const NodeCache = require('node-cache');
const authMiddleware = require('../middleware/authMiddleware');
const { checkFolderPermission } = require('../middleware/folderPermissions');

const router = express.Router();

const STORAGE_PATH = process.env.STORAGE_PATH || path.join(__dirname, "..", "..");
let folder_path = "";

// Ensure storage path exists
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

// Get user's accessible folders
router.get("/user-folders", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = parseInt(req.user.role);

    // Admin has access to all folders
    if (userRole === 1) {
      // Get all folders from storage
      const getAllFolders = (dir, basePath = '') => {
        const folders = [];
        try {
          const items = fs.readdirSync(dir);
          for (const item of items) {
            const fullPath = path.join(dir, item);
            const relativePath = path.join(basePath, item);
            if (fs.statSync(fullPath).isDirectory()) {
              folders.push({
                path: relativePath.replace(/\\/g, '/'),
                permission: 'admin'
              });
              // Recursively get subfolders
              folders.push(...getAllFolders(fullPath, relativePath));
            }
          }
        } catch (error) {
          console.error('Error reading directory:', error);
        }
        return folders;
      };

      const allFolders = getAllFolders(STORAGE_PATH);
      return res.json({ folders: allFolders });
    }

    // Get folders user has access to through permissions
    const [userFiles] = await pool.execute(
      "SELECT file_or_folder, permission FROM user_files WHERE user_id = ?",
      [userId]
    );

    const folders = userFiles.map(uf => ({
      path: uf.file_or_folder,
      permission: uf.permission
    }));

    res.json({ folders });
  } catch (error) {
    console.error('Error fetching user folders:', error);
    res.status(500).json({ message: 'Error fetching folders.' });
  }
});

// List files/folders
router.get("/list", authMiddleware, async (req, res) => {
  const requestedPath = req.query.path || "";
  folder_path = requestedPath;
  const fullPath = path.join(STORAGE_PATH, requestedPath);

  // Check if user has permission for this path
  const userId = req.user.id;
  const userRole = parseInt(req.user.role);

  // Admin has full access
  if (userRole !== 1) {
    try {
      // Get user's permitted folders
      const [userPermissions] = await pool.execute(
        "SELECT file_or_folder, permission FROM user_files WHERE user_id = ?",
        [userId]
      );

      if (userPermissions.length === 0) {
        return res.status(403).json({ message: 'Access denied. You do not have permission for any folders.' });
      }

      // Check if user has permission for this specific path
      const hasAccess = userPermissions.some(perm => {
        const normRequested = requestedPath.replace(/^[A-Z]:[\/\\]?/, '').replace(/\\/g, '/');
        const normPerm = perm.file_or_folder.replace(/^[A-Z]:[\/\\]?/, '').replace(/\\/g, '/');
        return normRequested.startsWith(normPerm) || normPerm.startsWith(normRequested);
      });

      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied. You do not have permission for this folder.' });
      }
    } catch (error) {
      console.error('Error checking folder permissions:', error);
      return res.status(500).json({ message: 'Error checking permissions.' });
    }
  }

  if (!fs.existsSync(fullPath)) {
    return res.json([]); // Return empty list if directory doesn't exist but user has permission
  }

  try {
    const items = await Promise.all(fs.readdirSync(fullPath).map(async (name) => {
      const fullItemPath = path.join(fullPath, name);
      const stats = fs.statSync(fullItemPath);
      const isDirectory = stats.isDirectory();
      
      // Get metadata for files
      let metadata = null;
      if (!isDirectory) {
        const relativePath = path.join(requestedPath, name);
        const [metadataRows] = await pool.execute(
          "SELECT * FROM metadata WHERE filePath = ?",
          [relativePath]
        );
        metadata = metadataRows[0] || null;
      }

      return {
        name,
        type: isDirectory ? "folder" : "file",
        createdAt: stats.birthtime,
        ...(metadata || {}),
        path: path.join(requestedPath, name)
      };
    }));

    // Sort by type (folders first) and then by name
    const sortedItems = items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    res.json(sortedItems);
  } catch (error) {
    console.error('Error reading directory:', error);
    res.status(500).json({
      message: "Error reading directory.",
      error: error.toString(),
    });
  }
});


// Create folder
router.post("/create-folder", authMiddleware, async (req, res) => {
  const { folderName, path: currentPath = "" } = req.body;

  if (!folderName || folderName.trim() === "") {
    return res.status(400).json({ message: "Folder name is required!" });
  }

  try {
    const safePath = path.normalize(currentPath).replace(/^(\.\.(\/|\\|$))+/, "");
    const basePath = path.join(STORAGE_PATH, safePath);

    // await fs.mkdir(basePath, { recursive: true });
    await fsPromises.mkdir(basePath, { recursive: true });


    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const now = new Date();
      const currentYear = new Date().getFullYear().toString().slice(-2); // "25"

      // 🔥 Get next running number from DB
      const [rows] = await connection.execute(
        `SELECT MAX(sequence) as lastSeq FROM metadata 
         WHERE YEAR(createdAt) = YEAR(CURDATE())`
      );

      let nextSeq = (rows[0].lastSeq || 0) + 1;

      // Format as 3 digit
      const formattedSeq = String(nextSeq).padStart(3, "0");

      // Final Display Name
      const finalFolderName = `${currentYear} ${formattedSeq} ${folderName}`;

      const fullPath = path.join(basePath, finalFolderName);

      await fsPromises.mkdir(fullPath);


      await connection.execute(
        `INSERT INTO metadata 
         (fileName, filePath, type, createdAt, updatedAt, sequence) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          finalFolderName,
          path.join(safePath, finalFolderName),
          "folder",
          now,
          now,
          nextSeq
        ]
      );

      await connection.commit();
      connection.release();

      res.status(201).json({
        message: "Folder created successfully!",
        folderName: finalFolderName
      });

    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating folder.",
      error: error.message
    });
  }
});




// Rename folder/file
router.post("/rename", authMiddleware, checkFolderPermission('write'), async (req, res) => {
  const { oldName, newName, path: itemPath = "" } = req.body;
  const oldPath = path.join(STORAGE_PATH, itemPath, oldName);
  const newPath = path.join(STORAGE_PATH, itemPath, newName);

  try {
    if (!fs.existsSync(oldPath)) return res.status(400).json({ message: "Item not found." });

    fs.renameSync(oldPath, newPath);

    // Update DB if it's a file
    const oldRelativePath = path.join(itemPath, oldName);
    const newRelativePath = path.join(itemPath, newName);

    await pool.execute(
      "UPDATE metadata SET fileName = ?, filePath = ? WHERE filePath = ?",
      [newName, newRelativePath, oldRelativePath]
    );

    res.json({ message: "Renamed successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error renaming item.", error: error.toString() });
  }
});


// Delete folder/file
router.post("/delete", authMiddleware, checkFolderPermission('write'), async (req, res) => {
  const { name, path: itemPath = "" } = req.body;
  const fullPath = path.join(STORAGE_PATH, itemPath, name);

  try {
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });

      // Delete from DB if it's a file
      const relativePath = path.join(itemPath, name);
      await pool.execute("DELETE FROM metadata WHERE filePath = ?", [relativePath]);

      return res.json({ message: "Deleted successfully!" });
    }
    res.status(400).json({ message: "Item not found!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item.", error: error.toString() });
  }
});


// Upload file using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(STORAGE_PATH, folder_path || "");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  checkFolderPermission('write'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const currentPath = req.body.path || "";
    const basePath = process.env.STORAGE_PATH || "D:/upload";

    try {
      const relativePath = path.join(basePath, currentPath, req.file.originalname);
      const now = new Date();

      await pool.execute(
        "INSERT INTO metadata (fileName, filePath, type, createdAt, updatedAt, fileId) VALUES (?, ?, ?, ?, ?, ?)",
        [req.file.originalname, relativePath, "file", now, now, null]
      );

      res.json({
        message: "File uploaded and metadata saved successfully!",
        fileName: req.file.originalname,
        currentPath,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error saving metadata.",
        error: error.toString(),
      });
    }
  }
);


// ✅ Search function with caching, pagination, and folder scope
// const searchCache = new NodeCache({ stdTTL: 300 });

// router.get("/search", async (req, res) => {
//   const { query, type, path: currentPath = "", page = 1, limit = 20 } = req.query;
//   const cacheKey = `${query}-${type}-${currentPath}-${page}-${limit}`;

//   try {
//     // ✅ Check cache first
//     const cachedResults = searchCache.get(cacheKey);
//     if (cachedResults) {
//       return res.json(cachedResults);
//     }

//     // ✅ Build search conditions
//     let whereConditions = [];
//     let queryParams = [];

//     if (currentPath) {
//       whereConditions.push("filePath LIKE ?");
//       queryParams.push(`${currentPath}%`);
//     }

//     if (query) {
//       whereConditions.push("(fileName LIKE ? OR filePath LIKE ?)");
//       queryParams.push(`%${query}%`, `%${query}%`);
//     }

//     if (type) {
//       whereConditions.push("type = ?");
//       queryParams.push(type);
//     }

//     const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

//     // ✅ Get total count
//     const [countResult] = await pool.execute(
//       `SELECT COUNT(*) as total FROM metadata ${whereClause}`,
//       queryParams
//     );
//     const totalCount = countResult[0].total;

//     // ✅ Get filtered + paginated results
//     const [results] = await pool.execute(
//       `SELECT * FROM metadata ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
//       [...queryParams, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]
//     );

//     // ✅ Format results
//     const formattedResults = await Promise.all(
//       results.map(async (metadata) => {
//         const fullPath = path.join(STORAGE_PATH, metadata.filePath);
//         let stats = null;

//         try {
//           stats = await fs.promises.stat(fullPath);
//         } catch {}

//         return {
//           id: metadata.id,
//           name: metadata.fileName,
//           type: metadata.type || (stats?.isDirectory() ? "folder" : "file"),
//           path: metadata.filePath,
//           createdAt: stats ? stats.birthtime : metadata.createdAt,
//           ...metadata,
//         };
//       })
//     );

//     const response = {
//       results: formattedResults,
//       pagination: {
//         total: totalCount,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalPages: Math.ceil(totalCount / limit),
//       },
//     };

//     // ✅ Cache
//     searchCache.set(cacheKey, response);

//     res.json(response);
//   } catch (error) {
//     console.error("Search error:", error);
//     res.status(500).json({
//       message: "Error searching files/folders.",
//       error: error.toString(),
//       details: error.message,
//     });
//   }
// });

// ✅ Search function with caching, pagination, and folder scope
// ✅ Search function with caching, pagination, and folder scope
const searchCache = new NodeCache({ stdTTL: 300 });

router.get("/search", authMiddleware, async (req, res) => {
  try {
    const {
      query,
      type,
      path: currentPath = "",
      page = 1,
      limit = 20
    } = req.query;

    // ✅ Safe pagination parsing
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 20, 1);
    const offset = (pageNum - 1) * limitNum;

    if (isNaN(pageNum) || isNaN(limitNum)) {
      return res.status(400).json({ message: "Invalid pagination values" });
    }

    const cacheKey = `${query || ""}-${type || ""}-${currentPath}-${pageNum}-${limitNum}`;

    // ✅ Check cache
    const cachedResults = searchCache.get(cacheKey);
    if (cachedResults) {
      return res.json(cachedResults);
    }

    // ✅ Build WHERE conditions dynamically
    let whereConditions = [];
    let queryParams = [];

    if (currentPath) {
      whereConditions.push("filePath LIKE ?");
      queryParams.push(`${currentPath}%`);
    }

    if (query) {
      whereConditions.push("(fileName LIKE ? OR filePath LIKE ?)");
      queryParams.push(`%${query}%`, `%${query}%`);
    }

    if (type) {
      whereConditions.push("type = ?");
      queryParams.push(type);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // ✅ Count query (safe prepared statement)
    const countSql = `SELECT COUNT(*) as total FROM metadata ${whereClause}`;
    const [countResult] = await pool.execute(countSql, queryParams);
    const totalCount = countResult[0].total;

    // ✅ MAIN QUERY (NO placeholders for LIMIT/OFFSET)
    const searchSql = `
      SELECT * FROM metadata
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    console.log("SQL:", searchSql);
    console.log("Params:", queryParams);

    const [results] = await pool.query(searchSql, queryParams);

    // ✅ Format results
    const formattedResults = await Promise.all(
      results.map(async (metadata) => {
        const fullPath = path.join(STORAGE_PATH, metadata.filePath);
        let stats = null;

        try {
          stats = await fs.promises.stat(fullPath);
        } catch {}

        return {
          id: metadata.id,
          name: metadata.fileName,
          type: metadata.type || (stats?.isDirectory() ? "folder" : "file"),
          path: metadata.filePath,
          createdAt: stats?.birthtime || metadata.createdAt,
          ...metadata,
        };
      })
    );

    const response = {
      results: formattedResults,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    };

    // ✅ Cache response
    searchCache.set(cacheKey, response);

    res.json(response);

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      message: "Error searching files/folders.",
      error: error.toString(),
    });
  }
});



// Open file
router.get("/open", async (req, res) => {
  const { filePath } = req.query;
  if (!filePath) {
    return res.status(400).json({ message: "File path is required" });
  }

  const fullPath = path.join(STORAGE_PATH, filePath);
  console.log('Attempting to open file:', {
    requestedPath: filePath,
    fullPath: fullPath,
    exists: fs.existsSync(fullPath),
    platform: process.platform
  });
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.error('File not found:', fullPath);
      return res.status(404).json({ message: "File not found", path: fullPath });
    }

    // For Windows
    if (process.platform === 'win32') {
      const command = `start "" "${fullPath}"`;
      console.log('Executing command:', command);
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Error opening file:', {
            error: error.message,
            stdout,
            stderr
          });
          return res.status(500).json({ 
            message: "Error opening file", 
            error: error.message,
            details: { stdout, stderr }
          });
        }
        console.log('File opened successfully:', fullPath);
        res.json({ message: "File opened successfully", path: fullPath });
      });
    } 
    // For macOS
    else if (process.platform === 'darwin') {
      const command = `open "${fullPath}"`;
      console.log('Executing command:', command);
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Error opening file:', {
            error: error.message,
            stdout,
            stderr
          });
          return res.status(500).json({ 
            message: "Error opening file", 
            error: error.message,
            details: { stdout, stderr }
          });
        }
        console.log('File opened successfully:', fullPath);
        res.json({ message: "File opened successfully", path: fullPath });
      });
    } 
    // For Linux
    else {
      const command = `xdg-open "${fullPath}"`;
      console.log('Executing command:', command);
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Error opening file:', {
            error: error.message,
            stdout,
            stderr
          });
          return res.status(500).json({ 
            message: "Error opening file", 
            error: error.message,
            details: { stdout, stderr }
          });
        }
        console.log('File opened successfully:', fullPath);
        res.json({ message: "File opened successfully", path: fullPath });
      });
    }
  } catch (error) {
    console.error('Error in file opening:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Error opening file", 
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
