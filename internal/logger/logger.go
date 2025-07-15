package logger

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/eyslce/lumberjack"
	routunelog "github.com/eyslce/routune/log"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var (
	logger *log.Logger
)

// LogEntry represents a log entry for frontend
type LogEntry struct {
	Timestamp string `json:"timestamp"`
	Level     string `json:"level"`
	Message   string `json:"message"`
}

func InitLogger(ctx context.Context, workDir string) {
	logFile := filepath.Join(workDir, "routune.log")

	logger = log.New(os.Stdout, "", log.Lshortfile|log.Ldate|log.Ltime)

	logger.SetOutput(&lumberjack.Logger{
		Filename:     logFile,
		MaxSize:      300,
		MaxAge:       30,
		MaxBackups:   10,
		Compress:     false,
		DailyRolling: true,
	})

	go subscribeRoutuneLog(ctx)
}


func subscribeRoutuneLog(ctx context.Context) {
	for msg := range routunelog.Subscribe() {
		event := msg.(routunelog.Event)

		message := fmt.Sprintf("%v", event.Payload)
		var levelStr string

		// 写入日志文件并设置级别字符串
		switch event.LogLevel {
		case routunelog.INFO:
			logger.Println("INFO: ", message)
			levelStr = "INFO"
		case routunelog.WARNING:
			logger.Println("WARNING: ", message)
			levelStr = "WARNING"
		case routunelog.ERROR:
			logger.Println("ERROR: ", message)
			levelStr = "ERROR"
		case routunelog.DEBUG:
			logger.Println("DEBUG: ", message)
			levelStr = "DEBUG"
		case routunelog.SILENT:
			logger.Println("SILENT: ", message)
			levelStr = "SILENT"
		default:
			logger.Println(message)
			levelStr = "INFO"
		}

		// 发送实时日志事件到前端
		logEntry := LogEntry{
			Timestamp: time.Now().Format("2006/01/02 15:04:05"),
			Level:     levelStr,
			Message:   message,
		}
		runtime.EventsEmit(ctx, "new-log", logEntry)
	}
}
