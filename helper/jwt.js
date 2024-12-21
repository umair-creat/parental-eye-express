const jwt = require("jsonwebtoken");

const { JWT_SECRET_KEY } = process.env;

const generateToken = (data, expiresIn = "30000s") => {
  const options = {
    expiresIn,
  };
  return jwt.sign(data, JWT_SECRET_KEY, options);
};

const verifyToken = (token) => jwt.verify(token, JWT_SECRET_KEY);

const decode = (token) => jwt.decode(token, JWT_SECRET_KEY);

module.exports = {
  generateToken,
  verifyToken,
  decode,
};
