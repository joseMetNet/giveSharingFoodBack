import { Router } from "express";
import { getDepartments } from "../controllers/Department.Controller";


const routes = Router();

routes.get("/departments", getDepartments);

export default routes;
