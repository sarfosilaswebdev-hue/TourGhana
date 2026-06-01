import { getAuth } from "@clerk/express";
import prisma from "../config/db.config";
import { catchAsync } from "../utils/catchAsync";
import NotFoundError from "../errors/NotFoundError";

export const createBooking = catchAsync(async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId)
    return res.status(401).json({ status: "fail", message: "Unauthorized" });

  const {
    destinationId,
    tourDate,
    groupSize,
    fullName,
    email,
    phone,
    specialRequest,
  } = req.body;

  if (
    !destinationId ||
    !tourDate ||
    !groupSize ||
    !fullName ||
    !email ||
    !phone
  ) {
    return res
      .status(400)
      .json({ status: "fail", message: "Missing required fields" });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new NotFoundError("User");

  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
  });
  if (!destination) throw new NotFoundError("Destination");

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      destinationId,
      tourDate: new Date(tourDate),
      groupSize: parseInt(groupSize),
      fullName,
      email,
      phone,
      specialRequest,
    },
    include: { destination: true },
  });

  res.status(201).json({ status: "success", data: booking });
});

export const getUserBookings = catchAsync(async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId)
    return res.status(401).json({ status: "fail", message: "Unauthorized" });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new NotFoundError("User");

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { destination: true },
    orderBy: { createdAt: "desc" },
  });

  res
    .status(200)
    .json({ status: "success", results: bookings.length, data: bookings });
});

export const getBookingById = catchAsync(async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId)
    return res.status(401).json({ status: "fail", message: "Unauthorized" });

  const { id: idParam } = req.params;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new NotFoundError("User");

  const booking = await prisma.booking.findFirst({
    where: { id, userId: user.id },
    include: { destination: true },
  });

  if (!booking)
    return res
      .status(404)
      .json({ status: "fail", message: "Booking not found" });

  res.status(200).json({ status: "success", data: booking });
});

export const deleteBooking = catchAsync(async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId)
    return res.status(401).json({ status: "fail", message: "Unauthorized" });

  const { id: idParam } = req.params;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new NotFoundError("User");

  const booking = await prisma.booking.findFirst({ where: { id, userId: user.id } });
  if (!booking)
    return res.status(404).json({ status: "fail", message: "Booking not found" });

  await prisma.booking.delete({ where: { id } });

  res.status(200).json({ status: "success", message: "Booking deleted" });
});

export const cancelBooking = catchAsync(async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId)
    return res.status(401).json({ status: "fail", message: "Unauthorized" });

  const { id: idParam } = req.params;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new NotFoundError("User");

  const booking = await prisma.booking.findFirst({
    where: { id, userId: user.id },
  });
  if (!booking)
    return res
      .status(404)
      .json({ status: "fail", message: "Booking not found" });

  if (booking.status === "CANCELLED") {
    return res
      .status(400)
      .json({ status: "fail", message: "Booking already cancelled" });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: { destination: true },
  });

  res.status(200).json({ status: "success", data: updated });
});
