import { Router } from "express";
import { getStatus } from "../controllers/Status.Controler";

const statusRouter = Router();

/**
 * @swagger
 * /status:
 *   get:
 *     tags:
 *       - status
 *     summary: Get all status
 *     description: Retrieve a list of all status.
 *     responses:
 *       200:
 *         description: A list of status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   department:
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
statusRouter.get("/status", getStatus);
export default statusRouter;