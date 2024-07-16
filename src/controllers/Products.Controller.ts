import { RequestHandler } from "express";
import * as repository from "../repository/Product.Repository";
import { ImageField, PostNewProductData, ProductRepositoryService, filterProduct, postProductRepositoryService } from "../interface/Product.Interface";
import { parseMessageI18n } from "../utils/parse-messga-i18";
import { UploadedFile } from "express-fileupload";
import * as path from 'path';

export const getProducts: RequestHandler = async (req, res) => {
    try {
        const productName: string = req.query.productName as string; 
        const filter: filterProduct = { productName };
        const { code, message, ... resto }: ProductRepositoryService = await repository.getProducts(filter);
        res.status(code).json({message: parseMessageI18n(message, req), ...resto});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: parseMessageI18n('error_server', req)});        
    }
}

export const getProductsToDonate: RequestHandler = async (req, res) => {
    try {
        const productName: string = req.query.productName as string; 
        const filter: filterProduct = { productName };
        const { code, message, ... resto }: ProductRepositoryService = await repository.getProductsToDonate(filter);
        res.status(code).json({message: parseMessageI18n(message, req), ...resto});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: parseMessageI18n('error_server', req)});        
    }
}

export const postProduct: RequestHandler = async (req, res) => {
    try {
        const { code, message, ...resto}: postProductRepositoryService = await repository.postProducts(req.body);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: parseMessageI18n("error_server", req) })
    }
}
export const postNewProductHandler: RequestHandler = async (req, res) => {
    try {
        const productData: PostNewProductData = {
            product: req.body.product,
            idUser: parseInt(req.body.idUser, 10),
            urlImage: '',
            urlImagen2: '',
            urlImagen3: '',
            urlImagen4: '',
            urlImagen5: '',
            urlImagen6: ''
        };
        const imageFields: ImageField[] = ['urlImage', 'urlImagen2', 'urlImagen3', 'urlImagen4', 'urlImagen5', 'urlImagen6'];

        for (let field of imageFields) {
            if (req.files && req.files[field]) {
                const uploadedFile = req.files[field] as UploadedFile;
                const filePath = path.join(__dirname, 'tmp', uploadedFile.name);
                await uploadedFile.mv(filePath);
                productData[field] = filePath;
            }
        }

        const { code, message, ...resto }: ProductRepositoryService = await repository.postNewProduct(productData);

        repository.deleteTemporaryFiles(productData, imageFields);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n("error_server", req) });
    }
};

export const putProductReserved: RequestHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { code, message, ...resto}: ProductRepositoryService = await repository.putProductReserve(id);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto});
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: parseMessageI18n("error_server", req)})
    }
}

export const getProductsReserved: RequestHandler = async (req, res) => {
    try {
        const idUser = req.query.idUser ? parseInt(req.query.idUser as string) : undefined;
        const { code, message, ... resto }: ProductRepositoryService = await repository.getProductsReserved(idUser);
        res.status(code).json({message: parseMessageI18n(message, req), ...resto});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: parseMessageI18n('error_server', req)});        
    }
}

export const putProductDelivered: RequestHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { code, message, ...resto}: ProductRepositoryService = await repository.putProductDelivered(id);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto});
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: parseMessageI18n("error_server", req)})
    }
}

export const deleteProductOrganization: RequestHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { code, message, ...resto}: ProductRepositoryService = await repository.deleteProductOrganization(id);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto});
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: parseMessageI18n("error_server", req)})
    }
}

export const putProductNotReserved: RequestHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { code, message, ...resto}: ProductRepositoryService = await repository.putProductNotReserved(id);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto});
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: parseMessageI18n("error_server", req)})
    }
}