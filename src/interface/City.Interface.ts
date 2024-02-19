export interface dataCity{
    idDepartament?: number;
}

export interface CitiesRepositoryService {
    code: number,
    message: string| { translationKey: string },
    data?: any
}