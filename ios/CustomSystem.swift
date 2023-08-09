import Foundation

@objc(CustomSystem)
public class CustomSystem : NSObject {
  
  @objc
  func ExitApp() {
    DispatchQueue.main.asyncAfter(deadline: .now()) {
      UIApplication.shared.perform(#selector(NSXPCConnection.suspend))
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
        exit(0)
      }
    }
  }
  
  @objc
  func cancelPendingPush() {
    DispatchQueue.main.asyncAfter(deadline: .now()) {
      UserDefaults.standard.removeObject(forKey: "pendingPushData")
    }
  }
  
  @objc
  func cancelNotification(_ id: String) {
    print("cancelcancel!!")
    let center = UNUserNotificationCenter.current()
    center.getDeliveredNotifications { (notifications) in
      print("==== Delivered Notifications ====")
      for notification in notifications {
        let identifier = notification.request.identifier
        let title = notification.request.content.title
        let body = notification.request.content.body
        let userInfo = notification.request.content.userInfo["data"]
        if let jsonString = userInfo as? String {
          if let jsonData = jsonString.data(using: .utf8) {
            do {
              if let someData = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any],
                 let accessKey = someData["accessKey"] as? String {
                // 이제 accessKey 값을 얻었습니다.
                if accessKey == id {
                  center.removeDeliveredNotifications(withIdentifiers: [identifier])
                }
              }
            } catch {
              print("Error: \(error)")
            }
          } else {
            print("Error: 문자열을 데이터로 변환하는 데 실패했습니다.")
          }
        } else {
          print("Error: 'userInfo'는 유효한 JSON 문자열이 아닙니다.")
        }
      }
    }
  }
}
