/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const Controller = require('./templates/infrastructure/Controller');
const Injector = require('./templates/infrastructure/Injector');
const Repository = require('./templates/infrastructure/Repository');

const createController = (nameVariants, use_cases) => {
  const relPath = path.resolve(
    __dirname,
    `../../app/infrastructure/controllers/${nameVariants.pluralPC}Controller.js`,
  );

  if (fs.existsSync(relPath)) {
    throw new Error(`There is already a file in path: ${relPath}`);
  }

  fs.writeFile(relPath, Controller(nameVariants, use_cases), (err) => {
    // In case of a error throw err.
    if (err) throw err;
    else {
      console.log(
        `Controller created in /app/infrastructure/controllers/${nameVariants.pluralPC}Controller.js`,
      );
    }
  });
};

const injectRepository = ({ pluralPC, pluralSC }) => {
  const relPath = path.resolve(
    __dirname,
    '../../app/infrastructure/repositories/index.js',
  );

  if (!fs.existsSync(relPath)) {
    throw new Error(`There is no repository index file in path: ${relPath}`);
  }

  const fileLines = fs.readFileSync(relPath).toString().split('\n');
  let lineToAppendImport;
  let lineToAppendExport;

  fileLines.forEach((line, index) => {
    if (line.slice(0, 14) === 'module.exports') lineToAppendImport = index - 1;
    if (line.slice(0, 2) === '};') lineToAppendExport = index + 1;
  });

  // Import new Repository
  fileLines.splice(
    lineToAppendImport,
    0,
    `const ${pluralPC}Repository = require('./${pluralSC}.repository');`,
  );

  // Export new Repository
  fileLines.splice(lineToAppendExport, 0, `  ${pluralPC}Repository,`);

  fs.writeFile(relPath, fileLines.join('\n'), (err) => {
    if (err) throw err;
    else {
      console.log(
        'Repository injected in /app/infrastructure/repositories/index.js',
      );
    }
  });
};

const createRepository = (nameVariants, use_cases) => {
  const relPath = path.resolve(
    __dirname,
    `../../app/infrastructure/repositories/${nameVariants.pluralSC}.repository.js`,
  );

  if (fs.existsSync(relPath)) {
    throw new Error(`There is already a file in path: ${relPath}`);
  }

  fs.writeFile(relPath, Repository(nameVariants, use_cases), (err) => {
    // In case of a error throw err.
    if (err) throw err;
    else {
      console.log(
        `Repository created in /app/infrastructure/repositories/${nameVariants.pluralSC}.repository.js`,
      );
    }
  });

  injectRepository(nameVariants);
};

const injectInjector = ({ pluralCC }) => {
  const relPath = path.resolve(
    __dirname,
    '../../app/infrastructure/injectors/index.js',
  );

  if (!fs.existsSync(relPath)) {
    throw new Error(`There is no injector index file in path: ${relPath}`);
  }

  const fileLines = fs.readFileSync(relPath).toString().split('\n');
  let lineToAppendImport;
  let lineToAppendExport;

  fileLines.forEach((line, index) => {
    if (line.slice(0, 14) === 'module.exports') lineToAppendImport = index - 1;
    if (line.slice(0, 4) === '  ];') lineToAppendExport = index + 1;
  });

  // Import new Injector
  fileLines.splice(
    lineToAppendImport,
    0,
    `const ${pluralCC}Injector = require('./${pluralCC}Injector');`,
  );

  // Export new Injector
  fileLines.splice(lineToAppendExport, 0, `    ${pluralCC}Injector,`);

  fs.writeFile(relPath, fileLines.join('\n'), (err) => {
    if (err) throw err;
    else {
      console.log(
        'Injector injected in /app/infrastructure/injectors/index.js',
      );
    }
  });
};

const createInjector = (nameVariants, use_cases) => {
  const relPath = path.resolve(
    __dirname,
    `../../app/infrastructure/injectors/${nameVariants.pluralCC}Injector.js`,
  );

  if (fs.existsSync(relPath)) {
    throw new Error(`There is already a file in path: ${relPath}`);
  }

  fs.writeFile(relPath, Injector(nameVariants, use_cases), (err) => {
    // In case of a error throw err.
    if (err) throw err;
    else {
      console.log(
        `Injector created in /app/infrastructure/injectors/${nameVariants.pluralCC}Injector.js`,
      );
    }
  });

  injectInjector(nameVariants);
};

module.exports = (nameVariants, use_cases) => {
  createController(nameVariants, use_cases);
  createRepository(nameVariants, use_cases);
  createInjector(nameVariants, use_cases);
};
