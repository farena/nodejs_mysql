const endpoints = [
  {
    endpoint_id: 1,
    name: "users.index",
    description: "List users",
    url: "/users",
    method: "GET",
  },
  {
    endpoint_id: 2,
    name: "users.create",
    description: "Create user",
    url: "/users",
    method: "POST",
  },
  {
    endpoint_id: 3,
    name: "users.show",
    description: "Show user",
    url: "/users/:id",
    method: "GET",
  },
  {
    endpoint_id: 4,
    name: "users.update",
    description: "Update user",
    url: "/users/:id",
    method: "PUT",
  },
  {
    endpoint_id: 5,
    name: "users.destroy",
    description: "Destroy user",
    url: "/users/:id",
    method: "DELETE",
  },
  {
    endpoint_id: 6,
    name: "users.activate",
    description: "Activate user",
    url: "/users/:id/activate",
    method: "PUT",
  },
  {
    endpoint_id: 7,
    name: "users.deactivate",
    description: "Deactivate user",
    url: "/users/:id",
    method: "DELETE",
  },
  {
    endpoint_id: 8,
    name: "users.resend_activation",
    description: "Resend activation email",
    url: "/users/:id/resend_activation",
    method: "GET",
  },
  {
    endpoint_id: 9,
    name: "roles.index",
    description: "List roles",
    url: "/roles",
    method: "GET",
  },
  {
    endpoint_id: 10,
    name: "roles.create",
    description: "Create role",
    url: "/roles",
    method: "POST",
  },
  {
    endpoint_id: 11,
    name: "roles.update",
    description: "Update role",
    url: "/roles/:id",
    method: "PUT",
  },
  {
    endpoint_id: 12,
    name: "roles.destroy",
    description: "Destroy role",
    url: "/roles/:id",
    method: "DELETE",
  },
  {
    endpoint_id: 13,
    name: "functionalities.index",
    description: "List functionalities",
    url: "/functionalities",
    method: "GET",
  },
];

const endpointMap = endpoints.reduce((acc, b) => {
  acc[b.name] = b.endpoint_id;
  return acc;
}, {});

module.exports = {
  endpoints,
  endpointMap,
};
