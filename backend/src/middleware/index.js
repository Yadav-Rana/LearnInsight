const { protect, authorize } = require("./auth");
const { AppError, errorHandler, notFound } = require("./errorHandler");
const validate = require("./validate");

module.exports = {
  protect,
  authorize,
  AppError,
  errorHandler,
  notFound,
  validate,
};
