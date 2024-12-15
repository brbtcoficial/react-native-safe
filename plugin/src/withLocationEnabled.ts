import type { ConfigPlugin } from '@expo/config-plugins';
import { withDangerousMod } from '@expo/config-plugins';
import { writeToPodfile } from './writeToPodfile';

/**
 * Set the `enableLocation` flag inside of the XcodeProject.
 * This is used to enable location APIs.
 * If location is disabled, the CLLocation APIs are not used in the codebase.
 * This is useful if you don't use Location and apple review is unhappy about CLLocation usage.
 */
export const withLocationEnabled: ConfigPlugin<PluginConfiguration> = (
  config,
  { enableLocation }
) => {
  return withDangerousMod(config, [
    'ios',
    (_config) => {
      writeToPodfile(
        _config.modRequest.projectRoot,
        '$VCEnableLocation',
        String(enableLocation)
      );
      return _config;
    },
  ]);
};
