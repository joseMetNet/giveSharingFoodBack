import { Router } from "express";
import { body, check, param, query } from "express-validator";
import { checkExistingEmail, validateEnpoint } from "../middlewares/validatorEnpoint";
import { getDepartments } from "../controllers/Department.Controller";
import { getCityByDepartment } from "../controllers/City.Controller";
import { getTypeIdentification } from "../controllers/TypeIdentification.Controller";
import { createUser } from "../controllers/User.Controller";
import { getProducts } from "../controllers/Products.Controller";
import { uploadFile } from "../controllers/Documents.controller";
import { createOrganization, getOrganizationById, updateOrganizationById } from "../controllers/Organization.Controller";


const routes = Router();

//Rutas departamentos
routes.get("/departments", getDepartments);

//Rutas ciudades
routes.get("/cities/:idDepartament", [param("idDepartament").notEmpty().isInt()], getCityByDepartment);

//Rutas tipo de identificacion
routes.get("/typeIdentification", getTypeIdentification);

//Rutas usuario
routes.post("/createUser", [body("idAuth"),
                            body("name").isString().notEmpty(),
                            body("phone").isString().notEmpty(),
                            body("email").notEmpty().isEmail(),
                            body("googleAddress").notEmpty(),
                            body("idOrganization").notEmpty(),
                            body("idRole").notEmpty(),
                            body("idCity")],checkExistingEmail, createUser);

//Rutas organizacion
routes.post("/createOrganization", [body("representativeName").isString().notEmpty,
                                    body("bussisnesName").isString().notEmpty(),
                                    body("email").notEmpty().isEmail(),
                                    body("password").notEmpty(),
                                    body("representativePhone").isString().notEmpty(),
                                    body("idTypeOrganitation").isInt().notEmpty], createOrganization);

routes.get("/organization/:id", [param("id").notEmpty().isInt()], getOrganizationById);

routes.put("/updateOrganization/:id", [param("id").notEmpty().isInt(),
                                    body ("bussisnesName").notEmpty().isString(),
                                    body("idTypeIdentification").notEmpty().isString(),
                                    body("identification").notEmpty().isString(),
                                    body("dv").notEmpty().isString(),
                                    body("representativaName").notEmpty().isString(),
                                    body("representativePhone").notEmpty().isString(),
                                    body("email").notEmpty().isEmail(),
                                    body("logo").notEmpty().isString()
                                    ],updateOrganizationById);

//Rutas productos
routes.get("/products", getProducts);

//Rutas documentos
routes.post('/upload', [body("filePath").isString().notEmpty(),
                        body("blobName").isString().notEmpty()], uploadFile);
export default routes;
