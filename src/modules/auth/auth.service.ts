import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUser } from "./auth.interface";
import jwt, { SignOptions } from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const loginUserIntoDB = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error("Password is inccorect");
  }
  if (user.activeStatus === "BLOCKED") {
    throw new Error("Your account has been blocked. Please contact support!");
  }
  const jwtPayloady = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayloady,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayloady,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return { accessToken, refreshToken };
};

export const authService = {
  loginUserIntoDB,
};
