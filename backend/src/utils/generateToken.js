const jwt = require("jsonwebtoken");
const config = require("../config");

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

// In production the frontend and API live on different domains, which requires
// SameSite=None + Secure for the browser to send the cookie cross-site.
const cookieOptions = () => {
  const isProd = config.nodeEnv === "production";
  return { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax" };
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    ...cookieOptions(),
    expires: new Date(
      Date.now() + config.cookieExpire * 24 * 60 * 60 * 1000
    ),
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teacher: user.teacher || null,
        inviteCode: user.inviteCode || null,
      },
    });
};

module.exports = { generateToken, sendTokenResponse, cookieOptions };
