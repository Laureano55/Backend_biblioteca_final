import { Request, Response, NextFunction } from "express";
import { UserPermission } from "../models/user.model";

export function requirePermission(permissionOrPermissions: UserPermission | UserPermission[]) {
  const allowed = Array.isArray(permissionOrPermissions) ? permissionOrPermissions : [permissionOrPermissions];

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const has = req.user.permisos.some((p: UserPermission) => allowed.includes(p));

    if (!has) {
      return res.status(403).json({ message: "Permiso denegado" });
    }

    next();
  };
}
