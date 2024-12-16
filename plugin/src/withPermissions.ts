import type { ConfigPlugin } from '@expo/config-plugins';
import {
  AndroidConfig,
  withAndroidManifest,
  withInfoPlist,
} from '@expo/config-plugins';

export const withPermissions: ConfigPlugin<PluginConfiguration> = (
  config,
  {
    enableLocation,
    locationPermissionText = 'Allow $(PRODUCT_NAME) to access your location',
    cameraPermissionText = 'Allow $(PRODUCT_NAME) to access your camera',
  }
) => {
  const androidPermissions = ['android.permission.CAMERA'];
  config = withInfoPlist(config, (_config) => {
    _config.modResults.NSCameraUsageDescription = cameraPermissionText;
    return _config;
  });

  if (enableLocation) {
    androidPermissions.push('android.permission.ACCESS_FINE_LOCATION');
    config = withInfoPlist(config, (_config) => {
      _config.modResults.NSLocationAlwaysAndWhenInUseUsageDescription =
        locationPermissionText;
      return _config;
    });
  }

  config = withAndroidManifest(config, (_config) => {
    androidPermissions.forEach((permission) => {
      AndroidConfig.Permissions.addPermission(_config.modResults, permission);
    });
    return _config;
  });

  return config;
};
