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
}
