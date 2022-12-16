#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_REMAP_MODULE(checkForgery, checkForgery, NSObject)

RCT_EXTERN_METHOD(isForgery: (RCTResponseSenderBlock)successCallback errorCallback : (RCTResponseSenderBlock)errorCallback)

@end
