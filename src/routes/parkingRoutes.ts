import { Router } from 'express';
import { ParkingController } from '../controllers/ParkingController';
import { authMiddleware } from '../middlewares/authMiddleware';

export function createParkingRoutes(parkingController: ParkingController): Router {
  const router = Router();

  // Todas las rutas requieren autenticación
  router.post('/entry', authMiddleware, (req, res) => parkingController.registerEntry(req as any, res));
  router.post('/exit/:sessionId', authMiddleware, (req, res) => parkingController.registerExit(req as any, res));
  router.post('/exit-by-plate', authMiddleware, (req, res) => parkingController.registerExitByPlate(req as any, res));
  router.get('/active', authMiddleware, (req, res) => parkingController.getActiveSessions(req as any, res));
  router.get('/all', authMiddleware, (req, res) => parkingController.getAllSessions(req as any, res));
  router.get('/by-plate/:plate', authMiddleware, (req, res) => parkingController.getSessionsByPlate(req as any, res));

  return router;
}
