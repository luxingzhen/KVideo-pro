# Google Analytics 添加计划

## 目标
为 KVideo 项目添加 Google Analytics (gtag.js) 追踪代码

## 追踪ID
- **GA4 ID**: `G-8E9FC4WMZR`

## 范围
- **IN**: 
  - 发布页 (`public/publish/index.html`)
  - 主应用页面 (`app/layout.tsx`)
- **OUT**: 
  - Vercel Analytics 移除（保留，与GA4共存）

---

## 任务列表

### Task 1: 在发布页添加 gtag.js

**文件**: `public/publish/index.html`

**操作**: 在 `<head>` 标签内添加以下代码（第78行 `</head>` 之前）:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-8E9FC4WMZR"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-8E9FC4WMZR');
</script>
```

**插入位置**: 第78行 `</head>` 标签之前

---

### Task 2: 在主应用添加 gtag.js

**文件**: `app/layout.tsx`

**操作**: 使用 Next.js `Script` 组件添加 GA 代码

在 `<head>` 部分添加:

```tsx
import Script from 'next/script';

// 在 metadata export 之后、RootLayout 组件内添加:
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-8E9FC4WMZR"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-8E9FC4WMZR');
  `}
</Script>
```

**插入位置**: 第113行 `<head>` 标签内部，在现有meta标签之后

---

## 验证步骤

1. **发布页**: 打开 `public/publish/index.html` 确认代码已添加
2. **主应用**: 确认 `app/layout.tsx` 包含 Script 组件导入和使用
3. **部署后**: 在浏览器开发者工具 Console 中输入 `gtag('get', 'G-8E9FC4WMZR', 'client_id')` 验证追踪

---

## 技术说明

- **发布页**: 使用原生 `<script>` 标签，因为是纯静态HTML
- **主应用**: 使用 Next.js `Script` 组件的 `afterInteractive` 策略，确保页面可交互后再加载，避免阻塞首屏渲染
- **Vercel Analytics**: 保留不动，与GA4形成互补（Vercel Analytics更注重性能数据）
