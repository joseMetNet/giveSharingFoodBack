import { Router } from "express";
import { createUser, deleteUser, getUserByOrganization, getUsersByIdStatus, putActiveOrInactiveUser, putStatusUser, updateUser } from "../controllers/User.Controller";
import { body, param, query } from "express-validator";
import { validateEnpoint } from "../middlewares/validatorEnpoint";
import { validateEmailUserExist } from "../middlewares/validator-custom";

const userRouter = Router();

/**
 * @swagger
 * /createUser:
 *   post:
 *     tags:
 *       - Users
 *     summary: Add a new user
 *     description: Add a new user to the organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               googleAddress:
 *                 type: string
 *               idOrganization:
 *                 type: number
 *               idCity:
 *                 type: number
 *               idDepartmen:
 *                 type: number           
 *     responses:
 *       200:
 *         description: User added successfully
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
 *                       example: user.successfull
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
 *                       example: user.error_invalid_data
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
userRouter.post(
    "/createUser",
    [
        body("name", "user.required_field_text").isString().notEmpty(),
        body("phone","user.required_field_text").isString().notEmpty(),
        body("email", "user.validate_email").notEmpty().isEmail(),
        body("email").custom(validateEmailUserExist),
        body("password", "user.required_field_text").isString().notEmpty(),
        body("googleAddress","user.required_field_text").notEmpty().isString(),
        body("idOrganization","user.validate_field_int").notEmpty().isInt(),
        body("idCity","user.validate_field_int").optional().isInt(),
        body("idDepartmen","user.validate_field_int").optional().isInt(),
        validateEnpoint
    ],
    createUser
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update an existing user
 *     description: Update user information such as name, phone, Google address, city, and department.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string 
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               googleAddress:
 *                 type: string
 *               idCity:
 *                 type: number
 *               idDepartmen:
 *                 type: number
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                       example: user.update_successful
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
 *                       example: user.error_invalid_data
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
userRouter.put(
    "/users/:id",
    [   
        body("email", "user.required_field_text").optional().isString(),
        body("password", "user.required_field_text").optional().isString(),
        body("name", "user.required_field_text").optional().isString(),
        body("phone", "user.required_field_text").optional().isString(),
        body("googleAddress", "user.required_field_text").optional().isString(),
        body("idCity", "user.validate_field_int").optional().isInt(),
        body("idDepartmen", "user.validate_field_int").optional().isInt(),
        validateEnpoint
    ],
    updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete a user
 *     description: Remove a user from the system by their ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                       example: user.delete_successful
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: user.not_found
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
userRouter.delete('/users/:id', deleteUser);

/**
 * @swagger
 * /users/{idOrganization}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get users by organization ID
 *     description: Retrieve a list of users associated with a specific organization by its ID.
 *     parameters:
 *       - in: path
 *         name: idOrganization
 *         required: true
 *         description: ID of the organization to retrieve users for
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   idAuth:
 *                     type: number 
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *                   city:
 *                     type: string
 *                   department:
 *                     type: string
 *                   bussisnesName:
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
 *                       example: user.error_invalid_data
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
userRouter.get(
    "/users/:idOrganization",
    [
        param("idOrganization", "user.required_field_text").notEmpty().isInt(),
        validateEnpoint
    ],
    getUserByOrganization
);

/**
 * @swagger
 * /putActiveOrInactiveUser/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Activate or inactive a user
 *     description: Update the status of a user for activate o inactivate.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: user updated successfully
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
 *                       example: user.successful
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
 *                       example: user.error_invalid_data
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
userRouter.put(
    "/putActiveOrInactiveUser/:id",
    [
        param("id", "user.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    putActiveOrInactiveUser
);

/**
 * @swagger
 * /putStatusUser/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: update the status of a user
 *     description: Update the status of a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idStatus:
 *                 type: integer
 *                 description: New status ID for the user.
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                       example: user.successful
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
 *                       example: user.error_invalid_data
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
userRouter.put(
    "/putStatusUser/:id",
    [
        param("id", "organizations.validate_field_int").notEmpty().isInt(),
        body("idStatus", "organizations.validate_field_int").isInt().notEmpty(),
        validateEnpoint
    ],
    putStatusUser
);

/**
 * @swagger
 * /getUsersByIdStatus:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get users list by status
 *     description: Gets the list of paginated users filtered by status, is optional filters.
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
 *         name: idStatus
 *         schema:
 *           type: string
 *         description: Optional filter by status.
 *         example: "11"
 *     responses:
 *       200:
 *         description: Users details retrieved successfully
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
 *                       idAuth:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       email:
 *                         type: string
 *                       idRol:
 *                         type: number
 *                       role:
 *                         type: string
 *                       idCity:
 *                         type: number
 *                       city:
 *                         type: string
 *                       idDepartmen:
 *                         type: number
 *                       departmen:
 *                         type: string
 *                       googleAddress:
 *                         type: string
 *                       idOrganization:
 *                         type: number
 *                       bussisnesName:
 *                         type: string
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
 *                       example: user.error_invalid_data
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
userRouter.get(
    "/getUsersByIdStatus",
    [
        query("page", "organizations.validate_field_int").optional().isInt(),
        query("size", "organizations.validate_field_int").optional().isInt(),
        query("idTypeOrganization", "organizations.validate_field_int").optional().isInt(),
        query("idStatus", "organizations.validate_field_int").optional().isInt(),
        validateEnpoint
    ],
    getUsersByIdStatus
)
export default userRouter;