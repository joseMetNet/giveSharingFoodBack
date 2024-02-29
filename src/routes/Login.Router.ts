import { Router } from "express";
import { body } from "express-validator";
import { login } from "../controllers/Login.Controller";
import { validateEnpoint } from "../middlewares/validatorEnpoint";

const loginRouter = Router();

loginRouter.post(
    "/login",
    [
        body("email", "login.file_required").notEmpty().isString(),
        body("password", "login.file_required").notEmpty().isString(),
        validateEnpoint
    ], 
    login);

export default loginRouter;