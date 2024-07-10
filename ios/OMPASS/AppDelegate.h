#import <RCTAppDelegate.h>
#import <React/RCTEventEmitter.h>
#import <UserNotifications/UserNotifications.h>
#import <UIKit/UIKit.h>

@interface AppDelegate : RCTAppDelegate <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate>

@property (strong, nonatomic) NSString *deviceToken;

@end
