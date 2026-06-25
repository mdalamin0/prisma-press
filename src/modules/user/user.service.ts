import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { registerUserPayload } from "./user.interface";

const registerUserIntoDB = async (payload: registerUserPayload) => {
  const { name, email, password, profilePhoto } = payload;
  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new Error("User with this email already exist");
  }
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      profile: {
        create: {
          profilePhoto,
        },
      },
    },
  });

  // await prisma.profile.create({
  //   data: {
  //     userId: createdUser.id,
  //     profilePhoto: profilePhoto,
  //   },
  // });

  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
      email: createdUser.email || email,
    },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });
  return user;
};

const getProfileFromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: { password: true },
    include: { profile: true },
  });
  return user;
};

const updateProfileInDB = async (userId: string, payload: any) => {
  const {name, profilePhoto, bio} = payload;
  const updatedProfile = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      profile: {
        update: {
          profilePhoto,
          bio,
        },
      },
    },
    omit: { password: true },
    include: { profile: true },
  });
  return updatedProfile
}

export const userServices = {
  registerUserIntoDB,
  getProfileFromDB,
  updateProfileInDB
};
