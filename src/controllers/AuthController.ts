import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthRequest } from '../middlewares/authMiddleware';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    try {
      const { email, fullName, password, phone, company } = req.body;

      // Validar campos requeridos
      if (!email || !fullName || !password) {
        return res.status(400).json({ 
          error: 'Email, nombre completo y contraseña son requeridos' 
        });
      }

      const user = await this.authService.register(email, fullName, password, phone, company);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email y contraseña son requeridos' 
        });
      }

      const { user, token } = await this.authService.login(email, password);

      res.json({
        message: 'Inicio de sesión exitoso',
        token,
        user,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const user = await this.authService.getUserById(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateUser(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { fullName, phone, company, password } = req.body;

      const updateData: any = {};
      if (fullName) updateData.fullName = fullName;
      if (phone) updateData.phone = phone;
      if (company) updateData.company = company;
      if (password) updateData.passwordHash = password;

      const user = await this.authService.updateUser(req.userId, updateData);

      res.json({
        message: 'Usuario actualizado exitosamente',
        user,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async validateToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(400).json({ valid: false, error: 'Token no proporcionado' });
      }

      const decoded = await this.authService.validateToken(token);

      res.json({
        valid: true,
        user: decoded,
      });
    } catch (error: any) {
      res.status(401).json({ 
        valid: false, 
        error: error.message 
      });
    }
  }
}
