/* eslint-disable object-curly-newline */
/* eslint-disable security/detect-object-injection */
/* eslint-disable jsdoc/require-jsdoc */
const { verifyToken, generateToken } = require("../helper/jwt");
const { User } = require("../models");

async function authenticate(req, res, next) {
  const authorization = req.headers.authorization || "";
  const refreshToken = req.headers.refreshtoken || "";

  req.user = null;

  if (!authorization) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid authorization format" });
  }

  const token = authorization.substring(7);
  let tokenData;

  try {
    tokenData = await verifyToken(token);
  } catch (error) {
    if (error.name === "TokenExpiredError" && refreshToken) {
      try {
        const refreshTokenData = await verifyToken(refreshToken);

        const user = await User.findByPk(refreshTokenData.userId);

        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        const newToken = generateToken(user.toJSON());


        const newRefreshToken = generateToken(user.toJSON(), "1yr");

        res.setHeader("Token", newToken);
        res.setHeader("RefreshToken", newRefreshToken);

        req.user = user;

        return next();
      } catch (refreshError) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
    }

    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const user = await User.findByPk(tokenData.id, { raw: true });

  if (!user) {
    return next();
  }

  req.user = user;

  const now = new Date();
  const exp = new Date(tokenData.exp * 1000);
  const difference = exp.getTime() - now.getTime();
  const minutes = Math.round(difference / 60000);

  if (refreshToken && minutes < 15) {
    try {
      const refreshTokenData = await verifyToken(refreshToken);

      if (refreshTokenData.id === tokenData.id) {
        const newToken = generateToken(user.toJSON());
        const newRefreshToken = generateToken(user.toJSON(), "1yr");

        res.setHeader("Token", newToken);
        res.setHeader("RefreshToken", newRefreshToken);
      }
    } catch (refreshError) {
      return res
        .status(401)
        .json({ message: "Invalid refresh token during renewal" });
    }
  }

  return next();
}

module.exports = { authenticate };
