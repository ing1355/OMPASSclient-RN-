import Foundation
import LocalAuthentication
import SwiftKeychainWrapper

@objc(WebAuthn)
public class WebAuthn : NSObject {
  var authenticatorMangager : AuthenticatorManager? = nil

  @objc
  func PreRegister(_ fidoAddress:String, domain:String, accessKey:String, username:String, displayName:String, redirectUri:String, did:Int, errorCallback: @escaping RCTResponseSenderBlock, successCallback: @escaping RCTResponseSenderBlock) {
    LogFunctionClass.writeLogToFile("PreRegister Start", data: fidoAddress)
//    debugPrint("\(Data()) : PreRegister | \(fidoAddress)")
    do {
      try DispatchQueue.main.async { [weak self] in
        self?.authenticatorMangager = AuthenticatorManager(fidoAddress: fidoAddress, domain: domain, accessKey: accessKey)
        LogFunctionClass.writeLogToFile("PreRegister Start", data: "create AuthenticatorManager in PreRegister")
        self?.authenticatorMangager?.tryPreregister(username: username, displayName: displayName, redirectUri: redirectUri, did: did, completion: { state in
          if state == "success" {
            let result: [String: Any] = [
              "authorization": self?.authenticatorMangager?.authorization,
              "challenge" : self?.authenticatorMangager?.challenge,
              "userId": self?.authenticatorMangager?.userId
            ] as Dictionary
            do {
              if let jsonString = String(data: try JSONSerialization.data(withJSONObject: result), encoding: .utf8) {
                  LogFunctionClass.writeLogToFile("PreRegister Success", data: jsonString)
              }
            } catch {
              LogFunctionClass.writeLogToFile("PreRegister Fail", data: "Fail To Convert Json String")
            }
            successCallback([result])
          } else {
            LogFunctionClass.writeLogToFile("PreRegister Fail", data: state)
            errorCallback([state])
          }
        })
      }
    } catch {
      print(error)
      LogFunctionClass.writeLogToFile("PreRegister Fail Catch", data: "\(error)")
    }
  }
  
  @objc
  func Register(_ fidoAddress:String, domain:String, accessKey:String, username:String, clientInfo:String, displayName:String, pushToken:String, authorization:String,
                challenge:String, userId:String, errorCallback: @escaping RCTResponseSenderBlock, successCallback: @escaping RCTResponseSenderBlock) {
    LogFunctionClass.writeLogToFile("Register Start", data: fidoAddress)
    authenticatorMangager?.pushToken = pushToken
    authenticatorMangager?.clientInfo = clientInfo
    authenticatorMangager?.tryRegister( completion: {state in
      if state == "true" {
        LogFunctionClass.writeLogToFile("Register Success", data: state)
        successCallback(["success"])
      } else {
        LogFunctionClass.writeLogToFile("Register Fail", data: state)
        errorCallback([state])
      }
    })
  }
  
  @objc
  func PreAuthenticate(_ fidoAddress:String, domain:String, accessKey:String, redirectUri:String, did:Int, username:String, errorCallback: @escaping RCTResponseSenderBlock, successCallback: @escaping RCTResponseSenderBlock) {
    LogFunctionClass.writeLogToFile("PreAuthenticate Start", data: fidoAddress)
    DispatchQueue.main.async { [weak self] in
      self?.authenticatorMangager = AuthenticatorManager(fidoAddress: fidoAddress, domain: domain, accessKey: accessKey)
      LogFunctionClass.writeLogToFile("PreAuthenticate Start", data: "create AuthenticatorManager in PreAuthenticate")
      self?.authenticatorMangager?.requestAuthentication(username: username, redirectUri: redirectUri, did: did, completion: { state in
        if state == "success" {
          let result: [String: Any] = [
            "authorization": self?.authenticatorMangager?.authorization,
            "challenge" : self?.authenticatorMangager?.challenge,
            "userId": self?.authenticatorMangager?.userId
          ] as Dictionary
          do {
            if let jsonString = String(data: try JSONSerialization.data(withJSONObject: result), encoding: .utf8) {
                LogFunctionClass.writeLogToFile("PreAuthenticate Success", data: jsonString)
            }
          } catch {
            LogFunctionClass.writeLogToFile("PreAuthenticate Fail", data: "Fail To Convert Json String")
          }
          successCallback([result])
        } else {
          LogFunctionClass.writeLogToFile("PreAuthenticate Fail", data: state)
          errorCallback([state])
        }
      })
    }
  }
  
  @objc
  func Authenticate(_ pushToken:String, fidoAddress:String, domain:String, accessKey:String, username:String, authorization:String, challenge:String, userId:String,
                    clientInfo:String, errorCallback: @escaping RCTResponseSenderBlock, successCallback: @escaping RCTResponseSenderBlock) {
    LogFunctionClass.writeLogToFile("Authenticate Start", data: fidoAddress)
    authenticatorMangager?.clientInfo = clientInfo
    authenticatorMangager?.pushToken = pushToken
    authenticatorMangager?.tryAuthentication(completion: {state in
      if state == "true" {
        LogFunctionClass.writeLogToFile("Authenticate Success", data: state)
        successCallback([self.authenticatorMangager?.authentication_token ?? ""])
      } else {
        LogFunctionClass.writeLogToFile("Authenticate Fail", data: state)
        errorCallback([state])
      }
    })
  }
  
  @objc
  func biometricType(_ successCallback: @escaping RCTResponseSenderBlock) {
    let context = LAContext()
    var error: NSError?
    if context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) {
      switch context.biometryType {
      case .none :
        successCallback(["none"])
      case .touchID:
        successCallback(["fingerprint"])
      case .faceID:
        successCallback(["face"])
      case .opticID: // 홍채인식
        successCallback(["none"])
      }
    } else {
      successCallback(["none"])
    }
  }
  
  @objc
  func Biometrics(_ title:String, type:String, successCallback: @escaping RCTResponseSenderBlock) {
    let context = LAContext()
    var error: NSError?
    if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
      if let domainState = context.evaluatedPolicyDomainState {
        let bData = domainState.base64EncodedData()
        if let currentBiometric = String(data: bData, encoding: .utf8) {
          let oldBiometric: String? = KeychainWrapper.standard.string(forKey: "oldBiometric")
          print(oldBiometric)
          print(currentBiometric)
          if oldBiometric == currentBiometric || type == "first_regist" {
            context.localizedFallbackTitle = ""
            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: title) {
              (success, evaluateError) in
              if success {
                DispatchQueue.main.async {
                  KeychainWrapper.standard.set(currentBiometric, forKey: "oldBiometric")
                  successCallback(["success"])
                }
              } else {
                let message: String
                switch evaluateError {
                case LAError.authenticationFailed?:
                  message = "There was a problem verifying your identity."
                case LAError.userCancel?:
                  message = "You pressed cancel."
                case LAError.userFallback?:
                  message = "You pressed password."
                case LAError.biometryNotAvailable?:
                  message = "Face ID/Touch ID is not available."
                case LAError.biometryNotEnrolled?:
                  message = "Face ID/Touch ID is not set up."
                case LAError.biometryLockout?:
                  message = "Face ID/Touch ID is locked."
                default:
                  message = "Face ID/Touch ID may not be configured"
                }
                DispatchQueue.main.async {
                  successCallback([message])
                }
              }
            }
          } else {
            KeychainWrapper.standard.set(currentBiometric, forKey: "oldBiometric")
            successCallback(["changed"])
          }
        }
      }
    } else {
      print(error)
      let message: String
      switch error!.code {
      case LAError.authenticationFailed.rawValue:
        message = "There was a problem verifying your identity."
      case LAError.userCancel.rawValue:
        message = "You pressed cancel."
      case LAError.userFallback.rawValue:
        message = "You pressed password."
      case LAError.biometryNotAvailable.rawValue:
        message = "Face ID/Touch ID is not available."
      case LAError.biometryNotEnrolled.rawValue:
        message = "Face ID/Touch ID is not set up."
      case LAError.biometryLockout.rawValue:
        message = "Face ID/Touch ID is locked."
      default:
        message = "Face ID/Touch ID may not be configured"
      }
      DispatchQueue.main.async {
        successCallback([message])
      }
    }
  }
  
  @objc
  func LocalAuth(_ title: String, successCallback: @escaping RCTResponseSenderBlock) {
    let context = LAContext()
    context.localizedFallbackTitle = title
    context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: " ") {
      (success, error) in
      if success {
        DispatchQueue.main.async {
          successCallback(["success"])
        }
      } else {
        DispatchQueue.main.async {
          successCallback([error])
        }
      }
    }
  }
  
  @objc
  func CanBiometric(_ successCallback: @escaping RCTResponseSenderBlock) {
    let context = LAContext()
    var error: NSError?
    if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
      successCallback(["true"])
    } else {
      switch error {
      case LAError.biometryNotAvailable?:
        successCallback(["false"])
        break
      default:
        successCallback(["true"])
      }
    }
  }
  
  @objc
  func DetectionChangedBiometric(_ successCallback: @escaping RCTResponseSenderBlock) {
    let context = LAContext()
    var error: NSError?
    if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
      if let domainState = context.evaluatedPolicyDomainState {
        let bData = domainState.base64EncodedData()
        if let currentBiometric = String(data: bData, encoding: .utf8) {
          let oldBiometric: String? = KeychainWrapper.standard.string(forKey: "oldBiometric")
          if oldBiometric == nil {
            let saveSuccessful: Bool = KeychainWrapper.standard.set(currentBiometric, forKey: "oldBiometric")
            if saveSuccessful {
              successCallback(["NO"])
            }
          } else if oldBiometric != currentBiometric {
            let saveSuccessful: Bool = KeychainWrapper.standard.set(currentBiometric, forKey: "oldBiometric")
            if saveSuccessful {
              successCallback(["YES"])
            }
          } else {
            successCallback(["NO"])
          }
        }
      }
    } else {
      if error != nil {
        print(error)
        successCallback(["OUT"])
      }
    }
  }
}
