# README_ai.md - Guía de Arquitectura Hexagonal para IA

## Visión General del Proyecto

Este proyecto es un backend RESTful API construido con Node.js, Express y MySQL, siguiendo **Arquitectura Hexagonal** (también conocida como Ports & Adapters). El proyecto implementa un sistema de gestión de usuarios con autenticación JWT, ACL (Access Control List) basado en roles, y funcionalidades modulares.

**Stack Tecnológico:**
- Node.js + Express
- MySQL + Sequelize ORM
- JWT para autenticación
- BCrypt para hashing de contraseñas
- Nodemailer para envío de correos
- ValidatorJS para validación de datos

---

## Arquitectura Hexagonal - Estructura de Capas

### 1. **Domain Layer** (`app/domain/`)
**Propósito:** Contiene la lógica de negocio pura, independiente de frameworks e infraestructura.

**Ubicación:** `/app/domain/`

**Componentes:**
- **Helpers** (`helpers/`): Lógica de negocio reutilizable
  - Ejemplo: `users.helper.js` - Maneja parsing de JWT, permisos, endpoints, verificación de contraseñas
- **Exceptions** (`exceptions/`): Errores de dominio personalizados
  - `CustomError.js` - Clase de error con código HTTP personalizado

**Características clave:**
- NO depende de librerías externas
- NO accede a base de datos directamente
- Contiene reglas de negocio puras
- Es reutilizable y testeable

---

### 2. **Application Layer** (`app/application/`)
**Propósito:** Contiene los casos de uso (use cases) de la aplicación. Orquesta la interacción entre dominio e infraestructura.

**Ubicación:** `/app/application/`

**Estructura por Módulo:**
```
app/application/
├── users/
│   ├── index.js                    # Exporta todos los casos de uso
│   ├── CreateUser.js               # Caso de uso: crear usuario
│   ├── UpdateUser.js               # Caso de uso: actualizar usuario
│   ├── GetUsersList.js             # Caso de uso: listar usuarios
│   ├── GetUsersPaginableList.js    # Caso de uso: listar usuarios paginados
│   ├── ValidateUserData.js         # Caso de uso: validar datos de usuario
│   ├── SignInUser.js               # Caso de uso: login
│   ├── RefreshToken.js             # Caso de uso: refresh token
│   └── ...                         # Otros casos de uso
├── roles/
│   └── ...
└── functionalities/
    └── ...
```

**Anatomía de un Caso de Uso:**
```javascript
class CreateUser {
  constructor(
    usersRepository,           // Inyección de dependencias
    transactionsRepository,
    mailerRepository,
    ValidateUserData,
    settings
  ) {
    this.$user = usersRepository;
    this.$transaction = transactionsRepository;
    this.$mailer = mailerRepository;
    this.$validator = ValidateUserData;
    this.domain = settings.domain;
  }

  async execute({ first_name, last_name, email, role_id }) {
    // 1. Validar datos
    await this.$validator.execute({ first_name, last_name, email, role_id });

    // 2. Ejecutar transacción
    return this.$transaction.handleTransaction(async (transaction) => {
      // 3. Crear usuario
      const user = await this.$user.create({ 
        first_name, last_name, email, role_id, transaction 
      });

      // 4. Enviar email de activación
      await this.$mailer.sendMail({
        transaction,
        email_template_id: this.$mailer.TEMPLATES.USER_ACTIVATION,
        data: { user_name: user.fullname, ... },
        to: user.email,
      });

      return "User created succesfully";
    });
  }
}
```

**Características clave:**
- Un caso de uso = una acción específica del sistema
- Recibe dependencias por constructor (DI)
- Método `execute()` ejecuta el caso de uso
- Orquesta llamadas a repositorios y servicios
- Maneja transacciones de base de datos

**Convenciones de Nombres:**
- `CreateX` - Crear entidad
- `UpdateX` - Actualizar entidad
- `DeleteX` - Eliminar entidad
- `GetXList` - Obtener lista completa
- `GetXPaginableList` - Obtener lista paginada
- `ShowX` - Obtener una entidad por ID
- `ValidateXData` - Validar datos de entrada

---

### 3. **Infrastructure Layer** (`app/infrastructure/`)
**Propósito:** Implementa la comunicación con elementos externos (DB, APIs, filesystem, etc.).

**Ubicación:** `/app/infrastructure/`

**Componentes:**

#### 3.1 **Repositories** (`infrastructure/repositories/`)
**Adaptadores que interactúan con la base de datos.**

```javascript
class UsersRepository {
  constructor(models) {
    this.models = models;  // Sequelize models
  }

  async getUserByEmail({ email, include, transaction }) {
    return this.models.user.findOne({
      transaction,
      where: { email },
      include,
    });
  }

  async create({ first_name, last_name, email, role_id, transaction }) {
    return this.models.user.create({
      first_name, last_name, email, role_id,
      password: uuid(),
      is_active: false,
      verification_code: Math.random().toString(36).slice(2) + 
                         Math.random().toString(36).slice(2),
    }, { transaction });
  }

  async paginate({ pagerOpts, filters }) {
    // Lógica de paginación
  }
}
```

**Responsabilidades:**
- CRUD operations
- Queries específicas
- Manejo de scopes de Sequelize
- Implementación de búsqueda full-text
- Implementación de paginación

**Archivos especiales:**
- `_db_transaction.repository.js` - Manejo centralizado de transacciones DB

#### 3.2 **Controllers** (`infrastructure/controllers/`)
**Manejan las solicitudes HTTP y respuestas.**

```javascript
class UsersController {
  constructor({ createUser, updateUser, getUsersList, ... }) {
    this.name = "usersController";
    this.createUser = createUser;  // Inyección de casos de uso
    // ...
  }

  async create(req, res, next) {
    try {
      const { first_name, last_name, email, role_id } = req.body;
      
      const result = await this.createUser.execute({
        first_name, last_name, email, role_id
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);  // Pasa al errorHandler
    }
  }
}
```

**Responsabilidades:**
- Extraer datos de req (body, params, query)
- Llamar al caso de uso correspondiente
- Formatear respuesta HTTP
- Manejar errores con next(error)

#### 3.3 **Injectors** (`infrastructure/injectors/`)
**Realizan la inyección de dependencias (Dependency Injection).**

```javascript
module.exports = function registerController({ models, mailer, jwt, settings }) {
  // Crear repositorios
  const usersRepository = new UsersRepository(models);
  const transactionsRepository = new TransactionRepository(models);
  const mailerRepository = new MailerRepository(mailer, models);

  // Crear validador
  const validateUserData = new ValidateUserData(validate);

  // Crear casos de uso
  const createUser = new CreateUser(
    usersRepository,
    transactionsRepository,
    mailerRepository,
    validateUserData,
    settings
  );
  const updateUser = new UpdateUser(...);
  // ...

  // Crear y retornar controller con casos de uso inyectados
  return new UsersController({
    createUser,
    updateUser,
    // ...
  });
};
```

**Responsabilidades:**
- Instanciar repositorios
- Instanciar casos de uso
- Instanciar controladores
- Conectar todas las dependencias

#### 3.4 **Middlewares** (`infrastructure/middlewares/`)
**Interceptan y procesan requests antes de llegar a los controladores.**

**Middlewares disponibles:**
- `auth.middleware.js` - Verifica JWT token y agrega `req.user`
- `acl.middleware.js` - Verifica permisos de endpoint basado en rol
- `cors.middleware.js` - Configura CORS
- `domain.middleware.js` - Maneja configuración multi-dominio
- `files.middleware.js` - Manejo de archivos con Multer

**Ejemplo ACL:**
```javascript
module.exports = (route) => async (req, res, next) => {
  try {
    const { user } = req;
    const endpoint_id = endpointMap[route];  // Mapea ruta a endpoint_id

    if (!endpoint_id) throw new CustomError("ACL Error. Route name not found", 400);
    if (!user.role_id) throw new CustomError("Unauthorized", 401);

    const isAdmin = user.role_id === 1;
    const endpointAuthorized = user.endpoints[endpoint_id - 1] === "1";
    
    if (!isAdmin && !endpointAuthorized) {
      throw new CustomError("Unauthorized", 401);
    }

    next();
  } catch (error) {
    next(error);
  }
};
```

#### 3.5 **Libs** (`infrastructure/libs/`)
**Utilidades y helpers de infraestructura.**

**Librerías disponibles:**
- `jwt.js` - Generación y verificación de tokens
- `mailer.js` - Envío de emails con templates
- `validate.js` - Validación de datos con ValidatorJS
- `paginable.js` - Paginación server-side
- `errorHandler.js` - Manejo centralizado de errores
- `serviceUtil.js` - Formateo de respuestas HTTP
- `fileSystem.js` - Operaciones con archivos
- `jsonToXls.js` - Exportación a Excel
- `fullTextSearch.js` - Búsqueda full-text con Sequelize
- `utils.js` - Utilidades generales

---

### 4. **Models** (`app/models/`)
**Definiciones de modelos Sequelize (ORM).**

**Ubicación:** `/app/models/`

**Estructura de un modelo:**
```javascript
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Relaciones
      models.user.belongsTo(models.role, {
        targetKey: "role_id",
        foreignKey: "role_id",
      });
    }
  }
  
  User.init(
    {
      user_id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      fullname: {
        type: DataTypes.VIRTUAL,  // Campo calculado
        get() {
          return `${this.getDataValue("first_name")} ${this.getDataValue("last_name")}`;
        },
      },
      password: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue("password", bcrypt.hashSync(value, 10));
        },
      },
      // ... otros campos
    },
    {
      scopes: {
        noPassword: {
          attributes: { exclude: ["password"] },
        },
        search: fullTextSearch(sequelize, ["first_name", "last_name", "email"]),
      },
      sequelize,
      modelName: "user",
    }
  );
  return User;
};
```

**Características:**
- Nombre en SINGULAR (user, role, functionality)
- Scopes para consultas comunes
- Virtual fields calculados
- Setters para hashing automático
- Asociaciones en método `associate()`

---

### 5. **Routes** (`app/routes/`)
**Definición de rutas HTTP del API.**

**Ubicación:** `/app/routes/`

**Estructura de un router:**
```javascript
const express = require("express");
const router = express.Router();

const routeACL = require("../infrastructure/middlewares/acl.middleware");
const authMiddleware = require("../infrastructure/middlewares/auth.middleware");

// GET /users - Lista de usuarios
router.get(
  "/users",
  [authMiddleware, routeACL("users.index")],  // Middlewares
  (req, res, next) => req.controllers.usersController.index(req, res, next)
);

// POST /users - Crear usuario
router.post(
  "/users",
  [authMiddleware, routeACL("users.create")],
  (req, res, next) => req.controllers.usersController.create(req, res, next)
);

// PUT /users/:id - Actualizar usuario
router.put(
  "/users/:id",
  [authMiddleware, routeACL("users.update")],
  (req, res, next) => req.controllers.usersController.update(req, res, next)
);

// DELETE /users/:id - Desactivar usuario
router.delete(
  "/users/:id",
  [authMiddleware, routeACL("users.deactivate")],
  (req, res, next) => req.controllers.usersController.userDeactivate(req, res, next)
);

module.exports = {
  basePath: "/",  // Prefijo de rutas
  router,
};
```

**Características:**
- Usa middlewares para autenticación y ACL
- Controladores accesibles vía `req.controllers`
- Siempre pasa `next` para manejo de errores
- Rutas públicas sin middlewares (login, register, etc.)

---

### 6. **Migrations** (`app/migrations/`)
**Scripts de creación/modificación de estructura DB.**

**Ubicación:** `/app/migrations/`

**Convención de nombres:** `YYYYMMDDHHMMSS-DDL-descripcion.js`
- Ejemplo: `20250821000002-DDL-create-user.js`

**Estructura:**
```javascript
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("user", {
      user_id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      first_name: { type: DataTypes.STRING },
      email: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.literal("CURRENT_TIMESTAMP"),
      },
      // ... otros campos
    });
    
    // Crear índices
    await queryInterface.addIndex("user", ["first_name", "last_name", "email"], {
      name: "userFtSearch",
      type: "FULLTEXT",
    });
  },
  
  down: async (queryInterface) => {
    await queryInterface.dropTable("user");
  },
};
```

**Comandos:**
- `npm run migrate` - Ejecutar migraciones pendientes
- `npm run migrate:undo` - Revertir última migración
- `npm run migrate:all` - Ejecutar todas las migraciones

---

### 7. **Seeders** (`app/seeders/`)
**Datos iniciales para la base de datos.**

**Ubicación:** `/app/seeders/`

**Convención:** `00000000000001-initial-system-data.js`

**Comando:**
- `npm run seed` - Ejecutar todos los seeders

---

## Sistema de ACL (Access Control List)

**Componentes del sistema de permisos:**

1. **Roles** (`role` table)
   - Define grupos de usuarios (Admin, Editor, Viewer)
   
2. **Functionalities** (`functionality` table)
   - Agrupa endpoints relacionados (users, roles, reports)
   
3. **Endpoints** (`endpoint` table)
   - Define rutas específicas (users.index, users.create)
   
4. **functionality_role** (tabla pivot)
   - Relaciona roles con funcionalidades
   - Campo `type`: `r` (read), `rw` (read-write)
   
5. **functionality_endpoint** (tabla pivot)
   - Relaciona funcionalidades con endpoints

**Flujo de verificación de permisos:**

```
Request → authMiddleware (verifica JWT) 
        → req.user contiene { user_id, role_id, endpoints: "0101101..." }
        → routeACL("users.create") 
        → Busca endpoint_id de "users.create" en endpointMap
        → Verifica si user.endpoints[endpoint_id-1] === "1"
        → Si es Admin (role_id=1) → permitir
        → Si tiene permiso → permitir
        → Si no → 401 Unauthorized
```

**String de endpoints en JWT:**
```javascript
endpoints: "01011010110101..."  // Cada posición es un endpoint_id
// Posición 0 (endpoint_id=1) = "0" (no autorizado)
// Posición 1 (endpoint_id=2) = "1" (autorizado)
```

---

## Scripts de Scaffolding Hexagonal

**Ubicación:** `/scripts/hexagonal/`

### Crear Módulo Completo
```bash
npm run new-module
```

**Opciones interactivas:**
- Nombre del módulo
- Casos de uso (Create, Update, Delete, List, Paginate, Show, Validate)
- Crear modelo (Sí/No)
- Crear seeder (Sí/No)
- Crear router (Sí/No)
- Timestamps (Sí/No)

**Genera:**
- `/app/application/{module}/` con casos de uso seleccionados
- `/app/infrastructure/controllers/{Module}Controller.js`
- `/app/infrastructure/repositories/{module}.repository.js`
- `/app/infrastructure/injectors/{module}Injector.js`
- `/app/models/{module}.model.js` (si se selecciona)
- `/app/migrations/{timestamp}-DDL-create-{module}.js` (si se selecciona)
- `/app/routes/{module}.router.js` (si se selecciona)

### Scripts Individuales
- `create-application.js` - Genera casos de uso
- `create-infrastructure.js` - Genera Controller + Repository + Injector
- `create-model.js` - Genera modelo Sequelize
- `create-migration.js` - Genera migración
- `create-seeder.js` - Genera seeder
- `create-router.js` - Genera router

---

## Flujo de Request Completo

```
1. Request HTTP → Express Server (server.js)
   ↓
2. Middlewares globales (cors, helmet, bodyParser, morgan)
   ↓
3. domainMiddleware (añade configuración de dominio)
   ↓
4. Router específico (routes/users.router.js)
   ↓
5. Middlewares de ruta [authMiddleware, routeACL]
   ↓
6. Controller (infrastructure/controllers/UsersController.js)
   - Extrae datos del request
   ↓
7. Caso de Uso (application/users/CreateUser.js)
   - Validación de datos
   - Lógica de negocio
   ↓
8. Repository (infrastructure/repositories/users.repository.js)
   - Query a base de datos (Sequelize)
   ↓
9. Model (models/user.model.js)
   - Modelo Sequelize
   ↓
10. DB (MySQL)
    ↓
11. Response ← serviceUtil.getResponseCustom(code, data)
    ↓
12. HTTP Response al cliente
```

**En caso de error en cualquier paso:**
```
Error → next(error) → errorHandler → HTTP Error Response
```

---

## Formato de Respuestas HTTP

**Respuesta exitosa:**
```json
{
  "code": 200,
  "message": "Successful operation!",
  "success": true,
  "data": { ... }
}
```

**Respuesta con error:**
```json
{
  "code": 400,
  "message": "Error message",
  "success": false,
  "data": []
}
```

**Respuesta paginada:**
```json
{
  "code": 200,
  "message": "Successful operation!",
  "success": true,
  "data": {
    "total": 125,
    "per_page": 10,
    "current_page": 1,
    "last_page": 13,
    "from": 1,
    "to": 10,
    "data": [ ... ]
  }
}
```

---

## Convenciones y Reglas

### Naming Conventions

**Archivos:**
- Models: `{entity}.model.js` (singular)
- Repositories: `{entity}.repository.js` (plural)
- Controllers: `{Entity}Controller.js` (PascalCase)
- Injectors: `{entity}Injector.js` (camelCase)
- Routers: `{entity}.router.js` (plural)
- Use Cases: `{Action}{Entity}.js` (PascalCase)

**Variables y clases:**
- Clases: PascalCase (`CreateUser`, `UsersRepository`)
- Variables: camelCase (`usersRepository`, `userData`)
- Constantes: UPPER_SNAKE_CASE (`JWT_SECRET_KEY`)

**Base de datos:**
- Tablas: snake_case singular (`user`, `role`, `functionality`)
- Columnas: snake_case (`user_id`, `first_name`, `created_at`)
- Claves primarias: `{table}_id` (`user_id`, `role_id`)

### Estructura de Carpetas para Nuevo Módulo

```
app/
├── application/
│   └── {module}/
│       ├── index.js
│       ├── Create{Module}.js
│       ├── Update{Module}.js
│       ├── Delete{Module}.js
│       ├── Get{Module}List.js
│       ├── Get{Module}PaginableList.js
│       ├── Show{Module}.js
│       └── Validate{Module}Data.js
├── infrastructure/
│   ├── controllers/
│   │   └── {Module}Controller.js
│   ├── repositories/
│   │   └── {module}.repository.js
│   └── injectors/
│       └── {module}Injector.js
├── models/
│   └── {module}.model.js
├── routes/
│   └── {module}.router.js
└── migrations/
    └── {timestamp}-DDL-create-{module}.js
```

### Reglas de Inyección de Dependencias

1. **Repositorios** reciben solo `models` (Sequelize)
2. **Casos de Uso** reciben repositorios y otros casos de uso
3. **Controladores** reciben casos de uso
4. **Injector** conecta todo y retorna el controller

### Reglas de Transacciones

- Usar `TransactionRepository.handleTransaction()` para operaciones DB
- Pasar `transaction` a todos los métodos de repositorio
- Si falla algo dentro → rollback automático
- Si todo OK → commit automático

### Reglas de Validación

- Crear caso de uso `Validate{Entity}Data`
- Usar librería `validate` con ValidatorJS
- Lanzar `CustomError` si validación falla
- Llamar validación al inicio del caso de uso

---

## Ejemplo Completo: Agregar Nueva Funcionalidad

**Requisito:** Agregar endpoint para obtener perfil de usuario autenticado

### Paso 1: Crear Caso de Uso
**Archivo:** `app/application/users/GetUserProfile.js`

```javascript
class GetUserProfile {
  constructor(usersRepository) {
    this.$user = usersRepository;
  }

  async execute({ user_id }) {
    const user = await this.$user.getUserById({
      user_id,
      password: false,  // Excluir password
      include: [{ association: 'role' }],
    });

    if (!user) throw new CustomError("User not found", 404);

    return user;
  }
}

module.exports = GetUserProfile;
```

### Paso 2: Exportar en index
**Archivo:** `app/application/users/index.js`

```javascript
module.exports = {
  // ... otros casos de uso
  GetUserProfile: require('./GetUserProfile'),
};
```

### Paso 3: Agregar al Injector
**Archivo:** `app/infrastructure/injectors/usersInjector.js`

```javascript
const { GetUserProfile } = require('../../application/users');

module.exports = function registerController({ models, ... }) {
  const usersRepository = new UsersRepository(models);
  
  // Crear caso de uso
  const getUserProfile = new GetUserProfile(usersRepository);

  // Inyectar en controller
  return new UsersController({
    // ... otros casos de uso
    getUserProfile,
  });
};
```

### Paso 4: Agregar método al Controller
**Archivo:** `app/infrastructure/controllers/UsersController.js`

```javascript
class UsersController {
  constructor({ getUserProfile, ... }) {
    this.getUserProfile = getUserProfile;
    // ...
  }

  async profile(req, res, next) {
    try {
      const { user_id } = req.user;  // Del JWT
      
      const result = await this.getUserProfile.execute({ user_id });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }
}
```

### Paso 5: Agregar Ruta
**Archivo:** `app/routes/users.router.js`

```javascript
router.get("/profile", [authMiddleware], (req, res, next) =>
  req.controllers.usersController.profile(req, res, next)
);
```

**¡Listo!** Endpoint `GET /profile` funcionando.

---

## Variables de Entorno

**Archivo:** `.env` (copiar de `.env.example`)

```bash
NODE_ENV=production          # development | production
PORT=5016                    # Puerto del servidor

# Database
DB_USERNAME=root
DB_PASSWORD=secret
DB_NAME=KMPUS_SUPERADMIN
DB_HOSTNAME=localhost
DB_PORT=5030

# JWT
JWT_SECRET_KEY=secret_key_here

# Mailer (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PWD=your_password
MAIL_FROM=noreply@yourapp.com

# Backend URL (para emails)
BACKEND_URL=http://localhost:5016/
```

---

## Testing Strategy (Recomendado)

**Niveles de testing:**

1. **Unit Tests - Use Cases**
   - Mockear repositorios
   - Testear lógica de negocio
   
2. **Integration Tests - Repositories**
   - Base de datos de prueba
   - Testear queries reales
   
3. **E2E Tests - Routes**
   - Supertest
   - Testear flujo completo HTTP → DB → HTTP

---

## Comandos NPM Útiles

```bash
# Desarrollo
npm start                    # Inicia servidor con nodemon

# Base de datos
npm run migrate              # Ejecutar migraciones
npm run migrate:undo         # Revertir última migración
npm run migrate:all          # Ejecutar todas las migraciones
npm run seed                 # Ejecutar seeders
npm run update-system-data   # Actualizar datos del sistema

# Scaffolding
npm run new-module           # Crear módulo completo (interactivo)

# Linting
npm run lint                 # Verificar código
npm run lint-fix             # Corregir errores de linting
```

---

## Errores Comunes y Soluciones

### 1. "Route name not found" en ACL
**Causa:** El nombre de ruta en `routeACL("users.index")` no existe en `endpointMap`

**Solución:** 
- Agregar endpoint en `_initial_database/__endpoint_data.js`
- Ejecutar `npm run update-system-data`

### 2. "Cannot read property 'execute' of undefined"
**Causa:** Caso de uso no inyectado en controller

**Solución:**
- Verificar que el caso de uso esté instanciado en injector
- Verificar que se pase al constructor del controller
- Verificar que el controller lo guarde como propiedad

### 3. Error de transacción
**Causa:** No se pasó `transaction` a método de repositorio

**Solución:**
```javascript
// ❌ Incorrecto
await this.$user.create({ first_name, last_name });

// ✅ Correcto
await this.$user.create({ first_name, last_name, transaction });
```

### 4. Password no se hashea
**Causa:** No está el setter en el modelo

**Solución:** Agregar setter en modelo:
```javascript
password: {
  type: DataTypes.STRING,
  set(value) {
    this.setDataValue("password", bcrypt.hashSync(value, 10));
  },
}
```

---

## Próximos Pasos Recomendados

1. **Testing:** Agregar Jest + Supertest
2. **Documentación API:** Agregar Swagger/OpenAPI
3. **Logging:** Implementar Winston para logs estructurados
4. **Validación:** Centralizar reglas de validación
5. **Cache:** Implementar Redis para cacheo
6. **Rate Limiting:** Agregar express-rate-limit
7. **Websockets:** Considerar Socket.io para real-time

---

## Referencias Rápidas

### Obtener usuario autenticado en Controller
```javascript
const { user_id, role_id, email } = req.user;  // Del authMiddleware
```

### Hacer query con transacción
```javascript
return this.$transaction.handleTransaction(async (transaction) => {
  await this.$user.create({ ...data, transaction });
  await this.$role.update({ ...data, transaction });
  return "Success";
});
```

### Formatear respuesta paginada
```javascript
const result = await this.$user.paginate({ pagerOpts, filters });
return result;  // Ya viene formateado por paginable.paginatedResult()
```

### Enviar email
```javascript
await this.$mailer.sendMail({
  transaction,
  email_template_id: this.$mailer.TEMPLATES.USER_ACTIVATION,
  data: { user_name: "John" },
  to: "user@example.com",
});
```

### Lanzar error personalizado
```javascript
throw new CustomError("User not found", 404);
```

---

## Resumen de Principios Arquitectónicos

1. **Separación de Responsabilidades:** Cada capa tiene su propósito específico
2. **Inyección de Dependencias:** Las dependencias fluyen de afuera hacia adentro
3. **Inversión de Dependencias:** Domain/Application NO dependen de Infrastructure
4. **Single Responsibility:** Una clase = una responsabilidad
5. **Testabilidad:** Mockear repositorios para testear casos de uso
6. **Escalabilidad:** Fácil agregar nuevos módulos sin afectar existentes

---

## Contacto y Soporte

Para dudas sobre la arquitectura o implementación, consultar:
- `README.md` - Documentación general
- Scripts en `/scripts/hexagonal/` - Generadores de código
- Ejemplos en `/app/application/users/` - Casos de uso de referencia

---

**Última actualización:** 2026-02-28
**Versión del proyecto:** 0.9.0
