export type CloudinaryUploadResponse = {
    publicId: string;
    url: string;
    secureUrl: string;
    resourceType: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
};
