module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn("user", "reset_code", {
      type: DataTypes.STRING,
      allowNull: true,
      after: "verification_code",
    });
    await queryInterface.addColumn("user", "last_login", {
      type: DataTypes.DATE,
      allowNull: true,
      after: "reset_code",
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("user", "last_login");
    await queryInterface.removeColumn("user", "reset_code");
  },
};
