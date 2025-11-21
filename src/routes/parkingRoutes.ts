import { Router } from 'express';
import { ParkingController } from '../controllers/ParkingController';

export function createParkingRoutes(parkingController: ParkingController): Router {
  const router = Router();

  router.post('/entry', (req, res) => parkingController.registerEntry(req, res));
  router.post('/exit/:sessionId', (req, res) => parkingController.registerExit(req, res));
  router.post('/exit-by-plate', (req, res) => parkingController.registerExitByPlate(req, res));
  router.get('/active', (req, res) => parkingController.getActiveSessions(req, res));
  router.get('/by-plate/:plate', (req, res) => parkingController.getSessionsByPlate(req, res));

  return router;
}
