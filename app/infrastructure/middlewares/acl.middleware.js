const CustomError = require("../../domain/exceptions/CustomError");
const {
  endpointMap,
} = require("../../../_initial_database/__endpoint_data.js");

module.exports = (route) => async (req, res, next) => {
  try {
    const { user } = req;
    const endpoint_id = endpointMap[route];

    if (!endpoint_id)
      throw new CustomError("ACL Error. Route name not found", 400);
    if (!user.role_id) throw new CustomError("Unauthorized", 401);

    const isAdmin = user.role_id === 1;
    const endpointAuthorized = user.endpoints[endpoint_id - 1] === "1";
    if (!isAdmin && !endpointAuthorized)
      throw new CustomError("Unauthorized", 401);

    next();
  } catch (error) {
    next(error);
  }
};
