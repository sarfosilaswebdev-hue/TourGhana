import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth.middleware";
import {
  deleteBookingAdmin,
  deleteReview,
  deleteUser,
  getAllBookings,
  getAllReviews,
  getAllUsers,
  getStats,
  updateBookingStatus,
} from "../controllers/admin.controller";

const router = Router();

// All admin routes require admin key
router.use(adminAuth);

router.get("/stats", getStats);

router.get("/bookings", getAllBookings);
router.patch("/bookings/:id/status", updateBookingStatus);
router.delete("/bookings/:id", deleteBookingAdmin);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);

export default router;
