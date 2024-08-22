package logger

import (
	clashlog "github.com/eyslce/clash/log"
	"github.com/eyslce/lumberjack"
	"log"
	"os"
	"path/filepath"
)

var (
	logger *log.Logger
)

func InitLogger(workDir string) {
	logFile := filepath.Join(workDir, "clashy.log")

	logger = log.New(os.Stdout, "", log.Lshortfile|log.Ldate|log.Ltime)

	logger.SetOutput(&lumberjack.Logger{
		Filename:     logFile,
		MaxSize:      300,
		MaxAge:       30,
		MaxBackups:   10,
		Compress:     false,
		DailyRolling: true,
	})

	go subscribeClashLog()
}

func subscribeClashLog() {
	for msg := range clashlog.Subscribe() {
		event := msg.(clashlog.Event)
		switch event.LogLevel {
		case clashlog.INFO:
			logger.Println("INFO: ", event.Payload)
		case clashlog.WARNING:
			logger.Println("WARNING: ", event.Payload)
		case clashlog.ERROR:
			logger.Println("ERROR: ", event.Payload)
		case clashlog.DEBUG:
			logger.Println("DEBUG: ", event.Payload)
		case clashlog.SILENT:
			logger.Println("SILENT: ", event.Payload)
		default:
			logger.Println(event.Payload)
		}
	}
}

func GetLogger() *log.Logger {
	return logger
}
