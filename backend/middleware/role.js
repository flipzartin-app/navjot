// Usage: authorize('admin'), authorize('admin', 'instructor')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Access denied: requires role [${roles.join(', ')}]`);
  }
  next();
};

module.exports = { authorize };
