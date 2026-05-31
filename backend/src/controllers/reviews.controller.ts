import { getAuth } from "@clerk/express";
import prisma from "../config/db.config";
import { catchAsync } from "../utils/catchAsync";
import NotFoundError from "../errors/NotFoundError";

export const createOrUpdateReview = catchAsync(async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId)
    return res.status(401).json({ status: "fail", message: "Unauthorized" });

  const { destinationId, rating, comment } = req.body;

  if (!destinationId || !rating) {
    return res
      .status(400)
      .json({ status: "fail", message: "destinationId and rating are required" });
  }

  if (rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ status: "fail", message: "Rating must be between 1 and 5" });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new NotFoundError("User");

  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
  });
  if (!destination) throw new NotFoundError("Destination");

  const review = await prisma.review.upsert({
    where: { userId_destinationId: { userId: user.id, destinationId } },
    create: {
      userId: user.id,
      destinationId,
      rating: parseInt(rating),
      comment,
    },
    update: {
      rating: parseInt(rating),
      comment,
    },
    include: { destination: true },
  });

  res.status(200).json({ status: "success", data: review });
});

export const getUserReviews = catchAsync(async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId)
    return res.status(401).json({ status: "fail", message: "Unauthorized" });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new NotFoundError("User");

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: { destination: true },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ status: "success", data: reviews });
});

export const getDestinationReviews = catchAsync(async (req, res) => {
  const { destinationId } = req.query;

  if (!destinationId || typeof destinationId !== "string") {
    return res
      .status(400)
      .json({ status: "fail", message: "destinationId query param is required" });
  }

  const reviews = await prisma.review.findMany({
    where: { destinationId },
    include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ status: "success", data: reviews });
});

export const deleteReview = catchAsync(async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId)
    return res.status(401).json({ status: "fail", message: "Unauthorized" });

  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new NotFoundError("User");

  const review = await prisma.review.findFirst({ where: { id, userId: user.id } });
  if (!review)
    return res.status(404).json({ status: "fail", message: "Review not found" });

  await prisma.review.delete({ where: { id } });

  res.status(200).json({ status: "success", message: "Review deleted" });
});
