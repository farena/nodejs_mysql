require('dotenv').config(); // Required for environment variables

// add CustomError to globals
global.CustomError = require('./app/functions/CustomError');

const helmet = require('helmet');
const express = require('express');
const compression = require('compression');

const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { cors } = require('./app/middlewares/cors');
const { errorHandler } = require('./app/functions/errorHandler');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());
app.use(helmet()); // Add Helmet as a middleware
app.use(cors); // add cors as middleware

// Add Routes and tasks
const routes = require('./app/routes/index');

routes.map((x) => app.use(x.basePath, x.router));

app.use(express.static('public'));

// Main errorHandler
app.use((err, req, res, next) => { errorHandler(err, req, res, next); });

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
