#ifndef RCTDeviceCheck_h
#define RCTDeviceCheck_h

#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNB8safeSpec.h"

@interface RCTDeviceCheck : NSObject<NativeB8safeSpec>
#else
#import <React/RCTBridgeModule.h>

@interface RCTDeviceCheck : NSObject<RCTBridgeModule>
#endif

+ (BOOL)deviceCheckCompatibleWithPlatform;

@end

#endif /* RCTDeviceCheck_h */