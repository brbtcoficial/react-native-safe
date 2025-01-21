package br.com.b8.safe;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry;
import br.com.b8.safe.b8safeframeprocessor.B8SafeFrameProcessorPlugin;

public class B8SafePackage implements ReactPackage {
  static {
    FrameProcessorPluginRegistry.addFrameProcessorPlugin("b8SafeProcessor", B8SafeFrameProcessorPlugin::new);
  }

  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
    return Arrays.<NativeModule>asList(new PlayIntegrityModule(reactContext));
  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }
}
