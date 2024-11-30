import React, { createContext, useEffect, useRef } from 'react';
import { NativeModules, Platform } from 'react-native';
import { RTCConnectionInterface } from '../functions/RTCConnectionInterface';

export interface Configuration {
  children: React.ReactNode;
  hashChecker?: string;
  onReady?: () => void;
}

export const B8SafeServiceContext =
  createContext<RTCConnectionInterface | null>(null);

export const B8SafeProvider: React.FC<Configuration> = ({
  children,
  hashChecker,
  onReady,
}) => {
  // const [connected, setConnected] = useState(false);
  // const [localStream, setlocalStream] = useState<MediaStream>();

  const rtcInstance = useRef<RTCConnectionInterface>(
    hashChecker != null ? new RTCConnectionInterface({ hashChecker }) : null
  );

  const servicesInitiator = async (): Promise<void> => {
    if (Platform.OS === 'android') {
      await NativeModules.PlayIntegrity.prepareStandardIntegrityTokenProvider(
        null
      );
    }

    if (onReady != null) onReady();
  };

  useEffect(() => {
    servicesInitiator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <B8SafeServiceContext.Provider value={rtcInstance.current}>
      {children}
    </B8SafeServiceContext.Provider>
  );
};
