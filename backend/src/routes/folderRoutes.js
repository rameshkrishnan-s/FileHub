const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const db = require("../models"); // Adjust path if needed
const { Op } = require("sequelize");
const { exec } = require('child_process');
const NodeCache = require('node-cache');

const router = express.Router();

const STORAGE_PATH = process.env.STORAGE_PATH || path.join(__dirname, "..", "upload");
let folder_path = "";

// Ensure storage path exists
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

// List files/folders
router.get("/list", async (req, res) => {
  const requestedPath = req.query.path || "";
  folder_path = requestedPath;
  const fullPath = path.join(STORAGE_PATH, requestedPath);

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ message: "Directory not found." });
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
        metadata = await db.Metadata.findOne({ 
          where: { filePath: relativePath }
        });
      }

      return {
        name,
        type: isDirectory ? "folder" : "file",
        createdAt: stats.birthtime,
        ...(metadata ? metadata.toJSON() : {}),
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
// router.post("/create-folder", async (req, res) => {
//   const { folderName, path: currentPath } = req.body;
//   if (!folderName) {
//     return res.status(400).json({ message: "Folder name is required!" });
//   }

//   const basePath = path.join(STORAGE_PATH, currentPath || "");

//   const getNextAvailableFolderName = (baseName, basePath) => {
//     let counter = 1;
//     let newName = baseName;
//     while (fs.existsSync(path.join(basePath, newName))) {
//       newName = `${baseName}-${counter++}`;
//     }
//     return newName;
//   };

//   const finalFolderName = getNextAvailableFolderName(folderName, basePath);
//   const fullPath = path.join(basePath, finalFolderName);
//   folder_path = currentPath || "";

//   try {
//     fs.mkdirSync(fullPath, { recursive: true });

//     // Also create subfolders if it's at the root level
//     if (!currentPath) {
//       fs.mkdirSync(path.join(fullPath, "2D-Drawing"));
//       fs.mkdirSync(path.join(fullPath, "3D-Model"));
//     }

//     // ✅ Store in metadata DB
//     await db.Metadata.create({
//       fileName: finalFolderName,
//       filePath: path.join(currentPath || "", finalFolderName),
//       type: "folder"
//     });

//     res.json({ message: "Folder created successfully!", folderName: finalFolderName });
//   } catch (error) {
//     res.status(500).json({ message: "Error creating folder.", error: error.toString() });
//   }
// });

router.post("/create-folder", async (req, res) => {
  const { folderName, path: currentPath, subFolderCount } = req.body;
  
  if (!folderName) {
    return res.status(400).json({ message: "Folder name is required!" });
  }

  const basePath = path.join(STORAGE_PATH, currentPath || "");

  // Function to ensure unique folder name
  const getNextAvailableFolderName = (baseName, basePath) => {
    let counter = 1;
    let newName = baseName;
    while (fs.existsSync(path.join(basePath, newName))) {
      newName = `${baseName}-${counter++}`;
    }
    return newName;
  };

  const finalFolderName = getNextAvailableFolderName(folderName, basePath);
  const fullPath = path.join(basePath, finalFolderName);

  try {
    // Create parent folder
    fs.mkdirSync(fullPath, { recursive: true });

    // Create user-defined subfolders
    if (subFolderCount && Number(subFolderCount) > 0) {
      for (let i = 1; i <= subFolderCount; i++) {
        const subFolderName = `${finalFolderName}-${i}`;
        fs.mkdirSync(path.join(fullPath, subFolderName));
      }
    }

    // Store parent folder in metadata DB
    await db.Metadata.create({
      fileName: finalFolderName,
      filePath: path.join(currentPath || "", finalFolderName),
      type: "folder"
    });

    // Optionally store subfolders in DB as well
    if (subFolderCount && Number(subFolderCount) > 0) {
      for (let i = 1; i <= subFolderCount; i++) {
        const subFolderName = `${finalFolderName}-${i}`;
        await db.Metadata.create({
          fileName: subFolderName,
          filePath: path.join(currentPath || "", finalFolderName, subFolderName),
          type: "folder"
        });
      }
    }

    res.json({ message: "Folder created successfully!", folderName: finalFolderName });
  } catch (error) {
    res.status(500).json({ message: "Error creating folder.", error: error.toString() });
  }
});



// Rename folder/file
router.post("/rename", async (req, res) => {
  const { oldName, newName, path: itemPath = "" } = req.body;
  const oldPath = path.join(STORAGE_PATH, itemPath, oldName);
  const newPath = path.join(STORAGE_PATH, itemPath, newName);

  try {
    if (!fs.existsSync(oldPath)) return res.status(400).json({ message: "Item not found." });

    fs.renameSync(oldPath, newPath);

    // Update DB if it's a file
    const oldRelativePath = path.join(itemPath, oldName);
    const newRelativePath = path.join(itemPath, newName);

    const metadata = await db.Metadata.findOne({ where: { filePath: oldRelativePath } });
    if (metadata) {
      metadata.fileName = newName;
      metadata.filePath = newRelativePath;
      await metadata.save();
    }

    res.json({ message: "Renamed successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error renaming item.", error: error.toString() });
  }
});


// Delete folder/file
router.post("/delete", async (req, res) => {
  const { name, path: itemPath = "" } = req.body;
  const fullPath = path.join(STORAGE_PATH, itemPath, name);

  try {
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });

      // Delete from DB if it's a file
      const relativePath = path.join(itemPath, name);
      await db.Metadata.destroy({ where: { filePath: relativePath } });

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

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const relativePath = path.join(folder_path || "", req.file.originalname);

    // Store in DB
    await db.Metadata.create({
      fileName: req.file.originalname,
      filePath: relativePath
    });

    res.json({
      message: "File uploaded and metadata saved successfully!",
      fileName: req.file.originalname,
      currentPath: folder_path || "",
    });
  } catch (error) {
    res.status(500).json({ message: "Error saving metadata.", error: error.toString() });
  }
});


// ✅ Search function with caching, pagination, and folder scope
const searchCache = new NodeCache({ stdTTL: 300 });

router.get("/search", async (req, res) => {
  const { query, type, path: currentPath = "", page = 1, limit = 20 } = req.query;
  const cacheKey = `${query}-${type}-${currentPath}-${page}-${limit}`;

  try {
    // ✅ Check cache first
    const cachedResults = searchCache.get(cacheKey);
    if (cachedResults) {
      return res.json(cachedResults);
    }

    // ✅ Build search conditions
    let whereClause = {};

    if (currentPath) {
      whereClause.filePath = { [Op.like]: `${currentPath}%` };  
    }

    if (query) {
      whereClause[Op.and] = [
        {
          [Op.or]: [
            { fileName: { [Op.like]: `%${query}%` } },
            { filePath: { [Op.like]: `%${query}%` } }
          ]
        },
        currentPath ? { filePath: { [Op.like]: `${currentPath}%` } } : {}
      ];
    }

    if (type) {
      whereClause.type = type;
    }

    // ✅ Get total count
    const totalCount = await db.Metadata.count({ where: whereClause });

    // ✅ Get filtered + paginated results
    const results = await db.Metadata.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [["createdAt", "DESC"]],
    });

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
          createdAt: stats ? stats.birthtime : metadata.createdAt,
          ...metadata.toJSON(),
        };
      })
    );

    const response = {
      results: formattedResults,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    };

    // ✅ Cache
    searchCache.set(cacheKey, response);

    res.json(response);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      message: "Error searching files/folders.",
      error: error.toString(),
      details: error.message,
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
