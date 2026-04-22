import express from "express";
import {
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  getChatPartners,
} from "../controllers/message_controller.js";
import { protectRoute } from "../middleware/auth_middleware.js";
import { arcjetProtection } from "../middleware/arcjet_middleware.js";

const router = express.Router();

router.use(arcjetProtection,protectRoute);  // requests rate limited then authenticated

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

export default router;
