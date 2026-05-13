import { Router } from "express";
import {
  generateChatResponse,
  getConversations,
} from "../controllers/openai.controller";

const router = Router();

router.post("/chat", generateChatResponse);
router.get("/conversations", getConversations);

export default router;
