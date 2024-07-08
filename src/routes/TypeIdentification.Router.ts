import { Router } from "express";
import { getTypeIdentification } from "../controllers/TypeIdentification.Controller";

const typeIdentificationRouter = Router();
/**
 * @swagger
 * /typeIdentification:
 *   get:
 *     tags:
 *       - Type Identifications
 *     summary: Get all type identifications
 *     description: Retrieve a list of all type identifications.
 *     responses:
 *       200:
 *         description: A list of type identifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   typeIdentification:
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
typeIdentificationRouter.get("/typeIdentification", getTypeIdentification);

export default typeIdentificationRouter;