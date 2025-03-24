export declare class UploadService {
    private readonly uploadDir;
    private readonly baseUrl;
    constructor();
    uploadFile(file: Buffer, fileName: string): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
}
