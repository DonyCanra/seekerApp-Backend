const bcrypt = require("bcryptjs");

const hashPassword = (input) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(input, salt);
};

const checkPassword = (input, hash) => {
  return bcrypt.compareSync(input, hash);
};

module.exports = {
  hashPassword,
  checkPassword,
};
