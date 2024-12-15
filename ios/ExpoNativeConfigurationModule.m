#import <ExpoModulesCore/ExpoModulesCore.h>

@interface ExpoNativeConfigurationModule : Module
@end

@implementation ExpoNativeConfigurationModule

- (ModuleDefinition *)definition {
  return ^ModuleDefinition *{
    Name(@"ExpoNativeConfiguration");

    Function(@"getHashChecker", ^{
      return [[NSBundle mainBundle] objectForInfoDictionaryKey:@"B8SAFE_HASH_CHECKER"];
    });

    return nil;
  }();
}

@end