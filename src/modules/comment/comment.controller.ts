import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { commentService } from "./comment.service";

const createComments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    if (!payload.postId) {
      throw new Error("You have must given postid");
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

const getCommentsByAuthorId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { authorId } = req.params;
    if (!authorId) {
      throw new Error("authorId required in params");
    }

    const result = await commentService.getCommentsByAuthorFromDB(
      authorId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All comments retrived successfully",
      data: result,
    });
  },
);

const getCommentByCommentId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params;
    if (!commentId) {
      throw new Error("comment id required in params");
    }
    const result = await commentService.getCommentByCommentIdFromDB(
      commentId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Single comments retrived successfully",
      data: result,
    });
  },
);

const updateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { commentId } = req.params;
    const authorId = req.user?.id;

    if (!payload) {
      throw new Error("You have must given updated content");
    }

    const result = await commentService.updateCommentIntoDB(
      payload,
      commentId as string,
      authorId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment updated successfully",
      data: result,
    });
  },
);

const deleteComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;
    const authorId = req.user?.id;
    const result = await commentService.deleteCommentFromDB(
      commentId as string,
      authorId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment deleted successfully",
      data: result,
    });
  },
);

const moderateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;
    const payload = req.body;
    if(!payload){
      throw new Error("You have must given status")
    }
    const result = await commentService.moderateCommentIntoDB(
      payload,
      commentId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment status updated successfully",
      data: result,
    });
  },
);

export const commentController = {
  createComments,
  getCommentsByAuthorId,
  getCommentByCommentId,
  updateComment,
  deleteComment,
  moderateComment,
};
