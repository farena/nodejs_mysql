/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

module.exports = (
  { singularPC, singularSC },
  timestamps = true,
  fields = []
) => {
  const template = `const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ${singularPC} extends Model {
    // static associate(models) {
    // CREATE ASSOCIATIONS HERE
    // }
  }
  ${singularPC}.init(
    {
      ${singularSC}_id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      ${fields
        .map(
          (field) => `${field.name}: {
        type: DataTypes.${field.type}${
            field.type === "ENUM"
              ? `(['${field.enumValues.join("', '")}'])`
              : ""
          },
      },`
        )
        .join("\n      ")}
    },
    {
      sequelize,
      modelName: '${singularSC}',${
    !timestamps
      ? `
      timestamps: false,`
      : ""
  }
    },
  );
  return ${singularPC};
};
`;

  const relPath = path.join(
    __dirname,
    "../../app/models",
    `${singularSC}.model.js`
  );

  if (fs.existsSync(relPath))
    throw new Error(`There is already a model in path: ${relPath}`);

  fs.writeFile(relPath, template, (err) => {
    // In case of a error throw err.
    if (err) throw err;
    else {
      console.log(`Model created in /app/models/${singularSC}.model.js`);
    }
  });
};
