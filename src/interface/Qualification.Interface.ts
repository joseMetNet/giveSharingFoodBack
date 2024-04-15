export interface dataQualification {
    idOrganization: number,
    timelyColection: number,
    timelyComunication: number,
    totalQualification: number,
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