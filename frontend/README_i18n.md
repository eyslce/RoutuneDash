# 国际化 (i18n) 使用说明

## 概述

本项目已集成 `i18next` 国际化框架，支持中文和英文两种语言。

## 功能特性

- 🌍 支持中文和英文切换
- 🔄 自动语言检测（浏览器语言、localStorage）
- 💾 语言选择持久化存储
- 🎨 与 Chakra UI 主题系统集成

## 使用方法

### 1. 在组件中使用翻译

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      <p>{t("dashboard.upload")}</p>
    </div>
  );
}
```

### 2. 切换语言

```tsx
import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <button onClick={() => changeLanguage("en")}>English</button>
    <button onClick={() => changeLanguage("zh")}>中文</button>
  );
}
```

### 3. 添加新的翻译文本

在 `src/i18n/locales/` 目录下的语言文件中添加新的翻译键值：

**中文 (zh.ts):**
```ts
export default {
  // ... 现有翻译
  new_section: {
    title: "新标题",
    description: "新描述"
  }
};
```

**英文 (en.ts):**
```ts
export default {
  // ... 现有翻译
  new_section: {
    title: "New Title",
    description: "New Description"
  }
};
```

## 语言文件结构

```
src/i18n/
├── config.ts          # i18next 配置
├── index.ts           # 入口文件
└── locales/
    ├── zh.ts          # 中文翻译
    └── en.ts          # 英文翻译
```

## 配置说明

- **默认语言**: 中文 (zh)
- **回退语言**: 中文 (zh)
- **语言检测顺序**: localStorage → navigator → htmlTag
- **缓存**: localStorage

## 组件集成

### 侧边栏语言切换器

在侧边栏底部已集成语言切换器，用户可以点击语言图标切换语言。

### 自动语言检测

系统会自动检测用户浏览器语言，如果支持中文或英文，会自动设置为对应语言。

## 最佳实践

1. **使用嵌套键**: 使用点分隔的键名组织翻译，如 `dashboard.title`
2. **保持一致性**: 确保所有语言文件中的键名一致
3. **上下文清晰**: 使用描述性的键名，便于理解和维护
4. **避免硬编码**: 所有用户可见的文本都应使用翻译函数

## 扩展支持

如需添加更多语言支持：

1. 在 `src/i18n/locales/` 目录下创建新的语言文件
2. 在 `src/i18n/config.ts` 中添加新语言到 resources 对象
3. 在语言切换器中添加新语言选项 