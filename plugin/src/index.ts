import type { ConfigPlugin } from 'expo/config-plugins';
import { withLocationEnabled } from './withLocationEnabled';
import { withPermissions } from './withPermissions';
import { withAuthentication } from './withAuthentication';
import withBuildGradle from './withBuildGradle';

const withB8Safe: ConfigPlugin<PluginConfiguration> = (config, props = {}) => {
  const { enableLocation = false, hashChecker = '' } = props;

  config = withPermissions(config, props);

  if (enableLocation) config = withLocationEnabled(config, props);

  if (hashChecker !== '') config = withAuthentication(config, hashChecker);

  config = withBuildGradle(config);

  return config;
};

export default withB8Safe;
