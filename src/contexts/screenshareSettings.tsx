import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ScreenshareResolutionId =
  | 'auto'
  | '720p'
  | '1080p'
  | '1440p'
  | '2160p';

type ScreenshareResolutionOption = {
  id: ScreenshareResolutionId;
  label: string;
  width?: number;
  height?: number;
};

const SCREEN_RESOLUTION_OPTIONS: ScreenshareResolutionOption[] = [
  { id: 'auto', label: 'Auto (native)' },
  { id: '720p', label: '1280 x 720 (720p)', width: 1280, height: 720 },
  { id: '1080p', label: '1920 x 1080 (1080p)', width: 1920, height: 1080 },
  { id: '1440p', label: '2560 x 1440 (1440p)', width: 2560, height: 1440 },
  { id: '2160p', label: '3840 x 2160 (4K)', width: 3840, height: 2160 },
];

const SCREEN_RESOLUTION_MAP = SCREEN_RESOLUTION_OPTIONS.reduce(
  (acc, option) => {
    acc[option.id] = option;
    return acc;
  },
  {} as Record<ScreenshareResolutionId, ScreenshareResolutionOption>,
);

type ScreenshareSettingsContextType = {
  resolutionId: ScreenshareResolutionId;
  resolution: ScreenshareResolutionOption;
  includeSystemAudio: boolean;
  setResolutionId: (value: ScreenshareResolutionId) => void;
  setIncludeSystemAudio: (value: boolean) => void;
};

const ScreenshareSettingsContext = createContext<
  ScreenshareSettingsContextType | undefined
>(undefined);

const getStoredResolution = (): ScreenshareResolutionId => {
  const stored = localStorage.getItem('screenshareResolution');
  if (stored && stored in SCREEN_RESOLUTION_MAP) {
    return stored as ScreenshareResolutionId;
  }
  return 'auto';
};

const getStoredSystemAudio = () =>
  localStorage.getItem('screenshareSystemAudio') === 'true';

export const ScreenshareSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [resolutionId, setResolutionId] = useState<ScreenshareResolutionId>(
    () => getStoredResolution(),
  );
  const [includeSystemAudio, setIncludeSystemAudio] = useState(() =>
    getStoredSystemAudio(),
  );

  useEffect(() => {
    localStorage.setItem('screenshareResolution', resolutionId);
  }, [resolutionId]);

  useEffect(() => {
    localStorage.setItem(
      'screenshareSystemAudio',
      String(includeSystemAudio),
    );
  }, [includeSystemAudio]);

  const resolution = useMemo(
    () => SCREEN_RESOLUTION_MAP[resolutionId],
    [resolutionId],
  );

  return (
    <ScreenshareSettingsContext.Provider
      value={{
        resolutionId,
        resolution,
        includeSystemAudio,
        setResolutionId,
        setIncludeSystemAudio,
      }}
    >
      {children}
    </ScreenshareSettingsContext.Provider>
  );
};

export const useScreenshareSettings = (): ScreenshareSettingsContextType => {
  const context = useContext(ScreenshareSettingsContext);
  if (context === undefined) {
    throw new Error(
      'useScreenshareSettings must be used within a ScreenshareSettingsProvider',
    );
  }
  return context;
};

export { SCREEN_RESOLUTION_OPTIONS };
