const bcrypt = require("bcryptjs");

module.exports = [
  {
    user_id: 1,
    first_name: "General",
    last_name: "Admin",
    email: "admin@farenasoft.com",
    password: bcrypt.hashSync("123456", 10),
    is_active: 1,
    role_id: 1,
  },
];
