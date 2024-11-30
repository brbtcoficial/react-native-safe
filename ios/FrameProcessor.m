#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import <VisionCamera/Frame.h>

@interface B8SafeFrameProcessorPlugin : FrameProcessorPlugin
@end

@implementation B8SafeFrameProcessorPlugin

- (instancetype) initWithProxy:(VisionCameraProxyHolder*)proxy
                   withOptions:(NSDictionary* _Nullable)options {
  self = [super initWithProxy:proxy withOptions:options];
  return self;
}

- (id)callback:(Frame*)frame withArguments:(NSDictionary*)arguments {
  CVImageBufferRef buffer = CMSampleBufferGetImageBuffer(frame.buffer);
  
  CIImage *ciImage = [CIImage imageWithCVPixelBuffer:buffer];
  CIContext *temporaryContext = [CIContext contextWithOptions:nil];
  CGImageRef videoImage = [temporaryContext
                              createCGImage:ciImage
                           fromRect:CGRectMake(0, 0, CVPixelBufferGetWidth(buffer), CVPixelBufferGetHeight(buffer))];
  UIImage *image = [[UIImage alloc] initWithCGImage:videoImage];
  
  float scale = [arguments[@"resolutionMultiplier"] floatValue];
  
  return [UIImageJPEGRepresentation(image, scale) base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength];
}

VISION_EXPORT_FRAME_PROCESSOR(B8SafeFrameProcessorPlugin, b8SafeProcessor)

@end