const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || "7d",
  cookieExpire: parseInt(process.env.COOKIE_EXPIRE) || 7,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};

module.exports = config;
