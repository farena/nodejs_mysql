# NodeJS + Express + Sequel (Mysql)

## Index
- [Basic installation](#basic-installation)
- [Deploy to Production](#deploy-to-production)
- [Settings](#settings)
- [Routing](#routing)
- [Database Interaction](#database-interaction)
- [Reusable Functions](#reusable-functions)


## Basic installation

```
// Clone the repository
git clone https://github.com/farena/nodejs_mysql.git

// Install dependencies
install npm

// Copy .env.example and fill in the DB variables
cp .env.example .env

// Start the server in development mode
npm start
```

## Deploy to production
```
// Change the environment variable NODE_ENV to production
// NODE_ENV=production

// Run application in daemon mode. It can be done with PM2, a process manager for NodeJS or within CPanel with your process manager.

    - Registration of the application within CPanel
    https://docs.cpanel.net/knowledge-base/web-services/how-to-install-a-node.js-application/

    - Run application with PM2 - ADVANCED PRODUCTION PROCESS MANAGER FOR NODE.JS
    https://desarrolloweb.com/articulos/ejecutar-aplicacion-nodejs-pm2.html
```

## Settings

It is often useful to have different configuration values depending on the environment in which the application is running. For example, you might want to use a different PORT to run the server locally than the one you use on your production server.

To use environment variables, this project uses the `DOTENV` plugin. Your application's root directory will have a `.env.example` file that defines many common environment variables to be used. You will need to duplicate this file and rename it to `.env`, which is ignored by git.

Some common variables are used to create a new database connection and you can see it working inside `/app/config/db.config.js`. Other variables used throughout the application are stored within `/app/config/config.js`.

### Using environment variables

All variables created in the `.env` file will be loaded into the global `process.env` variable when your application starts.

You can use it anywhere in the application like this:

```
const port = process.env.PORT;

console.log(port); // 3000
```

### Modifying an environment variable

In case of modifying a variable inside this file. you will be able to restart the application. Stopping the `npm start` process by entering the console where `ctrl + c` is being pressed, then you will need to start `npm start` again.

## Routing

To create a Rest API with the application, you must route the requests that we are going to receive. To do this we use the `ExpressJS` plugin. You can find the official documentation here: https://expressjs.com.

Inside the `/app/routes` folder you will find files ending in `.router.js`, each of these files contains the routes you create. They are separated by modules for a better understanding when looking for a route.

### Basic Routes
```
const express = require('express');
const router = express.Router();

router.get('/', (required, res) => {
    res.send('GET Request for root route');
});
router.post('/', (required, res) => {
    res.send('POST Request a root path');
});

router.put('/', (required, res) => {
    res.send('PUT Request for root path');
});
router.delete('/', (required, res) => {
    res.send('DELETE Root Route Request');
});
```

### Routes with Middleware

To transform, validate or reject a request, Express uses middlewares. To pass a middleware to a route, simply add it inside an array before the final function to be executed.

```
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.js');

router.get('/users', [authMiddleware], (req, res) => {
    res.send('Congratulations! You have access to this resource.');
});


module.exports = {
    basepath: '/',
    router,
};
```

### Route groups

As you can see in the example above, an object with 2 variables is exported at the end of the file. `basePath` and `router`.

BasePath will be the base from which the paths for that file will be created. While in router, the created routes will be exported.

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

### Controllers

As you can see, routes execute a function when requested by a user. For better organization, these functions are exported from the `controllers`. And it is used as follows.

```
// users.router.js

const express = require('express');
const router = express.Router();
// The index file, export all controllers
const controllers = require('../controllers/index');
const { authMiddleware } = require('../middlewares/auth.js');

router.get('/users', [authMiddleware], controllers.usersController.index);
```
```
// users.controller.js

module.exports = {
   name: 'usersController', // name used to access from the router

   index: (req, res) => {
     res.send('Congratulations! You accessed this resource from a controller.');
   },
}
```

### Error handling

For error handling, the application uses an `errorHandler` located in `/app/functions/errorHandler.js`. This is executed every time Express throws an error.


```
// users.controller.js
const CustomError = require('../functions/CustomError.js');

module.exports = {
   name: 'usersController',

   index: (req, res, next) => {
     try {
       // Throw an error to test
       throw new CustomError('Test Error')

       res.send('This message cannot be seen');
     } catch(error) {
       // catch the error with catch
       // and send it to the errorHandler
       next(error);
     }
   },
}
```

### Parameters

To get the data of a particular user, use parameters in the routes.

```
// users.router.js

const express = require('express');
const router = express.Router();
const controllers = require('../controllers/index');
const { authMiddleware } = require('../middlewares/auth.js');

// We send the USER_ID to consult the DB
router.get('/users/:user_id', [authMiddleware], controllers.usersController.show);
```


```
// users.controller.js
module.exports = {
   name: 'usersController',

   index: (req, res, next) => {
     try {
       // We save USER_ID in variable
       const id = req.params.user_id;

       res.send(`User information with ID: ${id}`);
     } catch(error) {
       next(error);
     }
   },
}
```

### Variables sent by HTTP

When receiving HTTP requests, variables are commonly sent with information to consult or save in DB.

In the case of a POST, PUT and DELETE request, variables will be sent in the BODY of the request. While a GET request will be sent in the same route.

Here some examples:

```
// Send a GET request to /users with 2 variables.
GET: /users?status=active&role=admin
```

```
// users.controller.js
module.exports = {
   name: 'usersController',

   index: (req, res, next) => {
     try {
       // For GET requests, get the variables from req.query
       const status = req.query.status;
       const role = req.query.role;

       console. log(status); // 'activate'
       console. log(role); // 'admin'

       res.send('Response');
     } catch(error) {
       next(error);
     }
   },
}
```

```
// Send a POST request to /users with 2 variables.
POST: /users
BODY: {
   name: 'John',
   email: 'john@example.com'
}
```

```
// users.controller.js
module.exports = {
   name: 'usersController',

   index: (req, res, next) => {
     try {
       // For POST requests, get the variables from req.body
       const name = req.body.name;
       const email = req.body.email;

       console. log(name); // 'activate'
       console.log(email); // 'admin'

       res.send('Response');
     } catch(error) {
       next(error);
     }
   },
}
```

## Database Interaction

To interact with the Database the application uses the ORM `Sequelize`. You can access the full documentation here: https://sequelize.org/docs/v6/getting-started/

### Models

A Model is a representation of a table in the database, in JS Object format. In this way we can execute queries to the DB in a much simpler way.

You can find them in the `/app/models` folder and each model ends with `.model.js`. By convention, the name of a model, as well as its table in the DB, is written in the SINGULAR. For example: `user.model.js`

Models are used commonly in a controller.

```
// user.model.js
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
   class User extends Model {
     static associate(models) {
       // Here the relationships with other models will be added.
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
       modelName: 'user', // Name to access the model.
     },
   );
   return User;
};
```

```
// users.controller.js
// The index file in this folder, export all models
const models = require('../models');

module.exports = {
   name: 'usersController',

   index: async(req, res, next) => {
     try {
       // We ask the DB for the user with the ID sent by parameter
       // Access the model by the `modelName` assigned in its file.
       const user = await models.user.findByPk(req.params.id);
      
       res. send(user); // We return the user as a response
       res.end(); // We end the response here.
     } catch(error) {
       next(error);
     }
   },
}
```

### Migrations

Migrations are used for the creation, modification or deletion of any entity in the DB. `IT IS VERY IMPORTANT` that this functionality is used, since when wanting to create a new environment for the app, it will not be necessary to dump the previous DB, just run the `npm run migrate` command.

Migrations should always be created using the date and time they were created, or at least the date and an order number. So that they are always executed in the same order.

Example: `20210108125000-create-user.js`.

You can see that this migration was created on 01/08/2021 at 12:50:00. And added `-create-user` for easy identification.

## Reusable Functions

In a Restful API, actions such as `sending emails`, `creating/deleting files`, `exporting XLS`, `server-side pagination`, `validation of received data`, `response formatting` are commonly needed. It has a set of reusable and expandable functions inside the `/app/functions` folder.

### Sending Emails

To this we use the `NodeMailer` plugin. You can access its official documentation here: https://nodemailer.com/

This plugin by itself does not have an HTML parser. For this we use the `HandlebarsJS` plugin. Its documentation is here: https://handlebarsjs.com/

Example for sending an email:

```
// email_templates/my_template.html
<html>
   <head>
     ...
   </head>
   <body>
     <h1>Thank you for your support Mr. {{name}}!</h1>
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

   sendEmail: async(req, res) => {
     const email_template = loadFile('../email_templates/my_template.html');
     const template_data = {
       name: 'John Doe',
     };

     const mailInfo = await mail.sendMail({
       // We take from the config. The email from which we will send
       from: config.mail_from,
      
       // Email Address
       to: 'to@recipient.com',

       // We can send a hidden copy (Optional)
       bcc: 'bcc@recipient.com',

       // Email subject
       subject: 'My Subject',

       // HTML to send. We must parse it to replace the data inside
       html: mailParse(email_template, template_data),
     });

     console.log({ mailInfo });

     res.send('Email sent successfully');
     res.end();
   },
}
```

### File management

For file management on the server, the plugin used is `fs-extra`. You can find its documentation here: https://github.com/jprichardson/node-fs-extra

Inside the `/functions/fileSystem.js` file you can find some helpers. Feel free to add more helpers if you need them.

### XLS Creation

To perform this function we use the `excel4node` plugin. Its documentation is here: https://github.com/advisr-io/excel4node

Usage example:

```
// users.controller.js
const jsonToXls = require('../functions/jsonToXls');


module.exports = {
   name: 'usersController',

   downloadXls: async(req, res) => {
     const sheet1 = [
       {
         name: 'Gustavo Cerati',
         profession: 'Musician',
         debt: 15000,
       },
       {
         name: 'Marcelo Tinelli',
         profession: 'TV host',
         debt: 10000,
       },
       {
         name: 'Valeria Mazza',
         profession: 'Model',
         debt: 25000,
       },
     ];

     const sheet2 = [
       ... // data sheet 2
     ];

     const options = {
       // We can pass the name of the Money type attributes
       // so that they are parsed in this way in the XLS
       moneyCells: ['debt']
     };

     const xlsPath = await jsonToXls(
       // Array with the pages.
       // You can send one or more,
       // but always inside an array
       [sheet1, sheet2],

       // Options
       options,
     );

     res.send('Email sent successfully');
     res.end();
   },
}
```


### Response Formatting

To comply with the conventions of a Restful API, it is recommended to be consistent in the responses issued.
You can find an easy way to do this by using the function wrapped inside the `src/functions/serviceUtil.js` file.

```
// posts.controller.js
const models = require('../models');
const validate = require('../functions/validate');
const response = require('../functions/serviceUtil.js');

module.exports = {
   name: 'postController',

   create: async(req, res, next) => {
     try {
       // Start Transaction
       const result = await models.sequelize.transaction(async(transaction) => {
         await validate(
           // Data to validate
           req.body,
          
           // Rules for validation
           {
             title: 'required|max:255',
             body: 'required',
           },
          
           // Custom messages in case of error for each rule
           {
             'required.title': 'The title is required',
             'max.title': 'The title cannot have more than 255 characters',
             'required.body': 'The body of the post is required',
           }
         );

         await models.post.create({
           title: req.body.title,
           body: req.body.body,
         }, { transaction });

         return 'Post Created successfully';
       });
       // Transaction complete!
       res.status(200).send(response.getResponseCustom(200, result));
       res.end();
     } catch(error) {
       // Transaction Failed!
       next(error);
     }
   },
}

/// The response will be:
{
   code: 200,
   message: 'Successful operation!',
   success: true,
   data: 'Post Created successfully',
};
```

### Server-Side Pagination

To avoid the excess of information sent by HTTP requests, server-side pagination is usually used. To achieve this we have a set of functions found in the `/app/functions/paginable.js` file.

Usage example:

```
// posts.controller.js
const models = require('../models');
const pageable = require('../functions/pageable');

module.exports = {
   name: 'postController',

   index: async(req, res, next) => {
     try {
     // Start Transaction
       const result = await models.sequelize.transaction(async(transaction) => {
         const posts = await models.post.findAndCountAll(
           pageable.paginate({
             transaction,
             // here you can do the necessary query with sequelize
           }, req.query),
         );

         return posts;
       });
       // Transaction complete!
       res.status(200).send(paginable.paginatedResponse(result, req.query));
       res.end();
     } catch(error) {
     // Transaction Failed!
       next(error);
     }
   },
}

/// The response will be:
{
   code: 200,
   message: 'Successful operation!',
   success: true,
   data: {
     total: 125, // Number of rows in DB
     per_page: 10, // Number of rows in response
     current_page: 1, // Current page
     last_page: 13, // Last page
     from: 1, // Starting row in this response
     to: 10, // Final Row in this response
     data: [
       ... // Paged data
     ],
   },
};

```

### Validation of data received.

For a quick validation of the received data we use the `ValidatorJS` plugin. Its documentation can be found here: https://github.com/mikeerickson/validatorjs.

A wrapper was created for this validator, using our `errorHandler` to catch its errors and send them directly to the end user.

Usage example:

```
// posts.controller.js
const models = require('../models');
const validate = require('../functions/validate');

module.exports = {
   name: 'postController',

   create: async(req, res, next) => {
     try {
       // Start Transaction
       const result = await models.sequelize.transaction(async(transaction) => {
         await validate(
           // Data to validate
           req.body,
          
           // Rules for validation
           {
             title: 'required|max:255',
             body: 'required',
           },
          
           // Custom messages in case of error for each rule
           {
             'required.title': 'The title is required',
             'max.title': 'The title cannot have more than 255 characters',
             'required.body': 'The body of the post is required',
           }
         );

         await models.post.create({
           title: req.body.title,
           body: req.body.body,
         }, { transaction });

         return 'Post Created successfully';
       });
       // Transaction complete!
       res.status(200).send(result);
       res.end();
     } catch(error) {
       // Transaction Failed!
       next(error);
     }
   },
}
```