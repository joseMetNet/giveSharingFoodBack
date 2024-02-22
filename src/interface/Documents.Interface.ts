export interface IFile {
    fileName: string;
    fileUrl: string;
  }

  export interface DocumentsRepositoryService {
    code: number,
    message: string| { translationKey: string },
    data?: any
}