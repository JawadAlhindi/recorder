import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import type { VideoMetadata } from 'services/youtube/types';

type YouTubeMetadataFormProps = {
  onSubmit: (metadata: VideoMetadata) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

export const YouTubeMetadataForm = ({
  onSubmit,
  onCancel,
  isSubmitting,
}: YouTubeMetadataFormProps) => {
  const [title, setTitle] = useState('Screen Recording');
  const [description, setDescription] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState<
    'public' | 'unlisted' | 'private'
  >('unlisted');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title: title.trim(), description: description.trim(), privacyStatus });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Upload to YouTube</h3>
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        fullWidth
        margin="normal"
        size="small"
        inputProps={{ maxLength: 100 }}
        disabled={isSubmitting}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        }}
      />
      <TextField
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        rows={3}
        fullWidth
        margin="normal"
        size="small"
        inputProps={{ maxLength: 5000 }}
        disabled={isSubmitting}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        }}
      />
      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>Privacy</InputLabel>
        <Select
          value={privacyStatus}
          onChange={(e) =>
            setPrivacyStatus(e.target.value as typeof privacyStatus)
          }
          label="Privacy"
          disabled={isSubmitting}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <MenuItem value="private">Private - Only you can view</MenuItem>
          <MenuItem value="unlisted">Unlisted - Anyone with link can view</MenuItem>
          <MenuItem value="public">Public - Visible to everyone</MenuItem>
        </Select>
      </FormControl>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1.5rem',
          justifyContent: 'flex-end',
        }}
      >
        <Button onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || !title.trim()}
          sx={{
            backgroundColor: '#ff0000',
            '&:hover': {
              backgroundColor: '#cc0000',
            },
          }}
        >
          {isSubmitting ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </form>
  );
};
