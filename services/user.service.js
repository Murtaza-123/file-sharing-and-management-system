const jwt = require("jsonwebtoken");
const { USER_STATUS } = require("../constants");
const User = require("../db/models/user.model");
const fs = require("fs");
const path = require("path");

const generateSecondaryKeys = async (req, res) => {
  try {
    const data = req.body;
    const { assignedTo } = data;

    if (data.expiresAt) {
      const now = new Date();
      now.setDate(now.getDate() + Number(data.expiresAt));
      data.expiresAt = now.toISOString();
    }

    if (!assignedTo) {
      return {
        status: false,
        message: "Assigned to is required",
        statusCode: 400,
      };
    }
    const primaryKey = req.headers["x-api-key"];
    if (!primaryKey) {
      return {
        status: false,
        message: "Primary key missing in header",
        statusCode: 403,
      };
    }

    let decoded;
    try {
      decoded = await jwt.verify(primaryKey, process.env.KEY_SECRET);
    } catch (err) {
      return {
        status: false,
        message: "Invalid or expired primary key",
        statusCode: 401,
      };
    }

    const { userId, keyType } = decoded;

    if (keyType !== "primary") {
      return {
        status: false,
        message: "Only primary key can generate secondary keys",
        statusCode: 403,
      };
    }

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return {
        status: false,
        message: "User not found",
        statusCode: 404,
      };
    }

    if (user.status === USER_STATUS.BLOCKED) {
      return {
        status: false,
        message: "User is blocked",
        statusCode: 401,
      };
    }

    const expiresInDays = 7;
    const secondaryKeyPayload = {
      userId: user.id,
      keyType: "secondary",
      expiresAt: expiresInDays,
      permissions: ["read"],
      assignedTo: assignedTo,
    };

    const secondaryKey = jwt.sign(secondaryKeyPayload, process.env.KEY_SECRET, {
      expiresIn: `${expiresInDays}d`,
    });

    return {
      status: true,
      message: "Secondary API key generated successfully",
      data: secondaryKey,
      statusCode: 201,
    };
  } catch (error) {
    console.error("Error generating secondary key:", error);
    return {
      status: false,
      message: "Internal server error",
      statusCode: 500,
    };
  }
};

const createFolder = async (req, res) => {
  try {
    const { folderName } = req.body;

    if (!folderName) {
      return {
        status: false,
        message: "folderName is required",
        statusCode: 400,
      };
    }
    const primaryKey = req.headers["x-api-key"];
    if (!primaryKey) {
      return {
        status: false,
        message: "Primary key missing in header",
        statusCode: 403,
      };
    }
    let decoded;
    try {
      decoded = jwt.verify(primaryKey, process.env.KEY_SECRET);
    } catch (err) {
      return {
        status: false,
        message: "Invalid or expired primary key",
        statusCode: 401,
      };
    }

    const { userId } = decoded;

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return {
        status: false,
        message: "User not found",
        statusCode: 404,
      };
    }

    if (user.status === USER_STATUS.BLOCKED) {
      return {
        status: false,
        message: "User is blocked",
        statusCode: 403,
      };
    }

    const userDir = user.userDirectory;
    if (!userDir) {
      return {
        status: false,
        message: "User directory not set in database",
        statusCode: 500,
      };
    }
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    const newFolderPath = path.join(userDir, folderName);

    if (fs.existsSync(newFolderPath)) {
      return {
        status: false,
        message: "Folder already exists",
        statusCode: 400,
      };
    }

    fs.mkdirSync(newFolderPath, { recursive: true });

    return {
      status: true,
      message: "Folder created successfully",
      data: { folderPath: newFolderPath },
      statusCode: 201,
    };
  } catch (error) {
    console.error("Error creating folder:", error);
    return {
      status: false,
      message: error.message,
      statusCode: 500,
    };
  }
};

const uploadFile = async (req) => {
  try {
    const { folderName } = req.params;

    if (!req.file) {
      return {
        status: false,
        message: "File is required",
        statusCode: 400,
      };
    }

    const userId = req.userId;

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return {
        status: false,
        message: "User not found",
        statusCode: 404,
      };
    }

    if (user.status === USER_STATUS.BLOCKED) {
      return {
        status: false,
        message: "User is blocked",
        statusCode: 403,
      };
    }

    const userDir = user.userDirectory;
    if (!userDir) {
      return {
        status: false,
        message: "User directory not configured",
        statusCode: 500,
      };
    }

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    let targetFolder = userDir;

    if (folderName) {
      targetFolder = path.join(userDir, folderName);

      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }
    }

    const fileName = `${Date.now()}_${req.file.originalname}`;
    const filePath = path.join(targetFolder, fileName);

    fs.writeFileSync(filePath, req.file.buffer);

    return {
      status: true,
      message: "File uploaded successfully",
      statusCode: 201,
      data: {
        fileName,
        folder: folderName || "root",
        filePath,
      },
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      status: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

const updateFolder = async (req) => {
  try {
    const { oldFolderName, newFolderName } = req.body;

    if (!oldFolderName || !newFolderName) {
      return {
        status: false,
        message: "folderName and newFolderName are required",
        statusCode: 400,
      };
    }

    const userId = req.userId;
    const keyType = req.apiKeyType;

    if (keyType !== "primary") {
      return {
        status: false,
        message: "Write operations require a primary API key",
        statusCode: 403,
      };
    }

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return {
        status: false,
        message: "User not found",
        statusCode: 404,
      };
    }

    if (user.status === USER_STATUS.BLOCKED) {
      return {
        status: false,
        message: "User is blocked",
        statusCode: 403,
      };
    }

    const userDir = user.userDirectory;
    if (!userDir) {
      return {
        status: false,
        message: "User directory missing",
        statusCode: 500,
      };
    }

    const oldFolderPath = path.join(userDir, oldFolderName);
    const newFolderPath = path.join(userDir, newFolderName);

    if (!fs.existsSync(oldFolderPath)) {
      return {
        status: false,
        message: "Folder does not exist",
        statusCode: 404,
      };
    }

    if (fs.existsSync(newFolderPath)) {
      return {
        status: false,
        message: "A folder with the new name already exists",
        statusCode: 400,
      };
    }

    fs.renameSync(oldFolderPath, newFolderPath);

    return {
      status: true,
      message: "Folder renamed successfully",
      statusCode: 200,
      data: {
        oldFolderName: oldFolderName,
        newFolderName: newFolderName,
        newPath: newFolderPath,
      },
    };
  } catch (error) {
    console.error("Error updating folder:", error);
    return {
      status: false,
      message: error.message,
      statusCode: 500,
    };
  }
};

const replaceFile = async (req, folderName, oldFileName, file) => {
  try {
    if (!file || !folderName || !oldFileName) {
      return {
        status: false,
        statusCode: 400,
        message: "folderName, oldFileName and file are required",
      };
    }

    const userId = req.userId;

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return { status: false, statusCode: 404, message: "User not found" };
    }

    if (user.status === USER_STATUS.BLOCKED) {
      return {
        status: false,
        statusCode: 403,
        message: "User is blocked",
      };
    }

    const userDir = user.userDirectory;
    if (!userDir) {
      return {
        status: false,
        statusCode: 500,
        message: "User directory not configured",
      };
    }

    const folderPath = path.join(userDir, folderName);

    if (!fs.existsSync(folderPath)) {
      return {
        status: false,
        statusCode: 404,
        message: "Folder does not exist",
      };
    }

    const oldFilePath = path.join(folderPath, oldFileName);
    if (!fs.existsSync(oldFilePath)) {
      return {
        status: false,
        statusCode: 404,
        message: "Old file does not exist",
      };
    }

    const newFileName = file.originalname;
    const newFilePath = path.join(folderPath, newFileName);

    fs.unlinkSync(oldFilePath);

    fs.writeFileSync(newFilePath, file.buffer);

    return {
      status: true,
      statusCode: 200,
      message: "File replaced successfully",
      data: {
        folder: folderName,
        oldFileName,
        newFileName,
        filePath: newFilePath,
      },
    };
  } catch (error) {
    console.error("Service error:", error);
    return {
      status: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

const deleteFolder = async (req, folderName) => {
  try {
    const userId = req.userId;

    const user = await User.findOne({ where: { id: userId } });
    if (!user)
      return { status: false, statusCode: 404, message: "User not found" };
    if (user.status === USER_STATUS.BLOCKED)
      return { status: false, statusCode: 403, message: "User is blocked" };

    const userDir = user.userDirectory;
    if (!userDir)
      return {
        status: false,
        statusCode: 500,
        message: "User directory not configured",
      };

    const folderPath = path.join(userDir, folderName);

    if (!fs.existsSync(folderPath)) {
      return {
        status: false,
        statusCode: 404,
        message: "Folder does not exist",
      };
    }
    fs.rmSync(folderPath, { recursive: true, force: true });

    return {
      status: true,
      statusCode: 200,
      message: "Folder deleted successfully",
      data: { folderName, folderPath },
    };
  } catch (err) {
    console.error("Error deleting folder:", err);
    return { status: false, statusCode: 500, message: err.message };
  }
};

const deleteFile = async (req, folderName, fileName) => {
  try {
    const userId = req.userId;
    const user = await User.findOne({ where: { id: userId } });
    if (!user)
      return { status: false, statusCode: 404, message: "User not found" };
    if (user.status === USER_STATUS.BLOCKED)
      return { status: false, statusCode: 403, message: "User is blocked" };

    const userDir = user.userDirectory;
    if (!userDir)
      return {
        status: false,
        statusCode: 500,
        message: "User directory not configured",
      };

    const folderPath = path.join(userDir, folderName);

    if (!fs.existsSync(folderPath)) {
      return {
        status: false,
        statusCode: 404,
        message: "Folder does not exist",
      };
    }

    const filePath = path.join(folderPath, fileName);

    if (!fs.existsSync(filePath)) {
      return { status: false, statusCode: 404, message: "File does not exist" };
    }

    fs.unlinkSync(filePath);

    return {
      status: true,
      statusCode: 200,
      message: "File deleted successfully",
      data: { folderName, fileName, filePath },
    };
  } catch (err) {
    console.error("Error deleting file:", err);
    return { status: false, statusCode: 500, message: err.message };
  }
};

const listFoldersForSecondary = async (req) => {
  try {
    const { userId } = req; // owner of data

    const user = await User.findOne({ where: { id: userId } });
    if (!user)
      return { status: false, message: "User not found", statusCode: 404 };

    const userDir = user.userDirectory;

    const folders = fs.readdirSync(userDir).filter((item) => {
      return fs.lstatSync(path.join(userDir, item)).isDirectory();
    });

    return {
      status: true,
      statusCode: 200,
      message: "Folders retrieved successfully",
      data: folders,
    };
  } catch (err) {
    return { status: false, statusCode: 500, message: err.message };
  }
};

const listFilesForSecondary = async (req) => {
  try {
    const { userId } = req;
    const { folderName } = req.params;

    const user = await User.findOne({ where: { id: userId } });

    const folderPath = path.join(user.userDirectory, folderName);

    if (!fs.existsSync(folderPath)) {
      return {
        status: false,
        statusCode: 404,
        message: "Folder does not exist",
      };
    }

    const files = fs.readdirSync(folderPath);

    return {
      status: true,
      statusCode: 200,
      message: "Files fetched successfully",
      data: files,
    };
  } catch (err) {
    return { status: false, statusCode: 500, message: err.message };
  }
};

const getFileContentForSecondary = async (req, res) => {
  try {
    const { userId } = req;
    const { folderName, fileName } = req.params;

    const user = await User.findOne({ where: { id: userId } });
    const filePath = path.join(user.userDirectory, folderName, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ status: false, message: "File not found" });
    }

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename=${fileName}`);

    return fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

const getFileInfoForSecondary = async (req) => {
  try {
    const { userId } = req;
    const { folderName, fileName } = req.params;

    const user = await User.findOne({ where: { id: userId } });

    const filePath = path.join(user.userDirectory, folderName, fileName);

    if (!fs.existsSync(filePath)) {
      return { status: false, statusCode: 404, message: "File not found" };
    }

    const stats = fs.statSync(filePath);

    return {
      status: true,
      statusCode: 200,
      message: "File metadata retrieved",
      data: {
        fileName,
        size: stats.size,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
      },
    };
  } catch (err) {
    return { status: false, statusCode: 500, message: err.message };
  }
};

module.exports = {
  generateSecondaryKeys,
  createFolder,
  uploadFile,
  updateFolder,
  replaceFile,
  deleteFolder,
  deleteFile,
  listFoldersForSecondary,
  listFilesForSecondary,
  getFileContentForSecondary,
  getFileInfoForSecondary,
};
