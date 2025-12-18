import CameraSelect from 'components/CameraSelect';
import MainRecordButton from 'components/MainRecordButton';
import MicrophoneSelect from 'components/MicrophoneSelect';
import ScreenAudioSelect from 'components/ScreenAudioSelect';
import ScreenResolutionSelect from 'components/ScreenResolutionSelect';
import ShapeSelect from 'components/ShapeSelect';
import TeleprompterSelect from 'components/TeleprompterSelect';

import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.root}>
      <div>&nbsp;</div>
      <MainRecordButton />
      <div className={styles.devices}>
        <TeleprompterSelect />
        <ShapeSelect />
        <ScreenResolutionSelect />
        <ScreenAudioSelect />
        <MicrophoneSelect />
        <CameraSelect />
      </div>
    </footer>
  );
};

export default Footer;
