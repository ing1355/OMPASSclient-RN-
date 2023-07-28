#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface EventEmitter : RCTEventEmitter <RCTBridgeModule>
+ (void)emitEventDictionaryWithName:(NSString *)name andPayload:(NSDictionary *)payload;
+ (void)emitEventStringWithName:(NSString *)name andPayload:(NSString *)payload;

@end
