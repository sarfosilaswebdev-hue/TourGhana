import { Router } from "express";
import { requireClerkAuth } from "../middleware/requireAuth.middleware";
import { registerUserOrLogin } from "../controllers/auth.controller";
const router = Router();

router.get('/me',requireClerkAuth,registerUserOrLogin)

export default router;