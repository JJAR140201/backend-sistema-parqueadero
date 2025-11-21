#!/usr/bin/env pwsh
# Script para preparar y desplegar el backend a Railway

# Colores para output
$Green = "`e[32m"
$Blue = "`e[34m"
$Yellow = "`e[33m"
$Red = "`e[31m"
$Reset = "`e[0m"

Write-Host "$Blue╔═══════════════════════════════════════════════════════════╗$Reset"
Write-Host "$Blue║         DESPLIEGUE BACKEND A RAILWAY - PARQUEADERO        ║$Reset"
Write-Host "$Blue╚═══════════════════════════════════════════════════════════╝$Reset"

# 1. Verificar si estamos en la carpeta backend
$Location = Get-Location
if (-not (Test-Path "package.json")) {
    Write-Host "$Red✗ Error: No estoy en la carpeta backend. Ejecuta desde backend/$Reset"
    exit 1
}

Write-Host "$Green✓ Ubicación correcta: $Location$Reset"

# 2. Compilar TypeScript
Write-Host "`n$Yellow→ Compilando TypeScript...$Reset"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "$Red✗ Error en la compilación$Reset"
    exit 1
}
Write-Host "$Green✓ TypeScript compilado exitosamente$Reset"

# 3. Agregar archivos a git
Write-Host "`n$Yellow→ Preparando archivos para git...$Reset"
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "$Red✗ Error agregando archivos$Reset"
    exit 1
}
Write-Host "$Green✓ Archivos agregados$Reset"

# 4. Crear commit
Write-Host "`n$Yellow→ Creando commit...$Reset"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Deploy: Actualización $Timestamp"
if ($LASTEXITCODE -ne 0) {
    Write-Host "$Yellow! No hay cambios para commitear (normal)$Reset"
} else {
    Write-Host "$Green✓ Commit creado$Reset"
}

# 5. Push a GitHub
Write-Host "`n$Yellow→ Subiendo cambios a GitHub...$Reset"
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "$Red✗ Error en push. Verifica tu conexión de git$Reset"
    exit 1
}
Write-Host "$Green✓ Cambios subidos a GitHub$Reset"

# 6. Railway deployment
Write-Host "`n$Yellow→ Verificando Railway CLI...$Reset"
railway --version | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "$Red✗ Railway CLI no está instalado$Reset"
    Write-Host "$Blue  Instala con: npm install -g railway$Reset"
    exit 1
}
Write-Host "$Green✓ Railway CLI disponible$Reset"

# 7. Desplegar en Railway
Write-Host "`n$Yellow→ Iniciando despliegue en Railway...$Reset"
railway up
if ($LASTEXITCODE -ne 0) {
    Write-Host "$Red✗ Error en el despliegue$Reset"
    exit 1
}

# 8. Mostrar información de despliegue
Write-Host "`n$Green╔═══════════════════════════════════════════════════════════╗$Reset"
Write-Host "$Green║                   ✓ DESPLIEGUE EXITOSO                    ║$Reset"
Write-Host "$Green╚═══════════════════════════════════════════════════════════╝$Reset"

Write-Host "`n$Blue📊 Siguiente paso:$Reset"
Write-Host "  1. Ve a https://railway.app/dashboard"
Write-Host "  2. Verifica las variables de entorno"
Write-Host "  3. Prueba el health endpoint: curl https://tu-url/health"

Write-Host "`n$Blue📝 Para ver logs:$Reset"
Write-Host "  railway logs"

Write-Host "`n$Blue🔗 URL del backend (aproximada):$Reset"
Write-Host "  https://backend-sistema-parqueadero.up.railway.app"

Write-Host "`n"
