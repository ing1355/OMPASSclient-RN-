#import <UIKit/UIKit.h>
#import "OMPASS-Swift.h"
#import "AppDelegate.h"

void uncaughtExceptionHandler(NSException *exception)
{
    NSArray<NSString *>*callStacks = [exception callStackSymbols];
    [LogFunctionClass writeLogToFile:@"uncaughtExceptionHandler(Reason)" data:exception];
    [LogFunctionClass writeLogToFile:@"uncaughtExceptionHandler(Detail)" data:exception.description];
    NSLog(@"CRASH: %@", exception);
    NSLog(@"Stack Trace: %@", [exception callStackSymbols]);
}

int main(int argc, char *argv[])
{
  @autoreleasepool {
    NSSetUncaughtExceptionHandler(&uncaughtExceptionHandler);
    return UIApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
  }
}
