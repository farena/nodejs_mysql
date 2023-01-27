const fs = require('fs');
const path = require('path');
const moment = require('moment');

module.exports = (name, timestamps = true) => {
  const template = `module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('${name}', {
      ${name}_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      // CREATE COLUMNS HERE${!timestamps ? '' : `
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },`}
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('${name}');
  },
};
`;

  const fileName = `${moment().format('DDMMYYYYHHmmss')}-create-${name}-table.js`;
  const relPath = path.resolve(
    __dirname,
    `../app/migrations/${fileName}`,
  );

  if (fs.existsSync(relPath)) throw new Error(`There is already a migration in path: ${relPath}`);

  fs.writeFile(relPath, template, (err) => {
    // In case of a error throw err.
    if (err) throw err;
    else {
      console.log(`Migration created in /app/migrations/${fileName}`);
    }
  });
};
