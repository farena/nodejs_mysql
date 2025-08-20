const normalizeName = (name) =>
  name
    .replace(/\.?([A-Z]+)/g, (x, y) => `_${y.toLowerCase()}`)
    .replace(/^_/, '');

const nameToPlural = (name) => {
  const lastChar = name.slice(-1);

  if (lastChar === 'y') return `${name.slice(0, name.length - 1)}ies`;
  if (lastChar === 's') return `${name}es`;

  return `${name}s`;
};

const nameToCamelCase = (pluralName) =>
  pluralName
    .split('_')
    .map((x, i) => (i === 0 ? x : `${x[0].toUpperCase()}${x.slice(1)}`))
    .join('');

const nameToPascalCase = (pluralName) =>
  pluralName
    .split('_')
    .map((x) => `${x[0].toUpperCase()}${x.slice(1)}`)
    .join('');

function parseName(name) {
  const normalized = normalizeName(name);
  const nameVariants = {
    singularSC: normalized,
    singularCC: nameToCamelCase(normalized),
    singularPC: nameToPascalCase(normalized),
    pluralSC: nameToPlural(normalized),
    pluralCC: nameToCamelCase(nameToPlural(normalized)),
    pluralPC: nameToPascalCase(nameToPlural(normalized)),
  };

  return nameVariants;
}

// Function to validate field types
function validateFieldType(type, enumValues = null) {
  // Valid types for fields
  const VALID_TYPES = [
    'STRING',
    'INTEGER',
    'TEXT',
    'BOOLEAN',
    'DATE',
    'DATEONLY',
    'ENUM',
  ];

  if (!VALID_TYPES.includes(type)) {
    throw new Error(
      `Invalid type: ${type}. Valid types are: ${VALID_TYPES.join(', ')}`,
    );
  }

  if (type === 'ENUM' && !enumValues) {
    throw new Error('ENUM type requires values separated by commas');
  }

  return true;
}

// Function to parse fields string
function parseFields(fieldsString) {
  if (!fieldsString) return [];

  return fieldsString.split(';').map((field) => {
    const [name, type, enumValues] = field.split(':');
    validateFieldType(type, enumValues);

    return {
      name,
      type,
      enumValues: type === 'ENUM' ? enumValues.split(',') : null,
    };
  });
}

module.exports = {
  parseName,
  parseFields,
};
