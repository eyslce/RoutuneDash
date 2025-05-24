package logger

import (
	"log"
	"os"
	"path/filepath"

	"github.com/eyslce/lumberjack"
	routunelog "github.com/eyslce/routune/log"
)

var (
	logger *log.Logger
)

func InitLogger(workDir string) {
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

	go subscribeRoutuneLog()
}

func subscribeRoutuneLog() {
	for msg := range routunelog.Subscribe() {
		event := msg.(routunelog.Event)
		switch event.LogLevel {
		case routunelog.INFO:
			logger.Println("INFO: ", event.Payload)
		case routunelog.WARNING:
			logger.Println("WARNING: ", event.Payload)
		case routunelog.ERROR:
			logger.Println("ERROR: ", event.Payload)
		case routunelog.DEBUG:
			logger.Println("DEBUG: ", event.Payload)
		case routunelog.SILENT:
			logger.Println("SILENT: ", event.Payload)
		default:
			logger.Println(event.Payload)
		}
	}
}

func GetLogger() *log.Logger {
	return logger
}
