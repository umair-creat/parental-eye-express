const bcrypt = require('bcrypt');

const compare = (password, hash) => bcrypt.compare(password, hash);

const generateHash = (password) => bcrypt.hash(password, 10);

module.exports = {
  compare,
  generateHash,
};
