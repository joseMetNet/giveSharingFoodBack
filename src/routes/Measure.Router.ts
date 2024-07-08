import { Router } from "express";
import { getMeasure } from "../controllers/Measure.Controller";

const measureRouter = Router();

/**
 * @swagger
 * /measure:
 *   get:
 *     tags:
 *       - Measures
 *     summary: Get all measures
 *     description: Retrieve a list of all measures.
 *     responses:
 *       200:
 *         description: A list of measures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   measure:
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
measureRouter.get("/measure", getMeasure);

export default measureRouter;