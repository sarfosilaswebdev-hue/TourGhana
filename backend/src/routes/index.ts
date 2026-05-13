import { Router } from "express";
import userRoutes from "./user.routes";
import destinationRoutes from "./destination.routes";
import openaiRoutes from "./openai.routes";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

router.use("/user", userRoutes);
router.use('/destinations',destinationRoutes)
router.use('/openai', openaiRoutes)


export default router;