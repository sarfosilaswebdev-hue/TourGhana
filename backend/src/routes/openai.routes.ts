import { Router } from "express";
import {
  generateChatResponse,
  getConversations,
  deleteMessage,
  deleteAllChats,
} from "../controllers/openai.controller";

const router = Router();

router.post("/chat", generateChatResponse);
router.get("/conversations", getConversations);
router.delete("/messages/:messageId", deleteMessage);
router.delete("/conversations", deleteAllChats);

export default router;
