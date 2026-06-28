import { prisma } from "../../lib/prisma";
import {
  ICommentModeratPayload,
  ICommentPayload,
  IUpdateCommentPayload,
} from "./comment.interface";

const createCommentsIntoDB = async (
  payload: ICommentPayload,
  userId: string,
) => {
  const post = await prisma.post.findUnique({
    where: { id: payload.postId },
  });

  if (!post) {
    throw new Error("Post not found!");
  }

  const createdPost = await prisma.comment.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });
  return createdPost;
};

const getCommentsByAuthorFromDB = async (authorId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: authorId },
  });
  if (!user) {
    throw new Error("user not found! please login");
  }
  const resutl = await prisma.comment.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
  return resutl;
};

const getCommentByCommentIdFromDB = async (commentId: string) => {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
    },
  });

  if (!comment) {
    throw new Error("Comment not found!");
  }
  return comment;
};

const updateCommentIntoDB = async (
  payload: IUpdateCommentPayload,
  commentId: string,
  authorId: string,
) => {
  const { content } = payload;

  const comment = await prisma.comment.findUniqueOrThrow({
    where: {
      id: commentId,
    },
  });

  if (comment.authorId !== authorId) {
    throw new Error("you are not the owner of this comment!");
  }
  const result = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      content,
    },
  });

  return result;
};

const deleteCommentFromDB = async (commentId: string, authorId: string) => {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (!comment) {
    throw new Error("Comment not found!");
  }

  if (comment.authorId !== authorId) {
    throw new Error("You are not the owner of this comment!");
  }
  const result = await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });

  return result;
};

const moderateCommentIntoDB = async (
  payload: ICommentModeratPayload,
  commentId: string,
) => {
  const {status} = payload;

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId
    }
  })

  if(!comment){
    throw new Error("Comment not found!")
  }

  if(comment.status === "REJECT"){
    throw new Error("Status already Rejected")
  }

  const result = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      status,
    },
  });
  return result;
};

export const commentService = {
  createCommentsIntoDB,
  getCommentsByAuthorFromDB,
  getCommentByCommentIdFromDB,
  updateCommentIntoDB,
  deleteCommentFromDB,
  moderateCommentIntoDB,
};
