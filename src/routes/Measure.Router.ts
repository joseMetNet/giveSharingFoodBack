import { Router } from "express";
import { getMeasure } from "../controllers/Measure.Controller";

const measureRouter = Router();

measureRouter.get("/measure", getMeasure);

export default measureRouter;