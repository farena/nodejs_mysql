const role = require("../../_initial_database/__role_data");
const functionality = require("../../_initial_database/__functionality_data");
const endpoint = require("../../_initial_database/__endpoint_data");

async function updateRoleChildrenFunctionalities(
  queryInterface,
  { role_id: parent_id, functionalities }
) {
  // GET CHILDREN ROLES
  const [children] = await queryInterface.sequelize.query(
    `SELECT * FROM role WHERE parent_id = ${parent_id}`
  );
  if (!children?.length) return;

  // LOOP OVER CHILDREN ROLES
  for (const child of children) {
    // GET CHILD FUNCTIONALITIES
    const [child_fns] = await queryInterface.sequelize.query(
      `SELECT * FROM functionality_role WHERE role_id = ${child.role_id}`
    );

    // CREATE FUNCTIONALITIES IDS ARRAY WITHOUT DUPLICATES
    const fns_ids = [
      ...new Set([
        ...child_fns.map((x) => x.functionality_id),
        ...functionalities.map((x) => x.functionality_id),
      ]),
    ].sort();

    // CREATE FUNCTIONALITIES MAP
    const fns_map = fns_ids.map((id) => {
      let type = "r";
      const child_fn = child_fns.find((x) => x.functionality_id === id);
      const parent_fn = functionalities.find((x) => x.functionality_id === id);

      if (child_fn?.type === "rw") type = "rw";
      if (parent_fn?.type === "rw") type = "rw";

      return {
        functionality_id: id,
        role_id: child.role_id,
        type,
      };
    });

    // INSERT FUNCTIONALITIES ROLES
    await queryInterface.bulkInsert("functionality_role", fns_map, {
      updateOnDuplicate: ["type"],
    });
  }
}

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    console.log("==> UPDATE ENDPOINTS");
    // INSERT ENDPOINTS
    await queryInterface.bulkInsert("endpoint", endpoint, {
      updateOnDuplicate: ["method", "url", "name", "description"],
    });

    console.log("==> UPDATE FUNCTIONALITIES");
    // INSERT FUNCTIONALITIES
    await queryInterface.bulkInsert(
      "functionality",
      functionality.map(({ endpoints, ...f }) => f),
      {
        updateOnDuplicate: ["name", "description"],
      }
    );

    console.log("==> UPDATE ROLES");
    // INSERT ROLES
    await queryInterface.bulkInsert(
      "role",
      role.map(({ role_id, by_system, name, sort }) => ({
        role_id,
        by_system,
        name,
        sort,
      })),
      {
        updateOnDuplicate: ["name", "sort"],
      }
    );

    console.log("==> UPDATE FUNCTIONALITY & ENDPOINTS");
    // ASSOCIATE FUNCTIONALITY & ENDPOINTS
    await queryInterface.sequelize.query(
      "TRUNCATE TABLE functionality_endpoint"
    );
    await queryInterface.bulkInsert(
      "functionality_endpoint",
      functionality.flatMap(({ endpoints, functionality_id }) =>
        endpoints.map((endpoint_id) => ({
          endpoint_id,
          functionality_id,
        }))
      ),
      {
        updateOnDuplicate: ["endpoint_id"],
      }
    );

    console.log("==> UPDATE FUNCTIONALITY & ROLES");
    const roleIds = role.map((x) => x.role_id).join(",");
    // ASSOCIATE FUNCTIONALITY & ROLES
    await queryInterface.sequelize.query(
      `DELETE FROM functionality_role WHERE role_id IN (${roleIds})`
    );
    await queryInterface.bulkInsert(
      "functionality_role",
      role.flatMap(({ functionalities, role_id }) =>
        functionalities.map(({ functionality_id, type }) => ({
          functionality_id,
          role_id,
          type,
        }))
      ),
      {
        updateOnDuplicate: ["type"],
      }
    );

    for (const r of role) {
      await updateRoleChildrenFunctionalities(queryInterface, r);
    }

    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  },
};
