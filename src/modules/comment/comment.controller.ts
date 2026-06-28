import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { commentService } from "./comment.service";

const getComments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await commentService.getCommentsFromDB();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All comments retrived successfully",
      data: result,
    });
  },
);


const createComments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    if(!payload.postId){
      throw new Error("You have must given postid")
    }

    const userId = req.user?.id;
    const result = await commentService.createCommentsIntoDB(
      payload,
      userId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Comments created successfully",
      data: result,
    });
  },
);

export const commentController = {
  getComments,
  createComments,
};
