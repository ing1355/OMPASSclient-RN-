import Foundation
import SwiftKeychainWrapper

@objc(keyChain)
public class keyChain : NSObject {
  
  @objc
  func VerificationByPass(_ successCallback: @escaping RCTResponseSenderBlock) {
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier:"ko_KR")
    formatter.dateFormat = "yyyy-MM-dd"
    let now = formatter.date(from: formatter.string(from: Date()))
    let dDay = formatter.date(from: "2020-01-14")
    let interval = (now?.timeIntervalSince(dDay!))!
    if(interval < 0) {
      successCallback([false])
    } else {
      successCallback([true])
    }
  }
  
  @objc
  func Verification(_ successCallback: @escaping RCTResponseSenderBlock) {
    let saveSuccessful_1: Bool = KeychainWrapper.standard.set("true", forKey: "Verification")
    if saveSuccessful_1 {
      successCallback(["success"])
    } else {
      successCallback(["fail"])
    }
  }
  
  @objc
  func isVerification(_ successCallback: @escaping RCTResponseSenderBlock) {
    let saveSuccessful: String? = KeychainWrapper.standard.string(forKey: "Verification")
    if saveSuccessful != nil {
      successCallback(["success"])
    } else {
      successCallback(["fail"])
    }
  }
  
  @objc
  func InitSecurity(_ successCallback: @escaping RCTResponseSenderBlock) {
    let saveSuccessful_1: Bool = KeychainWrapper.standard.set("0", forKey: "pattern")
    let saveSuccessful_2: Bool = KeychainWrapper.standard.set("0", forKey: "pin")
    let saveSuccessful_3: Bool = KeychainWrapper.standard.set("0", forKey: "password")
    // let saveSuccessful_4: Bool = KeychainWrapper.standard.set("0", forKey: "motp")
    let saveSuccessful_5: Bool = KeychainWrapper.standard.set("0", forKey: "pattern" + "isLock")
    let saveSuccessful_6: Bool = KeychainWrapper.standard.set("0", forKey: "pin" + "isLock")
    let saveSuccessful_7: Bool = KeychainWrapper.standard.set(0, forKey: "pattern" + "errorCount")
    let saveSuccessful_8: Bool = KeychainWrapper.standard.set(0, forKey: "pin" + "errorCount")
    if saveSuccessful_1 && saveSuccessful_2 && saveSuccessful_3 && saveSuccessful_5 && saveSuccessful_6 && saveSuccessful_7 && saveSuccessful_8 {
      successCallback(["success"])
    } else {
      successCallback(["fail"])
    }
  }
  
  @objc
  func AuthLock(_ name: String, timestamp: String, successCallback: @escaping RCTResponseSenderBlock) {
    let saveSuccessful: Bool = KeychainWrapper.standard.set(timestamp, forKey: name + "isLock")
    if(saveSuccessful) {
      successCallback(["success"])
    } else {
      successCallback(["fail"])
    }
  }
  
  @objc
  func isLock(_ name: String, successCallback: @escaping RCTResponseSenderBlock) {
    let saveSuccessful: String? = KeychainWrapper.standard.string(forKey: name + "isLock")
    if(saveSuccessful != nil) {
      successCallback([saveSuccessful!])
    } else {
      successCallback(["fail"])
    }
  }
  
  @objc
  func isAllLock(_ now_timestamp: Int, successCallback: @escaping RCTResponseSenderBlock) {
    let pattern: Int? = KeychainWrapper.standard.integer(forKey: "patternisLock");
    let pin: Int? = KeychainWrapper.standard.integer(forKey: "pinisLock");
    if(pin != nil && pattern != nil) {
      successCallback([now_timestamp > pattern! && now_timestamp > pin!])
    } else {
      successCallback(["fail"])
    }
  }
  
  @objc
  func errorCountAdd(_ name: String, successCallback: @escaping RCTResponseSenderBlock) {
    var errCount = KeychainWrapper.standard.integer(forKey: name + "errorCount")
    print("errorCountAdd")
    print(errCount!)
    errCount = errCount! + 1
    print("errorCountAdd2")
    print(errCount!)
    let saveSuccessful: Bool = KeychainWrapper.standard.set(errCount!, forKey: name + "errorCount")
    if(saveSuccessful) {
      successCallback([errCount!])
    } else {
      successCallback(["fail"])
    }
  }
  
  @objc
  func getErrorCount(_ name: String, successCallback: @escaping RCTResponseSenderBlock) {
    successCallback([KeychainWrapper.standard.integer(forKey: name + "errorCount")!])
  }
  
  @objc
  func resetErrorCount(_ name: String, successCallback: @escaping RCTResponseSenderBlock) {
    let saveSuccessful: Bool = KeychainWrapper.standard.set(0, forKey: name + "errorCount")
    if(saveSuccessful) {
      successCallback(["success"])
    } else {
      successCallback(["fail"])
    }
  }
  
  @objc
  func Security(_ data: String, Auth_name: String, Type: String, successCallback: @escaping RCTResponseSenderBlock, errorCallback: @escaping RCTResponseSenderBlock) {
    if(Type == "등록") {
      let saveSuccessful: Bool = KeychainWrapper.standard.set(data, forKey: Auth_name)
      if(saveSuccessful) {
        successCallback(["success"])
      } else {
        errorCallback(["fail"])
      }
    } else if(Type == "인증") {
      let read_data: String? = KeychainWrapper.standard.string(forKey: Auth_name)
      if(read_data == data) {
        successCallback(["success"])
      } else {
        errorCallback(["fail"])
      }
    }
  }
  
  @objc
  func Remove(_ Auth_name: String, successCallback: @escaping RCTResponseSenderBlock, errorCallback: @escaping RCTResponseSenderBlock) {
    let removeSuccessful: Bool = KeychainWrapper.standard.set("0",forKey: Auth_name)
    if(removeSuccessful) {
      successCallback(["success"])
    } else {
      errorCallback(["fail"])
    }
  }
  
  @objc
  func RemoveAll(_ successCallback: @escaping RCTResponseSenderBlock, errorCallback: @escaping RCTResponseSenderBlock) {
    let saveSuccessful_1: Bool = KeychainWrapper.standard.set("0", forKey: "pattern")
    let saveSuccessful_2: Bool = KeychainWrapper.standard.set("0", forKey: "pin")
    let saveSuccessful_3: Bool = KeychainWrapper.standard.set("0", forKey: "password")
    // let saveSuccessful_4: Bool = KeychainWrapper.standard.set("0", forKey: "motp")
    if saveSuccessful_1 && saveSuccessful_2 && saveSuccessful_3 {
      successCallback(["success"])
    } else {
      errorCallback(["fail"])
    }
  }
}
