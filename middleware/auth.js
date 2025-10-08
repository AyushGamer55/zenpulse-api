// middleware/auth.js
import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "Missing auth token" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing auth token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: userId }
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

export default auth;
