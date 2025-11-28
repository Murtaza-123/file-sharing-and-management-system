const userService = require("../services/user.service");
const { responseUtility } = require("../utils");

const generateSecondaryKeys = async (req, res) => {
  const result = await userService.generateSecondaryKeys(req, res);
  return responseUtility.sendResponse(res, result);
};

const createFolder = async (req, res) => {
  const result = await userService.createFolder(req, res);
  return responseUtility.sendResponse(res, result);
};

const uploadFile = async (req, res) => {
  const result = await userService.uploadFile(req, res);
  return responseUtility.sendResponse(res, result);
};

const updateFolder = async (req, res) => {
  const result = await userService.updateFolder(req, res);
  return responseUtility.sendResponse(res, result);
};

const replaceFile = async (req, res) => {
  const { folderName, oldFileName } = req.params;
  const file = req.file;
  const result = await userService.replaceFile(
    req,
    folderName,
    oldFileName,
    file
  );
  return await responseUtility.sendResponse(res, result);
};

const deleteFolder = async (req, res) => {
  const { folderName } = req.params;

  const result = await userService.deleteFolder(req, folderName);
  return responseUtility.sendResponse(res, result);
};

const deleteFile = async (req, res) => {
  const { folderName, fileName } = req.params;

  const result = await userService.deleteFile(req, folderName, fileName);
  return await responseUtility.sendResponse(res, result);
};

const listFoldersForSecondary = async (req, res) => {
  const result = await userService.listFoldersForSecondary(req);
  return responseUtility.sendResponse(res, result);
};

const listFilesForSecondary = async (req, res) => {
  const result = await userService.listFilesForSecondary(req);
  return responseUtility.sendResponse(res, result);
};

const getFileContentForSecondary = async (req, res) => {
  await userService.getFileContentForSecondary(req, res);
};

const getFileInfoForSecondary = async (req, res) => {
  const result = await userService.getFileInfoForSecondary(req);
  return responseUtility.sendResponse(res, result);
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
