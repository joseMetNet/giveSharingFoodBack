import { Router } from "express";
import { getCityByDepartment } from "../controllers/City.Controller";
import { param } from "express-validator";
import { validateEnpoint } from "../middlewares/validatorEnpoint";

const cityRouter = Router();


cityRouter.get(
    "/cities/:idDepartament",
    [
        param("idDepartament","city.field").notEmpty().isInt(),
        validateEnpoint
    ],
    getCityByDepartment);

export default cityRouter;