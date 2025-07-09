package main

import (
	"context"
	"embed"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/eyslce/routune/config"
	"github.com/eyslce/routune/hub/executor"
	"github.com/eyslce/routune/hub/route"
	"github.com/eyslce/routunedash/internal/client"
	"github.com/eyslce/routunedash/internal/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	"github.com/eyslce/routune/constant"
	"github.com/eyslce/routune/log"
)

const (
	configFile         = "config.yaml"
	externalController = "127.0.0.1:9090"
	externalUI         = ""
	secret             = ""
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
	a.initroutune()
}

// initroutune initializes the routune runtime
func (a *App) initroutune() {
	currentDir, _ := os.Getwd()
	constant.SetHomeDir(currentDir)
	// 初始化日志
	logger.InitLogger(a.ctx, currentDir)
	// 初始化配置文件
	a.initConfig(currentDir)

	cfg, err := executor.Parse()
	if err != nil {
		log.Fatalln("Parse config error: %s", err.Error())
		return
	}

	// 合并配置文件，覆盖不可变配置
	a.mergeConfig(cfg)

	if cfg.General.ExternalUI != "" {
		route.SetUIPath(cfg.General.ExternalUI)
	}

	if cfg.General.ExternalController != "" {
		go route.Start(cfg.General.ExternalController, cfg.General.Secret)
	}

	executor.ApplyConfig(cfg, true)

	if err := config.InitMMDB(); err != nil {
		log.Errorln("Initial mmdb error: %s", err.Error())
	}
}

func (a *App) initConfig(currentDir string) {
	cfgFile := filepath.Join(currentDir, configFile)
	fileinfo, err := os.OpenFile(cfgFile, os.O_RDWR|os.O_CREATE, 0666)
	defer func(fileinfo *os.File) {
		err := fileinfo.Close()
		if err != nil {
			log.Errorln("Close config file error: %s", err.Error())
		}
	}(fileinfo)
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

func (a *App) mergeConfig(cfg *config.Config) {
	cfg.General.ExternalController = externalController
	cfg.General.ExternalUI = externalUI
	cfg.General.Secret = secret
}

func (a *App) UpdateConfig(subscribeUrl string) string {
	c := client.NewHttpClient(10 * time.Minute)
	resp, err := c.Get(subscribeUrl, nil)
	if err != nil {
		log.Errorln("Update config error: %s", err.Error())
		return "update config failed:" + err.Error()
	}
	// 解析配置文件
	cfg, err := executor.ParseWithBytes(resp)
	if err != nil {
		log.Errorln("Parse config error: %s", err.Error())
		return "parse config failed:" + err.Error()
	}
	// 保留用户自定义的配置
	general := executor.GetGeneral()
	cfg.General = general

	err = a.backupAndCreateNewConfig(resp)
	if err != nil {
		log.Errorln("Backup and create new config error: %s", err.Error())
		return "backup and create new config failed:" + err.Error()
	}

	// 应用配置文件
	executor.ApplyConfig(cfg, true)
	log.Infoln("Update config success:%s", string(resp))
	return "update config success"
}

func (a *App) backupAndCreateNewConfig(bytes []byte) error {
	// 备份配置文件
	backupFile := filepath.Join(constant.Path.HomeDir(), "config.yaml.bak")
	err := os.Rename(constant.Path.Config(), backupFile)
	if err != nil {
		return err
	}
	// 创建新的配置文件
	err = os.WriteFile(constant.Path.Config(), bytes, 0666)
	if err != nil {
		return err
	}
	return nil
}

func (a *App) getAppIcon() []byte {
	bytes, err := assetConfig.ReadFile("assets/app.png")
	if err != nil {
		println("Error:", err.Error())
		return nil
	}
	return bytes
}

func (a *App) onSecondInstanceLaunch(data options.SecondInstanceData) {
	log.Infoln("user opened second instance:%s", strings.Join(data.Args, ","))
	log.Infoln("user opened second from:%s", data.WorkingDirectory)
	runtime.WindowUnminimise(a.ctx)
	runtime.Show(a.ctx)
}
