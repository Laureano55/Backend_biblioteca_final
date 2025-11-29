import jwt from "jsonwebtoken";


if (!process.env.JWT_SECRET) {
  throw new Error("Environment variable JWT_SECRET must be set");
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface JwtPayload {
  id: string;
  correo: string;
  permisos: string[];
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
