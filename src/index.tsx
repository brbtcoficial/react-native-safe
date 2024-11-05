import { useContext } from 'react';
import {
  B8SafeProvider as Provider,
  B8SafeServiceContext,
} from './contexts/B8Safe';
import { getToken, type TokenType } from './DeviceCheck/module';

// Device integrity token
export function getIntegrityToken(
  payload?: object,
  type?: TokenType
): Promise<string | null> {
  return getToken(payload, type);
}

// B8 Safe exports
export const B8SafeProvider = Provider;
export const useB8SafeService = () => {
  return useContext(B8SafeServiceContext);
};
