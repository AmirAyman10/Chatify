import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
} from "../controllers/auth_controller.js";
import { protectRoute } from "../middleware/auth_middleware.js";

const router = express.Router();
export default router;

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, (req, res) =>res.status(200).json(req.user));

