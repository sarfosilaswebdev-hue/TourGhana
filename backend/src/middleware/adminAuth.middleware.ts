import { Request, Response, NextFunction } from "express";

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers["x-admin-key"];
  if (!key || key !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ status: "fail", message: "Forbidden" });
  }
  next();
};
