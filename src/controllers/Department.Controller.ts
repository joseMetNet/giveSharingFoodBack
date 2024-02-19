import { RequestHandler } from "express";
import * as repository from "../repository/Department.Repository"
import { DepartmentsRepositoryService } from "../interface/Department.Interface";
import { parseMessageI18n } from "../utils/parse-messga-i18";

export const getDepartments: RequestHandler = async (req, res) => {
    try {
        const { code, message, ...resto }: DepartmentsRepositoryService = await repository.getDepartments();
        res.status(code).json({message: parseMessageI18n(message, req), ...resto});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req)});
    }
}
