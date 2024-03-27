import { Router } from "express";
import { body } from "express-validator";
import { updateFileController, uploadFile } from "../controllers/Documents.controller";
import { validateEnpoint } from "../middlewares/validatorEnpoint";

const documentsRouter = Router();

documentsRouter.post(
    '/upload',
    [
        body("filePath"),
        body("blobName","documents.file_required").isString().notEmpty(),
        body("idOrganization").isInt().notEmpty(),
        validateEnpoint
    ],
    uploadFile);

documentsRouter.put(
    '/updatedocument',
    [
        body("filePath"),
        body("blobName", "documents.file_required").isString().notEmpty(),
        body("idDocument").isInt().notEmpty(),
        validateEnpoint
    ],
    updateFileController);
export default documentsRouter;