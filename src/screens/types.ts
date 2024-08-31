export interface FinishCallData {
  success: boolean;
  message?: string;
  hash?: string;
  nextStep: 'back' | 'selfie';
}
