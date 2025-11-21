import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

export interface Auth0Request extends Request {
  userId?: string;
  user?: any;
  auth0Id?: string;
}

// Cache para las claves públicas de Auth0
let cachedKeys: any = null;
let keysExpiration = 0;

/**
 * Obtener las claves públicas de Auth0
 */
async function getAuth0PublicKeys() {
  const now = Date.now();
  
  // Si tenemos claves en caché y no han expirado, usarlas
  if (cachedKeys && keysExpiration > now) {
    return cachedKeys;
  }

  try {
    const domain = process.env.AUTH0_DOMAIN;
    const response = await axios.get(`https://${domain}/.well-known/jwks.json`);
    
    // Caché las claves por 24 horas
    cachedKeys = response.data;
    keysExpiration = now + 24 * 60 * 60 * 1000;
    
    return cachedKeys;
  } catch (error) {
    console.error('Error fetching Auth0 public keys:', error);
    throw new Error('Failed to fetch Auth0 public keys');
  }
}

/**
 * Obtener la clave pública específica para verificar el token
 */
function getKeyFromHeader(header: any, keys: any) {
  if (!header || !header.kid) {
    throw new Error('No key ID found in token header');
  }

  const key = keys.keys.find((k: any) => k.kid === header.kid);
  
  if (!key) {
    throw new Error('Unable to find a signing key that matches');
  }

  if (key.kty !== 'RSA' || !key.x5c || key.x5c.length === 0) {
    throw new Error('Invalid key type');
  }

  const cert = `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`;
  return cert;
}

/**
 * Middleware para verificar token de Auth0
 */
export const auth0Middleware = async (
  req: Auth0Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Obtener claves públicas de Auth0
    const keys = await getAuth0PublicKeys();

    // Decodificar el token sin verificación primero para obtener el header
    const decodedHeader = jwt.decode(token, { complete: true }) as any;
    
    if (!decodedHeader) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Obtener la clave pública
    const key = getKeyFromHeader(decodedHeader.header, keys);

    // Verificar el token usando la clave pública
    const verified = jwt.verify(token, key, {
      algorithms: ['RS256'],
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    }) as any;

    // Extraer información del usuario
    req.userId = verified.sub; // Auth0 usa 'sub' como identificador único
    req.auth0Id = verified.sub;
    req.user = {
      id: verified.sub,
      email: verified.email,
      name: verified.name,
      picture: verified.picture,
      sub: verified.sub,
    };

    next();
  } catch (error: any) {
    console.error('Auth0 verification error:', error.message);
    return res.status(401).json({ 
      message: 'Invalid or expired token',
      error: error.message 
    });
  }
};

/**
 * Middleware opcional - permite requests sin token pero enriquece req si está presente
 */
export const optionalAuth0Middleware = async (
  req: Auth0Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continuar sin token
    }

    const token = authHeader.substring(7);
    const keys = await getAuth0PublicKeys();
    const decodedHeader = jwt.decode(token, { complete: true }) as any;
    
    if (!decodedHeader) {
      return next(); // Continuar sin autenticación
    }

    const key = getKeyFromHeader(decodedHeader.header, keys);
    const verified = jwt.verify(token, key, {
      algorithms: ['RS256'],
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    }) as any;

    req.userId = verified.sub;
    req.auth0Id = verified.sub;
    req.user = verified;
    
  } catch (error) {
    console.warn('Optional Auth0 verification failed, continuing without auth');
  }

  next();
};

/**
 * Middleware para roles específicos
 */
export const auth0RoleMiddleware = (allowedRoles: string[]) => {
  return (req: Auth0Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user['https://parqueadero.app/roles']) {
      return res.status(403).json({ message: 'No roles found' });
    }

    const userRoles = req.user['https://parqueadero.app/roles'];
    const hasRole = userRoles.some((role: string) => allowedRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};
