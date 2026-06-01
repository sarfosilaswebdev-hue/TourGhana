import prisma from "../config/db.config";
import { catchAsync } from "../utils/catchAsync";

export const getStats = catchAsync(async (req, res) => {
  const [
    totalDestinations,
    totalBookings,
    totalUsers,
    totalReviews,
    pendingBookings,
  ] = await Promise.all([
    prisma.destination.count(),
    prisma.booking.count(),
    prisma.user.count(),
    prisma.review.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      totalDestinations,
      totalBookings,
      totalUsers,
      totalReviews,
      pendingBookings,
    },
  });
});

export const getAllBookings = catchAsync(async (req, res) => {
  const page = (req.query.page as string) ?? "1";
  const limit = (req.query.limit as string) ?? "20";
  const status = req.query.status as string | undefined;
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNumber - 1) * pageSize;

  const where: any = {};
  if (status) where.status = status;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        destination: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  res.status(200).json({
    status: "success",
    results: bookings.length,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / pageSize),
    data: bookings,
  });
});

export const updateBookingStatus = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status } = req.body;

  if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
    return res.status(400).json({ status: "fail", message: "Invalid status" });
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return res.status(404).json({ status: "fail", message: "Booking not found" });

  const updated = await prisma.booking.update({
    where: { id },
    data: { status },
    include: { destination: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });

  res.status(200).json({ status: "success", data: updated });
});

export const deleteBookingAdmin = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return res.status(404).json({ status: "fail", message: "Booking not found" });

  await prisma.booking.delete({ where: { id } });
  res.status(200).json({ status: "success", message: "Booking deleted" });
});

export const getAllUsers = catchAsync(async (req, res) => {
  const page = (req.query.page as string) ?? "1";
  const limit = (req.query.limit as string) ?? "20";
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNumber - 1) * pageSize;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { bookings: true } },
      },
    }),
    prisma.user.count(),
  ]);

  res.status(200).json({
    status: "success",
    results: users.length,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / pageSize),
    data: users,
  });
});

export const deleteUser = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ status: "fail", message: "User not found" });

  await prisma.user.delete({ where: { id } });
  res.status(200).json({ status: "success", message: "User deleted" });
});

export const getAllReviews = catchAsync(async (req, res) => {
  const page = (req.query.page as string) ?? "1";
  const limit = (req.query.limit as string) ?? "20";
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNumber - 1) * pageSize;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        destination: { select: { id: true, name: true } },
      },
    }),
    prisma.review.count(),
  ]);

  res.status(200).json({
    status: "success",
    results: reviews.length,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / pageSize),
    data: reviews,
  });
});

export const deleteReview = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return res.status(404).json({ status: "fail", message: "Review not found" });

  await prisma.review.delete({ where: { id } });
  res.status(200).json({ status: "success", message: "Review deleted" });
});
