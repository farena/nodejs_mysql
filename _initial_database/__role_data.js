const allFunctionalities = require("./__functionality_data");

module.exports = [
  {
    role_id: 1,
    sort: 1,
    by_system: 1,
    name: "Admin",
    functionalities: allFunctionalities.map((x) => ({
      functionality_id: x.functionality_id,
      type: "rw",
    })),
  },
  {
    role_id: 99,
    sort: 4,
    by_system: 1,
    name: "Customer",
    functionalities: [],
  },
];
