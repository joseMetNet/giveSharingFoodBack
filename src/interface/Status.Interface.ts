export interface IStatusRepositoryService {
    code: number,
    message: string| { translationKey: string },
    data?: any
}