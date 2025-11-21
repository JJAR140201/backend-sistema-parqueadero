import { Router } from 'express';
import { ClientController } from '../controllers/ClientController';
import { authMiddleware } from '../middlewares/authMiddleware';

export function createClientRoutes(clientController: ClientController): Router {
  const router = Router();

  router.post('/', authMiddleware, (req, res) => clientController.createClient(req as any, res));
  router.get('/document/:document', authMiddleware, (req, res) => clientController.getClientByDocument(req as any, res));
  router.get('/:clientId', authMiddleware, (req, res) => clientController.getClientById(req as any, res));
  router.get('/', authMiddleware, (req, res) => clientController.getAllClients(req as any, res));
  router.get('/monthly-only', authMiddleware, (req, res) => clientController.getMonthlyClients(req as any, res));
  router.put('/:clientId', authMiddleware, (req, res) => clientController.updateClient(req as any, res));
  router.delete('/:clientId', authMiddleware, (req, res) => clientController.deactivateClient(req as any, res));

  return router;
}
