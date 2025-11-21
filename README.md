# Parqueadero Backend

Sistema de gestión de parqueadero desarrollado con Node.js, TypeScript y Express.

## Características

- ✓ Registro de entrada/salida de vehículos
- ✓ Gestión de clientes con suscripciones mensuales
- ✓ Cálculo automático de tarifas
- ✓ Generación de facturas (PDF)
- ✓ Reportes diarios y mensuales (XLSX)
- ✓ Envío de facturas por email y SMS

## Instalación

```bash
cd backend
npm install
```

## Configuración

1. Copiar `.env.example` a `.env`
2. Configurar variables de entorno según necesario

```bash
cp .env.example .env
```

## Desarrollo

```bash
npm run dev
```

El servidor iniciará en `http://localhost:3000`

## Construcción

```bash
npm run build
```

## Producción

```bash
npm run build
npm start
```

## API Endpoints

### Parqueadero
- `POST /api/parking/entry` - Registrar entrada de vehículo
- `POST /api/parking/exit/:sessionId` - Registrar salida
- `POST /api/parking/exit-by-plate` - Registrar salida por placa
- `GET /api/parking/active` - Listar sesiones activas
- `GET /api/parking/by-plate/:plate` - Obtener historial de placa

### Facturas
- `POST /api/invoices/:sessionId` - Generar factura
- `GET /api/invoices/:invoiceId/pdf` - Descargar PDF
- `POST /api/invoices/:invoiceId/email` - Enviar por email
- `POST /api/invoices/:invoiceId/sms` - Enviar por SMS
- `GET /api/invoices/client/:clientId` - Facturas de cliente
- `PUT /api/invoices/:invoiceId/pay` - Marcar como pagada

### Reportes
- `GET /api/reports/daily?date=YYYY-MM-DD` - Reporte diario
- `GET /api/reports/monthly?month=M&year=YYYY` - Reporte mensual
- `GET /api/reports/daily/xlsx?date=YYYY-MM-DD` - Descargar reporte diario
- `GET /api/reports/monthly/xlsx?month=M&year=YYYY` - Descargar reporte mensual

### Clientes
- `POST /api/clients` - Crear cliente
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:clientId` - Obtener cliente
- `PUT /api/clients/:clientId` - Actualizar cliente
- `DELETE /api/clients/:clientId` - Desactivar cliente

## Base de Datos

Se utiliza SQLite por defecto. Para cambiar a PostgreSQL, actualizar `.env`:

```
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=parqueadero
```

## Estructura del Proyecto

```
src/
├── entities/         # Modelos de datos
├── services/         # Lógica de negocio
├── controllers/      # Controladores HTTP
├── routes/          # Definición de rutas
├── middlewares/     # Middlewares personalizados
├── utils/           # Utilidades
└── index.ts         # Punto de entrada
```

## Dependencias Principales

- **Express**: Framework web
- **TypeORM**: ORM para base de datos
- **XLSX**: Generación de reportes Excel
- **PDFKit**: Generación de PDF
- **Twilio**: Envío de SMS
- **Nodemailer**: Envío de emails

## Licencia

ISC
