import { Router } from "express";
import { commentController } from "./comment.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.USER, Role.ADMIN), commentController.createComments);
router.get("/author/:authorId", commentController.getCommentsByAuthorId);
router.get("/:commentId", commentController.getCommentByCommentId);

router.patch(
  "/:commentId",
  auth(Role.USER, Role.ADMIN),
  commentController.updateComment,
);

router.delete(
  "/:commentId",
  auth(Role.USER, Role.ADMIN),
  commentController.deleteComment,
);

router.patch(
  "/:commentId/moderate",
  auth(Role.ADMIN),
  commentController.moderateComment,
);

export const commentRoutes = router;