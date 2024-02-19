export interface dataUser {
    idAuth?: number,
    name: string,
    phone: string,
    email: String,
    googleAddress: string,
    idOrganization: number,
    idRole: number,
    idCity: number
}

export interface ImessageComposed {
    translationKey: string,
    translationParams: object
}

export interface IresponseRepositoryService {
    code: number,
    message: string | ImessageComposed,
    data?: any
}