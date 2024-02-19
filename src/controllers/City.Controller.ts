import { RequestHandler } from "express";
import * as repository from "../repository/City.Repository";
import { CitiesRepositoryService } from "../interface/City.Interface";
import { parseMessageI18n } from "../utils/parse-messga-i18";

export const getCityByDepartment: RequestHandler = async (req, res) => {
    try {
        const { code, message, ...resto }: CitiesRepositoryService = await repository.getCityByDepartment(req.params);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req) });
    }
};