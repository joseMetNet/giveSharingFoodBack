import { Router } from "express";
import { createUser, getUserByOrganization, putActivateStatusUser } from "../controllers/User.Controller";
import { body, param } from "express-validator";
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
 * /putActiveUser/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Activate a user
 *     description: Update the status of a user for activate.
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
    "/putActiveUser/:id",
    [
        param("id", "user.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    putActivateStatusUser
)
export default userRouter;