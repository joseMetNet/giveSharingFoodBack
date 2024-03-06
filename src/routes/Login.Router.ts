import { Router } from "express";
import { body } from "express-validator";
import { login } from "../controllers/Login.Controller";
import { validateEnpoint } from "../middlewares/validatorEnpoint";

const loginRouter = Router();

loginRouter.post(
    "/login",
    [
        body("email").notEmpty().withMessage("login.file_required").isString().withMessage("login.file_required_tex"),
        body("password").notEmpty().withMessage("login.file_required_password").isString().withMessage("login.file_required_tex"),
        validateEnpoint
    ], 
    login
);

export default loginRouter;