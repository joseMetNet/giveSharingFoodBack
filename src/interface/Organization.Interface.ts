export interface dataOrganization {
    representativaName: string,
    bussisnesName: string,
    email: String,
    password: String,
    representativePhone: string,
    idTypeOrganitation: number,
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

export interface dataOrganizationById{
    id?: number;
}

export interface IresponseRepositoryServiceGet{
    code: number,
    message: string | { translationKey: string },
    data?:any
}

export interface updateOrganizationById {
    bussisnesName?: string | undefined,
    idTypeIdentification?: number | undefined,
    identification?: string | undefined,
    dv?: string | undefined,
    representativaName?: string | undefined,
    representativePhone?: string | undefined,
    representativeEmail?: string | undefined,
    logo?: string,
    name?: string | undefined,
    phone?: string | undefined,
    email?: string | undefined,
    idCity?: number | undefined,
    googleAddress?: string | undefined,
    observations?: string | undefined
}

export interface idHistory {
    idOrganization?: number,
    idProductOrganization?: number,
    idOrganizationProductReserved?: number;
}