#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_REMAP_MODULE(webAuthn, WebAuthn, NSObject)

RCT_EXTERN_METHOD(PreRegister: (NSString *) fidoAddress domain :(NSString *) domain accessKey : (NSString *) accessKey username : (NSString *) username displayName : (NSString *) displayName redirectUri : (NSString *) redirectUri did : (int) did errorCallback : (RCTResponseSenderBlock)errorCallback successCallback : (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(Register: (NSString *) fidoAddress domain :(NSString *) domain accessKey : (NSString *) accessKey username : (NSString *) username clientInfo : (NSString *) clientInfo displayName : (NSString *) displayName pushToken : (NSString *) pushToken authorization : (NSString *) authorization challenge : (NSString *) challenge userId : (NSString *) userId errorCallback : (RCTResponseSenderBlock)errorCallback successCallback : (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(PreAuthenticate: (NSString *) fidoAddress domain : (NSString *) domain accessKey : (NSString *) accessKey redirectUri : (NSString *) redirectUri did : (int) did username : (NSString *) username errorCallback : (RCTResponseSenderBlock)errorCallback successCallback : (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(Authenticate: (NSString *) pushToken fidoAddress : (NSString *) fidoAddress domain : (NSString *) domain accessKey : (NSString *) accessKey username : (NSString *) username authorization : (NSString *) authorization  challenge : (NSString *) challenge userId : (NSString *) userId clientInfo : (NSString *) clientInfo errorCallback : (RCTResponseSenderBlock)errorCallback successCallback : (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(biometricType: (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(Biometrics: (NSString *) title type : (NSString*)type successCallback : (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(LocalAuth: (NSString *) title successCallback : (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(CanBiometric: (RCTResponseSenderBlock)successCallback)

RCT_EXTERN_METHOD(DetectionChangedBiometric: (RCTResponseSenderBlock)successCallback)

@end
