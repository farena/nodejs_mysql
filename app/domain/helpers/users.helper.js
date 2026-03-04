const bcrypt = require("bcrypt");
const CustomError = require("../exceptions/CustomError");
const {
  endpoints: EPData,
} = require("../../../_initial_database/__endpoint_data");
// const PERMData = require("../../../_initial_database/__permission_data.js");

class UsersHelper {
  static async parseAuthenticatedResponse({ user, jwt, settings }) {
    const userRes = {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      is_active: user.is_active,
      is_agent: user.is_agent,
      provider_slug: settings.slug,
      role: {
        role_id: user.role.role_id,
        name: user.role.name,
      },
      functionalities: UsersHelper.parseFunctionalities(user.role),
      // permissions: UsersHelper.parsePermissions(user.role),
    };

    return {
      user: userRes,
      token: jwt.generateAccessToken({
        user_id: user.user_id,
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        is_active: user.is_active,
        is_agent: user.is_agent,
        role: {
          role_id: user.role.role_id,
          name: user.role.name,
        },
        endpoints: UsersHelper.createEndpointsString(user.role),
        // permissions: UsersHelper.createPermissionsString(user.role),
      }),
      refresh_token: jwt.generateRefreshToken({
        user_id: user.user_id,
      }),
    };
  }

  static parseFunctionalities(role) {
    const functionalities = {};

    role.functionalities.forEach((func) => {
      functionalities[func.description] = {
        read: true,
        write: func.functionality_role.type === "rw",
      };
    });

    return functionalities;
  }

  // static parsePermissions(role) {
  //   const permissions = {};

  //   role.permissions.forEach((perm) => {
  //     permissions[perm.permission_id] = true;
  //   });

  //   return permissions;
  // }

  // static createPermissionsString(role) {
  //   const lastPERMID = [...PERMData].pop().permission_id;

  //   // Create Array with all zeros with length == lastPERMID
  //   const perms = [...Array(lastPERMID).keys()].map(() => 0);

  //   // Set authorized PERM Ids to 1 in the STR
  //   for (const perm of role.permissions) {
  //     perms[perm.permission_id - 1] = 1;
  //   }

  //   return perms.join("");
  // }

  static createEndpointsString(role) {
    const lastEPID = [...EPData].pop().endpoint_id;

    // Create Array with all zeros with length == lastEPID
    const eps = [...Array(lastEPID).keys()].map(() => 0);

    // Set authorized EP Ids to 1 in the STR
    for (const functionality of role.functionalities) {
      const CAN_READ = ["r", "rw"].includes(
        functionality.functionality_role.type
      );
      const CAN_WRITE = functionality.functionality_role.type === "rw";

      for (const endpoint of functionality.endpoints) {
        const ROUTE_METHOD = endpoint.method;

        if (CAN_WRITE || (ROUTE_METHOD === "GET" && CAN_READ)) {
          eps[endpoint.endpoint_id - 1] = 1;
        }
      }
    }

    return eps.join("");
  }

  static checkPassword({ password, user_password }) {
    if (!bcrypt.compareSync(password, user_password)) {
      throw new CustomError("Incorrect User or Password", 401);
    }
  }
}

module.exports = UsersHelper;
