const yargs = require('yargs');
const createModel = require('./create-model');
const createMigration = require('./create-migration');
const createSeeder = require('./create-seeder');
const createController = require('./create-controller');
const createRouter = require('./create-router');

try {
  const options = yargs
    .usage('Usage: -n <name> [--no-stamps|--no-timestamps] [-s|--seeder] [-c|--controller] [-r|--router]')
    .option('n', {
      alias: 'name', describe: 'Model name', type: 'string', demandOption: true,
    })
    .option('no-stamps', {
      alias: 'no-timestamps', describe: 'Create without timestamps', type: 'boolean', demandOption: false,
    })
    .option('s', {
      alias: 'seeder', describe: 'Create seeder template', type: 'boolean', demandOption: false,
    })
    .option('c', {
      alias: 'controller', describe: 'Create controller template', type: 'boolean', demandOption: false,
    })
    .option('r', {
      alias: 'router', describe: 'Create router template', type: 'boolean', demandOption: false,
    })
    .argv;

  const name = options.name.replace(/\.?([A-Z]+)/g, (x, y) => `_${y.toLowerCase()}`).replace(/^_/, '');

  createModel(name, !options['no-timestamps']);
  createMigration(name, !options['no-timestamps']);

  if (options.seeder) createSeeder(name);
  if (options.controller) createController(name);
  if (options.router) createRouter(name);
} catch (error) {
  console.error(error);
}
