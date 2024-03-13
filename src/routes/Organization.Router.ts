import { Router } from "express";
import { body, param } from "express-validator";
import { createOrganization, getListOrganizationById, getListOrganizations, getOrganizationById, updateOrganizationById } from "../controllers/Organization.Controller";
import { validateEnpoint } from "../middlewares/validatorEnpoint";
import { validateEmailOrganizationExist, validateEmailUserExist } from "../middlewares/validator-custom";

const organizationRouter = Router();

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

organizationRouter.get(
    "/organization/:id",
    [
        param("id","organizations.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    getOrganizationById);

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
            validateEnpoint
        ],
        updateOrganizationById
    );

organizationRouter.get(
    "/listOrders",
    [
        param("page").isString(),
        param("size").isString()
    ],
    getListOrganizations);

organizationRouter.get(
    "/listOrder/:id",
    [
        param("id","organizations.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    getListOrganizationById);
export default organizationRouter;