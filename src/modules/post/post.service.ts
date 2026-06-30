import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  ICreatePostPayload,
  IPostQuery,
  IUpdatePostPayload,
} from "./post.interface";

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

const getAllPostFromDB = async (query: IPostQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const tags = query.tags ? JSON.parse(query.tags as string) : null;
  const tagsArray = Array.isArray(tags) ? tags : [];
 


  const andConditions: PostWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        },
        {
          content: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        }
      ]
    })
  }

  if(query.title){
    andConditions.push({
      title: query.title
    })
  }

  if(query.content){
    andConditions.push({
      content: query.content
    })
  }

  if(query.authorId){
    andConditions.push({
      authorId: query.authorId
    })
  }

 if (query.isFeatured ) {
   andConditions.push({
     isFeatured: query.isFeatured === "true" as string ,
   });
 }


  if(query.tags){
    andConditions.push({
      tags: {
        hasSome: tagsArray
      }
    })
  }

  if(query.status){
    andConditions.push({
      status: query.status
    })
  }

  const allPosts = await prisma.post.findMany({
    // filtering/exact match without AND operator

    // where : {
    //   title: "my third post",
    //   isFeatured: false
    // },

    // filtering/exact match with AND operator

    // where: {
    //   AND: [
    //     {
    //       title: "my third post",
    //       content: "conten of the post goes here  33333",
    //     },
    //     {
    //       tags: {
    //         has: "typescript",
    //       },
    //     },
    //   ],
    // },

    // seraching with OR operator

    // where: {
    //   OR: [
    //     {
    //       title: {
    //         contains: "Ronaldo",
    //         mode: "insensitive"
    //       }
    //     },
    //     {
    //       content: {
    //         contains: "Ronaldo",
    //         mode: "insensitive"
    //       }
    //     }
    //   ]
    // },

    // filtering & searching combine

    // where: {
    //   AND: [
    //     {
    //       OR: [
    //         {
    //           title: {
    //             contains: "Ronaldo",
    //             mode: "insensitive"
    //           }
    //         },
    //         {
    //           content: {
    //             contains: "Ron",
    //             mode: "insensitive"
    //           }
    //         }
    //       ]
    //     },
    //     {
    //       title: "Ronaldo"
    //     },
    //     {
    //       content: "Ronaldo"
    //     }
    //   ]
    // },

    // pagination

    // page = 5, limit = 10, skip: (page-1) * limit = skip
    // take: 2,
    // skip: 2,

    // where: {
    //   AND: [

    //     // searching
    //     query.searchTerm? {
    //       OR: [
    //         {
    //           title: {
    //             contains: query.searchTerm,
    //             mode: "insensitive"
    //           }
    //         },
    //         {
    //           content: {
    //             contains: query.searchTerm,
    //             mode: "insensitive"
    //           }
    //         },
    //       ]
    //     } : {},

    //     // filtering
    //     query.title ? { title: query.title } : {},
    //     query.content ? { content: query.content } : {},
    //   ],
    // },

    where: {
      AND: andConditions,
    },

    take: limit,
    skip: skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

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
  const transactionSinglePostResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id: postId },
      data: {
        views: { increment: 1 },
      },
    });

    const post = await tx.post.findUniqueOrThrow({
      where: { id: postId },
      include: {
        author: {
          omit: { password: true },
        },
        comments: {
          where: {
            status: CommentStatus.APROVED,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    return post;
  });
  return transactionSinglePostResult;
};

const getPostStatsFromDB = async () => {
  const transactionResult = await prisma.$transaction(async (tx) => {
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
      totalPostViews: totalPostViewsAgregate._sum.views,
    };
  });
  return transactionResult;
};

const updatePostIntoDB = async (
  payload: IUpdatePostPayload,
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("you are not the owner of this post");
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
    where: { id: postId },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("you are not the owner of this post");
  }

  await prisma.post.delete({
    where: { id: postId },
  });
};

export const postService = {
  getAllPostFromDB,
  createPostIntoDB,
  getMyPostFromDB,
  getPostByIdFromDB,
  getPostStatsFromDB,
  updatePostIntoDB,
  deletePostFromDB,
};
