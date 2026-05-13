import { getAuth } from "@clerk/express";
import type { Role } from "@prisma/client";
import type { Request, Response, NextFunction } from "express";
import AuthError from "../errors/AuthError";
import { prisma } from "../config/prisma";
import NotFoundError from "../errors/NotFoundError";
import ForbiddenError from "../errors/ForbiddenError";

export const requireRole =
  (...allowedRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = getAuth(req);
    if (!userId) throw new AuthError("User not Authenticated");
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) throw new NotFoundError("User");

    if (!allowedRoles.includes(user.role)) throw new ForbiddenError();

    (req as any).user = user;
    next();
  };
