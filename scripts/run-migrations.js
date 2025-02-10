/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-console */
require('dotenv').config(); // Required for enviorment variables
const yargsInteractive = require('yargs-interactive');
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const ProviderSettings = require('../app/infrastructure/libs/providerSettings');

const dbSingleton = ProviderSettings.getInstance({ db_logging: false });
const migrationsDir = path.join(__dirname, '../app/migrations');

function loadMigrations() {
  const migrations = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.js'));

  return migrations;
}
function loadMigration(migrationFile) {
  return require(path.join(migrationsDir, migrationFile));
}

async function createSequelizeMetaIfNotExist({ sequelize }) {
  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS SequelizeMeta (
      name VARCHAR(255) NOT NULL,
      PRIMARY KEY (name)
    );`,
  );
}

async function getLastMigrationDone({ sequelize }) {
  const [lastMigration] = await sequelize.query(
    'SELECT * FROM SequelizeMeta ORDER BY name DESC LIMIT 1',
    {
      type: Sequelize.QueryTypes.SELECT,
    },
  );

  return lastMigration?.name;
}

async function migrationDone({ migrationFile, sequelize }) {
  const [existingMigration] = await sequelize.query(
    'SELECT * FROM SequelizeMeta WHERE name = :migrationFile',
    {
      replacements: { migrationFile },
      type: Sequelize.QueryTypes.SELECT,
    },
  );

  return !!existingMigration;
}

async function registerMigration({ migrationFile, sequelize }) {
  await sequelize.query(
    'INSERT INTO SequelizeMeta (name) VALUES (:migrationFile)',
    {
      replacements: { migrationFile },
    },
  );
}
async function unregisterMigration({ migrationFile, sequelize }) {
  await sequelize.query(
    'DELETE FROM SequelizeMeta WHERE name = :migrationFile',
    {
      replacements: { migrationFile },
    },
  );
}

async function runMigrationsForConnection(
  domain,
  sequelize,
  settings,
  aws_s3,
  algolia,
) {
  try {
    console.log(`Running migrations for ${domain}`);

    const queryInterface = sequelize.getQueryInterface();

    await createSequelizeMetaIfNotExist({ sequelize });

    const migrations = loadMigrations();
    let doneCount = 0;

    for (const migrationFile of migrations) {
      const migrationIsDone = await migrationDone({
        migrationFile,
        sequelize,
      });

      if (!migrationIsDone) {
        const migration = require(path.join(migrationsDir, migrationFile));
        await migration.up(
          queryInterface,
          sequelize.Sequelize,
          settings,
          aws_s3,
          algolia,
        );

        await registerMigration({ migrationFile, sequelize });

        console.log(`Migration ${migrationFile} executed for ${domain}`);
      } else {
        doneCount += 1;
      }
    }

    if (doneCount === migrations.length) {
      console.log(`Migrations up to date for ${domain}`);
    }
  } catch (error) {
    console.error(`Error executing migrations for ${domain}:`, error);
  }
}

async function rollbackMigrationForConnection(domain, sequelize, algolia) {
  const queryInterface = sequelize.getQueryInterface();
  const migrationFile = await getLastMigrationDone({ sequelize });
  const migration = loadMigration(migrationFile);

  try {
    if (!migration) throw Error(`Migration '${migrationFile}' doesnt exist`);

    await migration.down(queryInterface, sequelize.Sequelize, algolia);

    await unregisterMigration({ migrationFile, sequelize });

    console.log(`Migration ${migrationFile} rolled back for ${domain}`);
  } catch (error) {
    console.error(
      `Error rolling back migration ${migrationFile} for ${domain}:`,
      error,
    );
  }
}

async function run(selectedDomain) {
  if (selectedDomain !== 'All (Not test)') {
    const {
      settings,
      db,
      aws_s3,
      algolia,
    } = await dbSingleton.getProviderSettings({
      domain: selectedDomain,
    });

    await runMigrationsForConnection(
      settings.domain,
      db,
      settings,
      aws_s3,
      algolia,
    );
  } else {
    const providers = dbSingleton
      .providersToArray()
      .filter((x) => !x.settings.name.includes('Test Env'));

    for (const { settings, db, aws_s3, algolia } of providers) {
      await runMigrationsForConnection(
        settings.domain,
        db,
        settings,
        aws_s3,
        algolia,
      );
    }
  }
}
async function runRollback(selectedDomain) {
  if (selectedDomain !== 'All (Not test)') {
    const {
      settings: { domain },
      db,
      algolia,
    } = await dbSingleton.getProviderSettings({ domain: selectedDomain });

    await rollbackMigrationForConnection(domain, db, algolia);
  } else {
    const providers = dbSingleton
      .providersToArray()
      .filter((x) => !x.settings.name.includes('Test Env'));

    for (const {
      settings: { domain },
      db,
      algolia,
    } of providers) {
      await rollbackMigrationForConnection(domain, db, algolia);
    }
  }
}

(async () => {
  try {
    await dbSingleton.refreshProviders();

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
      undo: {
        type: 'confirm',
        default: false,
        describe: 'Undo last migration?',
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

          await run(testEnv.settings.domain);
          return;
        }

        if (result.undo) {
          await runRollback(result.domain.split('|').pop().trim());
        } else {
          await run(result.domain.split('|').pop().trim());
        }
      });
  } catch (error) {
    console.error(error);
  }
})();
