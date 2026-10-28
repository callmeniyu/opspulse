import bcrypt from "bcrypt";

import { createUser, findUserByEmail, findUserById } from "../repositories/user.repository.js";

import type { RegisterInput, LoginInput } from "../validators/auth.validator.js";
import { createAccessToken, createRefreshToken } from "../utils/tokens.js";

export async function registerUser(input: RegisterInput) {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await createUser(input.name, input.email, passwordHash);

  const accessToken = createAccessToken(user.id.toString());
  const refreshToken = createRefreshToken(user.id.toString());

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
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

  const accessToken = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
}
