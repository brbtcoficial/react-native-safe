
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNB8safeSpec.h"

@interface B8safe : NSObject <NativeB8safeSpec>
#else
#import <React/RCTBridgeModule.h>

@interface B8safe : NSObject <RCTBridgeModule>
#endif

@end
