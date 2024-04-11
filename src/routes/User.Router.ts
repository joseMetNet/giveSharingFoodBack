import { Router } from "express";
import { createUser, getUserByOrganization } from "../controllers/User.Controller";
import { body, param } from "express-validator";
import { validateEnpoint } from "../middlewares/validatorEnpoint";
import { validateEmailUserExist } from "../middlewares/validator-custom";

const userRouter = Router();

userRouter.post(
    "/createUser",
    [
        body("name", "user.required_field_text").isString().notEmpty(),
        body("phone","user.required_field_text").isString().notEmpty(),
        body("email", "user.validate_email").notEmpty().isEmail(),
        body("email").custom(validateEmailUserExist),
        body("password", "user.required_field_text").isString().notEmpty,
        body("googleAddress","user.required_field_text").notEmpty().isString(),
        body("idOrganization","user.validate_field_int").notEmpty().isInt(),
        body("idCity","user.validate_field_int").notEmpty().isInt(),
        body("idDepartmen","user.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    createUser);

userRouter.get(
    "/users/:idOrganization",
    [
        param("idOrganization", "user.required_field_text").notEmpty().isInt(),
        validateEnpoint
    ],
    getUserByOrganization
);
export default userRouter;