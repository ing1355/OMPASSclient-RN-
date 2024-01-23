#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_REMAP_MODULE(CustomSystem, CustomSystem, NSObject)

RCT_EXTERN_METHOD(ExitApp)
RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(checkPendingPush)
{
  NSDictionary *pendingPushData = [[NSUserDefaults standardUserDefaults] objectForKey:@"pendingPushData"];
  [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"pendingPushData"];
  return pendingPushData;
}
RCT_EXTERN_METHOD(cancelPendingPush)
RCT_EXTERN_METHOD(cancelNotification: (NSString *)id)

RCT_EXTERN_METHOD(LogNative: (NSString *)tag text: (NSString *)text)

@end
