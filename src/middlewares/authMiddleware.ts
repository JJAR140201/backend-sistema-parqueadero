import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No autorizado - Token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    req.userId = decoded.id;
    req.user = decoded;

    next();
  } catch (error: any) {
    return res.status(401).json({ error: 'Token inválido o expirado', details: error.message });
  }
};

export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      req.userId = decoded.id;
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Si el token es inválido, continuamos sin autenticación
    next();
  }
};

// Middleware para verificar rol específico
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso' });
    }
    next();
  };
};
