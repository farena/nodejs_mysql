require('dotenv').config(); // Required for environment variables

const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const errorHandler = require('./app/functions/errorHandler');
const CustomError = require('./app/functions/CustomError');

// add CustomError to globals
global.CustomError = CustomError;

const express = require('express');
const compression = require('compression');
const moment = require('moment-timezone');

const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());
app.use(helmet()); // Add Helmet as a middleware

// Add headers
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  );

  // Request headers you wish to allow
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With,content-type,authorization',
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// Add Routes and tasks
const routes = require('./app/routes/index');

routes.map((x) => app.use(x.basePath, x.router));

app.use(express.static('public'));

// Main errorHandler
app.use((err, req, res, next) => { errorHandler(err, req, res, next) });

// assume 404 since no middleware responded
app.use((req, res) => {
  res.status(404)
    .json({
      code: 404,
      message: 'Not found',
      success: false,
      data: [],
    });
});

const server = app.listen(process.env.PORT || 3000, () => {
  const host = server.address().address;
  const { port } = server.address();

  // eslint-disable-next-line no-console
  console.log(`App listening at ${host}:${port}`);
});
