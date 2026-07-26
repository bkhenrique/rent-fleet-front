export type UploadContentType = 'image/jpeg' | 'image/png' | 'image/webp';

export const SUPPORTED_UPLOAD_CONTENT_TYPES: UploadContentType[] = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadUrlResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}
