# NodeJS + Express + Sequelize (Mysql)

## Indice
- [Instalación básica](#instalación-básica)
- [Paso a Producción](#paso-a-producción)
- [Configuración](#configuración)
- [Enrutamiento](#enrutamiento)
- [Interacción con Base de Datos](#interacción-con-base-de-datos)
- [Funciones Reutilizables](#funciones-reutilizables)


## Instalación básica

```
// Clona el repositorio
git clone https://github.com/farena/nodejs_mysql.git

// Instala dependencias
npm install

// Copia .env.example y rellena las variables de DB
cp .env.example .env

// Inicia el servidor en modo desarrollo
npm start
```

## Paso a producción
```
// Clona el proyecto en la carpeta HOME de tu usuario de CPanel

// Cambia la variable de entorno NODE_ENV a producción
// NODE_ENV=production

// Ejecutar aplicación en modo daemon. Se puede hacer con PM2, un administrador de procesos para NodeJS o dentro de CPanel con su administrador de procesos.

  - Registro de la app dentro de CPanel 
  https://docs.cpanel.net/knowledge-base/web-services/how-to-install-a-node.js-application/

  - Ejecutar aplicación con PM2 - ADVANCED, PRODUCTION PROCESS MANAGER FOR NODE.JS
  https://desarrolloweb.com/articulos/ejecutar-aplicacion-nodejs-pm2.html
```

## Configuración 

Suele ser útil tener diferentes valores de configuración según el entorno en el que se ejecuta la aplicación. Por ejemplo, es posible que desee utilizar un PORT diferente para ejecutar el servidor localmente que el que utiliza en su servidor de producción.

Para usar variables de entorno, este proyecto usa el plugin `DOTENV`. El directorio raíz de su aplicación tendrá un archivo `.env.example` que define muchas variables de entorno comunes que se utilizarán. Deberá duplicar este archivo y cambiarle el nombre a `.env`, el cual se encuentra ignorado por git.

Algunas variables comunes se usan para crear una nueva conexión de base de datos y puede verla funcionando dentro de `/app/config/db.config.js`. Otras variables comúnmente utilizadas a lo largo de la aplicación se almacenan dentro de `/app/config/config.js`.

### Usando variables de entorno

Todas las variables creadas en el archivo `.env` se cargarán en la variable global `process.env` cuando su aplicación comienza. 

La puede utilizar en cualquier parte de la aplicación de esta manera:

```
const port = process.env.PORT;

console.log(port); // 3000
```

### Modificando una variable de entorno

En caso de modificar una variable dentro de este archivo. Deberá reiniciar la aplicación. Frenando el proceso `npm start` entrando en la consola donde se esta ejecutando y presionando `ctrl + c`, luego deberá volver a iniciar ejecutando nuevamente `npm start`.

## Enrutamiento

Para la creación de una API Rest con la aplicación debera enrutar las peticiones que vamos a recibir. Para hacerlo usamos el plugin `ExpressJS`. Puede encontrar la documentacion oficial aca: https://expressjs.com/es.

Dentro de la carpeta `/app/routes` encontrara archivos finalizados en `.router.js`, cada uno de estos archivos contiene las rutas que se deseen utilizar. Se los separa por modulos para mayor claridad a la hora de buscar una ruta. 

### Rutas Basicas
```
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('GET Request a ruta raiz');
});
router.post('/', (req, res) => {
  res.send('POST Request a ruta raiz');
});

router.put('/', (req, res) => {
  res.send('PUT Request a ruta raiz');
});
router.delete('/', (req, res) => {
  res.send('DELETE Request a ruta raiz');
});
```

### Rutas con Middleware

Para transformar, validar o rechazar una petición, Express utiliza middlewares. Para pasar un middleware a una ruta, basta con agregarlo dentro de un array previo a la función final a ejecutar.

```
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.js');

router.get('/users', [authMiddleware], (req, res) => {
  res.send('Felicidades! Usted tiene acceso a este recurso.');
});


module.exports = {
  basePath: '/',
  router,
};
```

### Grupos de rutas

Como puede ver en el ejemplo anterior, al final del archivo se exporta un objeto con 2 variables. `basePath` y `router`.

BasePath va a ser la base desde la que se crearan las rutas para ese archivo. Mientras que en router, se exportaran las rutas creadas.

```
// GET /users
router.get('/', [], function () {});

// GET /users/:id
router.get('/:id', [], function () {});


module.exports = {
  basePath: '/users',
  router,
};
```

### Controladores

Como puede ver, las rutas ejecutan una función al ser requeridas por un usuario. Para una mejor organización, estas funciones se las exporta desde los `controllers`. Y se utilizan de la siguiente manera.

```
// users.router.js

const express = require('express');
const router = express.Router();
// El archivo index, exporta todos los controllers
const controllers = require('../controllers/index');
const { authMiddleware } = require('../middlewares/auth.js');

router.get('/users', [authMiddleware], controllers.usersController.index);
```
```
// users.controller.js

module.exports = {
  name: 'usersController', // nombre utilizado para acceder desde el router

  index: (req, res) => {
    res.send('Felicidades! Accediste a este recurso desde un controlador.');
  },
}
```

### Manejo de errores

Para el manejo de errores, la aplicación utiliza un `errorHandler` ubicado en `/app/functions/errorHandler.js`. Este es ejecutado cada vez que Express tira un error. 


```
// users.controller.js
const CustomError = require('../functions/CustomError.js');

module.exports = {
  name: 'usersController', 

  index: (req, res, next) => {
    try {
      // Tiramos un error para probar
      throw new CustomError('Error de prueba')

      res.send('Este mensaje no se podra ver');
    } catch (error) {
      // capturamos el error con catch 
      // y lo enviamos al errorHandler
      next(error); 
    }
  },
}
```

### Parametros

Para obtener los datos de un usuario en particular, use parametros en las rutas.

```
// users.router.js

const express = require('express');
const router = express.Router();
const controllers = require('../controllers/index');
const { authMiddleware } = require('../middlewares/auth.js');

// Enviamos el USER_ID para consultar en la DB
router.get('/users/:user_id', [authMiddleware], controllers.usersController.show);
```


```
// users.controller.js
module.exports = {
  name: 'usersController', 

  index: (req, res, next) => {
    try {
      // Guardamos USER_ID en variable
      const id = req.params.user_id; 

      res.send(`Información del usuario con ID: ${id}`);
    } catch (error) {
      next(error); 
    }
  },
}
```

### Variables enviadas por HTTP

Al recibir peticiones por HTTP, se envian comunmente variables con información para consultar o guardar en DB.

En el caso de una petición POST, PUT y DELETE, se enviaran variables en el BODY de la peticion. Mientras que una petición GET se enviaran en la misma ruta.

Aca unos ejemplos:

```
// Se envia una petición GET a /users con 2 variables.
GET: /users?status=active&role=admin
```

```
// users.controller.js
module.exports = {
  name: 'usersController', 

  index: (req, res, next) => {
    try {
      // Para peticiones GET, obtenemos las variables desde req.query
      const status = req.query.status; 
      const role = req.query.role; 

      console.log(status); // 'active'
      console.log(role); // 'admin'

      res.send('Respuesta');
    } catch (error) {
      next(error); 
    }
  },
}
```

```
// Se envia una petición POST a /users con 2 variables.
POST: /users
BODY: {
  name: 'Juan',
  email: 'juan@example.com'
}
```

```
// users.controller.js
module.exports = {
  name: 'usersController', 

  index: (req, res, next) => {
    try {
      // Para peticiones POST, obtenemos las variables desde req.body
      const name = req.body.name; 
      const email = req.body.email; 

      console.log(name); // 'active'
      console.log(email); // 'admin'

      res.send('Respuesta');
    } catch (error) {
      next(error); 
    }
  },
}
```

## Interacción con Base de Datos 

Para la Interacción con la Base de Datos la aplicación utiliza el ORM `Sequelize`. Puede acceder a la documentación completa de este aca: https://runebook.dev/es/docs/sequelize/manual/getting-started

### Models

Un Model es una representación de una tabla en la base de datos, en formato de Object de JS. De esta manera podemos ejecutar querys a la DB de una manera mucho mas simple.

Los puede encontrar en la carpeta `/app/models` y cada modelo termina con `.model.js`. Por convención, el nombre de un modelo, asi como su tabla en la DB se escribe de manera SINGULAR. Por ejemplo: `user.model.js`

Los Models se usan `SIEMPRE` en un controller.

```
// user.model.js
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Aca se agregaran las relaciones con otros modelos.
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
      name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'user', // Nombre para acceder al modelo.
    },
  );
  return User;
};
```

```
// users.controller.js
// El archivo index de esta carpeta, exporta todos los models
const models = require('../models'); 

module.exports = {
  name: 'usersController', 

  index: async (req, res, next) => {
    try {
      // Pedimos a la DB el usuario con el ID enviado por parametro
      // Accedemos al model por el `modelName` asignado en su archivo.
      const user = await models.user.findByPk(req.params.id);
      
      res.send(user); // Devolvemos el usuario como respuesta
      res.end(); // Terminamos la respuesta aca.
    } catch (error) {
      next(error); 
    }
  },
}
```

### Migrations

Se utilizan migrations para la creación, modificación o eliminación de cualquier entidad en la DB. `ES MUY IMPORTANTE` que se utilice esta funcionalidad, ya que al querer levantar un nuevo entorno de la app, no va a ser necesario hacer un dump de la DB anterior, solo se correria el comando `npm run migrate`.

Las Migrations deben ser creadas siempre utilizando la fecha y hora en que se crearon, o al menos la fecha y un numero de orden. Para que estas sean ejecutadas siempre en el mismo orden. 

Ejemplo: `20210108125000-create-user.js`. 

Se puede ver que se creo esta migration el dia 08/01/2021 a las 12:50:00. Y se le agrego `-create-user` para su facil identificación.

## Funciones Reutilizables

En una API Restful muy comunmente se necesiten realizar acciones como `envio de emails`, `creación/eliminación de archivos`, `exportación de XLS`, `paginado server-side`, `validación de datos recibidos`, `formateo de respuestas`. Dispone de un set de funciones reutilizables y expandibles a su gusto dentro de la carpeta `/app/functions`

### Envio de Emails

Para esto utilizamos el plugin `NodeMailer`. Puede acceder a su documentación oficial aca: https://nodemailer.com/

Este plugin por si solo, no dispone de un parser para HTML. Para esto usamos el plugin `HandlebarsJS`. Su documentación se encuentra aca: https://handlebarsjs.com/

Ejemplo para envio de un email:

```
// email_templates/my_template.html
<html>
  <head>
    ...
  </head>
  <body>
    <h1>Gracias por su apoyo señor/a {{name}}!</h1>
  </body>
</html>
```
```
// users.controller.js
const { loadFile } = require('../functions/fileSystem');
const { mail, mailParse } = require('../functions/mailer');
const config = require('../config/config');


module.exports = {
  name: 'usersController',

  sendEmail: async (req, res) => {
    const email_template = loadFile('../email_templates/my_template.html');
    const template_data = {
      name: 'Juan Perez',
    };

    const mailInfo = await mail.sendMail({
      // Tomamos desde el config. El email desde el que enviaremos
      from: config.mail_from, 
      
      // Destinatario
      to: 'to@recipient.com',

      // Podemos enviar una copia oculta (Opcional)
      bcc: 'bcc@recipient.com',

      // Asunto
      subject: 'My Subject',

      // HTML a enviar. Lo debemos parsear para reemplazar la data dentro
      html: mailParse(email_template, template_data),
    });

    console.log({ mailInfo });

    res.send('Email enviado con exito');
    res.end();
  },
}
```

### Manejo de Archivos

Para el manejo de archivos en el servidor, el plugin utilizado es `fs-extra`. Puede encontrar su documentación aca: https://github.com/jprichardson/node-fs-extra

Dentro del archivo `/functions/fileSystem.js` puede encontrar algunos helpers. Sientase libre de agregar mas helpers en caso de necesitarlos.

### Creación de XLS

Para realizar esta función usamos el plugin `excel4node`. Su documentación se encuentra aca: https://github.com/advisr-io/excel4node

Ejemplo de uso: 

```
// users.controller.js
const jsonToXls = require('../functions/jsonToXls');


module.exports = {
  name: 'usersController',

  downloadXls: async (req, res) => {
    const hoja1 = [
      {
        nombre: 'Gustavo Cerati',
        profesion: 'Musico',
        deuda: 15000,
      },
      {
        nombre: 'Marcelo Tinelli',
        profesion: 'Conductor de TV',
        deuda: 10000,
      },
      {
        nombre: 'Valeria Mazza',
        profesion: 'Modelo',
        deuda: 25000,
      },
    ];

    const hoja2 = [
      ... // datos hoja 2
    ];

    const options = {
      // Podemos pasar el nombre de los atributos tipo Money
      // para que queden parseados de esta manera en el XLS
      moneyCells: ['deuda'] 
    };

    const xlsPath = await jsonToXls(
      // Array con las hojas. 
      // Se puede enviar una o varias, 
      // pero siempre dentro de un array
      [hoja1, hoja2], 

      // Opciones
      options,
    ); 

    res.send('Email enviado con exito');
    res.end();
  },
}
```


### Formateo de Respuestas

Para cumplir con las convenciones de una API Restful, se recomienda ser consistente en las respuestas emitidas.
Puede encontrar una forma facil de realizar esto utilizando la función encapsulada dentro del archivo `src/functions/serviceUtil.js`.

```
// posts.controller.js
const models = require('../models');
const validate = require('../functions/validate');
const response = require('../functions/serviceUtil.js');

module.exports = {
  name: 'postsController',

  create: async (req, res, next) => {
    try {
      // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        await validate(
          // Datos a validar
          req.body, 
          
          // Reglas para la validación
          {
            title: 'required|max:255',
            body: 'required',
          }, 
          
          // Mensajes Personalizados en caso de error para cada regla
          {
            'required.title': 'El titulo es requerido',
            'max.title': 'El titulo no puede tener mas de 255 caracteres',
            'required.body': 'El cuerpo del post es requerido',
          }
        );

        await models.post.create({
          title: req.body.title,
          body: req.body.body,
        }, { transaction });

        return 'Post Creado con exito';
      });
      // Transaction complete!
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      // Transaction Failed!
      next(error);
    }
  },
}

/// La respuesta sera:
{
  code: 200,
  message: 'Successful operation!',
  success: true,
  data: 'Post Creado con exito',
};
```

### Paginado Server-Side

Para evitar el exceso de información enviada por peticiones HTTP se suele utilizar la paginación server-side. Para lograr esto tenemos un conjunto de funciones que se encuentran en el archivo `/app/functions/paginable.js`.

Ejemplo de uso:

```
// posts.controller.js
const models = require('../models');
const paginable = require('../functions/paginable');

module.exports = {
  name: 'postsController',

  index: async (req, res, next) => {
    try {
    // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        const posts = await models.post.findAndCountAll(
          paginable.paginate({ 
            transaction,
            // aca se puede hacer la query necesaria con sequelize
          }, req.query),
        );

        return posts;
      });
      // Transaction complete!
      res.status(200).send(paginable.paginatedResponse(result, req.query));
      res.end();
    } catch (error) {
    // Transaction Failed!
      next(error);
    }
  },
}

/// La Respuesta sera:
{
  code: 200,
  message: 'Successful operation!',
  success: true,
  data: {
    total: 125, // Cantidad de rows en DB
    per_page: 10, // Cantidad de rows en respuesta
    current_page: 1, // Pagina actual
    last_page: 13, // Ultima pagina
    from: 1, // Row de inicio en esta respuesta
    to: 10, // Row final en esta respuesta
    data: [
      ... // Data paginada 
    ],
  },
};

```

### Validación de Datos recibidos.

Para una rapida validación de los datos recibidos usamos el plugin `ValidatorJS`. Su documentación se puede encontrar aca: https://github.com/mikeerickson/validatorjs.

Se creo un wrapper para este validador, utilizando nuestro `errorHandler` para capturar sus errores y enviarlos directamente al usuario final.

Ejemplo de uso: 

```
// posts.controller.js
const models = require('../models');
const validate = require('../functions/validate');

module.exports = {
  name: 'postsController',

  create: async (req, res, next) => {
    try {
      // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        await validate(
          // Datos a validar
          req.body, 
          
          // Reglas para la validación
          {
            title: 'required|max:255',
            body: 'required',
          }, 
          
          // Mensajes Personalizados en caso de error para cada regla
          {
            'required.title': 'El titulo es requerido',
            'max.title': 'El titulo no puede tener mas de 255 caracteres',
            'required.body': 'El cuerpo del post es requerido',
          }
        );

        await models.post.create({
          title: req.body.title,
          body: req.body.body,
        }, { transaction });

        return 'Post Creado con exito';
      });
      // Transaction complete!
      res.status(200).send(result);
      res.end();
    } catch (error) {
      // Transaction Failed!
      next(error);
    }
  },
}
```
