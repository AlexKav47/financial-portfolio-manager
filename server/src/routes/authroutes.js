import { Router } from "express";
import { register, login, logout} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({ 
    authenticated: true, 
    userId: req.userId 
  });
});

export default router;

