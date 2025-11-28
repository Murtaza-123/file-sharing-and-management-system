const express = require("express");
const { userController } = require("../controllers");
const {
  authenticateKey,
  requireWrite,
  requireRead,
} = require("../middlewares/index");
const upload = require("../middlewares/multer.middleware");

const router = express.Router();

router.post("/generate-secondary-key", userController.generateSecondaryKeys);
router.post(
  "/create-folder",
  authenticateKey,
  requireWrite,
  userController.createFolder
);
router.post(
  "/upload-file/:folderName",
  authenticateKey,
  requireWrite,
  upload.single("file"),
  userController.uploadFile
);

router.patch(
  "/update-file/:folderName/:oldFileName",
  authenticateKey,
  requireWrite,
  upload.single("file"),
  userController.replaceFile
);
router.patch(
  "/update-folder",
  authenticateKey,
  requireWrite,
  userController.updateFolder
);

router.delete(
  "/delete-folder/:folderName",
  authenticateKey,
  requireWrite,
  userController.deleteFolder
);

router.delete(
  "/delete-file/:folderName/:fileName",
  authenticateKey,
  requireWrite,
  userController.deleteFile
);

router.get(
  "/folders",
  authenticateKey,
  requireRead,
  userController.listFoldersForSecondary
);

router.get(
  "/files/:folderName",
  authenticateKey,
  requireRead,
  userController.listFilesForSecondary
);

router.get(
  "/file/content/:folderName/:fileName",
  authenticateKey,
  requireRead,
  userController.getFileContentForSecondary
);

router.get(
  "/secondary/file/info/:folderName/:fileName",
  authenticateKey,
  requireRead,
  userController.getFileInfoForSecondary
);

module.exports = router;
