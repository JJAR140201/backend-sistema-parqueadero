import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  private userRepository: any;

  constructor(dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
  }

  async register(email: string, fullName: string, password: string, phone?: string, company?: string): Promise<User> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('El correo ya está registrado');
    }

    // Hash del password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    const user = this.userRepository.create({
      email,
      fullName,
      passwordHash,
      phone,
      company,
      role: 'admin', // Por defecto admin
      isActive: true,
    });

    await this.userRepository.save(user);
    
    // No devolver el password
    delete (user as any).passwordHash;
    return user;
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    if (!user.isActive) {
      throw new Error('Este usuario ha sido desactivado');
    }

    // Verificar password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // No devolver el password
    delete (user as any).passwordHash;
    
    return { user, token };
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Si se intenta cambiar la contraseña
    if (data.passwordHash) {
      const salt = await bcrypt.genSalt(10);
      data.passwordHash = await bcrypt.hash(data.passwordHash, salt);
    }

    Object.assign(user, data);
    await this.userRepository.save(user);

    delete (user as any).passwordHash;
    return user;
  }

  async validateToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      return decoded;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }
}
