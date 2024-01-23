import OSLog

extension OSLog {
  private static var subsystem = Bundle.main.bundleIdentifier!
  static let data = OSLog(subsystem: subsystem, category: "Data")
}

let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
let fileURL = documentsURL.appendingPathComponent("authLog")

@objc
class LogFunctionClass: NSObject {
  
  @objc
  static func writeLogToFile(_ tag: String, data: String) {
    if !FileManager.default.fileExists(atPath: fileURL.path) {
      let text = ""
      do {
        try text.write(to: fileURL, atomically: false, encoding: .utf8)
        LogToConsole("파일 생성", text: "로그 파일 생성 완료")
      } catch let e as NSError {
        LogToConsole("파일 생성 에러!", text: e.localizedDescription)
      }
    }
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
    let current_date_string = formatter.string(from: Date())
    LogToConsole(tag, text: data)
    if let handle = try? FileHandle(forWritingTo: fileURL) {
        let row = "[\(current_date_string)] - \(tag) - \(data)\n\n"
        handle.seekToEndOfFile()
        var existingData = handle.readDataToEndOfFile()
        existingData.append(row.data(using: .utf8)!)
        handle.write(row.data(using: .utf8)!)
        handle.closeFile()
    }
  }
}

func LogToConsole(_ tag: String, text: String) {
  let message = "[\(tag)]: \(text)"
  os_log(.debug, log: .data, "@%", message)
}
