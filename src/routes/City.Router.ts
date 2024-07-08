import { Router } from "express";
import { getCityByDepartment } from "../controllers/City.Controller";
import { param } from "express-validator";
import { validateEnpoint } from "../middlewares/validatorEnpoint";

const cityRouter = Router();

/**
 * @swagger
 * /cities/{idDepartament}:
 *   get:
 *     tags:
 *       - Cities
 *     summary: Get cities by department ID
 *     description: Retrieve a list of cities associated with a specific department ID.
 *     parameters:
 *       - in: path
 *         name: idDepartament
 *         required: true
 *         description: ID of the department to retrieve cities for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of cities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   city:
 *                     type: string
 *                   idDepartament:
 *                     type: integer
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
 *                       example: city.error_invalid_data
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
cityRouter.get(
    "/cities/:idDepartament",
    [
        param("idDepartament","city.field").notEmpty().isInt(),
        validateEnpoint
    ],
    getCityByDepartment);

export default cityRouter;