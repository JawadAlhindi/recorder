type UploadProgressProps = {
  progress: number;
  statusMessage: string;
};

export const UploadProgress = ({
  progress,
  statusMessage,
}: UploadProgressProps) => {
  return (
    <div>
      <p style={{ textAlign: 'center', margin: '1rem 0' }}>{statusMessage}</p>
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
            backgroundColor: '#ff0000',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <p
        style={{
          textAlign: 'center',
          margin: '0.5rem 0 0',
          fontSize: '0.875rem',
          color: '#888',
        }}
      >
        {progress}%
      </p>
    </div>
  );
};
