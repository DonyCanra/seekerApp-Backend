var jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET)
// var token = jwt.sign({ name: 'Dony Canra' }, JWT_SECRET);

const SignToken = (payload) => {
  console.log(JWT_SECRET, "<<");
  return jwt.sign(payload, JWT_SECRET);
};

//verify
const VerifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  SignToken,
  VerifyToken,
};
