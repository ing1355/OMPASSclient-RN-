#import "AppDelegate.h"

#import "EventEmitter.h"
#import <React/RCTLinkingManager.h>
#import <React/RCTBundleURLProvider.h>
#import "RNSplashScreen.h"
#import <Firebase.h>
#import <UserNotifications/UserNotifications.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }
  if ([UNUserNotificationCenter class] != nil) [UNUserNotificationCenter currentNotificationCenter].delegate = self;
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert | UNAuthorizationOptionBadge | UNAuthorizationOptionSound)
                        completionHandler:^(BOOL granted, NSError * _Nullable error) {
      if (granted) {
          NSLog(@"알림 권한이 승인되었습니다.");
      } else {
          NSLog(@"알림 권한이 거부되었습니다.");
      }
  }];
  [application registerForRemoteNotifications];
  [FIRMessaging messaging].delegate = self;
  
  self.moduleName = @"ompass";
  self.initialProps = @{};
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    application.applicationIconBadgeNumber = 0;
}

- (void) userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
    NSDictionary *userInfo = notification.request.content.userInfo;
    if (@available(iOS 14.0, *)) {
      completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionBanner | UNNotificationPresentationOptionList | UNNotificationPresentationOptionBadge);
    } else {
      completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionList | UNNotificationPresentationOptionBanner | UNNotificationPresentationOptionBadge);
    }
    [EventEmitter emitEventDictionaryWithName: @"pushEvent" andPayload: userInfo];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler {
    NSDictionary *userInfo = response.notification.request.content.userInfo;
    [EventEmitter emitEventDictionaryWithName: @"pushEvent" andPayload: userInfo];
    [[NSUserDefaults standardUserDefaults] setObject:userInfo forKey:@"pendingPushData"];
    completionHandler();
}

- (void)messaging:(FIRMessaging *)messaging didReceiveRegistrationToken:(NSString *)fcmToken {
    NSLog(@"FCM new registration token: %@", fcmToken);
    [EventEmitter emitEventStringWithName: @"newToken" andPayload: fcmToken];
}

- (NSDictionary *)prepareInitialProps: (NSString*)data
{
  NSMutableDictionary *initProps = [NSMutableDictionary new];
  [initProps setObject:data forKey:@"data"];
#ifdef RCT_NEW_ARCH_ENABLED
  initProps[kRNConcurrentRoot] = @([self concurrentRootEnabled]);
#endif

  return initProps;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (BOOL)application:(UIApplication *)application
openURL:(NSURL *)url
options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity
restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler
{
  return [RCTLinkingManager application:application
    continueUserActivity:userActivity
    restorationHandler:restorationHandler];
}

@end
