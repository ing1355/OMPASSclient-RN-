import Foundation
import SwiftKeychainWrapper
import Alamofire
import SwiftyJSON

@objc(checkForgery)
public class checkForgery : NSObject {
  var session : Session? = nil
  @objc
  func isForgery(_ successCallback: @escaping RCTResponseSenderBlock, errorCallback: @escaping RCTResponseSenderBlock) {
    
    var version: String? {
      guard let dictionary = Bundle.main.infoDictionary,
          let version = dictionary["CFBundleShortVersionString"] as? String else {return nil}
      
      return "\(version)"
    }
//    let urlString = "https://ompass.kr:8800/oms/app-verification/os/ios/version/" + version!
    let urlString = "https://admin-api.ompasscloud.com/oms/app-verification/os/ios/version/" + version!
    let configuration = URLSessionConfiguration.af.default
    configuration.timeoutIntervalForRequest = 5
//    let manager = ServerTrustManager(allHostsMustBeEvaluated: false, evaluators: ["https://ompass.kr:8800": DisabledTrustEvaluator()])
    let manager = ServerTrustManager(allHostsMustBeEvaluated: false, evaluators: ["https://admin-api.ompasscloud.com": DisabledTrustEvaluator()])
    session = Session(configuration: configuration, serverTrustManager: manager)
    let url = NSURL(string: urlString)
    var request = URLRequest(url: url! as URL)
    request.httpMethod = "GET"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("application/json", forHTTPHeaderField: "accept")
    session?.request(request)
      .responseJSON { response in
        
        switch response.result {
        case .success(let value):
          if let data = response.data {
            do {
              let json = try JSON(data: data)
              let responseJson = JSON(json["data"])
              let result: [String: Any] = [
                "version" : responseJson["version"].boolValue,
                "hash": true
              ] as Dictionary
              successCallback([result])
            }
            catch {
              errorCallback(["Internel Error"])
            }
          }
        case.failure(let error):
          errorCallback(["Server Connection Error"])
        }
      }
  }
}
