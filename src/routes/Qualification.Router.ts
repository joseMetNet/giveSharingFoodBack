import { Router } from "express";
import { body } from "express-validator";
import { validateEnpoint } from "../middlewares/validatorEnpoint";
import { postQualification } from "../controllers/Qualification.Controller";

const qualificationRouter = Router();

qualificationRouter.post(
    "/postQuailification",
    [
        body("idOrganization", "qualification.validate_field_int").notEmpty().isInt(),
        body("timelyColection", "qualification.validate_field_int").notEmpty().isInt(),
        body("timelyComunication", "qualification.validate_field_int").notEmpty().isInt(),
        body("observations", "qualification.validate_field_text").notEmpty().isString(),
        validateEnpoint
    ],
    postQualification
);

export default qualificationRouter;