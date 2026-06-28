import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { postService } from "./post.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";


const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    const payload = req.body;

    const result = await postService.createPostIntoDB(payload, id as string);

     sendResponse(res, {
       success: true,
       statusCode: httpStatus.CREATED,
       message: "Post created successfully",
       data: result,
     });
  },
);

const getAllPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allPosts = await postService.getAllPostFromDB()

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Posts retrived successfully",
      data: allPosts
    })
  },
);

const getPostsStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postsStats = await postService.getPostStatsFromDB()

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Posts stats retrived successfully",
      data: postsStats
    })
  },
);

const getMyPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const myPosts = await postService.getMyPostFromDB(authorId as string)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "My Posts retrive successfully!",
      data: myPosts
    })
  },
);

const getPostById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {postId} = req.params;
    if(!postId){
      throw new Error("Post id required in params")
    }
    const singlePost = await postService.getPostByIdFromDB(postId as string)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Single Post retrive successfully",
      data: singlePost
    })
  },
);

const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const authorId = req.user?.id;
    const postId = req.params.postId;
    if (!postId) {
      throw new Error("Post id required in params");
    }
    const isAdmin = req.user?.role === "ADMIN";

    const result = await postService.updatePostIntoDB(payload, postId as string, authorId as string, isAdmin );

     sendResponse(res, {
       success: true,
       statusCode: httpStatus.OK,
       message: "Post updated successfully",
       data: result,
     });
  },
);

const deletePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const postId = req.params.postId;
    if (!postId) {
      throw new Error("Post id required in params");
    }
    const isAdmin = req.user?.role === "ADMIN";

    await postService.deletePostFromDB(
      postId as string,
      authorId as string,
      isAdmin,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Post deleted successfully",
      data: null
    });
  },
);


export const postController = {
  getAllPosts,
  createPost,
  getPostsStats,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost
}
