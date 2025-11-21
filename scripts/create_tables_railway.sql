-- ============================================================
-- SCRIPT SQL PARA CREAR TABLAS EN RAILWAY PostgreSQL
-- Ejecutar en: switchback.proxy.rlwy.net:57431
-- Database: railway
-- User: postgres
-- ============================================================

-- ============================================================
-- TABLA 1: USER (Autenticación)
-- ============================================================
CREATE TABLE IF NOT EXISTS "user" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(100) UNIQUE NOT NULL,
  "passwordHash" varchar(255) NOT NULL,
  "fullName" varchar(255),
  "phone" varchar(20),
  "company" varchar(255),
  "role" varchar(50) DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'user')),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_user_email" ON "user"("email");
CREATE INDEX IF NOT EXISTS "idx_user_role" ON "user"("role");

-- ============================================================
-- TABLA 2: VEHICLE (Vehículos)
-- ============================================================
CREATE TABLE IF NOT EXISTS "vehicle" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "licensePlate" varchar(20) UNIQUE NOT NULL,
  "brand" varchar(100),
  "model" varchar(100),
  "color" varchar(50),
  "ownerName" varchar(255),
  "ownerPhone" varchar(20),
  "ownerEmail" varchar(100),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_vehicle_licensePlate" ON "vehicle"("licensePlate");
CREATE INDEX IF NOT EXISTS "idx_vehicle_createdAt" ON "vehicle"("createdAt");

-- ============================================================
-- TABLA 3: CLIENT (Clientes)
-- ============================================================
CREATE TABLE IF NOT EXISTS "client" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "document" varchar(20) UNIQUE NOT NULL,
  "name" varchar(255) NOT NULL,
  "email" varchar(100),
  "phone" varchar(20),
  "type" varchar(50) NOT NULL CHECK (type IN ('occasional', 'monthly')),
  "isActive" boolean DEFAULT true,
  "userId" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_client_userId" ON "client"("userId");
CREATE INDEX IF NOT EXISTS "idx_client_document" ON "client"("document");
CREATE INDEX IF NOT EXISTS "idx_client_type" ON "client"("type");
CREATE INDEX IF NOT EXISTS "idx_client_isActive" ON "client"("isActive");

-- ============================================================
-- TABLA 4: PARKING_SESSION (Sesiones de Estacionamiento)
-- ============================================================
CREATE TABLE IF NOT EXISTS "parking_session" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "vehicleId" uuid NOT NULL REFERENCES "vehicle"("id") ON DELETE CASCADE,
  "clientId" uuid REFERENCES "client"("id") ON DELETE SET NULL,
  "entryTime" TIMESTAMP NOT NULL,
  "exitTime" TIMESTAMP,
  "entryPhoto" varchar(255),
  "exitPhoto" varchar(255),
  "totalCost" numeric(10,2),
  "status" varchar(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  "userId" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_parking_session_userId" ON "parking_session"("userId");
CREATE INDEX IF NOT EXISTS "idx_parking_session_vehicleId" ON "parking_session"("vehicleId");
CREATE INDEX IF NOT EXISTS "idx_parking_session_clientId" ON "parking_session"("clientId");
CREATE INDEX IF NOT EXISTS "idx_parking_session_status" ON "parking_session"("status");
CREATE INDEX IF NOT EXISTS "idx_parking_session_entryTime" ON "parking_session"("entryTime");

-- ============================================================
-- TABLA 5: INVOICE (Facturas)
-- ============================================================
CREATE TABLE IF NOT EXISTS "invoice" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoiceNumber" varchar(50) UNIQUE NOT NULL,
  "sessionId" uuid NOT NULL REFERENCES "parking_session"("id") ON DELETE CASCADE,
  "clientId" uuid REFERENCES "client"("id") ON DELETE SET NULL,
  "totalAmount" numeric(10,2) NOT NULL,
  "taxAmount" numeric(10,2) DEFAULT 0,
  "netAmount" numeric(10,2) NOT NULL,
  "paymentMethod" varchar(50),
  "status" varchar(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  "pdfPath" varchar(255),
  "emailSent" boolean DEFAULT false,
  "smsSent" boolean DEFAULT false,
  "userId" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_invoice_userId" ON "invoice"("userId");
CREATE INDEX IF NOT EXISTS "idx_invoice_sessionId" ON "invoice"("sessionId");
CREATE INDEX IF NOT EXISTS "idx_invoice_clientId" ON "invoice"("clientId");
CREATE INDEX IF NOT EXISTS "idx_invoice_status" ON "invoice"("status");
CREATE INDEX IF NOT EXISTS "idx_invoice_createdAt" ON "invoice"("createdAt");

-- ============================================================
-- TABLA 6: DAILY_REPORT (Reportes Diarios)
-- ============================================================
CREATE TABLE IF NOT EXISTS "daily_report" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "date" DATE NOT NULL,
  "totalVehicles" integer DEFAULT 0,
  "totalIncome" numeric(10,2) DEFAULT 0,
  "monthlyClientsIncome" numeric(10,2) DEFAULT 0,
  "occasionalClientsIncome" numeric(10,2) DEFAULT 0,
  "averageStayTime" integer,
  "reportData" TEXT,
  "userId" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_daily_report_userId" ON "daily_report"("userId");
CREATE INDEX IF NOT EXISTS "idx_daily_report_date" ON "daily_report"("date");
CREATE INDEX IF NOT EXISTS "idx_daily_report_userId_date" ON "daily_report"("userId", "date");

-- ============================================================
-- TABLA 7: MONTHLY_REPORT (Reportes Mensuales)
-- ============================================================
CREATE TABLE IF NOT EXISTS "monthly_report" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "month" integer NOT NULL CHECK (month >= 1 AND month <= 12),
  "year" integer NOT NULL,
  "totalVehicles" integer DEFAULT 0,
  "totalIncome" numeric(10,2) DEFAULT 0,
  "monthlyClientsIncome" numeric(10,2) DEFAULT 0,
  "occasionalClientsIncome" numeric(10,2) DEFAULT 0,
  "averageStayTime" integer,
  "topClientName" varchar(255),
  "topClientRevenue" numeric(10,2),
  "reportData" TEXT,
  "userId" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_monthly_report_userId" ON "monthly_report"("userId");
CREATE INDEX IF NOT EXISTS "idx_monthly_report_month_year" ON "monthly_report"("month", "year");
CREATE INDEX IF NOT EXISTS "idx_monthly_report_userId_month_year" ON "monthly_report"("userId", "month", "year");

-- ============================================================
-- VERIFICACIÓN: Contar tablas creadas
-- ============================================================
SELECT 
  tablename as "Tabla",
  1 as "Creada"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================
-- INFORMACIÓN DE CONEXIÓN
-- ============================================================
-- Host: switchback.proxy.rlwy.net
-- Puerto: 57431
-- Base de Datos: railway
-- Usuario: postgres
-- URL: postgres://postgres:hmSLZpdOQDBROxCgplRMRlYKaZQBXXkD@switchback.proxy.rlwy.net:57431/railway
