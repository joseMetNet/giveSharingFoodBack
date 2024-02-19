import { RequestHandler } from "express";
import * as repository from "../repository/User.Repository"
import { IresponseRepositoryService } from "../interface/User.Insterface";
import { parseMessageI18n } from "../utils/parse-messga-i18";

export const createUser: RequestHandler = async(req, res) => {
    try {
        const { code, message, ...resto}: IresponseRepositoryService = await repository.postContacts(req.body);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: parseMessageI18n("error_server", req) })
    }
}