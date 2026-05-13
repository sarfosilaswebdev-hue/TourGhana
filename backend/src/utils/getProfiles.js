import prisma from "../config/prismaConfig.js";
import AppError from "../errors/AppError.js";
import AuthError from "../errors/AuthError.js";
import { catchAsync } from "./catchAsync.js";

export const getBuyerById = async (userId) => {
  if (!userId) return undefined;

  const buyer = await prisma.buyerProfile.findUnique({
    where: { userId },
  });
  return buyer;
};

export const getSellerById = async (userId) => {
  if (!userId) return undefined;

  const vendor = getVendorById(userId);

  if (!vendor) return undefined;
  const seller = await prisma.sellerProfile.findUnique({
    where: { vendorId: vendor.id },
  });
  return seller;
};

export const getVendorById = async (userId) => {
  if (!userId) return undefined;
  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId },
  });
  return vendor;
};

export const getDeliveryAgentById = async (userId) => {
  if (!userId) return undefined;
  const deliveryAgent = await prisma.deliveryProfile.findUnique({
    where: { userId },
  });
  return deliveryAgent;
};

export const getStoreById = async (userId)=>{
    if (!userId) return undefined;
    const vendor = await getVendorById(userId);
    if (!vendor) return undefined;
    const seller = await prisma.sellerProfile.findUnique({
        where: { vendorId: vendor.id },
    });
    const store = await prisma.store.findUnique({
        where: { sellerId: seller.id },
    });
    return store;
}
