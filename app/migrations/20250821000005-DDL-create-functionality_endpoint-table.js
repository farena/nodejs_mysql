module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("functionality_endpoint", {
      functionality_endpoint_id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      functionality_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      endpoint_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("functionality_endpoint");
  },
};
