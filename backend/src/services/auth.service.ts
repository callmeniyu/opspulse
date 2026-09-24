import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { createUser, findUserByEmail, findUserById } from "../repositories/user.repository.js";

import type { RegisterInput, LoginInput } from "../validators/auth.validator.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await createUser(input.name, input.email, passwordHash);

  return user;
}

export async function loginUser(input: LoginInput) {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new Error("Invalid email or password");
  }
  const passwordMatches = await bcrypt.compare(input.password, user.password_hash);

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
}
