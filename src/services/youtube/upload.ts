import type {
  VideoMetadata,
  UploadProgressCallback,
  YouTubeVideoResponse,
} from './types';

const YOUTUBE_UPLOAD_URL =
  'https://www.googleapis.com/upload/youtube/v3/videos';

export const uploadVideo = async (
  accessToken: string,
  videoBlob: Blob,
  metadata: VideoMetadata,
  onProgress?: UploadProgressCallback,
): Promise<YouTubeVideoResponse> => {
  // Step 1: Initialize resumable upload session
  const initResponse = await fetch(
    `${YOUTUBE_UPLOAD_URL}?uploadType=resumable&part=snippet,status`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Length': String(videoBlob.size),
        'X-Upload-Content-Type': videoBlob.type || 'video/mp4',
      },
      body: JSON.stringify({
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags || [],
          categoryId: '22', // People & Blogs
        },
        status: {
          privacyStatus: metadata.privacyStatus,
          selfDeclaredMadeForKids: false,
        },
      }),
    },
  );

  if (!initResponse.ok) {
    const error = await initResponse.json();
    throw new Error(
      error.error?.message || `Failed to initialize upload: ${initResponse.status}`,
    );
  }

  const uploadUrl = initResponse.headers.get('Location');
  if (!uploadUrl) {
    throw new Error('No upload URL received from YouTube API');
  }

  // Step 2: Upload the video file with progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          bytesUploaded: event.loaded,
          totalBytes: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Invalid response from YouTube API'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(
            new Error(
              errorResponse.error?.message || `Upload failed: ${xhr.status}`,
            ),
          );
        } catch {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled'));
    });

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('Content-Type', videoBlob.type || 'video/mp4');
    xhr.send(videoBlob);
  });
};
