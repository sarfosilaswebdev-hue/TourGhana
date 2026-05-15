import { getAuth } from "@clerk/express";
import prisma from "../config/db.config";
import { catchAsync } from "../utils/catchAsync";
import NotFoundError from "../errors/NotFoundError";

export const getAllDestinations = catchAsync(async (req, res) => {
  const { category, tag, search, page = "1", limit = "10" } = req.query;

  // Pagination
  const pageNumber = parseInt(page as string);
  const pageSize = parseInt(limit as string);
  const skip = (pageNumber - 1) * pageSize;

  // Build filters
  const where: any = {};

  // Filter by category
  if (category) {
    if (category === "All") {
      // No category filter
    } else if (typeof category === "string") {
      where.category = category;
    }
  }

  // Filter by tag (array contains)
  if (tag) {
    where.tags = {
      has: tag,
    };
  }

  // Search (name + description + tags)
  if (search && search !== "") {
    const searchTerm = (search as string).toLowerCase();

    // Your known tags (keep this centralized later)
    const ALL_TAGS = [
      "beach",
      "forest",
      "wildlife",
      "nature",
      "relax",
      "hiking",
      "adventure",
      "culture",
      "history",
      "mountain",
      "lake",
      "waterfall",
      "museum",
      "nightlife",
    ];

    // Find partial matches in tags
    const matchedTags = ALL_TAGS.filter((tag) => tag.includes(searchTerm));

    where.OR = [
      {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      ...(matchedTags.length > 0
        ? [
            {
              tags: {
                hasSome: matchedTags,
              },
            },
          ]
        : []),
    ];
  }

  // Query DB
  const [destinations, total] = await Promise.all([
    prisma.destination.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.destination.count({ where }),
  ]);

  res.status(200).json({
    status: "success",
    results: destinations.length,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / pageSize),
    destinations,
  });
});

export const getDestinationById = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    return res.status(400).json({
      status: "fail",
      message: "Destination ID is required",
    });
  }

  const destination = await prisma.destination.findUnique({
    where: { id },
  });

  if (!destination) {
    return res.status(404).json({
      status: "fail",
      message: "Destination not found",
    });
  }

  res.status(200).json({
    status: "success",
    destination,
  });
});

export const getDestinationByCategory = catchAsync(async (req, res) => {
  const { category } = req.query;
  const categoryValue = Array.isArray(category) ? category[0] : category;

  if (!categoryValue || typeof categoryValue !== "string") {
    return res.status(400).json({
      status: "fail",
      message: "Category is required",
    });
  }

  const destinations = await prisma.destination.findMany({
    where: {
      category: categoryValue.toUpperCase() as any,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    status: "success",
    results: destinations.length,
    data: destinations,
  });
});

export const createDestination = catchAsync(async (req, res) => {
  const {
    name,
    description,
    region,
    category,
    latitude,
    longitude,
    rating,
    tags,
    images,
  } = req.body;

  const destination = await prisma.destination.create({
    data: {
      name,
      description,
      region,
      category,
      latitude,
      longitude,
      rating,
      tags,
      images,
    },
  });

  res.status(201).json({
    status: "success",
    data: destination,
  });
});

export const addToFavorites = catchAsync(async (req, res) => {
  const destinationId = Array.isArray(req.params.destinationId)
    ? req.params.destinationId[0]
    : req.params.destinationId;

  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({
      status: "fail",
      message: "Unauthorized",
    });
  }

  if (!destinationId) {
    return res.status(400).json({
      status: "fail",
      message: "Destination ID is required",
    });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  // Check if favorite already exists
  const existingFavorite = await prisma.favorite.findFirst({
    where: {
      userId: user.id,
      destinationId,
    },
  });

  // If exists -> remove from favorites
  if (existingFavorite) {
    await prisma.favorite.delete({
      where: {
        id: existingFavorite.id,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Removed from favorites",
      isFavorite: false,
    });
  }

  // Otherwise -> add to favorites
  const favorite = await prisma.favorite.create({
    data: {
      userId: user.id,
      destinationId,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Added to favorites",
    isFavorite: true,
    data: favorite,
  });
});

export const removeFromFavorites = catchAsync(async (req, res) => {
  const destinationId = Array.isArray(req.params.destinationId)
    ? req.params.destinationId[0]
    : req.params.destinationId;
  const { userId: clerkId } = getAuth(req);
  if (!clerkId)
    return res.status(401).json({ status: "fail", message: "Unauthorized" });
  if (!destinationId) {
    return res.status(400).json({
      status: "fail",
      message: "Destination ID is required",
    });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkId },
  });
  if (!user) {
    throw new NotFoundError("User");
  }
  await prisma.favorite.deleteMany({
    where: {
      userId: user.id,
      destinationId,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Removed from favorites",
  });
});

export const getUserFavorites = catchAsync(async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  console.log("Getting favorites for user:", clerkId);
  if (!clerkId)
    return res.status(401).json({ status: "fail", message: "Unauthorized" });

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkId },
  });
  if (!user) {
    throw new NotFoundError("User");
  }
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      destination: true,
    },
  });

  res.status(200).json({
    status: "success",
    results: favorites.length,
    data: favorites.map((fav) => fav.destination),
  });
});
