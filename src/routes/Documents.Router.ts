import { Router } from "express";
import { body } from "express-validator";
import { updateFileController, uploadFile } from "../controllers/Documents.controller";
import { validateEnpoint } from "../middlewares/validatorEnpoint";

const documentsRouter = Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     tags:
 *       - Documents
 *     summary: Upload a file
 *     description: Upload a file with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               filePath:
 *                 type: string
 *                 format: binary
 *                 description: The path of the file to be uploaded
 *               blobName:
 *                 type: string
 *                 description: The name of the blob
 *               idOrganization:
 *                 type: integer
 *                 description: The ID of the organization
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: documents.error_invalid_data
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
documentsRouter.post(
    '/upload',
    [
        body("filePath"),
        body("blobName","documents.file_required").isString().notEmpty(),
        body("idOrganization").isInt().notEmpty(),
        validateEnpoint
    ],
    uploadFile);

/**
 * @swagger
 * /updatedocument:
 *   put:
 *     tags:
 *       - Documents
 *     summary: Update a document
 *     description: Update an existing document with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               filePath:
 *                 type: string
 *                 format: binary
 *                 description: The path of the file to be uploaded
 *               blobName:
 *                 type: string
 *                 description: The name of the blob
 *               idDocument:
 *                 type: integer
 *                 description: The ID of the document to be updated
 *     responses:
 *       200:
 *         description: Document updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Document updated successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: documents.error_invalid_data
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
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