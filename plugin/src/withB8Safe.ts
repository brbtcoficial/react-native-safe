import { withLocationEnabled } from './withLocationEnabled';
import { withPermissions } from './withPermissions';
import { withAuthentication } from './withAuthentication';
import withBuildGradle from './withBuildGradle';
import {
  ConfigPlugin,
  createRunOncePlugin,
  withPlugins,
} from '@expo/config-plugins';

import * as pkg from '@b8safe/react-native-safe/package.json';

const withB8Safe: ConfigPlugin<PluginConfiguration> = (config, props = {}) => {
  const { enableLocation = false, hashChecker = '' } = props;

  if (enableLocation) config = withLocationEnabled(config, props);

  if (hashChecker !== '') config = withAuthentication(config, hashChecker);

  withPlugins(config, [[withPermissions, props], withBuildGradle]);
  return config;
};

export default createRunOncePlugin(withB8Safe, pkg.name, pkg.version);
