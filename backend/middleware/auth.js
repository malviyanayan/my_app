const jwt = require('jsonwebtoken');
const SECRET = "mysecretkey";

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "No token provided" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    console.log("Authorization error:", err.message);
    
    // Provide specific error messages
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: "Token expired" });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: "Invalid token" });
    } else {
      return res.status(401).json({ success: false, message: "Authentication failed" });
    }
  }
};

module.exports = authMiddleware;
