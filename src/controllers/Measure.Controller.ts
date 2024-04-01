import { RequestHandler } from "express";
import * as repository from "../repository/Measure.Repository"
import { MeasureRepositorySercice } from "../interface/Measure.Interface";
import { parseMessageI18n } from "../utils/parse-messga-i18";

export const getMeasure: RequestHandler = async (req, res) => {
    try {
        const { code, message, ...resto }: MeasureRepositorySercice = await repository.getMeasusre();
        res.status(code).json({message: parseMessageI18n(message, req), ...resto});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: parseMessageI18n('error_server', req)}); 
    }
}