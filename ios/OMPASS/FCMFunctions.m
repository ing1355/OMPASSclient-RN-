#import <React/RCTBridgeModule.h>
@interface RCT_EXTERN_MODULE(FCMFunctions, NSObject)
    RCT_EXTERN_METHOD(getToken:
    (RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject
)
@end
