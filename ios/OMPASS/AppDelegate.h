#import <RCTAppDelegate.h>
#import <React/RCTEventEmitter.h>
#import <UserNotifications/UserNotifications.h>
#import <UIKit/UIKit.h>
#import <Firebase.h>

@interface AppDelegate : RCTAppDelegate <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate, FIRMessagingDelegate>

@end
