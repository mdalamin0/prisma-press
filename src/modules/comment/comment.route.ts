import { Router } from "express";
import { commentController } from "./comment.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();


router.get("/", commentController.getComments)
router.post("/", auth(Role.USER, Role.ADMIN), commentController.createComments)


export const commentRoutes = router;