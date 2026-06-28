import { Router } from "express";
import { postController } from "./post.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.USER, Role.ADMIN), postController.createPost);
router.get("/", postController.getAllPosts);
router.get("/stats", auth(Role.ADMIN), postController.getPostsStats);
router.get(
  "/my-posts",
  auth(Role.USER, Role.ADMIN, Role.AUTHOR),
  postController.getMyPosts,
);
router.get("/:postId", postController.getPostById);
router.patch("/:postId",auth(Role.USER, Role.ADMIN),postController.updatePost);
router.delete("/:postId",auth(Role.USER, Role.ADMIN),postController.deletePost);
router.get("/stats",auth(Role.ADMIN),postController.getPostsStats);

export const postRoutes = router;
