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

export const updateUser: RequestHandler = async (req, res) => {
    try {
        const idUser = parseInt(req.params.id);
        const { code, message, ...resto }: IresponseRepositoryService = await repository.updateContacts(idUser, req.body);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: parseMessageI18n("error_server", req) });
    }
}

export const deleteUser: RequestHandler = async (req, res) => {
    try {
        const idUser = parseInt(req.params.id);
        const { code, message, ...resto }: UserRepositoryService = await repository.deleteUser(idUser);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: parseMessageI18n("error_server", req) });
    }
};

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

export const putStatusUser: RequestHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { idStatus } = req.body;
        const { code, message, ...resto }: UserRepositoryService = await repository.putStatusUser(id, idStatus);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req) });
    }
  }

export const getUsersByIdStatus: RequestHandler = async (req, res) => {
    try {
        let { page = 0, size = 10, idStatus } = req.query;

        page = parseInt(page as string, 10);
        size = parseInt(size as string, 10);
        const parsedIdStatus  = idStatus ? parseInt(idStatus as string, 10) : undefined;
        const { code, message, ...resto }: UserRepositoryService = await repository.getUsersByIdStatus(page, size, parsedIdStatus); 
        res.status(code).json({message: parseMessageI18n(message, req), ...resto});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req)});
    }
}