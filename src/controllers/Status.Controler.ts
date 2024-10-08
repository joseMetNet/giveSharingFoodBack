import { RequestHandler } from "express";
import * as repository from "../repository/Status.Repository";
import { IStatusRepositoryService } from "../interface/Status.Interface";
import { parseMessageI18n } from "../utils/parse-messga-i18";

export const getStatus: RequestHandler = async (req, res) => {
    try {
        const { code, message, ...resto }: IStatusRepositoryService = await repository.getStatus();
        res.status(code).json({message: parseMessageI18n(message, req), ...resto});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req)});
    }
}