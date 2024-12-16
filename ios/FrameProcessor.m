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
  float scale = 1;
  if (arguments != nil && [arguments[@"resolutionMultiplier"] isKindOfClass:[NSNumber class]]) {
    scale = [arguments[@"resolutionMultiplier"] floatValue];
  } else {
      @throw [NSException exceptionWithName:@"RuntimeException"
                                    reason:@"resolutionMultiplier property has to be a number!"
                                  userInfo:nil];
  }
  
  CVPixelBufferRef buffer = CMSampleBufferGetImageBuffer(frame.buffer);
  if (buffer == NULL) {
    @throw [NSException exceptionWithName:@"RuntimeException"
                                  reason:@"Failed to get image buffer from frame!"
                                userInfo:nil];
  }
  
  CIImage *ciImage = [CIImage imageWithCVPixelBuffer:buffer];
  CIContext *temporaryContext = [CIContext contextWithOptions:nil];
  CGImageRef videoImage = [temporaryContext createCGImage:ciImage
                                                fromRect:CGRectMake(0, 0, CVPixelBufferGetWidth(buffer), CVPixelBufferGetHeight(buffer))];                                              
  if (videoImage == NULL) {
    @throw [NSException exceptionWithName:@"RuntimeException"
                                  reason:@"Failed to create CGImage from CIImage!"
                                userInfo:nil];
  }

  UIImage *image = [[UIImage alloc] initWithCGImage:videoImage];
  CGImageRelease(videoImage);

  NSData *imageData = UIImageJPEGRepresentation(image, scale);
  if (imageData == nil) {
    @throw [NSException exceptionWithName:@"RuntimeException"
                                  reason:@"Failed to create JPEG representation of image!"
                                userInfo:nil];
  }
  
  return [imageData base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength];
}

VISION_EXPORT_FRAME_PROCESSOR(B8SafeFrameProcessorPlugin, b8SafeProcessor)

@end