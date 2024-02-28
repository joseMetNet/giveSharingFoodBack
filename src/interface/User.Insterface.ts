export interface dataUser {
    name: string,
    phone: string,
    email: String,
    googleAddress: string,
    idOrganization: number,
    idCity: number,
    idDepartmen: number
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