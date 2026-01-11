const { param } = require("express-validator");

const insightIdValidator = [
  param("id").isMongoId().withMessage("Invalid insight ID"),
];

const userIdValidator = [
  param("userId").isMongoId().withMessage("Invalid user ID"),
];

module.exports = {
  insightIdValidator,
  userIdValidator,
};
