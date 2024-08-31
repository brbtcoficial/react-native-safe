import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-b8safe' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const DeviceCheck: {
  getDeviceToken: () => Promise<string>;
} = NativeModules.DeviceCheck
  ? NativeModules.DeviceCheck
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const PlayIntegrity: {
  isPlayIntegrityAvailable: () => Promise<boolean>;
  requestIntegrityToken: (nonce: string) => Promise<string>;
} = NativeModules.PlayIntegrity
  ? NativeModules.PlayIntegrity
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

// import PlayIntegrity from '@erickcrus/react-native-play-integrity';
import { sha256 } from 'react-native-sha256';

export const getToken = async (payload?: object) => {
  try {
    if (Platform.OS === 'android') {
      const nonce = await sha256(JSON.stringify(payload ?? {}));
      const isAvailable = await PlayIntegrity.isPlayIntegrityAvailable();
      const base64Nonce = new Buffer(nonce).toString('base64');
      if (isAvailable)
        return (
          (await PlayIntegrity.requestIntegrityToken(base64Nonce)) + '|' + nonce
        );
      return null;
    } else {
      return await DeviceCheck.getDeviceToken();
    }
  } catch (e) {
    console.error('Erro:', e);
    return null;
  }
};
