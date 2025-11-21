import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Importar entidades
import { User } from './entities/User';
import { Vehicle } from './entities/Vehicle';
import { Client } from './entities/Client';
import { ParkingSession } from './entities/ParkingSession';
import { Invoice } from './entities/Invoice';
import { DailyReport } from './entities/DailyReport';
import { MonthlyReport } from './entities/MonthlyReport';

// Importar servicios
import { AuthService } from './services/AuthService';
import { ParkingService } from './services/ParkingService';
import { InvoiceService } from './services/InvoiceService';
import { ReportService } from './services/ReportService';
import { ClientService } from './services/ClientService';

// Importar controladores
import { AuthController } from './controllers/AuthController';
import { ParkingController } from './controllers/ParkingController';
import { InvoiceController } from './controllers/InvoiceController';
import { ReportController } from './controllers/ReportController';
import { ClientController } from './controllers/ClientController';

// Importar rutas
import { createAuthRoutes } from './routes/authRoutes';
import { createParkingRoutes } from './routes/parkingRoutes';
import { createInvoiceRoutes } from './routes/invoiceRoutes';
import { createReportRoutes } from './routes/reportRoutes';
import { createClientRoutes } from './routes/clientRoutes';

dotenv.config();

// Detectar entorno
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development' || !isProduction;

// Configurar DataSource según el entorno
const getDataSourceConfig = () => {
  if (isProduction || process.env.DATABASE_URL) {
    // PostgreSQL en producción (Railway/Heroku)
    return {
      type: 'postgres' as const,
      url: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      synchronize: isDevelopment,
      logging: isDevelopment,
      entities: [User, Vehicle, Client, ParkingSession, Invoice, DailyReport, MonthlyReport],
    };
  }
  
  // SQLite en desarrollo
  return {
    type: 'sqlite' as const,
    database: './parqueadero.db',
    synchronize: true,
    logging: false,
    entities: [User, Vehicle, Client, ParkingSession, Invoice, DailyReport, MonthlyReport],
  };
};

const AppDataSource = new DataSource(getDataSourceConfig());

// Inicializar aplicación
const app = express();

// Configurar CORS - Permitir todos los orígenes
const corsOptions = {
  origin: true, // Permitir cualquier origen
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Inicializar base de datos y rutas
AppDataSource.initialize()
  .then(() => {
    console.log('✓ Database initialized successfully');

    // Instanciar servicios
    const authService = new AuthService(AppDataSource);

    const parkingService = new ParkingService(
      AppDataSource.getRepository(ParkingSession),
      AppDataSource.getRepository(Vehicle),
      AppDataSource.getRepository(Client)
    );

    const invoiceService = new InvoiceService(
      AppDataSource.getRepository(Invoice),
      AppDataSource.getRepository(ParkingSession),
      AppDataSource.getRepository(Client)
    );

    const reportService = new ReportService(
      AppDataSource.getRepository(DailyReport),
      AppDataSource.getRepository(MonthlyReport),
      AppDataSource.getRepository(ParkingSession)
    );

    const clientService = new ClientService(
      AppDataSource.getRepository(Client)
    );

    // Instanciar controladores
    const authController = new AuthController(authService);
    const parkingController = new ParkingController(parkingService);
    const invoiceController = new InvoiceController(invoiceService);
    const reportController = new ReportController(reportService);
    const clientController = new ClientController(clientService);

    // Registrar rutas
    app.use('/api/auth', createAuthRoutes(authController));
    app.use('/api/parking', createParkingRoutes(parkingController));
    app.use('/api/invoices', createInvoiceRoutes(invoiceController));
    app.use('/api/reports', createReportRoutes(reportController));
    app.use('/api/clients', createClientRoutes(clientController));

    // Ruta de prueba
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', message: 'Server is running' });
    });

    // Iniciar servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API Documentation:`);
      console.log(`  - Auth: POST /api/auth/register, POST /api/auth/login`);
      console.log(`  - Parking: POST /api/parking/entry, POST /api/parking/exit-by-plate`);
      console.log(`  - Invoices: GET /api/invoices/client/:clientId`);
      console.log(`  - Reports: GET /api/reports/daily, GET /api/reports/monthly`);
      console.log(`  - Clients: POST /api/clients, GET /api/clients`);
      console.log(`✓ CORS enabled for development`);
    });
  })
  .catch(error => console.error('Error initializing database:', error));

export default app;
