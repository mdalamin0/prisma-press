import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
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

  const transactionSinglePostResult = await prisma.$transaction(
    async(tx) => {
      await tx.post.update({
        where: {id: postId},
        data: {
          views: {increment: 1}
        }
      });

      const post = await tx.post.findUniqueOrThrow({
        where: {id: postId},
        include: {
          author: {
            omit: {password: true}
          },
          comments: {
            where: {
              status: CommentStatus.APROVED
            },
            orderBy: {createdAt: "desc"}
          },
          _count: {
            select: {
              comments: true
            }
          }
        }
      })
      return post;
    }
  )
  return transactionSinglePostResult
};

const getPostStatsFromDB = async() => {
  const transactionResult = await prisma.$transaction(
    async(tx) => {
      // const totalPost = await tx.post.count();

      // const allPosts = await tx.post.findMany();

      // let totalPostViews = 0;
      // allPosts.forEach((post) => {
      //   totalPostViews = totalPostViews + post.views
      // })

      // const totalPostViewsAgregate = await tx.post.aggregate({
      //   _sum: {
      //     views: true
      //   }
      // })

      // const totalPostViews = totalPostViewsAgregate._sum.views;

      // const totalPublishedPost = await tx.post.count({
      //   where: {
      //     status: PostStatus.PUBLISHED
      //   }
      // })
      // const totalDraftPost = await tx.post.count({
      //   where: {
      //     status: PostStatus.DRAFT
      //   }
      // })
      // const totalArchivedPost = await tx.post.count({
      //   where: {
      //     status: PostStatus.ARCHIVED
      //   }
      // })

      // const totalComments = await tx.comment.count();

      // const totalAprovedComments = await tx.comment.count({
      //   where: {
      //     status: CommentStatus.APROVED
      //   }
      // })

      // const totalRjectComments = await tx.comment.count({
      //   where: {
      //     status: CommentStatus.REJECT
      //   }
      // })
      
      const [
        totalPost,
        totalPublishedPost,
        totalDraftPost,
        totalArchivedPost,
        totalComments,
        totalAprovedComments,
        totalRjectComments,
        totalPostViewsAgregate,
      ] = await Promise.all([
        await tx.post.count(),
        await tx.post.count({
          where: {
            status: PostStatus.PUBLISHED,
          },
        }),
        await tx.post.count({
          where: {
            status: PostStatus.DRAFT,
          },
        }),
        await tx.post.count({
          where: {
            status: PostStatus.ARCHIVED,
          },
        }),
        await tx.comment.count(),
        await tx.comment.count({
          where: {
            status: CommentStatus.APROVED,
          },
        }),
        await tx.comment.count({
          where: {
            status: CommentStatus.REJECT,
          },
        }),
        await tx.post.aggregate({
          _sum: {
            views: true,
          },
        }),
      ]);

      return {
        totalPost,
        totalPublishedPost,
        totalDraftPost,
        totalArchivedPost,
        totalComments,
        totalAprovedComments,
        totalRjectComments,
        totalPostViews: totalPostViewsAgregate._sum.views
      };
    }
    
  )
  return transactionResult;
}

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
  getMyPostFromDB,
  getPostByIdFromDB,
  getPostStatsFromDB,
  updatePostIntoDB,
  deletePostFromDB
};
