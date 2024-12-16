import type { ConfigPlugin } from '@expo/config-plugins';
import { AndroidConfig, withPlugins } from '@expo/config-plugins';

export const withPermissions: ConfigPlugin<PluginConfiguration> = (
  config,
  {
    enableLocation,
    locationPermissionText = 'Allow $(PRODUCT_NAME) to access your location',
    cameraPermissionText = 'Allow $(PRODUCT_NAME) to access your camera',
  }
) => {
  if (config.ios == null) config.ios = {};
  if (config.ios.infoPlist == null) config.ios.infoPlist = {};

  const androidPermissions = ['android.permission.CAMERA'];
  config.ios.infoPlist.NSCameraUsageDescription = cameraPermissionText;

  if (enableLocation === true) {
    androidPermissions.push('android.permission.ACCESS_FINE_LOCATION');
    config.ios.infoPlist.NSLocationAlwaysAndWhenInUseUsageDescription =
      locationPermissionText;
  }
  return withPlugins(config, [
    [AndroidConfig.Permissions.withPermissions, androidPermissions],
  ]);
};
