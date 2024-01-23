//
//  AuthenticatorManager.swift
//  WebAuthnKitDemo
//
//  Created by Kang Kim on 2020/12/15.
//  Copyright © 2020 Lyo Kato. All rights reserved.
//

import UIKit
import Foundation
import WebAuthnKit
import PromiseKit
import CryptoSwift
import Alamofire
import SwiftyJSON

import Firebase

public enum UserVerification : String {
  
  case required = "Required"
  case preferred = "Preferred"
  case discouraged = "Discouraged"
}

enum AttestationConveyance : String {
  case direct = "Direct"
  case indirect = "Indirect"
  case none = "None"
}

class AuthenticatorManager {
  
  var webAuthnClient: WebAuthnClient!
  var domain = ""
  var url = ""
  var credentialId = ""
  var challenge = ""
  var userId = ""
  var userName = ""
  var displayName = ""
  var redirectUri = ""
  var did = 0
  var rpId = ""
  var userVerification = UserVerification.discouraged
  var attestationConveyance = AttestationConveyance.direct
  var accessKey = ""
  var authorization = ""
  var attestation = ""
  var pushToken = ""
  var authentication_token = ""
  var clientInfo = ""
  
  var session : Session? = nil
  
  init(fidoAddress:String, domain:String, accessKey:String) {
    
    url = "https://" + fidoAddress
    
    self.domain = domain
    self.rpId = domain
    self.accessKey = accessKey
    
    setupWebAuthnClient()
  }
  
//  func FAlogEvent(parameters:[String : Any]) {
//    Analytics.logEvent("iosPreRegisterEvent", parameters: parameters)
//  }
  
  public func setupWebAuthnClient() {
    
    let authenticator = InternalAuthenticator()
    self.webAuthnClient = WebAuthnClient(
      origin:        self.rpId,
      authenticator: authenticator
    )
  }
  
  func customError(error:AFError, completion: ((String) -> ())? = nil) {
    print(error.errorDescription)
    LogFunctionClass.writeLogToFile("CustomError", data: "\(error.errorDescription)")
    if ((error.errorDescription?.contains("The certificate for this server is invalid")) == true) {
      completion?("SSLerror")
    } else if((error.errorDescription?.contains("이 서버에 대한 인증서가 유효하지 않습니다.")) == true) {
      completion?("SSLerror")
    }
    else {
      completion?(error.errorDescription ?? "")
    }
  }
  
  public func tryRegister(completion: ((String) -> ())? = nil) {
    
    //        setProperties()
    
    if challenge.isEmpty {
      NSLog("error : challenge ")
      completion?("CODE002")
      return
    }
    
    if userId.isEmpty {
      NSLog("error : userId ")
      completion?("CODE002")
      return
    }
    
    if userName.isEmpty {
      NSLog("error : userName ")
      completion?("CODE002")
      return
    }
    
//    if displayName.isEmpty {
//      NSLog("error : displayName ")
//      completion?("CODE002")
//      return
//    }
    
    
    if rpId.isEmpty {
      NSLog("error : rpID ")
      completion?("CODE002")
      return
    }
    
    print("tryRegister | challenge: " + self.challenge)
    
    
    var options = PublicKeyCredentialCreationOptions()
    options.challenge = self.challenge
    options.user.id = Bytes.fromString(userId)
    options.user.name = userName
    options.user.displayName = displayName
    options.rp.id = rpId + "-" + userName
    options.rp.name = rpId
    
    options.attestation = AttestationConveyancePreference.direct
    options.addPubKeyCredParam(alg: .es256)
    options.authenticatorSelection = AuthenticatorSelectionCriteria(
      requireResidentKey: true,
      userVerification: UserVerificationRequirement.discouraged
    )
    // options.timeout = UInt64(120)
    
    print("==========================================")
    print("rp.id: " + (options.rp.id ?? "nil"))
    print("user.id: " + Base64.encodeBase64URL(options.user.id))
    
    
    print(" options.challenge: " + options.challenge!)
    
    print("==========================================")
    
    //self.webAuthnClient.minTimeout = 5
    //self.webAuthnClient.defaultTimeout = 5
    
    firstly {
      self.webAuthnClient.create(options)
    }.done { credential in
      let attestationObject = Base64.encodeBase64URL(credential.response.attestationObject)
//      var clientDataJSON = ""
//      if let dataFromString = credential.response.clientDataJSON.data(using: .utf8, allowLossyConversion: false) {
//        var json = try JSON(data: dataFromString)
//        json["origin"].string = (self.rpId.contains("https://") || self.rpId.contains("www.")) ? self.rpId : "https://" + self.rpId
//        clientDataJSON = json.rawString()!
//      }
      guard let clientDataJson = credential.response.clientDataJSON.data(using: .utf8) else { return  }
      let b64ClientDataJSON = Base64.encodeBase64URL(clientDataJson)
//      let b64ClientDataJSON = Base64.encodeBase64URL(clientDataJSON.data(using: .utf8)!)
      
      print("==========================================")
      print("credentialId: " + credential.id)
      print("rawId: " + Base64.encodeBase64URL(credential.rawId))
      print("attestationObject: " + attestationObject)
      print("clientDataJSON: " + b64ClientDataJSON)
      print("==========================================")
      
      
      
      let urlString = self.url + "/fido2/register/type/ompass"
      
      let parameters = self.getRegisterToJSON(cborB64: attestationObject, b64ClientDataJSON: b64ClientDataJSON)
      print("register json")
      print(parameters)
      do {
          let jsonData = try JSONSerialization.data(withJSONObject: parameters, options: .prettyPrinted)

          // JSON 데이터를 문자열로 변환
          if let jsonString = String(data: jsonData, encoding: .utf8) {
              LogFunctionClass.writeLogToFile("Register Request(JSON String)", data: jsonString)
          }
      } catch {
          LogFunctionClass.writeLogToFile("Register Request Error(JSON Parse Error)", data: error.localizedDescription)
          print("Error converting Dictionary to JSON: \(error.localizedDescription)")
      }
      if self.session != nil {
        let manager = ServerTrustManager(allHostsMustBeEvaluated: false, evaluators: [self.domain: DisabledTrustEvaluator()])
        let configuration = URLSessionConfiguration.af.default
        self.session = Session(configuration: configuration, serverTrustManager: manager)
      }
      
      
      let url = NSURL(string: urlString)
      var request = URLRequest(url: url! as URL)
      request.httpMethod = "POST"
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")
      request.setValue("application/json", forHTTPHeaderField: "accept")
      request.setValue(self.accessKey, forHTTPHeaderField: "accessKey")
      request.setValue(self.authorization, forHTTPHeaderField: "Authorization")
      let data = try! JSONSerialization.data(withJSONObject: parameters, options: JSONSerialization.WritingOptions.prettyPrinted)
      
      let json = NSString(data: data, encoding: String.Encoding.utf8.rawValue)
      if let json = json {
        print(json)
      }
      request.httpBody = json!.data(using: String.Encoding.utf8.rawValue)
      self.session?.request(request)
        .responseJSON { response in
          
          debugPrint("Response: \(response)")
          switch response.result {
          case .success(let value):
            let result = JSON(value)["isSuccess"].stringValue
            LogFunctionClass.writeLogToFile("Register Response(Success)", data: result)
            completion?(result)
          case.failure(let error):
            self.customError(error: error, completion: {
              str in
              LogFunctionClass.writeLogToFile("Register Response(Fail)", data: str)
              completion?(str)
            })
          }
        }
    }.catch { error in
      print("==========================================")
      print("error credential: " + error.localizedDescription)
      print("==========================================")
      LogFunctionClass.writeLogToFile("Register Response(Fail)", data: "CODE002")
      LogFunctionClass.writeLogToFile("Register Response(Fail Reason)", data: error.localizedDescription)
      completion?("CODE002")
    }
    
  }
  
  func requestAuthentication(username:String, redirectUri:String, did:Int, completion: ((String) -> ())? = nil) {
    
    self.userId = username
    self.userName = username
    self.redirectUri = redirectUri
    self.did = did
    
    let result: () = preAuthenticate(completion: {state in
      
      completion?(state)
      
    })
    
    print("result of preauthenticate : \(result)" )
  }
  
  func tryPreregister(username:String, displayName:String, redirectUri:String, did:Int, completion: ((String) -> ())? = nil) {
    self.userName = username
    self.displayName = displayName
    self.redirectUri = redirectUri
    self.did = did
    
    preRegister( completion: {state in
      completion?(state)
    })
    
  }
  
  struct PreRegisterData : Encodable {
    let userName: String
    let displayName: String
    let domain: String
    let redirectUri:String
    let did : CLong
  }
  
  func getPreAuthDataToJSON(
    userName: String,
    domain: String,
    redirectUri:String,
    did : Int) -> Parameters {
    
    let json : Parameters = [
      "redirectUri": redirectUri,
      "did" : did,
      "username" : userName,
      "domain" : domain
    ]
    return json
  }
  
  func getPreRegisterToJSON(
    userName: String,
    displayName: String,
    domain: String,
    redirectUri:String,
    did : Int) -> Parameters {
    
    let json : Parameters = [
      "username" : userName,
      "displayName" : displayName,
      "domain" : domain,
      "redirectUri": redirectUri,
      "did" : did
    ]
    return json
  }
  
  func getRegisterToJSON(
    cborB64:String,
    b64ClientDataJSON : String) -> Parameters {
    
    var json : Parameters = [:]
    
    var dictionary:NSDictionary?
    
    if let clientInfoData = self.clientInfo.data(using: .utf8) {
      do {
        dictionary = try JSONSerialization.jsonObject(with: clientInfoData, options: [.allowFragments]) as! NSDictionary
      } catch let error as NSError {
        print(error)
      }
    }
      
      json = [
        "response": [
          "attestationObject":cborB64,
          "clientDataJSON":b64ClientDataJSON
        ],
        "rawId":self.userId,
        "id":self.userId,
        "type":"public-key",
        "ompass": [
          "pushToken" : self.pushToken,
          "clientInfo" : dictionary
        ],
      ]
      
      return json
    }
  
  func getAuthenDataToJSON(
    authenticatorData:String,
    signature:String,
    userHandle:String,
    clientDataJSON:String) -> Parameters {
      
      var dictionary:NSDictionary?
      
      if let clientInfoData = self.clientInfo.data(using: .utf8) {
        do {
          dictionary = try JSONSerialization.jsonObject(with: clientInfoData, options: [.allowFragments]) as! NSDictionary
        } catch let error as NSError {
          print(error)
        }
      }
    
    let json : Parameters = [
      "response": [
        "authenticatorData":authenticatorData,
        "signature":signature,
        "userHandle":userHandle,
        "clientDataJSON":clientDataJSON
      ],
      "rawId":self.credentialId,
      "id":self.credentialId,
      "type":"public-key",
      "ompass":[
        "pushToken" : self.pushToken,
        "clientInfo": dictionary
      ]
    ]
    
    return json
  }
  
  func preRegister(completion: ((String) -> ())? = nil) {
    
    let urlString = self.url + "/fido2/preregister"
    let parameters = getPreRegisterToJSON(userName: self.userName, displayName: self.displayName, domain: self.domain, redirectUri: self.redirectUri, did: self.did)
    let manager = ServerTrustManager(allHostsMustBeEvaluated: false, evaluators: [domain: DisabledTrustEvaluator()])
    let configuration = URLSessionConfiguration.af.default
    configuration.timeoutIntervalForRequest = 5
    session = Session(configuration: configuration, serverTrustManager: manager)
    
    let url = NSURL(string: urlString)
    var request = URLRequest(url: url! as URL)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("application/json", forHTTPHeaderField: "accept")
    request.setValue(self.accessKey, forHTTPHeaderField: "accessKey")
    let data = try! JSONSerialization.data(withJSONObject: parameters, options: JSONSerialization.WritingOptions.prettyPrinted)
    let json = NSString(data: data, encoding: String.Encoding.utf8.rawValue)
    LogFunctionClass.writeLogToFile("PreRegister Request", data: String(json ?? ""))
    if let json = json {
      debugPrint(json)
    }
    request.httpBody = json!.data(using: String.Encoding.utf8.rawValue)
    
    session?.request(request)
      .responseJSON { response in
        debugPrint("Response: \(response)")
        switch response.result {
        case .success(let value):
          if let data = response.data {
            debugPrint(data)
            if let headers = response.response?.headers  {
              
              self.authorization = headers.value(for: "Authorization") ?? ""
              print("authorization : \(self.authorization)")
            }
            
            do {
              let json = try JSON(data: data)
              LogFunctionClass.writeLogToFile("PreRegister Response(Success)", data: json.rawString() ?? "")
              let responseJson = json["Response"]
              
              self.userName = responseJson["user"]["name"].string ?? ""
              self.userId = responseJson["user"]["id"].string ?? ""
              self.challenge = responseJson["challenge"].string ?? ""
              self.attestation = responseJson["attestation"].string ?? ""
            }
            catch {
              LogFunctionClass.writeLogToFile("PreRegister Response(Fail)", data: "CODE001")
              completion?("CODE001")
            }
          }
          let result = JSON(value)["isSuccess"]
          completion?(result.string ?? "success")
        case.failure(let error):
          self.customError(error: error, completion: {
            str in
            LogFunctionClass.writeLogToFile("PreRegister Response(Fail)", data: str)
            completion?(str)
          })
        }
      }
  }
  
  
  func preAuthenticate(completion: ((String) -> ())? = nil) {
    
    let urlString = self.url + "/fido2/preauthenticate"
    
    
    let parameters = getPreAuthDataToJSON(userName: self.userName, domain: self.domain, redirectUri: redirectUri, did: did)
    
    if (session == nil) {
      let manager = ServerTrustManager(allHostsMustBeEvaluated: false, evaluators: [domain: DisabledTrustEvaluator()])
      let configuration = URLSessionConfiguration.af.default
      session = Session(configuration: configuration, serverTrustManager: manager)
    }
    
    
    let url = NSURL(string: urlString)
    var request = URLRequest(url: url! as URL)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("application/json", forHTTPHeaderField: "accept")
    request.setValue(self.accessKey, forHTTPHeaderField: "accessKey")
    let data = try! JSONSerialization.data(withJSONObject: parameters, options: JSONSerialization.WritingOptions.prettyPrinted)
    let json = NSString(data: data, encoding: String.Encoding.utf8.rawValue)
    LogFunctionClass.writeLogToFile("PreAuthenticate Request", data: String(json ?? ""))
    if let json = json {
      print(json)
    }
    request.httpBody = json!.data(using: String.Encoding.utf8.rawValue)
    session?.request(request)
      .responseJSON { response in
        
        debugPrint("Response: \(response)")
        switch response.result {
        case .success(let value):
          if let data = response.data {
            
            debugPrint(data)
            
            if let headers = response.response?.headers  {
              
              self.authorization = headers.value(for: "Authorization") ?? ""
            }
            
            do {
              let json = try JSON(data: data)
              let responseJson = json["Response"]
              LogFunctionClass.writeLogToFile("PreAuthenticate Response(Success)", data: json.rawString() ?? "")
              
              self.credentialId = responseJson["allowCredentials"][0]["id"].string ?? ""
              self.challenge = responseJson["challenge"].string ?? ""
              
              debugPrint("preAuthenticate | challenge: " + self.challenge)
            }
            catch {
              LogFunctionClass.writeLogToFile("PreAuthenticate Response(Fail)", data: "CODE001")
              completion?("CODE001")
            }
            
            let result = JSON(value)["isSuccess"]
            completion?(result.string ?? "success")
          }
        case.failure(let error):
          self.customError(error: error, completion: {
            str in
            LogFunctionClass.writeLogToFile("PreAuthenticate Response(Fail)", data: str)
            completion?(str)
          })
        }
      }
  }
  
  func authenticationComplete(options: PublicKeyCredentialRequestOptions, completion: ((String) -> ())? = nil, failCompletion: @escaping () -> Void) {
    firstly {
      self.webAuthnClient.get(options)
    }.done { assertion in
      print("==========================================")
      print("credentialId: " + assertion.id)
      print("rawId: " + Base64.encodeBase64URL(assertion.rawId))
      print("authenticatorData: " + Base64.encodeBase64URL(assertion.response.authenticatorData))
      print("signature: " + Base64.encodeBase64URL(assertion.response.signature))
      print("userHandle: " + Base64.encodeBase64URL(assertion.response.userHandle!))

      print("clientDataJSON: " + Base64.encodeBase64URL(assertion.response.clientDataJSON.data(using: .utf8)!))
      print("==========================================")

      let urlString = self.url + "/fido2/authenticate"
      let parameters = self.getAuthenDataToJSON(authenticatorData: Base64.encodeBase64URL(assertion.response.authenticatorData),
                                                signature: Base64.encodeBase64URL(assertion.response.signature),
                                                userHandle: Base64.encodeBase64URL(assertion.response.userHandle!),
                                                clientDataJSON: Base64.encodeBase64URL(assertion.response.clientDataJSON.data(using: .utf8)!))
      
      if self.session != nil {
        let manager = ServerTrustManager(allHostsMustBeEvaluated: false, evaluators: [self.domain: DisabledTrustEvaluator()])
        let configuration = URLSessionConfiguration.af.default
        self.session = Session(configuration: configuration, serverTrustManager: manager)
      }
      
      let url = NSURL(string: urlString)
      var request = URLRequest(url: url! as URL)
      request.httpMethod = "POST"
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")
      request.setValue("application/json", forHTTPHeaderField: "accept")
      request.setValue(self.accessKey, forHTTPHeaderField: "accessKey")
      request.setValue(self.authorization, forHTTPHeaderField: "Authorization")
      let data = try! JSONSerialization.data(withJSONObject: parameters, options: JSONSerialization.WritingOptions.prettyPrinted)
      
      let json = NSString(data: data, encoding: String.Encoding.utf8.rawValue)
      if let json = json {
        print(json)
      }
      LogFunctionClass.writeLogToFile("Authenticate Request", data: String(json ?? ""))
      request.httpBody = json!.data(using: String.Encoding.utf8.rawValue)
      self.session?.request(request)
        .responseJSON { response in
          debugPrint("Response: \(response)")
          print(response.response?.allHeaderFields)
          switch response.result {
          case .success(let value):
            if let data = response.data {
              let result = JSON(value)["isSuccess"].stringValue
              LogFunctionClass.writeLogToFile("Authenticate Response(Success)", data: result)
              if result == "true" {
                self.authentication_token = response.response?.allHeaderFields["Authorization"] as! String
              }
              completion?(result)
            }
          case.failure(let error):
            self.customError(error: error, completion: {
              str in
              LogFunctionClass.writeLogToFile("Authenticate Response(Fail)", data: str)
              completion?(str)
            })
          }
        }
    }.catch { error in
      print("==========================================")
      print("error credential: " + error.localizedDescription)
      print("==========================================")
      LogFunctionClass.writeLogToFile("Authenticate Response(Fail)", data: "")
      LogFunctionClass.writeLogToFile("Authenticate Response(Fail Reason)", data: error.localizedDescription)
      failCompletion()
    }
  }
  
  func tryAuthentication(completion: ((String) -> ())? = nil) {
    
    //        setProperties()
    
    if challenge.isEmpty {
      NSLog("error : challenge ")
      return
    }
    
    
    if rpId.isEmpty {
      NSLog("error : rpID ")
      return
    }
    
    print("tryAuthenticate | challenge: " + self.challenge)
//    print((rpId.contains("https://") || rpId.contains("www.")) ? rpId : "https://" + rpId)
    let options = PublicKeyCredentialRequestOptions(challenge: challenge, rpId: rpId + "-" + userName, userVerification: UserVerificationRequirement.discouraged)
    LogFunctionClass.writeLogToFile("Authenticate Request", data: "Check The App Is Latest Version - " + "\(rpId) - \(userName)")
    authenticationComplete(options: options, completion: completion, failCompletion: {
      let old_options = PublicKeyCredentialRequestOptions(challenge: self.challenge, rpId: self.rpId, userVerification: UserVerificationRequirement.discouraged)
      LogFunctionClass.writeLogToFile("Authenticate Request(Old Version)", data: "The App Is Old Version - " + "\(self.rpId)")
      self.authenticationComplete(options: old_options, completion: completion, failCompletion: {
        LogFunctionClass.writeLogToFile("Authenticate Request(Old Version) Fail", data: "CODE002")
        completion?("CODE002")
      })
    })
  }
  
  
  func encrypt(data:Data) -> Data? {
    
    guard let alg = COSEAlgorithmIdentifier.fromInt(COSEAlgorithmIdentifier.es256.rawValue) else {
      WAKLogger.debug("<GetAssertion> insufficient capability (alg), stop session")
      return nil
    }
    
    let keySupportChooser = KeySupportChooser()
    guard let keySupport = keySupportChooser.choose([alg]) as? ECDSAKeySupport else {
      WAKLogger.debug("<GetAssertion> insufficient capability (alg), stop session")
      return nil
    }
    
    return keySupport.encrypt(label: domain, data: data)
  }
  
  func decrypt(data:Data) -> Data? {
    guard let alg = COSEAlgorithmIdentifier.fromInt(COSEAlgorithmIdentifier.es256.rawValue) else {
      WAKLogger.debug("<GetAssertion> insufficient capability (alg), stop session")
      return nil
    }
    
    let keySupportChooser = KeySupportChooser()
    guard let keySupport = keySupportChooser.choose([alg]) as? ECDSAKeySupport else {
      WAKLogger.debug("<GetAssertion> insufficient capability (alg), stop session")
      return nil
    }
    return keySupport.decrypt(label: domain, data: data)
  }
}
