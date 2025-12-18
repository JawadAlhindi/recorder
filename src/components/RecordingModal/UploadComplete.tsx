import Button from '@mui/material/Button';
import type { YouTubeVideoResponse } from 'services/youtube/types';

type UploadCompleteProps = {
  result: YouTubeVideoResponse;
  onClose: () => void;
};

export const UploadComplete = ({ result, onClose }: UploadCompleteProps) => {
  const videoUrl = `https://www.youtube.com/watch?v=${result.id}`;
  const studioUrl = `https://studio.youtube.com/video/${result.id}/edit`;

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4caf50"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 style={{ color: '#4caf50', marginTop: 0, marginBottom: '0.5rem' }}>
        Upload Complete!
      </h3>
      <p style={{ marginBottom: '1.5rem', color: '#888' }}>
        Your video has been uploaded to YouTube
        {result.status?.privacyStatus === 'private' && ' (Private)'}
        {result.status?.privacyStatus === 'unlisted' && ' (Unlisted)'}
        {result.status?.privacyStatus === 'public' && ' (Public)'}
      </p>
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Button
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          sx={{
            backgroundColor: '#ff0000',
            '&:hover': {
              backgroundColor: '#cc0000',
            },
          }}
        >
          Watch on YouTube
        </Button>
        <Button
          href={studioUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
        >
          Edit in Studio
        </Button>
        <Button onClick={onClose} variant="text">
          Close
        </Button>
      </div>
    </div>
  );
};
