import { Router } from "express";
import { body, param } from "express-validator";
import { validateEnpoint } from "../middlewares/validatorEnpoint";
import { getCommentsQuailification, getPointsToGrade, getQuailification, getQualificationGeneral, postQualification } from "../controllers/Qualification.Controller";

const qualificationRouter = Router();

/**
 * @swagger
 * /pointsGradeByIdRol/{idRol}:
 *   get:
 *     tags:
 *       - Qualifications
 *     summary: Get points grade by role ID
 *     description: Obtain the points grade associated with a specific role ID.
 *     parameters:
 *       - in: path
 *         name: idRol
 *         required: true
 *         description: ID of the role to obtain points grade for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of points grade
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   description:
 *                     type: string
 *                   idRol:
 *                     type: integer
 *                   role:
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
 *                       example: qualification.error_invalid_data
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
qualificationRouter.get(
    "/pointsGradeByIdRol/:idRol",
    [
        param("idRol", "qualification.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    getPointsToGrade);

/**
 * @swagger
 * /postQualification:
 *   post:
 *     tags:
 *       - Qualifications
 *     summary: Post a new qualification
 *     description: Create multiple qualifications with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idOrganization:
 *                 type: integer
 *                 description: ID of the organization
 *               idProductsOrganization:
 *                 type: integer
 *                 description: ID of the products organization
 *               idPointsToGrade:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of point IDs to grade
 *               qualification:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of qualification values corresponding to the points
 *               observations:
 *                 type: string
 *                 description: Observations for the qualifications
 *             required:
 *               - idOrganization
 *               - idProductsOrganization
 *               - idPointsToGrade
 *               - qualification
 *     responses:
 *       200:
 *         description: Qualifications created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Qualification created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: qualification.invalidData
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
qualificationRouter.post(
    "/postQualification",
    [
        body("idOrganization", "qualification.validate_field_int").notEmpty().isInt(),
        body("idProductsOrganization", "qualification.validate_field_int").notEmpty().isInt(),
        body("idPointsToGrade", "qualification.validate_field_array").isArray({ min: 1 }),
        body("qualification", "qualification.validate_field_array").isArray({ min: 1 }),
        body("idPointsToGrade.*", "qualification.validate_field_int").isInt(),
        body("qualification.*", "qualification.validate_field_int").isInt(),
        body("observations", "qualification.validate_field_text").optional().isString(),
        validateEnpoint
    ],
    postQualification
);

/**
 * @swagger
 * /commentsQualification/{idOrganization}:
 *   get:
 *     tags:
 *       - Qualifications
 *     summary: Get comments qualification by organization ID
 *     description: Retrieve comments qualification associated with a specific organization ID.
 *     parameters:
 *       - in: path
 *         name: idOrganization
 *         required: true
 *         description: ID of the organization to retrieve comments qualification for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of comments qualification
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   idOrganization:
 *                     type: integer
 *                   comment:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
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
 *                       example: qualification.error_invalid_data
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
qualificationRouter.get(
    "/commentsQualification/:idOrganization",
    [
        param("idOrganization", "qualification.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    getCommentsQuailification
);

/**
 * @swagger
 * /qualifications/{idOrganization}:
 *   get:
 *     tags:
 *       - Qualifications
 *     summary: Get qualifications by organization ID
 *     description: Retrieve qualifications associated with a specific organization ID.
 *     parameters:
 *       - in: path
 *         name: idOrganization
 *         required: true
 *         description: ID of the organization to retrieve qualifications for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of qualifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   idOrganization:
 *                     type: integer
 *                   qualification:
 *                     type: string
 *                   comments:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: qualification.error_invalid_data
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
qualificationRouter.get(
    "/qualifications/:idOrganization",
    [
        param("idOrganization", "qualification.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    getQuailification
);

/**
 * @swagger
 * /getQualificationGeneral:
 *   get:
 *     tags:
 *       - Qualifications
 *     summary: Get all QualificationGeneral
 *     description: Retrieve a list of all QualificationGeneral.
 *     responses:
 *       200:
 *         description: A list of QualificationGeneral
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
qualificationRouter.get("/getQualificationGeneral", getQualificationGeneral);

export default qualificationRouter;