import { useEffect, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import Button from '@mui/material/Button';

import { useYouTube } from 'contexts/youtube';
import { uploadVideo } from 'services/youtube/upload';
import type { VideoMetadata, YouTubeVideoResponse } from 'services/youtube/types';

import { YouTubeMetadataForm } from './YouTubeMetadataForm';
import { UploadProgress } from './UploadProgress';
import { UploadComplete } from './UploadComplete';
import styles from './RecordingModal.module.css';

type ModalStatus =
  | 'idle'
  | 'loading'
  | 'converting'
  | 'authenticating'
  | 'metadata'
  | 'uploading'
  | 'uploadComplete'
  | 'error';

type RecordingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recordingBlob: Blob | null;
};

export const RecordingModal = ({
  isOpen,
  onClose,
  recordingBlob,
}: RecordingModalProps) => {
  const [status, setStatus] = useState<ModalStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [uploadResult, setUploadResult] = useState<YouTubeVideoResponse | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState('');
  const ffmpegRef = useRef<FFmpeg>();

  const { isAuthenticated, signIn, getAccessToken } = useYouTube();

  useEffect(() => {
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg log:', message);
      if (message.includes('configuration')) {
        setStatusMessage('Initializing encoder...');
      }
    });

    ffmpeg.on('progress', ({ progress }) => {
      console.log('FFmpeg progress:', progress);
      setStatus('converting');
      const normalizedProgress = Math.abs(progress);
      const startValue = 2500000;
      const percentage = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            (1 - (startValue - normalizedProgress) / startValue) * 100,
          ),
        ),
      );
      setProgress(percentage);
      setStatusMessage(`Converting video... ${percentage}%`);
    });

    return () => {
      ffmpeg.off('log', () => {});
      ffmpeg.off('progress', () => {});
    };
  }, []);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setProgress(0);
      setStatusMessage('');
      setConvertedBlob(null);
      setUploadResult(null);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen || !recordingBlob) return null;

  const convertToMp4Internal = async (): Promise<Blob> => {
    if (!ffmpegRef.current) {
      throw new Error('FFmpeg not initialized');
    }

    setStatus('loading');
    setStatusMessage('Loading FFmpeg libraries...');
    setProgress(0);

    const ffmpeg = ffmpegRef.current;
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.js`,
        'text/javascript',
      ),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm',
      ),
    });

    setStatusMessage('Processing input file...');
    await ffmpeg.writeFile('input.webm', await fetchFile(recordingBlob));

    setStatusMessage('Starting conversion...');
    await ffmpeg.exec(['-i', 'input.webm', '-c:v', 'libx264', 'output.mp4']);

    setStatusMessage('Reading converted file...');
    const data = await ffmpeg.readFile('output.mp4');

    return new Blob([data instanceof Uint8Array ? data : new Uint8Array()], {
      type: 'video/mp4',
    });
  };

  const downloadWebm = () => {
    const url = URL.createObjectURL(recordingBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recording.webm';
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const convertToMp4 = async () => {
    try {
      const mp4Blob = await convertToMp4Internal();

      const url = URL.createObjectURL(mp4Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'recording.mp4';
      link.click();
      URL.revokeObjectURL(url);

      setStatus('idle');
      setStatusMessage('');
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error converting video:', message);
      setErrorMessage(`Conversion failed: ${message}`);
      setStatus('error');
    }
  };

  const handleYouTubeUpload = async () => {
    try {
      // Step 1: Authenticate if needed
      if (!isAuthenticated) {
        setStatus('authenticating');
        setStatusMessage('Signing in to Google...');
        await signIn();
      }

      // Step 2: Convert to MP4
      const mp4Blob = await convertToMp4Internal();
      setConvertedBlob(mp4Blob);

      // Step 3: Show metadata form
      setStatus('metadata');
      setStatusMessage('');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error preparing upload:', message);
      setErrorMessage(message);
      setStatus('error');
    }
  };

  const handleMetadataSubmit = async (metadata: VideoMetadata) => {
    if (!convertedBlob) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      setErrorMessage('Authentication expired. Please try again.');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setProgress(0);
    setStatusMessage('Uploading to YouTube...');

    try {
      const result = await uploadVideo(
        accessToken,
        convertedBlob,
        metadata,
        (uploadProgress) => {
          setProgress(uploadProgress.percentage);
          setStatusMessage(`Uploading to YouTube... ${uploadProgress.percentage}%`);
        },
      );

      setUploadResult(result);
      setStatus('uploadComplete');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error uploading to YouTube:', message);
      setErrorMessage(message);
      setStatus('error');
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setErrorMessage('');
    setProgress(0);
    setStatusMessage('');
  };

  const handleDownloadFallback = () => {
    if (convertedBlob) {
      const url = URL.createObjectURL(convertedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'recording.mp4';
      link.click();
      URL.revokeObjectURL(url);
    } else {
      downloadWebm();
    }
    onClose();
  };

  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
              Recording Complete
            </h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <Button
                onClick={handleYouTubeUpload}
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: '#ff0000',
                  '&:hover': {
                    backgroundColor: '#cc0000',
                  },
                }}
              >
                Upload to YouTube
              </Button>
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                }}
              >
                <Button
                  onClick={convertToMp4}
                  className={styles.convertButton}
                  fullWidth
                >
                  Convert (MP4)
                </Button>
                <Button
                  onClick={downloadWebm}
                  className={styles.downloadButton}
                  fullWidth
                >
                  Download (WebM)
                </Button>
              </div>
            </div>
          </>
        );

      case 'loading':
      case 'converting':
      case 'authenticating':
        return (
          <>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
              {status === 'authenticating' ? 'Signing In' : 'Processing'}
            </h2>
            <div>
              <p style={{ textAlign: 'center', margin: '1rem 0' }}>
                {statusMessage}
              </p>
              {status === 'converting' && (
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#333',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginTop: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      backgroundColor: '#007bff',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              )}
            </div>
          </>
        );

      case 'metadata':
        return (
          <YouTubeMetadataForm
            onSubmit={handleMetadataSubmit}
            onCancel={handleRetry}
            isSubmitting={false}
          />
        );

      case 'uploading':
        return (
          <>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
              Uploading to YouTube
            </h2>
            <UploadProgress progress={progress} statusMessage={statusMessage} />
          </>
        );

      case 'uploadComplete':
        return uploadResult ? (
          <UploadComplete result={uploadResult} onClose={onClose} />
        ) : null;

      case 'error':
        return (
          <>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#f44336' }}>
              Something went wrong
            </h2>
            <p
              style={{
                textAlign: 'center',
                margin: '0 0 1.5rem',
                color: '#888',
              }}
            >
              {errorMessage}
            </p>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
              }}
            >
              <Button onClick={handleRetry} variant="contained">
                Try Again
              </Button>
              <Button onClick={handleDownloadFallback} variant="outlined">
                Download Instead
              </Button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'black',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};
