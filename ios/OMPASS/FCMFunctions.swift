import Foundation
import Firebase

@objc(FCMFunctions)
class FCMFunctions : NSObject {
  @objc(getToken:rejecter:)
  func getToken(resolve: @escaping RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    Messaging.messaging().token { token, error in
      if let error = error {
        print("Error fetching FCM registration token: \(error)")
        resolve(nil)
      } else if let token = token {
        print("FCM registration token: \(token)")
        resolve(token)
      }
    }
  }
}
