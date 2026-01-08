import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "JWT_SECRET not configured" });

    const payload = jwt.verify(token, secret);
    req.userId = payload.sub; // we used { sub: userId }
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

