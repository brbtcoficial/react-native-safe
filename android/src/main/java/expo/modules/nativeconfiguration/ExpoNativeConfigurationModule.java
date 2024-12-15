package expo.modules.nativeconfiguration;

import expo.modules.kotlin.modules.Module;
import expo.modules.kotlin.modules.ModuleDefinition;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;

public class ExpoNativeConfigurationModule extends Module {
  @Override
  public ModuleDefinition definition() {
    return new ModuleDefinition() {{
      Name("ExpoNativeConfiguration");

      Function("getHashChecker", () -> {
        ApplicationInfo applicationInfo = null;
        try {
          applicationInfo = getAppContext().getReactContext().getPackageManager().getApplicationInfo(getAppContext().getReactContext().getPackageName(), PackageManager.GET_META_DATA);
        } catch (PackageManager.NameNotFoundException e) {
          e.printStackTrace();
        }

        if (applicationInfo != null && applicationInfo.metaData != null) {
          return applicationInfo.metaData.getString("B8SAFE_HASH_CHECKER");
        }
        return null;
      });
    }};
  }
}