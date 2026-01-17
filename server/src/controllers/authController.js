import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * Creates a JWT for the user
 * Encrypts the User ID into a string that expires in 7 days
 */
function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

/**
 * Cookie Configuration
 * httpOnly prevents browser scripts from stealing the token ,XSS protection.
 * sameSite prevents other websites from using your login ,CSRF protection.
 */
const cookieOptions = {
  httpOnly: true,     // Secure JS cannot touch this cookie
  secure: false,      // Set to true in production requires HTTPS
  sameSite: "strict", // CSRF protection
  maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
};

export async function register(req, res) {
  try {
    const { email, password } = req.body;

    // Validation checks
    if (!email || !password) return res.status(400).json({ message: "Required fields missing" });
    if (password.length < 8) return res.status(400).json({ message: "Password too short" });

    // Check for duplicates
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email already exists" });

    // Hash the password: Never store raw passwords in the database!
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email: email.toLowerCase(), passwordHash });

    // Generate token and drop it into a secure cookie
    const token = signToken(user._id.toString());
    res.cookie("token", token, cookieOptions);

    return res.status(201).json({ user: { id: user._id, email: user.email } });
  } catch (err) {
    return res.status(500).json({ message: "Error creating user" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user manually include the password hash for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Compare typed password with the hashed version in the DB
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // Set the cookie so the browser remembers the user
    const token = signToken(user._id.toString());
    res.cookie("token", token, cookieOptions);

    return res.json({ user: { id: user._id, email: user.email } });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }
}

export const logout = (req, res) => {
  // Tell the browser to delete the token cookie immediately
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/" 
  });
  return res.status(200).json({ message: "Logged out" });
};