export interface ImessageComposed {
    translationKey: string,
    translationParams: object
}

export interface ProductRepositoryService {
    code: number,
    message: string | { translationKey: string },
    data?: any
}

export interface postProductRepositoryService {
    code: number,
    message: string | ImessageComposed
    data?: any
}

export interface postProduct {
    idProduct: number,
    idOrganization: number,
    idMeasure: number,
    quantity: number,
    expirationDate: Date,
    deliverDate: Date,
    idUser: number,
    price: number,
    attendantName?: string,
    attendantPhone?: string,
    attendantEmail?: string,
    attendantAddres?: string,
    idCity?: number,
    idDepartment?: number
}

export interface PostNewProductData {
    product: string;
    idUser: number;
    urlImage?: string;
    urlImagen2?: string;
    urlImagen3?: string;
    urlImagen4?: string;
    urlImagen5?: string;
    urlImagen6?: string;
}

export interface filterProduct{
    productName?: string;
}

export type ImageField = 'urlImage' | 'urlImagen2' | 'urlImagen3' | 'urlImagen4' | 'urlImagen5' | 'urlImagen6';