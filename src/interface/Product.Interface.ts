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
    deliverDate: Date
}

export interface filterProduct{
    productName?: string;
}