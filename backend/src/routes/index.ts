import { Router } from "express";
import userRoutes from "./user.routes";
import destinationRoutes from "./destination.routes";
import openaiRoutes from "./openai.routes";
import bookingRoutes from "./booking.routes";
import reviewRoutes from "./reviews.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

router.use("/user", userRoutes);
router.use('/destinations',destinationRoutes)
router.use('/openai', openaiRoutes)
router.use("/bookings", bookingRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admin", adminRoutes);

export default router;