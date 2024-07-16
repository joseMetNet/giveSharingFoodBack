import { RequestHandler } from "express";
import * as repository from "../repository/User.Repository"
import { IresponseRepositoryService, UserRepositoryService } from "../interface/User.Insterface";
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

export const getUserByOrganization: RequestHandler = async (req, res) => {
    try {
        const {code, message, ...resto }: UserRepositoryService = await repository.getUserByOrganization(req.params);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req) });
    }
}

export const putActiveOrInactiveUser: RequestHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { code, message, ...resto }: UserRepositoryService = await repository.putActiveOrInactiveUser(id);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req) });
    }
}