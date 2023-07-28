#import <React/RCTBridgeDelegate.h>
#import <React/RCTEventEmitter.h>
#import <UserNotifications/UserNotifications.h>
#import <UIKit/UIKit.h>
#import <Firebase.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate, FIRMessagingDelegate>

@property (nonatomic, strong) UIWindow *window;

@end
