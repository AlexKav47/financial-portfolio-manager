import jwt from "jsonwebtoken";

/**
 * Runs before controllers like getPortfolioSummary
 * It stops unauthorized users before they can see any sensitive data
 */
export function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // If the token was tampered with or expired, jwt.verify will throw an error
    const secret = process.env.JWT_SECRET;
    const payload = jwt.verify(token, secret);
    
    // Takes the users ID out of the token and puts it onto the req object
    // Allows the next function to know exactly which user is asking for data
    req.userId = payload.sub; 
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

