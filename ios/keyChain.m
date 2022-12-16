#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_REMAP_MODULE(Security, keyChain, NSObject)

RCT_EXTERN_METHOD(VerificationByPass: (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(Verification: (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(isVerification: (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(InitSecurity: (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(AuthLock: (NSString *)name timestamp :(NSString *)timestamp
                  successCallback :(RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(isLock: (NSString *)name successCallback :(RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(isAllLock: (int)now_timestamp successCallback :(RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(errorCountAdd: (NSString *)name successCallback :(RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(getErrorCount: (NSString *)name successCallback :(RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(resetErrorCount: (NSString *)name successCallback :(RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(Security: (NSString *)data Auth_name : (NSString *) Auth_name Type : (NSString *) Type successCallback : (RCTResponseSenderBlock)successCallback errorCallback : (RCTResponseSenderBlock)errorCallback)

RCT_EXTERN_METHOD(Remove: (NSString *) Auth_name successCallback : (RCTResponseSenderBlock)successCallback errorCallback : (RCTResponseSenderBlock)errorCallback)

RCT_EXTERN_METHOD(RemoveAll: (RCTResponseSenderBlock)successCallback errorCallback : (RCTResponseSenderBlock)errorCallback)

@end
