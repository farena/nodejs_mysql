const endpoints = [];
const endpointMap = endpoints.reduce((acc, b) => {
  acc[b.name] = b.endpoint_id;
  return acc;
}, {});

module.exports = {
  endpoints,
  endpointMap,
};
