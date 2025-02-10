const fs = require('fs');
const path = require('path');

module.exports = (name, timestamps = true) => {
  const camelCaseName = name
    .split('_')
    .map((x) => `${x[0].toUpperCase()}${x.slice(1)}`)
    .join('');

  const template = `const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ${camelCaseName} extends Model {
    // static associate(models) {
    // CREATE ASSOCIATIONS HERE
    // }
  }
  ${camelCaseName}.init(
    {
      ${name}_id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      // CREATE COLUMNS HERE
    },
    {
      sequelize,
      modelName: '${name}',${
    !timestamps
      ? `
      timestamps: false,`
      : ''
  }
    },
  );
  return ${camelCaseName};
};
`;

  const relPath = path.resolve(__dirname, `../app/models/${name}.model.js`);

  if (fs.existsSync(relPath))
    throw new Error(`There is already a model in path: ${relPath}`);

  fs.writeFile(relPath, template, (err) => {
    // In case of a error throw err.
    if (err) throw err;
    else {
      console.log(`Model created in /app/models/${name}.model.js`);
    }
  });
};
