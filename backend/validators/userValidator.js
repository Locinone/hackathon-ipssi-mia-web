const { z } = require("zod");

const userSchema = z.object({
  // username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

module.exports = { userSchema };
