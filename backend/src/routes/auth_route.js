import express from "express";
import { signup } from "../controllers/auth_controller.js";

const router = express.Router();
export default router;


router.post("/signup", signup);
router.get("/login", (req, res) => {
  res.send("Login endpoint");
});
router.get("/logout", (req, res) => {
  res.send("Logout endpoint");
});
