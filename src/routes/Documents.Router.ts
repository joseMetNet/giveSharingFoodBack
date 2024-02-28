import { Router } from "express";
import { body } from "express-validator";
import { uploadFile } from "../controllers/Documents.controller";
import { validateEnpoint } from "../middlewares/validatorEnpoint";

const documentsRouter = Router();

documentsRouter.post(
    '/upload',
    [
        body("filePath"),
        body("blobName","documents.file_required").isString().notEmpty(),
        validateEnpoint
    ],
    uploadFile);

export default documentsRouter;