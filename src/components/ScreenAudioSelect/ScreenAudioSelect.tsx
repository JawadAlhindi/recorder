import VolumeOffOutlinedIcon from '@mui/icons-material/VolumeOffOutlined';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import MenuItem from '@mui/material/MenuItem';

import DeviceSelect from 'components/DeviceSelect';
import { useScreenshareSettings } from 'contexts/screenshareSettings';

const ScreenAudioSelect = () => {
  const { includeSystemAudio, setIncludeSystemAudio } =
    useScreenshareSettings();

  return (
    <DeviceSelect
      startAdornment={
        includeSystemAudio ? (
          <VolumeUpOutlinedIcon
            onClick={() => setIncludeSystemAudio(false)}
          />
        ) : (
          <VolumeOffOutlinedIcon
            onClick={() => setIncludeSystemAudio(true)}
          />
        )
      }
      value={includeSystemAudio ? 'on' : 'off'}
      onChange={(event) => setIncludeSystemAudio(event.target.value === 'on')}
    >
      <MenuItem value="off">System audio off</MenuItem>
      <MenuItem value="on">System audio on</MenuItem>
    </DeviceSelect>
  );
};

export default ScreenAudioSelect;
