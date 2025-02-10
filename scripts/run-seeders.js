/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-console */
require('dotenv').config(); // Required for enviorment variables
const yargsInteractive = require('yargs-interactive');
const fs = require('fs');
const path = require('path');
const ProviderSettings = require('../app/infrastructure/libs/providerSettings');

const dbSingleton = ProviderSettings.getInstance({ db_logging: false });
const seedersDir = path.join(__dirname, '../app/seeders');

function getSeedersList() {
  const seeders = fs
    .readdirSync(seedersDir)
    .filter((file) => file.endsWith('.js'));

  return seeders;
}

function loadSeeder(seederFile) {
  const seeder = require(path.join(seedersDir, seederFile));
  if (!seeder) {
    throw new Error('No seeder was found');
  }
  return seeder;
}

async function runSeedersForConnection(
  domain,
  sequelize,
  selectedSeeder,
  provider,
) {
  try {
    console.log(`Running seeders for ${domain}`);

    const queryInterface = sequelize.getQueryInterface();

    if (selectedSeeder === 'System Data') {
      const allSeeders = getSeedersList();
      const seeders = allSeeders.filter((x) => x.includes('system'));

      for (const seederName of seeders) {
        const seeder = loadSeeder(seederName);
        await seeder.up(queryInterface, sequelize.Sequelize, provider);

        console.log(`Seeder ${seederName} executed for ${domain}`);
      }
    } else {
      const seeder = loadSeeder(selectedSeeder);
      await seeder.up(queryInterface, sequelize.Sequelize, provider);

      console.log(`Seeder ${selectedSeeder} executed for ${domain}`);
    }
  } catch (error) {
    console.error(`Error executing seeders for ${domain}:`, error);
  }
}

async function run(selectedDomain, selectedSeeder) {
  await dbSingleton.refreshProviders();

  if (selectedDomain !== 'All (Not test)') {
    const provider = await dbSingleton.getProviderSettings({
      domain: selectedDomain,
    });

    const {
      settings: { domain },
      db,
    } = provider;

    await runSeedersForConnection(domain, db, selectedSeeder, provider);
  } else {
    const providers = dbSingleton
      .providersToArray()
      .filter((x) => !x.settings.name.includes('Test Env'));

    for (const provider of providers) {
      const {
        settings: { domain },
        db,
      } = provider;

      await runSeedersForConnection(domain, db, selectedSeeder, provider);
    }
  }
}

(async () => {
  try {
    await dbSingleton.refreshProviders();
    const seeders = getSeedersList();

    const options = {
      interactive: { default: true },
      domain: {
        type: 'list',
        describe: 'Select a domain',
        prompt: 'if-no-arg',
        choices: [
          'Test Env',
          'All (Not test)',
          ...dbSingleton
            .providersToArray()
            .filter((x) => !x.settings.name.includes('Test Env'))
            .map((x) => `${x.settings.name} | ${x.settings.domain}`),
        ],
      },
      name: {
        type: 'list',
        describe: 'Select a seeder',
        prompt: 'if-no-arg',
        choices: ['System Data', ...seeders],
      },
    };

    yargsInteractive()
      .usage('$0 <command> [args]')
      .interactive(options)
      .then(async (result) => {
        if (result.domain === 'Test Env') {
          const testEnv = dbSingleton
            .providersToArray()
            .find((x) => x.settings.name === 'Test Env');

          if (!testEnv) {
            throw new Error(
              'There is no TEST Env. Please create one into Provider table, named "Test Env"',
            );
          }

          await run(testEnv.settings.domain, result.name);
          return;
        }

        const domain = result.domain.split('|').pop().trim();
        await run(domain, result.name);
      });
  } catch (error) {
    console.error(error);
  }
})();
