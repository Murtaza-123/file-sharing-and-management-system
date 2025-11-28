const { HTTP_STATUS_CODES } = require("../constants/index.js");
const messageUtility = require("./message.utility.js");

const sendResponse = (res, response) => {
  const { status, message, data, statusCode } = response;

  let httpCode = statusCode;

  if (!httpCode) {
    if (status === true) httpCode = HTTP_STATUS_CODES.OK;
    else if (status === false) httpCode = HTTP_STATUS_CODES.BAD_REQUEST;
    else httpCode = HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY;
  }

  const payload = {
    status: !!status,
    message: message || "",
  };

  if (data) payload.data = data;

  return res.status(httpCode).json(payload);
};

const validationErrorResponse = (res, errors) => {
  res.status(HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY).json({
    status: false,
    error: errors,
    message: messageUtility.validationErrors,
  });
};

const badRequestErrorResponse = (res, message) => {
  res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
    status: false,
    message,
  });
};

const authorizationErrorResponse = (res, message) => {
  res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
    status: false,
    message,
  });
};

const manyRequestErrorResponse = (res, message) => {
  res.status(HTTP_STATUS_CODES.TOO_MANY_REQUESTS).json({
    status: false,
    message,
  });
};

const validationFailResponse = (res, message, result) => {
  const response = {
    status: false,
    message,
  };
  if (result) response.result = result;

  res.status(HTTP_STATUS_CODES.VALIDATION_FAILED).json(response);
};

const successResponse = (res, message, result) => {
  const response = {
    status: true,
    message,
  };
  if (result) response.result = result;

  res.status(HTTP_STATUS_CODES.OK).json(response);
};

const noSuccessResponse = (res, message, result) => {
  const response = {
    status: false,
    message,
  };
  if (result) response.result = result;

  res.status(HTTP_STATUS_CODES.OK).json(response);
};

const errorResponse = (res, message, result) => {
  const response = {
    status: false,
    message,
  };
  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(response);
};

module.exports = {
  sendResponse,
  successResponse,
  noSuccessResponse,
  validationFailResponse,
  validationErrorResponse,
  errorResponse,
  badRequestErrorResponse,
  authorizationErrorResponse,
  manyRequestErrorResponse,
};
