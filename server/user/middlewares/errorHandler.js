const errorHandler = (err, req, res, next) => {
  console.log(err);
  if (err.name === "CustomError")res.status(err.status).json({ message: err.message });
  if (err.name === "SequelizeValidationError") return res.status(400).json({ message: err.errors[0].message });
  if (err.name === "SequelizeUniqueConstraintError") return res.status(400).json({ message: err.errors[0].message });
  if (err.name === "InvalidUser") return res.status(400).json({ message: `Email or Password is not valid` });
  if (err.name === "NameRequired") return res.status(400).json({ message: `Email is required` });
  if (err.name === "PasswordRequired") return res.status(400).json({ message: `Password is required` });
  if (err.name === "InvalidToken" || err.name === "JsonWebTokenError") return res.status(401).json({ message: `Invalid Token` });
  if (err.name === "Forbidden") return res.status(403).json({ message: `You are not authorized to this action` });
  if (err.name === "NotFound") return res.status(404).json({ message: `Not found` });
  return res.status(500).json({ message: `Internal server error` });
};

module.exports = errorHandler;
