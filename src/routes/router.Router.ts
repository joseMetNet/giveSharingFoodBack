import { Router } from "express";
import { body, check, param, query } from "express-validator";
import { validateEnpoint } from "../middlewares/validatorEnpoint";
import { getDepartments } from "../controllers/Department.Controller";
import { getCityByDepartment } from "../controllers/City.Controller";
import { getTypeIdentification } from "../controllers/TypeIdentification.Controller";
import { createUser } from "../controllers/User.Controller";
import { getProducts } from "../controllers/Products.Controller";
import { uploadFile } from "../controllers/Documents.controller";


const routes = Router();

//Rutas departamentos
routes.get("/departments", getDepartments);

//Rutas ciudades
routes.get("/cities/:idDepartament", [param("idDepartament").notEmpty().isInt()], getCityByDepartment);

//Rutas tipo de identificacion
routes.get("/typeIdentification", getTypeIdentification);

//Rutas usuario
routes.post("/createUser", [body("idAuth"),
                            body("name"),
                            body("phone"),
                            body("email"),
                            body("googleAddress"),
                            body("idOrganization"),
                            body("idRole"),
                            body("idCity")], createUser);

//Rutas productos
routes.get("/products", getProducts);

//Rutas documentos
routes.post('/upload', uploadFile);
export default routes;
