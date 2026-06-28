import { CommentStatus } from "../../../generated/prisma/enums";

export interface ICommentPayload {
  content: string;
  postId: string;
}

export interface IUpdateCommentPayload {
  content: string;
}

export interface ICommentModeratPayload {
  status: CommentStatus
}