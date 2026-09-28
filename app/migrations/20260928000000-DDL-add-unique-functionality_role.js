module.exports = {
  up: async (queryInterface) => {
    // Remove duplicated role/functionality pairs, keeping the latest one
    await queryInterface.sequelize.query(`
      DELETE fr1 FROM functionality_role fr1
      INNER JOIN functionality_role fr2
        ON fr1.role_id = fr2.role_id
        AND fr1.functionality_id = fr2.functionality_id
        AND fr1.functionality_role_id < fr2.functionality_role_id
    `);

    await queryInterface.addIndex("functionality_role", ["role_id", "functionality_id"], {
      name: "functionality_role_unique",
      unique: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex("functionality_role", "functionality_role_unique");
  },
};
