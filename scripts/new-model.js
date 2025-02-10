const yargs = require('yargs');
const createModel = require('./create-model');
const createMigration = require('./create-migration');
const createSeeder = require('./create-seeder');

try {
  const options = yargs
    .usage('Usage: -n <name> [--no-stamps|--no-timestamps] [-s|--seeder]')
    .option('n', {
      alias: 'name',
      describe: 'Model name',
      type: 'string',
      demandOption: true,
    })
    .option('no-stamps', {
      alias: 'no-timestamps',
      describe: 'Create without timestamps',
      type: 'boolean',
      demandOption: false,
    })
    .option('s', {
      alias: 'seeder',
      describe: 'Create seeder template',
      type: 'boolean',
      demandOption: false,
    }).argv;

  const name = options.name
    .replace(/\.?([A-Z]+)/g, (x, y) => `_${y.toLowerCase()}`)
    .replace(/^_/, '');

  createModel(name, !options['no-timestamps']);
  createMigration(name, !options['no-timestamps']);

  if (options.seeder) createSeeder(name);
} catch (error) {
  console.error(error);
}
