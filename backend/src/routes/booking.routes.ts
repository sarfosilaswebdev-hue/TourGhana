// routes/booking.routes.ts
import { Router } from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  deleteBooking,
} from "../controllers/booking.controller";

const router = Router();

// Remove requireAuth() middleware — auth is handled inside each controller
router.post("/", createBooking);
router.get("/", getUserBookings);
router.get("/:id", getBookingById);
router.patch("/:id/cancel", cancelBooking);
router.delete("/:id", deleteBooking);

export default router;