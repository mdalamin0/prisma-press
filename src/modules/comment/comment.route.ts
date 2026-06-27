import { Router } from "express";
import { commentController } from "./comment.controller";

const router = Router();


router.get("/", commentController.getComments)


export const commentRoutes = router;