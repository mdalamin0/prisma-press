import { prisma } from "../../lib/prisma";
import { ICreatePostPayload, IUpdatePostPayload } from "./post.interface";

const createPostIntoDB = async (
  payload: ICreatePostPayload,
  userId: string,
) => {
  // const {title, content, thumbnail, tags, views, authorId} = payload;
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });

  return result;
};

const getAllPostFromDB = async () => {
  const allPosts = await prisma.post.findMany({
    include: {
      author: {
        omit: { password: true },
      },
      comments: true,
    },
  });
  return allPosts;
};

const getAllPostStatsFromDB = async () => {};

const getMyPostFromDB = async (authorId: string) => {
  const myPosts = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      comments: true,
      author: {
        omit: { password: true },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return myPosts;
};

const getPostByIdFromDB = async (postId: string) => {
  const singlePost = await prisma.post.findUnique({
    where: { id: postId },
  });

  if(!singlePost){
    throw new Error("Post not found!!")
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      views: {
        increment: 1,
      },
    },
    include: {
      author: {
        omit: { password: true },
      },
      comments: true,
    },
  });

  return updatedPost;
};

const updatePostIntoDB = async (
  payload: IUpdatePostPayload,
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId }
  });

  if(!isAdmin && post.authorId !== authorId){
    throw new Error("you are not the owner of this post")
  }

  const result = await prisma.post.update({
    where: { id: postId },
    data: payload,
    include: {
      author: {
        omit: { password: true },
      },
      comments: true,
    },
  });
  return result;
};

const deletePostFromDB = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId }
  });

  if(!isAdmin && post.authorId !== authorId){
    throw new Error("you are not the owner of this post")
  }

  await prisma.post.delete({
    where: { id: postId }
  });
};

export const postService = {
  getAllPostFromDB,
  createPostIntoDB,
  getAllPostStatsFromDB,
  getMyPostFromDB,
  getPostByIdFromDB,
  updatePostIntoDB,
  deletePostFromDB
};
