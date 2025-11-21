import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/authMiddleware';

export const createAuthRoutes = (authController: AuthController) => {
  const router = Router();

  // Rutas públicas
  router.post('/register', (req, res) => authController.register(req, res));
  router.post('/login', (req, res) => authController.login(req, res));
  router.post('/validate-token', (req, res) => authController.validateToken(req, res));

  // Rutas protegidas
  router.get('/me', authMiddleware, (req, res) => authController.getCurrentUser(req as any, res));
  router.put('/me', authMiddleware, (req, res) => authController.updateUser(req as any, res));

  return router;
};
