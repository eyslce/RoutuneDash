package main

import (
	"context"
	"embed"
	"os"
	"path/filepath"

	"github.com/eyslce/clash/constant"
	"github.com/eyslce/clash/hub"
	"github.com/eyslce/clash/log"
)

const (
	configFile = "config.yaml"
)

//go:embed assets/*
var assetConfig embed.FS

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.initClash()
}

// initClash initializes the clash runtime
func (a *App) initClash() {
	a.initConfig()

	//if err := config.Init(constant.Path.HomeDir()); err != nil {
	//	log.Fatalln("Initial configuration directory error: %s", err.Error())
	//}

	if err := hub.Parse(); err != nil {
		log.Fatalln("Parse config error: %s", err.Error())
	}

}

func (a *App) initConfig() {
	currentDir, _ := os.Getwd()
	constant.SetHomeDir(currentDir)
	cfgFile := filepath.Join(currentDir, configFile)
	fileinfo, err := os.OpenFile(cfgFile, os.O_RDWR|os.O_CREATE, 0666)
	defer fileinfo.Close()
	stat, err := fileinfo.Stat()
	if err != nil {
		log.Fatalln("Open config file error: %s", err.Error())
		return
	}
	if stat.Size() == 0 {
		bytes, err := assetConfig.ReadFile("assets/template_config.yaml")
		if err != nil {
			log.Fatalln("Read template config error: %s", err.Error())
			return
		}
		_, err = fileinfo.Write(bytes)
		if err != nil {
			log.Fatalln("Write template config error: %v", err)
			return
		}
	}
	constant.SetConfig(cfgFile)
}

func (a *App) shutdown(ctx context.Context) {

}
