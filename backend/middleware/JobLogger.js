// middleware/jobLogger.js
module.exports = (req, res, next) => {
  console.log(`Job route accessed: ${req.method} ${req.url}`);
  next();
};
