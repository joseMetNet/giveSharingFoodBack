import { Router } from "express";
import { body, param } from "express-validator";
import { downloadFile, getDocumentsByIdOrganization, getDocumentType, updateFileController, uploadFile } from "../controllers/Documents.controller";
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
 *               idTypeDocument:
 *                 type: integer
 *                 description: The ID of the document type
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
        body("idTypeDocument").isInt().notEmpty(),
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

/**
 * @swagger
 * /downloadDocument/{idDocument}:
 *   get:
 *     tags:
 *       - Documents
 *     summary: Download a document by ID
 *     description: Retrieve the file associated with the given document ID.
 *     parameters:
 *       - in: path
 *         name: idDocument
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the document to download
 *     responses:
 *       200:
 *         description: Document file downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid document ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid document ID
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Document not found
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
documentsRouter.get("/downloadDocument/:idDocument", downloadFile);

/**
 * @swagger
 * /getDocumentsType:
 *   get:
 *     tags:
 *       - Documents
 *     summary: Get all documents type
 *     description: Retrieve a list of all documents type.
 *     responses:
 *       200:
 *         description: A list of docuents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   docuement:
 *                     type: string
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
documentsRouter.get("/getDocumentsType", getDocumentType);

/**
 * @swagger
 * /getDocumentsByIdOrganization/{idOrganization}:
 *   get:
 *     tags:
 *       - Documents
 *     summary: Get documents by organization ID
 *     description: Retrieve a list of documents associated with a specific organization ID.
 *     parameters:
 *       - in: path
 *         name: idOrganization
 *         required: true
 *         description: ID of the organization to retrieve documents for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idDocument:
 *                     type: integer
 *                   docuement:
 *                     type: string
 *                   url:
 *                     type: integer
 *                   idOrganization:
 *                     type: integer
 *                   idTypeDocument:
 *                     type: integer
 *                   documentType:
 *                     type: string
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
documentsRouter.get(
    "/getDocumentsByIdOrganization/:idOrganization",
    [
        param("idOrganization","organizations.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    getDocumentsByIdOrganization);
export default documentsRouter;