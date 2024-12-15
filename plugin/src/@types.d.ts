type PluginConfiguration = {
  /**
   * The text to show in the native dialog when asking for Camera Permissions.
   * @default 'Allow $(PRODUCT_NAME) to access your camera'
   */
  cameraPermissionText?: string;
  /**
   * Whether to add Location Permissions to the native manifest or not.
   *
   * On iOS, this also fully removes the location-related APIs (`CLLocationManager`) from the compiled app.
   * @default false
   */
  enableLocation?: boolean;
  /**
   * The text to show in the native dialog when asking for Location Permissions.
   * @default 'Allow $(PRODUCT_NAME) to access your location'
   */
  locationPermissionText?: string;
  /**
   * The hash checker from B8Safe console.
   * @default undefined
   */
  hashChecker?: string;
};
