import { getAuth } from "@clerk/express";
import prisma from "../config/db.config";
import { catchAsync } from "../utils/catchAsync";
import NotFoundError from "../errors/NotFoundError";

export const getAllDestinations = catchAsync(async (req, res) => {
  const { category, tag, search, page = "1", limit = "10" } = req.query;
  const { userId: clerkId } = getAuth(req);

  const pageNumber = parseInt(page as string);
  const pageSize = parseInt(limit as string);
  const skip = (pageNumber - 1) * pageSize;

  const where: any = {};

  if (category && category !== "All") {
    where.category = category;
  }

  if (tag) {
    where.tags = { has: tag };
  }

  if (search && search !== "") {
    const searchTerm = (search as string).toLowerCase();

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

    const matchedTags = ALL_TAGS.filter((t) =>
      t.includes(searchTerm)
    );

    where.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
      ...(matchedTags.length > 0
        ? [{ tags: { hasSome: matchedTags } }]
        : []),
    ];
  }

  // Get logged-in user
  let user = null;

  if (clerkId) {
    user = await prisma.user.findUnique({
      where: { clerkId },
    });
  }

  const [destinations, total] = await Promise.all([
    prisma.destination.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        favorites: user
          ? {
              where: {
                userId: user.id,
              },
              select: {
                id: true,
              },
            }
          : false,
      },
    }),

    prisma.destination.count({ where }),
  ]);

  const formattedDestinations = destinations.map(
    ({ favorites, ...destination }) => ({
      ...destination,
      isFavorite: favorites?.length > 0,
    })
  );

  res.status(200).json({
    status: "success",
    results: formattedDestinations.length,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / pageSize),
    destinations: formattedDestinations,
  });
});

export const getDestinationById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId: clerkId } = getAuth(req);

  const destinationId = Array.isArray(id) ? id[0] : id;

  if (!destinationId) {
    return res.status(400).json({
      status: "fail",
      message: "Destination ID is required",
    });
  }

  let user = null;

  if (clerkId) {
    user = await prisma.user.findUnique({
      where: { clerkId },
    });
  }

  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
    include: {
      favorites: user
        ? {
            where: {
              userId: user.id,
            },
            select: {
              id: true,
            },
          }
        : false,
    },
  });

  if (!destination) {
    return res.status(404).json({
      status: "fail",
      message: "Destination not found",
    });
  }

  const { favorites, ...destinationData } = destination;

  res.status(200).json({
    status: "success",
    destination: {
      ...destinationData,
      isFavorite: favorites?.length > 0,
    },
  });
});

export const getDestinationByCategory = catchAsync(async (req, res) => {
  const { category } = req.query;
  const categoryValue = Array.isArray(category) ? category[0] : category;

  if (!categoryValue || typeof categoryValue !== "string") {
    return res
      .status(400)
      .json({ status: "fail", message: "Category is required" });
  }

  const destinations = await prisma.destination.findMany({
    where: { category: categoryValue.toUpperCase() as any },
    orderBy: { createdAt: "desc" },
  });

  res
    .status(200)
    .json({
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

  res.status(201).json({ status: "success", data: destination });
});

export const addToFavorites = catchAsync(async (req, res) => {
  const rawDestinationId = req.params.destinationId;
  const destinationId = Array.isArray(rawDestinationId)
    ? rawDestinationId[0]
    : rawDestinationId;
  const destinationIdStr = typeof destinationId === "string" ? destinationId : undefined;
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ status: "fail", message: "Unauthorized" });
  }
  if (!destinationIdStr) {
    return res.status(400).json({ status: "fail", message: "Destination ID is required" });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new NotFoundError("User");

  const existingFavorite = await prisma.favorite.findFirst({
    where: { userId: user.id, destinationId: destinationIdStr },
  });

  if (existingFavorite) {
    await prisma.favorite.delete({ where: { id: existingFavorite.id } });
    return res.status(200).json({
      status: "success",
      message: "Removed from favorites",
      isFavorite: false,
    });
  }

  // FIX: include destination so the frontend gets usable data
  const favorite = await prisma.favorite.create({
    data: { userId: user.id, destinationId: destinationIdStr },
    include: { destination: true },  // <-- this line
  });

  res.status(200).json({
    status: "success",
    message: "Added to favorites",
    isFavorite: true,
    data: favorite.destination,  // <-- return destination, not raw favorite
  });
});

export const removeFromFavorites = catchAsync(async (req, res) => {
  const rawDestinationId = req.params.destinationId;
  const destinationId = Array.isArray(rawDestinationId)
    ? rawDestinationId[0]
    : rawDestinationId;
  const destinationIdStr = typeof destinationId === "string" ? destinationId : undefined;
  const { userId: clerkId } = getAuth(req);

  if (!clerkId)
    return res.status(401).json({ status: "fail", message: "Unauthorized" });
  if (!destinationIdStr)
    return res
      .status(400)
      .json({ status: "fail", message: "Destination ID is required" });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new NotFoundError("User");

  await prisma.favorite.deleteMany({
    where: { userId: user.id, destinationId: destinationIdStr },
  });

  res
    .status(200)
    .json({ status: "success", message: "Removed from favorites" });
});

export const getUserFavorites = catchAsync(async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  // FIX: removed console.log leaking clerkId
  if (!clerkId)
    return res.status(401).json({ status: "fail", message: "Unauthorized" });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new NotFoundError("User");

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { destination: true },
  });
  console.log("User favorites retrieved:", favorites);
  res.status(200).json({
    status: "success",
    results: favorites.length,
    data: favorites.map((fav) => fav.destination),
  });
});
