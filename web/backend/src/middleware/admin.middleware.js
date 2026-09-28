const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const allowedRoles = ["admin", "operator"];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Administrator privileges are required",
    });
  }

  next();
};

export default adminMiddleware;