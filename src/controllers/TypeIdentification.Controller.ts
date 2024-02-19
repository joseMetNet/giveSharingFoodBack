import { RequestHandler } from "express";
import * as repository from "../repository/TypeIdentification.Repository"
import { TypeIdentificatioRepositoryService } from "../interface/TypeIdentification.Interface";
import { parseMessageI18n } from "../utils/parse-messga-i18";

export const getTypeIdentification: RequestHandler = async (req, res) => {
    try {
        const { code, message, ...resto }: TypeIdentificatioRepositoryService = await repository.getTypeIdentification();
        res.status(code).json({message: parseMessageI18n(message, req), ...resto});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req)});
    }
}
