import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status';
import { commentService } from "./comment.service";


const getComments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await commentService.getCommentsFromDB()
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Posts retrived successfully",
      data: result,
    });
  },
);

export const commentController = {
  getComments
}