#import <Foundation/Foundation.h>

#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import <VisionCamera/VisionCameraProxy.h>
#import <VisionCamera/Frame.h>

#import <WebRTC/RTCMediaConstraints.h>
#import <WebRTC/RTCConfiguration.h>
#import <WebRTC/RTCIceServer.h>
#import <WebRTCModule.h>
#import <WebRTCModule+RTCPeerConnection.h>


@interface WebRTCPluginPlugin : FrameProcessorPlugin
@property(weak, nonatomic) WebRTCModule *module;
@property(nonatomic, strong) RTCCameraVideoCapturer *capturer;
@end

@implementation WebRTCPluginPlugin
//- (void) connectRTC {
//
//  NSMutableArray<RTCIceServer *> *iceServers = [NSMutableArray new];
//  [iceServers addObject:[[RTCIceServer alloc] initWithURLStrings: @[@"turn:54.94.8.152:3478"]
//                                                        username: @"yJr4LWEp82m6gVCh"
//                                                      credential: @"xrp73KVqagYMG2te"]];
//
//  RTCConfiguration *configuration = [[RTCConfiguration alloc] init];
//  configuration.iceServers = iceServers;
//
//  RTCMediaConstraints *constraints = [[RTCMediaConstraints alloc] initWithMandatoryConstraints: @{
//                                                                      @"width": @"1280",
//                                                                      @"height": @"720",
//                                                                      @"frameRate": @"23"
//                                                                  }
//                                                                           optionalConstraints:nil];
//
//  RTCPeerConnection *peerConnection = [self.module.peerConnectionFactory peerConnectionWithConfiguration:configuration
//                                                                                        constraints:constraints
//                                                                                           delegate:self.module];
//  if (peerConnection == nil) {
//      return;
//  }
//
//  peerConnection.dataChannels = [NSMutableDictionary new];
//  peerConnection.reactTag = @(0);
//  peerConnection.remoteStreams = [NSMutableDictionary new];
//  peerConnection.remoteTracks = [NSMutableDictionary new];
//  peerConnection.webRTCModule = self.module;
//
//  self.module.peerConnections[@(0)] = peerConnection;
//
//  NSLog(peerConnection.connectionState ? @"YES" : @"NO");
//};

- (instancetype _Nonnull)initWithProxy:(VisionCameraProxyHolder*)proxy
                           withOptions:(NSDictionary* _Nullable)options {
  self = [super initWithProxy:proxy withOptions:options];
//  [self connectRTC];
  return self;
}

- (id _Nullable)callback:(Frame* _Nonnull)frame
           withArguments:(NSDictionary* _Nullable)arguments {
  CVImageBufferRef buffer = CMSampleBufferGetImageBuffer(frame.buffer);
  
  CIImage *ciImage = [CIImage imageWithCVPixelBuffer:buffer];
  CIContext *temporaryContext = [CIContext contextWithOptions:nil];
  CGImageRef videoImage = [temporaryContext
                              createCGImage:ciImage
                           fromRect:CGRectMake(0, 0, CVPixelBufferGetWidth(buffer), CVPixelBufferGetHeight(buffer))];
  UIImage *image = [[UIImage alloc] initWithCGImage:videoImage];
  
  float scale = [arguments[@"resolutionMultiplier"] floatValue];
//  int newWidth = image.size.width*scale;
//  int newHeight = image.size.height*scale;
//  UIGraphicsBeginImageContext(CGSizeMake(newWidth, newHeight));
//  [image drawInRect:CGRectMake(0, 0, newWidth, newHeight)];
//  UIImage *destImage = UIGraphicsGetImageFromCurrentImageContext();
//  UIGraphicsEndImageContext();
  
  return [UIImageJPEGRepresentation(image, scale) base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength];
}

VISION_EXPORT_FRAME_PROCESSOR(WebRTCPluginPlugin, webrtcPlugin)

@end