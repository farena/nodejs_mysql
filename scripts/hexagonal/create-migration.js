/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const moment = require('moment');

module.exports = (
  { singularSC },
  timestamps = true,
  fields = [],
  soft_delete = false,
) => {
  const template = `module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('${singularSC}', {
      ${singularSC}_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      ${fields
        .map(
          (field) => `${field.name}: {
        type: DataTypes.${field.type}${
            field.type === 'ENUM'
              ? `(['${field.enumValues.join("', '")}'])`
              : ''
          },
      },`,
        )
        .join('\n      ')}${
    soft_delete
      ? `
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },\n`
      : ''
  }${
    !timestamps
      ? ''
      : `      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },`
  }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('${singularSC}');
  },
};
`;

  const fileName = `${moment().format(
    'YYYYMMDDHHmmss',
  )}-DDL-create-${singularSC}-table.js`;
  const relPath = path.resolve(__dirname, `../../app/migrations/${fileName}`);

  if (fs.existsSync(relPath))
    throw new Error(`There is already a migration in path: ${relPath}`);

  fs.writeFile(relPath, template, (err) => {
    // In case of a error throw err.
    if (err) throw err;
    else {
      console.log(`Migration created in /app/migrations/${fileName}`);
    }
  });
};
