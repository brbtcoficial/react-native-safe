import type { Frame } from 'react-native-vision-camera';
import { VisionCameraProxy } from 'react-native-vision-camera';

const plugin = VisionCameraProxy.initFrameProcessorPlugin(
  'b8SafeProcessor',
  {}
);

export function b8SafeProcessor(frame: Frame): unknown {
  'worklet';
  if (plugin == null) throw new Error('Failed to load Frame Processor Plugin!');

  return plugin.call(frame);
}
