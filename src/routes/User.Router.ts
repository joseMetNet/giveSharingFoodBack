import { Router } from "express";
import { createUser } from "../controllers/User.Controller";
import { body } from "express-validator";
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
        body("googleAddress","user.required_field_text").notEmpty().isString(),
        body("idOrganization","user.validate_field_int").notEmpty().isInt(),
        body("idCity","user.validate_field_int").notEmpty().isInt(),
        body("idDepartmen","user.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    createUser);

export default userRouter;