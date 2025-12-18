import MonitorOutlinedIcon from '@mui/icons-material/MonitorOutlined';
import MenuItem from '@mui/material/MenuItem';

import DeviceSelect from 'components/DeviceSelect';
import {
  SCREEN_RESOLUTION_OPTIONS,
  type ScreenshareResolutionId,
  useScreenshareSettings,
} from 'contexts/screenshareSettings';

const ScreenResolutionSelect = () => {
  const { resolutionId, setResolutionId } = useScreenshareSettings();

  return (
    <DeviceSelect
      startAdornment={<MonitorOutlinedIcon />}
      value={resolutionId}
      onChange={(event) =>
        setResolutionId(event.target.value as ScreenshareResolutionId)
      }
    >
      {SCREEN_RESOLUTION_OPTIONS.map((option) => (
        <MenuItem key={option.id} value={option.id}>
          {option.label}
        </MenuItem>
      ))}
    </DeviceSelect>
  );
};

export default ScreenResolutionSelect;
