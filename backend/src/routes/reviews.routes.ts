import { Router } from "express";
import {
  createOrUpdateReview,
  getUserReviews,
  getDestinationReviews,
  deleteReview,
} from "../controllers/reviews.controller";

const router = Router();

router.post("/", createOrUpdateReview);
router.get("/my", getUserReviews);
router.get("/", getDestinationReviews);
router.delete("/:id", deleteReview);

export default router;
