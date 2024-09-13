import { useContext } from 'react';
import {
  B8SafeProvider as Provider,
  B8SafeServiceContext,
} from './contexts/B8Safe';
import { getToken } from './DeviceCheck/module';
import CameraScreen from './screens/CameraScreen';
import type { FinishCallData } from './screens/types';

// Device integrity token
export function getIntegrityToken(payload?: object): Promise<string | null> {
  return getToken(payload);
}

// B8 Safe exports
export const B8SafeProvider = Provider;
export const useB8SafeService = () => {
  return useContext(B8SafeServiceContext);
};

// Default components
export const CameraOCR = CameraScreen;

// Types
export type FinishCallCallback = FinishCallData;
