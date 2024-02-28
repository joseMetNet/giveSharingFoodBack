import { Router } from "express";
import { getTypeIdentification } from "../controllers/TypeIdentification.Controller";

const typeIdentificationRouter = Router();

typeIdentificationRouter.get("/typeIdentification", getTypeIdentification);

export default typeIdentificationRouter;