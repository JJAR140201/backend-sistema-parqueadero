import { Router } from 'express';
import { ClientController } from '../controllers/ClientController';

export function createClientRoutes(clientController: ClientController): Router {
  const router = Router();

  router.post('/', (req, res) => clientController.createClient(req, res));
  router.get('/document/:document', (req, res) => clientController.getClientByDocument(req, res));
  router.get('/:clientId', (req, res) => clientController.getClientById(req, res));
  router.get('/', (req, res) => clientController.getAllClients(req, res));
  router.get('/monthly-only', (req, res) => clientController.getMonthlyClients(req, res));
  router.put('/:clientId', (req, res) => clientController.updateClient(req, res));
  router.delete('/:clientId', (req, res) => clientController.deactivateClient(req, res));

  return router;
}
