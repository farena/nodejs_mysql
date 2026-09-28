const user = require("../../_initial_database/__user_data");
const role = require("../../_initial_database/__role_data");

const canRunSeeder = async (queryInterface) => {
  const [[{ count }]] = await queryInterface.sequelize.query(
    "SELECT COUNT(*) as count FROM user;"
  );
  return Number(count) === 0;
};

module.exports = {
  up: async (queryInterface) => {
    if (!(await canRunSeeder(queryInterface))) return;

    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    await queryInterface.bulkInsert(
      "role",
      role.map(({ functionalities, ...roleData }) => roleData),
      { ignoreDuplicates: true }
    );
    await queryInterface.bulkInsert("user", user);

    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  },
  down: async () => {},
};
