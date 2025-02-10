/* eslint-disable no-console */
const yargsInteractive = require('yargs-interactive');
const createApplication = require('./create-application');
const createInfrastructure = require('./create-infrastructure');
const parseName = require('./name-parser');
const createRouter = require('../create-router');

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
          name: 'Validate',
          value: 'validate',
        },
      ],
      validate(value) {
        if (!value.length) return 'Select at least one use case';
        return true;
      },
    },
  };

  yargsInteractive()
    .usage('$0 <command> [args]')
    .interactive(options)
    .then(async (result) => {
      const nameVariants = parseName(result.name);
      createApplication(nameVariants, result.use_cases);
      createInfrastructure(nameVariants, result.use_cases);
      createRouter(nameVariants, result.use_cases);
    });
} catch (error) {
  console.error(error);
}
