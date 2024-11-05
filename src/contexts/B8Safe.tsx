import React, { createContext, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';

export interface FacialRecognitionChannelData {
  function: string;
  data: any;
}

export interface Configuration {
  children: React.ReactNode;
  hashChecker?: string;
  onReady?: () => void;
}

export const B8SafeServiceContext = createContext(null);

export const B8SafeProvider: React.FC<Configuration> = ({
  children,
  onReady,
}) => {
  // const [connected, setConnected] = useState(false);
  // const [localStream, setlocalStream] = useState<MediaStream>();

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
    <B8SafeServiceContext.Provider value={null}>
      {children}
    </B8SafeServiceContext.Provider>
  );
};
