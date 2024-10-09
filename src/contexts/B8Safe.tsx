import React, { createContext, useRef, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';
import { RTCConnectionInterface } from './functions';

export interface FacialRecognitionChannelData {
  function: string;
  data: any;
}

export interface Configuration {
  children: React.ReactNode;
  hashChecker: string;
  onReady?: () => void;
}

export const B8SafeServiceContext = createContext<RTCConnectionInterface>(
  new RTCConnectionInterface({ hashChecker: '' })
);

export const B8SafeProvider: React.FC<Configuration> = ({
  children,
  hashChecker,
  onReady,
}) => {
  // const [connected, setConnected] = useState(false);
  // const [localStream, setlocalStream] = useState<MediaStream>();
  const rtcInstance = useRef<RTCConnectionInterface>(
    new RTCConnectionInterface({ hashChecker })
  );

  const servicesInitiator = async () => {
    if (Platform.OS === 'android') {
      await NativeModules.PlayIntegrity.prepareStandardIntegrityTokenProvider(
        null
      );
    }

    if (onReady) onReady();
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
