import type { ConfigPlugin } from '@expo/config-plugins';
import { withAppBuildGradle } from '@expo/config-plugins';

const withBuildGradle: ConfigPlugin = (_config) => {
  return withAppBuildGradle(_config, (config) => {
    if (
      !config.modResults.contents.includes(
        "include ':@b8safe_react-native-safe'"
      )
    ) {
      config.modResults.contents += `
            include ':@b8safe_react-native-safe'
            project(':@b8safe_react-native-safe').projectDir = new File(rootProject.projectDir, '../node_modules/@b8safe/react-native-safe/android')
        `;
    }

    if (
      !config.modResults.contents.includes(
        "implementation project(':@b8safe_react-native-safe')"
      )
    ) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s?{/,
        `dependencies {
            implementation project(':@b8safe_react-native-safe')`
      );
    }

    return config;
  });
};

export default withBuildGradle;
