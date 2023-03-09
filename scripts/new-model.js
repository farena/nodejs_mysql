const yargs = require('yargs');
const createModel = require('./create-model');
const createMigration = require('./create-migration');
const createSeeder = require('./create-seeder');
const createController = require('./create-controller');
const createRouter = require('./create-router');

const parseUtilsDir = (utils_dir) => {
  if (!utils_dir) return '../functions';

  const dirStack = utils_dir.split('/');
  dirStack[0] = '..';
  return dirStack.join('/');
};

const parsePluralName = (name) => {
  let pluralName = name;
  switch (name.slice(-1)) {
    case 'y': pluralName = `${name.slice(0, -1)}ies`; break;
    case 's': pluralName = `${name}es`; break;
    default: pluralName = `${name}s`; break;
  }
  return pluralName;
};

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
    .option('utils_dir', {
      describe: 'Utils directory path from root folder', type: 'string', demandOption: false,
    })
    .argv;

  const name = options.name.replace(/\.?([A-Z]+)/g, (x, y) => `_${y.toLowerCase()}`).replace(/^_/, '');
  const pluralName = parsePluralName(name);
  const utils_dir = parseUtilsDir(options.utils_dir);

  createModel(name, !options['no-timestamps']);
  createMigration(name, !options['no-timestamps']);

  if (options.seeder) createSeeder(name);
  if (options.controller) createController(name, pluralName, utils_dir);
  if (options.router) createRouter(name, pluralName);
} catch (error) {
  console.error(error);
}
