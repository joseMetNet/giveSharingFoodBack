import { Router } from "express";
import { body, param } from "express-validator";
import { createOrganization, getDonationHistory, getDonationHistoryById, getListOrganizationById, getListOrganizations, getOrganizationById, updateOrganizationById } from "../controllers/Organization.Controller";
import { validateEnpoint } from "../middlewares/validatorEnpoint";
import { validateEmailOrganizationExist, validateEmailUserExist } from "../middlewares/validator-custom";
import { or } from "sequelize";

const organizationRouter = Router();

/**
 * @swagger
 * /createOrganization:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Create a new organization
 *     description: Create a new organization with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               representativaName:
 *                 type: string
 *                 description: The name of the representative
 *               bussisnesName:
 *                 type: string
 *                 description: The business name of the organization
 *               email:
 *                 type: string
 *                 description: The email of the organization
 *               password:
 *                 type: string
 *                 description: The password for the organization account
 *               representativePhone:
 *                 type: string
 *                 description: The phone number of the representative
 *               idTypeOrganitation:
 *                 type: integer
 *                 description: The ID of the organization type
 *     responses:
 *       200:
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization created successfully
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
 *                       example: organizations.error_invalid_data
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
organizationRouter.post(
    "/createOrganization",
    [
        body("representativaName","organizations.required_field_text").isString().notEmpty(),
        body("bussisnesName","organizations.required_field_text").isString().notEmpty(),
        body("email","organizations.validate_email").notEmpty().isEmail(),
        body("email").custom(validateEmailOrganizationExist),
        body("password","organizations.required_field_text").isString().notEmpty(),
        body("representativePhone","organizations.required_field_text").isString().notEmpty(),
        body("idTypeOrganitation","organizations.validate_field_int").isInt().notEmpty(),
        validateEnpoint
    ],
    createOrganization);

/**
 * @swagger
 * /organization/{id}:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get organization by ID
 *     description: Retrieve the details of an organization by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the organization
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Organization details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 representativaName:
 *                   type: string
 *                 bussisnesName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 representativePhone:
 *                   type: string
 *                 idTypeOrganitation:
 *                   type: integer
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
 *                       example: organizations.error_invalid_data
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
organizationRouter.get(
    "/organization/:id",
    [
        param("id","organizations.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    getOrganizationById);

/**
 * @swagger
 * /updateOrganization/{id}:
 *   put:
 *     tags:
 *       - Organizations
 *     summary: Update organization by ID
 *     description: Update the details of an organization by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the organization
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               bussisnesName:
 *                 type: string
 *                 description: The business name of the organization
 *               idTypeIdentification:
 *                 type: integer
 *                 description: The ID type of identification
 *               identification:
 *                 type: string
 *                 description: The identification number
 *               dv:
 *                 type: string
 *                 description: The DV
 *               representativaName:
 *                 type: string
 *                 description: The name of the representative
 *               representativePhone:
 *                 type: string
 *                 description: The phone number of the representative
 *               representativeEmail:
 *                 type: string
 *                 format: email
 *                 description: The email of the representative
 *               filePath:
 *                 type: string
 *                 format: binary
 *                 description: The path of the file to be uploaded
 *               idCity:
 *                 type: integer
 *                 description: The ID of the city
 *               googleAddress:
 *                 type: string
 *                 description: The Google address of the organization
 *               name:
 *                 type: string
 *                 description: The name of the organization
 *               phone:
 *                 type: string
 *                 description: The phone number of the organization
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the organization
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization updated successfully
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
 *                       example: organizations.error_invalid_data
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
organizationRouter.put(
    "/updateOrganization/:id",
    [
        param("id", "organizations.validate_field_int").notEmpty().isInt(),
        body("bussisnesName", "organizations.required_field_text").notEmpty().isString(),
        body("idTypeIdentification", "organizations.validate_field_int").notEmpty().isInt(),
        body("identification", "organizations.required_field_text").notEmpty().isString(),
        body("dv", "organizations.required_field_text").notEmpty().isString(),
        body("representativaName", "organizations.required_field_text").notEmpty().isString(),
        body("representativePhone", "organizations.required_field_text").notEmpty().isString(),
        body("representativeEmail", "organizations.validate_email").notEmpty().isEmail(),
        body("filePath"), 
        body("idCity", "organizations.validate_field_int").notEmpty().isInt(),
        body("googleAddress", "organizations.required_field_text").notEmpty().isString(),
        body("name", "organizations.required_field_text").notEmpty().isString(),
        body("phone", "organizations.required_field_text").notEmpty().isString(),
        body("email", "organizations.validate_email").notEmpty().isEmail(),
        validateEnpoint
    ],
    updateOrganizationById
);

/**
 * @swagger
 * /listOrders:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get order list
 *     description: Gets the list of orders for paged organizations.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: Page number for pagination.
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *         description: Page size for pagination.
 *     responses:
 *       200:
 *         description: Organization details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 representativaName:
 *                   type: string
 *                 bussisnesName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 representativePhone:
 *                   type: string
 *                 idTypeOrganitation:
 *                   type: integer
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
 *                       example: organizations.error_invalid_data
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
organizationRouter.get(
    "/listOrders",
    [
        param("page").isString(),
        param("size").isString()
    ],
    getListOrganizations);

/**
 * @swagger
 * /listOrder/{id}:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get order by ID
 *     description: Gets the details of a specific order by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the order you want to obtain.
 *     responses:
 *       200:
 *         description: Organization details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 representativaName:
 *                   type: string
 *                 bussisnesName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 representativePhone:
 *                   type: string
 *                 idTypeOrganitation:
 *                   type: integer
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
 *                       example: organizations.error_invalid_data
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
organizationRouter.get(
    "/listOrder/:id",
    [
        param("id","organizations.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    getListOrganizationById);

/**
 * @swagger
 * /history/{idOrganization}:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get donation history by organization ID
 *     description: Gets the donation history of a specific organization by its ID.
 *     parameters:
 *       - in: path
 *         name: idOrganization
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the organization whose donation history you want to obtain.
 *     responses:
 *       200:
 *         description: Organization details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 representativaName:
 *                   type: string
 *                 bussisnesName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 representativePhone:
 *                   type: string
 *                 idTypeOrganitation:
 *                   type: integer
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
 *                       example: organizations.error_invalid_data
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
organizationRouter.get(
    "/history/:idOrganization",
    [
        param("idOrganization", "organizations.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    getDonationHistory
);

/**
 * @swagger
 * /historyById/{idOrganization}/{idProductOrganization}:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get donation history by organization ID and organization product ID
 *     description: Gets the donation history of a specific product from an organization by its IDs.
 *     parameters:
 *       - in: path
 *         name: idOrganization
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the organization whose product donation history you want to obtain.
 *       - in: path
 *         name: idProductOrganization
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID of the organization whose donation history you want to obtain.
 *     responses:
 *       200:
 *         description: Organization details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 representativaName:
 *                   type: string
 *                 bussisnesName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 representativePhone:
 *                   type: string
 *                 idTypeOrganitation:
 *                   type: integer
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
 *                       example: organizations.error_invalid_data
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
organizationRouter.get(
    "/historyById/:idOrganization/:idProductOrganization",
    [
        param("idOrganization", "organizations.validate_field_int").notEmpty().isInt(),
        param("idProductOrganization","organizations.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    getDonationHistoryById
);

export default organizationRouter;