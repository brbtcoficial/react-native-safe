import { NativeModules, Platform } from 'react-native';
import { sha256 } from 'react-native-sha256';

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
  prepareStandardIntegrityTokenProvider: (cloudProjectNumber?:string) => Promise<void>;
  isStandardIntegrityTokenProviderPrepared: () => Promise<boolean>;
  requestStandardIntegrityToken: (hash: string) => Promise<string>;
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

function generateRandomString(length: number) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const getToken = async (payload?: object, type = 'standard') => {
  try {
    if (Platform.OS === 'android') {
      const isAvailable = await PlayIntegrity.isPlayIntegrityAvailable();
      if (isAvailable) {
        if (type === 'classic') {
          const nonce = await sha256(JSON.stringify(payload ?? {}));
          const base64Nonce = new Buffer(nonce).toString('base64');
          return (
            (await PlayIntegrity.requestIntegrityToken(base64Nonce)) +
            '|' +
            nonce
          );
        } else if (type === 'standard') {
          try {
            const isPrepared =
              await PlayIntegrity.isStandardIntegrityTokenProviderPrepared();
            if (isPrepared) {
              const hash = generateRandomString(64);
              return await PlayIntegrity.requestStandardIntegrityToken(hash);
            }
          } catch (e) {
            console.error('Erro ao obter o token de integridade padrão:', e);
          }
        }
      }
      return null;
    } else {
      return await DeviceCheck.getDeviceToken();
    }
  } catch (e) {
    console.error('Erro ao obter o token de integridade:', e);
    return null;
  }
};
