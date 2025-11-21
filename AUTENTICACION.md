# 🔐 Sistema de Login y Autenticación

## Descripción General

Se ha implementado un **sistema completo de autenticación multi-usuario** con JWT. Cada usuario tiene:

- ✅ **Cuenta independiente** con email y contraseña
- ✅ **Datos aislados** - Solo ve su propia información
- ✅ **Roles** - admin, operator, user
- ✅ **Tokens JWT** - Sesiones seguras de 7 días
- ✅ **Contraseñas hasheadas** con bcrypt

---

## 📊 Arquitectura de Seguridad

### Flujo de Autenticación

```
Usuario
  ↓
POST /api/auth/register (crear cuenta)
  ↓
POST /api/auth/login (obtener token)
  ↓
JWT Token (válido 7 días)
  ↓
Header: Authorization: Bearer {token}
  ↓
authMiddleware (valida token)
  ↓
req.userId (identificación del usuario)
  ↓
Datos filtrados por userId
```

---

## 🔑 Endpoints de Autenticación

### 1. Registrar Usuario (Públic)

```bash
POST /api/auth/register

Body:
{
  "email": "usuario@parqueadero.com",
  "fullName": "Juan Pérez",
  "password": "Password123!",
  "phone": "+57 312 345 6789",
  "company": "Parqueadero Central"
}

Response:
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "uuid",
    "email": "usuario@parqueadero.com",
    "fullName": "Juan Pérez",
    "role": "admin",
    "isActive": true,
    "createdAt": "2024-11-21T10:30:00Z"
  }
}
```

### 2. Iniciar Sesión (Público)

```bash
POST /api/auth/login

Body:
{
  "email": "usuario@parqueadero.com",
  "password": "Password123!"
}

Response:
{
  "message": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@parqueadero.com",
    "fullName": "Juan Pérez",
    "role": "admin"
  }
}
```

### 3. Obtener Usuario Actual (Autenticado)

```bash
GET /api/auth/me

Headers:
Authorization: Bearer {token}

Response:
{
  "id": "uuid",
  "email": "usuario@parqueadero.com",
  "fullName": "Juan Pérez",
  "phone": "+57 312 345 6789",
  "company": "Parqueadero Central",
  "role": "admin",
  "isActive": true,
  "createdAt": "2024-11-21T10:30:00Z",
  "updatedAt": "2024-11-21T10:30:00Z"
}
```

### 4. Actualizar Perfil (Autenticado)

```bash
PUT /api/auth/me

Headers:
Authorization: Bearer {token}

Body:
{
  "fullName": "Juan Pérez Updated",
  "phone": "+57 312 999 9999",
  "company": "Parqueadero Premium",
  "password": "NewPassword456!"
}

Response:
{
  "message": "Usuario actualizado exitosamente",
  "user": { ... }
}
```

### 5. Validar Token (Público)

```bash
POST /api/auth/validate-token

Headers:
Authorization: Bearer {token}

Response:
{
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "usuario@parqueadero.com",
    "role": "admin",
    "iat": 1700563800,
    "exp": 1701168600
  }
}
```

---

## 🔄 Cómo Funciona el Flujo

### Paso 1: Registro

```bash
# Usuario nuevo se registra
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos@parqueadero.com",
    "fullName": "Carlos López",
    "password": "SecurePass123!"
  }'
```

### Paso 2: Login

```bash
# Obtiene su token JWT
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos@parqueadero.com",
    "password": "SecurePass123!"
  }'

# Respuesta:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { ... }
# }
```

### Paso 3: Usar Token

```bash
# Token guardado en variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Todas las peticiones incluyen el token
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Cliente Carlos",
    "document": "1088888888",
    "email": "cliente@example.com"
  }'
```

---

## 📱 Integración en Frontend Flutter

### Guardar Token Localmente

```dart
// services/secure_storage.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  final _storage = const FlutterSecureStorage();

  // Guardar token
  Future<void> saveToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }

  // Obtener token
  Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }

  // Eliminar token
  Future<void> deleteToken() async {
    await _storage.delete(key: 'auth_token');
  }

  // Guardar usuario
  Future<void> saveUser(Map<String, dynamic> user) async {
    await _storage.write(key: 'user', value: jsonEncode(user));
  }

  // Obtener usuario
  Future<Map<String, dynamic>?> getUser() async {
    final userJson = await _storage.read(key: 'user');
    if (userJson != null) {
      return jsonDecode(userJson);
    }
    return null;
  }
}
```

### Usar Token en API Calls

```dart
// services/api_service.dart
class ApiService {
  final Dio _dio;
  final SecureStorageService _storage;

  ApiService(this._dio, this._storage) {
    _setupDio();
  }

  void _setupDio() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            // Token expirado, redirigir a login
            _storage.deleteToken();
            _storage.deleteUser();
          }
          return handler.next(error);
        },
      ),
    );
  }

  // Login
  Future<String> login(String email, String password) async {
    final response = await _dio.post(
      '$baseURL/auth/login',
      data: {'email': email, 'password': password},
    );

    final token = response.data['token'];
    final user = response.data['user'];

    await _storage.saveToken(token);
    await _storage.saveUser(user);

    return token;
  }

  // Registrar
  Future<void> register(String email, String fullName, String password) async {
    await _dio.post(
      '$baseURL/auth/register',
      data: {
        'email': email,
        'fullName': fullName,
        'password': password,
      },
    );
  }

  // Obtener usuario actual
  Future<User> getCurrentUser() async {
    final response = await _dio.get('$baseURL/auth/me');
    return User.fromJson(response.data);
  }
}
```

### Pantalla de Login

```dart
// screens/login_screen.dart
class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _login() async {
    setState(() => _isLoading = true);

    try {
      final apiService = context.read<ApiService>();
      await apiService.login(
        _emailController.text,
        _passwordController.text,
      );

      // Ir a home
      Navigator.of(context).pushReplacementNamed('/home');
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Iniciar Sesión')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _emailController,
              decoration: InputDecoration(labelText: 'Email'),
            ),
            SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: InputDecoration(labelText: 'Contraseña'),
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _login,
              child: Text(_isLoading ? 'Cargando...' : 'Iniciar Sesión'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 🔐 Seguridad

### Contraseñas

- ✅ Hasheadas con **bcrypt** (10 rounds de salt)
- ✅ Nunca se almacenan en texto plano
- ✅ Validación de fuerza en cliente

### Tokens JWT

- ✅ Válidos por **7 días**
- ✅ Firman con **HS256**
- ✅ Se incluyen en el header `Authorization: Bearer`
- ✅ Se validan en cada petición

### Base de Datos

- ✅ Campo `userId` en todas las tablas
- ✅ Filtrado por usuario en **cada consulta**
- ✅ Un usuario no puede acceder a datos de otro

---

## 🧪 Pruebas

### Postman Collection

```json
{
  "info": { "name": "Parqueadero Auth" },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/auth/register",
        "body": {
          "email": "test@test.com",
          "fullName": "Test User",
          "password": "TestPass123!"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/auth/login",
        "body": {
          "email": "test@test.com",
          "password": "TestPass123!"
        }
      }
    }
  ]
}
```

---

## ⚠️ Manejo de Errores

### 400 Bad Request
```json
{
  "error": "Email y contraseña son requeridos"
}
```

### 401 Unauthorized
```json
{
  "error": "Token inválido o expirado"
}
```

### 403 Forbidden
```json
{
  "error": "No tienes permiso para acceder a este recurso"
}
```

---

## 🚀 Próximos Pasos

1. **Actualizar Frontend** con pantalla de login
2. **Guardar token** en secure storage
3. **Agregar autenticación** a todas las llamadas API
4. **Manejar expiración** de token
5. **Refresh tokens** para sesiones largas (opcional)

---

**Estado**: ✅ Implementado  
**Compilación**: ✅ Sin errores  
**Base de Datos**: ✅ Sincronizada  
**Seguridad**: ✅ bcrypt + JWT
