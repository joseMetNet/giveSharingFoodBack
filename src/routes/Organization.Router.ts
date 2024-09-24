import { Router } from "express";
import { body, param, query } from "express-validator";
import { createOrganization, getDonationHistory, getDonationHistoryById, getDonatorTypeOrgaization, getFoundationTypeOrgaization, getListByTypeOrganizationAndStatus, getListOrganizationById, getListOrganizations, getListOrganizationsByIdStatus, getOrganizationById, getTypeOrganization, putActiveOrInactiveOrganization, putBlockOrEnableOrganization, updateOrganizationById } from "../controllers/Organization.Controller";
import { validateEnpoint } from "../middlewares/validatorEnpoint";
import { validateEmailOrganizationExist } from "../middlewares/validator-custom";
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
 *               observations:
 *                 type: string
 *                 description: The observations of the organization
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
        body("observations", "organizations.validate_email").isString(),
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (Activo, Inactivo).
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
        param("size").isString(),
        query("status").optional().isString().isIn(['Abierto', 'Cerrado']),
    ],
    getListOrganizations);

/**
 * @swagger
 * /getListOrganizationsByIdStatus:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get order list By status
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
 *       - in: query
 *         name: idStatus
 *         schema:
 *           type: string
 *         description: Filter by status.
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
    "/getListOrganizationsByIdStatus",
    [
        param("page").isString(),
        param("size").isString(),
        query("Idstatus").optional().isString(),
    ],
    getListOrganizationsByIdStatus);

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
 * /history:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get donation history with optional filters
 *     description: Gets the donation history of organizations with optional filters by organization ID, product organization ID, or reserved organization product ID.
 *     parameters:
 *       - in: query
 *         name: idOrganization
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID of the organization whose donation history you want to obtain.
 *       - in: query
 *         name: idOrganizationProductReserved
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID of the reserved organization product for filtering.
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
    "/history",
    [
        param("idOrganization", "organizations.validate_field_int").optional().isInt(),
        param("idOrganizationProductReserved", "organizations.validate_field_int").optional().isInt(),
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

/**
 * @swagger
 * /getTypeOrganization:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get all type organizations
 *     description: Retrieve a list of all type organizations.
 *     responses:
 *       200:
 *         description: A list of type organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   typeOrganization:
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
organizationRouter.get("/getTypeOrganization", getTypeOrganization);

/**
 * @swagger
 * /putActiveOrInactiveOrganization/{id}:
 *   put:
 *     tags:
 *       - Organizations
 *     summary: Activate or inactive a organization
 *     description: Update the status of a organization for activate o inactivate.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the organization to update
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: organization.successful
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
 *                       example: organization.error_invalid_data
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
    "/putActiveOrInactiveOrganization/:id",
    [
        param("id", "organizations.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    putActiveOrInactiveOrganization
);

/**
 * @swagger
 * /getFoundationTypeOrgaization:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get all organizations by type foundation
 *     description: Retrieve a list of all organizations by type foundation.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: A list of organizations by type foundation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   bussisnesName:
 *                     type: string
 *                   idTypeIdentification:
 *                     type: integer
 *                   typeIdentification:
 *                     type: string
 *                   dv:
 *                     type: string
 *                   representativaName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   logo:
 *                     type: string
 *                   idStatus:
 *                     type: integer
 *                   status: 
 *                     type: string
 *                   idTypeOrganitation:
 *                     type: integer
 *                   typeOrganization:
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
organizationRouter.get("/getFoundationTypeOrgaization", getFoundationTypeOrgaization);

/**
 * @swagger
 * /getDonatorTypeOrgaization:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get all organizations by type donator
 *     description: Retrieve a list of all organizations by type donator.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: A list of organizations by type donator
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   bussisnesName:
 *                     type: string
 *                   idTypeIdentification:
 *                     type: integer
 *                   typeIdentification:
 *                     type: string
 *                   dv:
 *                     type: string
 *                   representativaName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   logo:
 *                     type: string
 *                   idStatus:
 *                     type: integer
 *                   status: 
 *                     type: string
 *                   idTypeOrganitation:
 *                     type: integer
 *                   typeOrganization:
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
organizationRouter.get("/getDonatorTypeOrgaization", getDonatorTypeOrgaization);

/**
 * @swagger
 * /putBlockOrEnableOrganization/{id}:
 *   put:
 *     tags:
 *       - Organizations
 *     summary: Block or enable an organization
 *     description: Update the status of a organization for blocking or enabling.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the organization to update
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: organization.successful
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
 *                       example: organization.error_invalid_data
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
    "/putBlockOrEnableOrganization/:id",
    [
        param("id", "organizations.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    putBlockOrEnableOrganization
);

/**
 * @swagger
 * /getListByTypeOrganizationAndStatus:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get organization list by type and status
 *     description: Gets the list of paginated organizations filtered by type of organization and status, both are optional filters.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: Page number for pagination.
 *         example: "0"
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *         description: Page size for pagination.
 *         example: "10"
 *       - in: query
 *         name: idTypeOrganization
 *         schema:
 *           type: string
 *         description: Optional filter by type of organization.
 *         example: "1"
 *       - in: query
 *         name: idStatus
 *         schema:
 *           type: string
 *         description: Optional filter by status.
 *         example: "11"
 *     responses:
 *       200:
 *         description: Organization details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 organizations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       representativaName:
 *                         type: string
 *                         example: "John Doe"
 *                       bussisnesName:
 *                         type: string
 *                         example: "Business Corp"
 *                       email:
 *                         type: string
 *                         example: "contact@business.com"
 *                       representativePhone:
 *                         type: string
 *                         example: "+123456789"
 *                       idTypeOrganization:
 *                         type: integer
 *                         example: 1
 *                       typeOrganization:
 *                         type: string
 *                         example: "Technology"
 *                       idStatus:
 *                         type: integer
 *                         example: 11
 *                       status:
 *                         type: string
 *                         example: "Active"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                       example: 100
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 0
 *                     size:
 *                       type: integer
 *                       example: 10
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
    "/getListByTypeOrganizationAndStatus",
    [
        query("page", "organizations.validate_field_int").optional().isInt(),
        query("size", "organizations.validate_field_int").optional().isInt(),
        query("idTypeOrganization", "organizations.validate_field_int").optional().isInt(),
        query("idStatus", "organizations.validate_field_int").optional().isInt(),
        validateEnpoint
    ],
    getListByTypeOrganizationAndStatus
)
export default organizationRouter;