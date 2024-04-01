export interface ImessageComposed {
    translationKey: string,
    translationParams: object
}

export interface MeasureRepositorySercice {
    code: number,
    message: string | { translationKey: string },
    data?: any
}