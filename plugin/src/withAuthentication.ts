import {
  AndroidConfig,
  withAndroidManifest,
  withInfoPlist,
  type ConfigPlugin,
} from '@expo/config-plugins';

/**
 * Set the `enableLocation` flag inside of the XcodeProject.
 * This is used to enable location APIs.
 * If location is disabled, the CLLocation APIs are not used in the codebase.
 * This is useful if you don't use Location and apple review is unhappy about CLLocation usage.
 */
export const withAuthentication: ConfigPlugin<string> = (
  config,
  hashChecker
) => {
  config = withInfoPlist(config, (configInfoPlist) => {
    configInfoPlist.modResults.B8SAFE_HASH_CHECKER = hashChecker;
    return configInfoPlist;
  });

  config = withAndroidManifest(config, (configAndroidManifest) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      configAndroidManifest.modResults
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'B8SAFE_HASH_CHECKER',
      hashChecker
    );
    return configAndroidManifest;
  });

  return config;
};
