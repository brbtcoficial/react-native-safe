import { createRunOncePlugin, type ConfigPlugin } from '@expo/config-plugins';
import { withLocationEnabled } from './withLocationEnabled';
import { withPermissions } from './withPermissions';
import { withAuthentication } from './withAuthentication';
import withBuildGradle from './withBuildGradle';

const pkg = { name: '@b8safe/react-native-safe', version: 'UNVERSIONED' };

const withB8Safe: ConfigPlugin<PluginConfiguration> = (config, props = {}) => {
  const { enableLocation = false, hashChecker = '' } = props;

  config = withPermissions(config, props);

  if (enableLocation) config = withLocationEnabled(config, props);

  if (hashChecker !== '') config = withAuthentication(config, hashChecker);

  config = withBuildGradle(config);

  return config;
};

export default createRunOncePlugin(withB8Safe, pkg.name, pkg.version);
