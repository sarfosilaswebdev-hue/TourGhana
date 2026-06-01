import { Router } from "express";
import {
  addToFavorites,
  createDestination,
  deleteDestination,
  getAllDestinations,
  getDestinationByCategory,
  getDestinationById,
  getUserFavorites,
  removeFromFavorites,
  updateDestination,
} from "../controllers/destinations.controller";
import { adminAuth } from "../middleware/adminAuth.middleware";

const router = Router();

// GET /destinations
router.get("/", getAllDestinations);

// GET /destinations/category/:category
router.get("/category/:category", getDestinationByCategory);

// POST /destinations
router.post("/", createDestination);

// Favorites
router.post("/favorite/:destinationId", addToFavorites);

router.delete("/favorite/:destinationId", removeFromFavorites);

// GET /destinations/favorites
router.get("/favorites", getUserFavorites);

// GET /destinations/:id
router.get("/:id", getDestinationById);

// PUT /destinations/:id  (admin only)
router.put("/:id", adminAuth, updateDestination);

// DELETE /destinations/:id  (admin only)
router.delete("/:id", adminAuth, deleteDestination);

export default router;