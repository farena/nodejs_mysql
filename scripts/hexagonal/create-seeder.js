/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

module.exports = ({ singularSC }, fields = []) => {
  const template = `module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      '${singularSC}',
      [
        {
          ${singularSC}_id: 1,
          ${fields.map((field) => `${field.name}: null`).join(",\n          ")}
        },
      ],
    );
  },
};
`;

  const relPath = path.resolve(__dirname, `../../app/seeders/${singularSC}.js`);

  if (fs.existsSync(relPath))
    throw new Error(`There is already a seeder in path: ${relPath}`);

  fs.writeFile(relPath, template, (err) => {
    // In case of a error throw err.
    if (err) throw err;
    else {
      console.log(`Seeder created in /app/seeders/${singularSC}.js`);
    }
  });
};
