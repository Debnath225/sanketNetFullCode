// Third-party packages (No file extensions needed)
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Local files (File extensions are REQUIRED)
import User from "../models/User.js";
import { env } from "../config/env.js";


const ACCESS_TOKEN_EXPIRES = env.jwtExpiresIn || "1h";
const REFRESH_TOKEN_EXPIRES = env.jwtRefreshExpiresIn || "7d";

const sanitizeUser = (user) => {
  if (!user) return null;

  const obj = user.toObject ? user.toObject() : { ...user };

  delete obj.password;
  delete obj.passwordHash;
  delete obj.refreshToken;

  return obj;
};

const createAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES,
    }
  );
};

const createRefreshToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      type: "refresh",
    },
    env.jwtRefreshSecret || env.jwtSecret,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES,
    }
  );
};

const register = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    const error = new Error("Name, email and password are required");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error(
      "Password must contain at least 8 characters"
    );
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: passwordHash,
    role: "user",
  });

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const passwordHash = user.password || user.passwordHash;

  if (!passwordHash) {
    const error = new Error("User authentication is not configured");
    error.statusCode = 500;
    throw error;
  }

  const validPassword = await bcrypt.compare(
    password,
    passwordHash
  );

  if (!validPassword) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.isActive === false) {
    const error = new Error("User account is disabled");
    error.statusCode = 403;
    throw error;
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();

  await user.save();

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

const logout = async (currentUser) => {
  if (!currentUser || !currentUser._id) {
    return { loggedOut: true };
  }

  await User.findByIdAndUpdate(currentUser._id, {
    $unset: {
      refreshToken: 1,
    },
  });

  return {
    loggedOut: true,
  };
};

const getMe = async (currentUser) => {
  if (!currentUser || !currentUser._id) {
    const error = new Error("Authentication required");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(currentUser._id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
};

const refreshToken = async ({ refreshToken }) => {
  if (!refreshToken) {
    const error = new Error("Refresh token is required");
    error.statusCode = 400;
    throw error;
  }

  let payload;

  try {
    payload = jwt.verify(
      refreshToken,
      env.jwtRefreshSecret || env.jwtSecret
    );
  } catch {
    const error = new Error("Invalid or expired refresh token");
    error.statusCode = 401;
    throw error;
  }

  if (payload.type !== "refresh") {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(payload.sub);

  if (!user || user.isActive === false) {
    const error = new Error("User account not available");
    error.statusCode = 401;
    throw error;
  }

  if (!user.refreshToken || user.refreshToken !== refreshToken) {
    const error = new Error("Refresh token has been revoked");
    error.statusCode = 401;
    throw error;
  }

  const newAccessToken = createAccessToken(user);
  const newRefreshToken = createRefreshToken(user);

  user.refreshToken = newRefreshToken;

  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export default {
  register,
  login,
  logout,
  getMe,
  refreshToken,
};