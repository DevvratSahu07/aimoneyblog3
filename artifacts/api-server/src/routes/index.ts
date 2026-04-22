import { Router, type IRouter } from "express";
import healthRouter from "./health";
import statsRouter from "./stats";
import categoriesRouter from "./categories";
import postsRouter from "./posts";
import resourcesRouter from "./resources";
import tagsRouter from "./tags";
import newsletterRouter from "./newsletter";
import aiRouter from "./ai";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(statsRouter);
router.use(categoriesRouter);
router.use(postsRouter);
router.use(resourcesRouter);
router.use(tagsRouter);
router.use(newsletterRouter);
router.use(aiRouter);
router.use(adminRouter);

export default router;
