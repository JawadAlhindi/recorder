export interface VideoMetadata {
  title: string;
  description: string;
  privacyStatus: 'public' | 'unlisted' | 'private';
  tags?: string[];
}

export interface UploadProgress {
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;

export interface YouTubeVideoResponse {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: Record<string, { url: string; width: number; height: number }>;
  };
  status: {
    uploadStatus: string;
    privacyStatus: string;
  };
}

export interface YouTubeErrorResponse {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

export interface StoredToken {
  accessToken: string;
  expiresAt: number;
}
