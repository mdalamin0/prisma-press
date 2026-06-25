import { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import config from "../../config";
import httpStatus from "http-status";
import { userServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import jwt from "jsonwebtoken"
import { jwtUtils } from "../../utils/jwt";



// const registerUser = async (req: Request, res: Response) => {
//   try {
//     const payload = req.body;
//     const user = await userServices.registerUserIntoDB(payload);

//     res.status(httpStatus.CREATED).json({
//       success: true,
//       statusCode: httpStatus.CREATED,
//       message: "User registered successfully",
//       data: { user },
//     });
//   } catch (error) {
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       message: "Failed to register user",
//       error: (error as Error).message,
//     });
//   }
// };


const registerUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
const payload = req.body;
const user = await userServices.registerUserIntoDB(payload);
//  res.status(httpStatus.CREATED).json({
//       success: true,
//       statusCode: httpStatus.CREATED,
//       message: "User registered successfully",
//       data: { user },
//     });

sendResponse(res, {
  statusCode: httpStatus.CREATED,
  success: true,
  message: "User registerd successfully",
  data: {user}
})
})

const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const {accessToken} = req.cookies
    const user = req.user;
    // const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret)
    // if(typeof verifiedToken === "string"){
    //   throw new Error(verifiedToken)
    // }
    const profile = await userServices.getProfileFromDB(user?.id as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile retrive successfully",
      data: {profile}
    })
  },
);

const updateMyProfile = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const payload = req.body;

const updatedProfile = await userServices.updateProfileInDB(userId as string, payload);
sendResponse(res,{
  statusCode: httpStatus.OK,
  success: true,
  message: "Profile updated successfully",
  data: updatedProfile
})
})

export const userController = {
  registerUser,
  getMyProfile,
  updateMyProfile
};
