import { prisma } from "../../lib/prisma"
import { ICommentPayload } from "./comment.interface"

const getCommentsFromDB = async() => {

}

const createCommentsIntoDB = async(payload: ICommentPayload, userId: string) => {

  const post = await prisma.post.findUnique({
    where: {id: payload.postId}
  })

  if(!post){
    throw new Error("Post not found!")
  }
  console.log(post);

 const createdPost = await prisma.comment.create({
  data: {
    ...payload,
    authorId: userId
  }
 })
 return createdPost
}


export const commentService = {
  getCommentsFromDB,
  createCommentsIntoDB
}