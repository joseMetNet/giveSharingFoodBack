import { RequestHandler } from "express";
import * as repository from "../repository/Qualification.Repository"
import { QualificationRepositoryService } from "../interface/Qualification.Interface";
import { parseMessageI18n } from "../utils/parse-messga-i18";

export const postQualification: RequestHandler = async(req, res) => {
    try {
        const { code, message, ...resto }: QualificationRepositoryService = await repository.postQualification(req.body);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: parseMessageI18n("error_server", req) });
    }
}