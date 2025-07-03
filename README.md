# RoutuneDash

## 简介

RoutuneDash 是一个基于 Wails 构建的 Routune 客户端，提供了简洁直观的用户界面。它允许用户轻松管理和配置 Routune 服务。

## 功能特性

- 简洁现代的图形用户界面
- 实时状态监控
- 配置管理
- 跨平台支持（Windows、macOS、Linux）

## 系统要求

- Go 1.22.0 或更高版本
- Wails v2.10.1
- 操作系统：Windows、macOS 或 Linux

## 安装

### 从源码构建

1. 克隆仓库：
```bash
git clone https://github.com/eyslce/routunedash.git
cd routunedash
```

2. 安装依赖：
```bash
go mod download
```

3. 构建项目：
```bash
wails build
```

### 下载预编译版本

从 [Releases](https://github.com/eyslce/routunedash/releases) 页面下载适合您操作系统的最新版本。

## 使用方法

1. 启动应用程序
2. 在配置文件中设置必要的参数（config.yaml）
3. 通过图形界面进行配置和管理

## 配置说明

配置文件 `config.yaml` 示例：
```yaml
# 在此添加配置示例
```

## 开发

### 开发环境设置

1. 安装 Wails CLI：
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

2. 运行开发服务器：
```bash
wails dev
```


## 贡献

欢迎提交 Issue 和 Pull Request！

## 致谢

- [Wails](https://wails.io/) - 用于构建桌面应用