export interface ProductRepositoryService {
    code: number,
    message: string| { translationKey: string },
    data?: any
}