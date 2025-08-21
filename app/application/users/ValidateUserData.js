class ValidateUserData {
  constructor(Validator) {
    this.$validator = Validator;
  }

  /**
   * Using validatorJS.
   * For documentation: https://github.com/mikeerickson/validatorjs
   */
  async execute({
    first_name,
    last_name,
    email,
    role_id,
    new_password,
    new_password_confirmation,
    password,
    password_confirmation,
    verification_code,
    type = "default",
  }) {
    const rules = {
      default: {
        first_name: "required",
        last_name: "required",
        email: "required|email",
        role_id: "required|integer",
      },
      profileUpdate: {
        new_password: "min:6|confirmed",
      },
      verify: {
        verification_code: "required",
        password: "required|min:6|confirmed",
      },
    };

    await this.$validator(
      {
        first_name,
        last_name,
        email,
        role_id,
        password,
        password_confirmation,
        new_password,
        new_password_confirmation,
        verification_code,
      },
      rules[type],
      {
        "required.first_name": "First Name is required",
        "required.last_name": "Last Name is required",
        "required.email": "Email is required",
        "email.email": "Email is invalid",
        "required.role_id": "Role is required",
        "integer.role_id": "Role is invalid",
        "min.password": "Password must be at least 8 chars long",
        "confirmed.password": "Passwords must be identical",
        "required.password": "Password is required",
        "required.verification_code": "Verification Code is required",
      }
    );
  }
}

module.exports = ValidateUserData;
