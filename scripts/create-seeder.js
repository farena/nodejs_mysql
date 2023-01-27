const fs = require('fs');
const path = require('path');

module.exports = (name) => {
  const template = `module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      '${name}',
      [
        {
          ${name}_id: 1,
          // ADD COLUMNS HERE
        },
      ],
    );
  },
};
`;

  const relPath = path.resolve(__dirname, `../app/seeders/${name}.js`);

  if (fs.existsSync(relPath)) throw new Error(`There is already a seeder in path: ${relPath}`);

  fs.writeFile(relPath, template, (err) => {
    // In case of a error throw err.
    if (err) throw err;
    else {
      console.log(`Seeder created in /app/seeders/${name}.js`);
    }
  });
};
