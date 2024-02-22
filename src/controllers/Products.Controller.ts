import { RequestHandler } from "express";
import * as repository from "../repository/Product.Repository";
import { ProductRepositoryService } from "../interface/Product.Interface";
import { parseMessageI18n } from "../utils/parse-messga-i18";

export const getProducts: RequestHandler = async (req, res) => {
    try {
        const { code, message, ... resto }: ProductRepositoryService = await repository.getProducts();
        res.status(code).json({message: parseMessageI18n(message, req), ...resto});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: parseMessageI18n('error_server', req)});        
    }
}