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
}

export const B8SafeServiceContext = createContext<RTCConnectionInterface>(
  new RTCConnectionInterface({ hashChecker: '' })
);

export const B8SafeProvider: React.FC<Configuration> = ({
  children,
  hashChecker,
}) => {
  // const [connected, setConnected] = useState(false);
  // const [localStream, setlocalStream] = useState<MediaStream>();
  const rtcInstance = useRef<RTCConnectionInterface>(
    new RTCConnectionInterface({ hashChecker })
  );

  useEffect(() => {
    if (Platform.OS === 'android') {
      NativeModules.PlayIntegrity.prepareStandardIntegrityTokenProvider(null);
    }
  }, []);

  return (
    <B8SafeServiceContext.Provider value={rtcInstance.current}>
      {children}
    </B8SafeServiceContext.Provider>
  );
};
