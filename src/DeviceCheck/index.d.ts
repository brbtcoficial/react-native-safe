type TDeviceCheck = {
  getDeviceToken: () => Promise<string>;
};

type TPlayIntegrity = {
  isPlayIntegrityAvailable: () => Promise<boolean>;
  requestIntegrityToken: (
    nonce: string,
    loudProjectNumber?: string | null
  ) => Promise<string>;
  prepareStandardIntegrityTokenProvider: (
    cloudProjectNumber?: string
  ) => Promise<void>;
  isStandardIntegrityTokenProviderPrepared: () => Promise<boolean>;
  requestStandardIntegrityToken: (hash: string) => Promise<string>;
};

type TokenType = 'standard' | 'classic';
