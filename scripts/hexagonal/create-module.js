/* eslint-disable no-console */
const yargsInteractive = require('yargs-interactive');
const createApplication = require('./create-application');
const createInfrastructure = require('./create-infrastructure');
const { parseName, parseFields } = require('./helpers');
const createModel = require('./create-model');
const createMigration = require('./create-migration');
const createSeeder = require('./create-seeder');
const createRouter = require('./create-router');

try {
  const options = {
    interactive: { default: true },
    name: {
      type: 'input',
      describe: 'Enter a name for the module',
      prompt: 'if-no-arg',
      validate(value) {
        if (!value) return 'The name is required';
        return true;
      },
    },
    use_cases: {
      type: 'checkbox',
      prompt: 'if-no-arg',
      describe: 'Select default use cases',
      choices: [
        {
          name: 'Paginable List',
          value: 'paginate',
        },
        {
          name: 'List',
          value: 'list',
        },
        {
          name: 'Show',
          value: 'show',
        },
        {
          name: 'Create',
          value: 'create',
        },
        {
          name: 'Update',
          value: 'update',
        },
        {
          name: 'Delete',
          value: 'delete',
        },
        {
          name: 'Soft Delete',
          value: 'soft_delete',
        },
        {
          name: 'Validate',
          value: 'validate',
        },
      ],
      validate(value) {
        if (!value.length) return 'Select at least one use case';
        return true;
      },
    },
    with_model: {
      type: 'confirm',
      prompt: 'if-no-arg',
      describe: 'Create a model for the module',
      default: false,
    },
    fields: {
      type: 'input',
      prompt: 'if-no-arg',
      describe: 'Enter the fields for the model',
      default: '',
    },
    with_seeder: {
      type: 'confirm',
      prompt: 'if-no-arg',
      describe: 'Create a seeder for the module',
      default: false,
    },
    with_router: {
      type: 'confirm',
      prompt: 'if-no-arg',
      describe: 'Create a router for the module',
      default: true,
    },
    with_timestamps: {
      type: 'confirm',
      prompt: 'if-no-arg',
      describe: 'Create timestamps for the model',
      default: true,
    },
  };

  yargsInteractive()
    .usage('$0 <command> [args]')
    .interactive(options)
    .then(async (result) => {
      const nameVariants = parseName(result.name);
      const fields = parseFields(result.fields);
      const soft_delete = result.use_cases.includes('soft_delete');

      createApplication(nameVariants, result.use_cases, fields);
      createInfrastructure(nameVariants, result.use_cases, fields);

      if (result.with_model) {
        createModel(nameVariants, result.with_timestamps, fields, soft_delete);
        createMigration(
          nameVariants,
          result.with_timestamps,
          fields,
          soft_delete,
        );
        if (result.with_seeder) createSeeder(nameVariants, fields);
        if (result.with_router) createRouter(nameVariants, result.use_cases);
      }
    });
} catch (error) {
  console.error(error);
}
