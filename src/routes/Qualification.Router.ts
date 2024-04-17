import { Router } from "express";
import { body, param } from "express-validator";
import { validateEnpoint } from "../middlewares/validatorEnpoint";
import { getCommentsQuailification, getPointsToGrade, getQuailification, postQualification } from "../controllers/Qualification.Controller";

const qualificationRouter = Router();

qualificationRouter.get("/pointsGrade", getPointsToGrade);

qualificationRouter.post(
    "/postQuailification",
    [
        body("idOrganization", "qualification.validate_field_int").notEmpty().isInt(),
        body("idProductsOrganization", "qualification.validate_field_int").notEmpty().isInt(),
        body("idPointsToGrade", "qualification.validate_field_int").notEmpty().isInt(),
        body("qualification", "qualification.validate_field_int").notEmpty().isInt(),
        body("observations", "qualification.validate_field_text").notEmpty().isString(),
        validateEnpoint
    ],
    postQualification
);

qualificationRouter.get(
    "/commentsQualification/:idOrganization",
    [
        param("idOrganization", "qualification.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    getCommentsQuailification
);

qualificationRouter.get(
    "/qualifications/:idOrganization",
    [
        param("idOrganization", "qualification.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    getQuailification
);

export default qualificationRouter;