import jwt from "jsonwebtoken";

export function auth(requiredRole = null) {
  return (req, res, next) => {
    try {
      // Get the token from the 'Authorization' header
      const authHeader = req.headers.authorization || "";
      if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization header is missing or malformed" });
      }
      const token = authHeader.slice(7); // Remove "Bearer " prefix

      if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
      }

      // Verify the token using our secret key
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to the request for later use
      req.user = payload; // payload will contain { id, role }

      // --- THIS IS OUR NEW DEBUGGING LINE ---
      console.log(`DEBUG: Comparing payload role: '${payload.role}' against required role: '${requiredRole}'`);
      // ------------------------------------

      // If a specific role is required, check it
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ message: "Forbidden: You do not have the required role." });
      }

      // If everything is okay, proceed to the next function (the actual route handler)
      next();
    } catch (e) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  };
}