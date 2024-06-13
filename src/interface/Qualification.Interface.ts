export interface dataQualification {
    idOrganization: number,
    idProductsOrganization: number,
    idPointsToGrade: number,
    qualification: number,
    observations: string,
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

export interface QualificationRepositoryService {
    code: number,
    message: string| { translationKey: string },
    data?: any
}

export interface idOrganizationQualification {
    idOrganization?: number,
}

export interface IfilterQuantificationByIdRol {
    idRol?: number,
}