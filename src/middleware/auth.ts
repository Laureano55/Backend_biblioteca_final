import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../middleware/jwt";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = header.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
}
