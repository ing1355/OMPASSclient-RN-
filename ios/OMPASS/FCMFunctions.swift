import Foundation

@objc(FCMFunctions)
class FCMFunctions : NSObject {
  @objc(getToken:rejecter:)
  func getToken(resolve: @escaping RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
    if let appDelegate = UIApplication.shared.delegate as? AppDelegate,
       let deviceToken = appDelegate.deviceToken {
      resolve(deviceToken)
      // 여기서 deviceToken을 필요에 따라 사용합니다.
    } else {
      print("Device Token is not available.")
    }
  }
}
