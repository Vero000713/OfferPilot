# OfferPilot 面试复盘

个人面试经验管理工具：粘贴面试录音转写文本，自动解析出问答（QA），并可以标注掌握程度、按公司/轮次/掌握度筛选、随时回看原文。

## 技术栈

- React + TypeScript + Vite
- React Router（路由）
- Dexie.js（IndexedDB 封装，数据保存在本地浏览器，不上传服务器）
- Zustand + persist（保存 DeepSeek API Key 等设置，存在 localStorage）
- Tailwind CSS v4

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:5173，先去「设置」页填写你的 DeepSeek API Key（[获取地址](https://platform.deepseek.com/)），再去首页粘贴面试转写文本即可解析。

## 关于 DeepSeek API 调用的说明（重要）

DeepSeek 官方接口不允许浏览器直接跨域调用，所以 `vite.config.ts` 里配置了开发服务器代理：

```
/deepseek-api/*  ->  https://api.deepseek.com/*
```

这只在 `npm run dev` 时生效。如果之后想把项目 `npm run build` 后部署成纯静态站点长期使用，代理就不存在了，需要额外加一个小型反向代理（比如本地一个几行的 Node/Express 服务，或部署一个 serverless function）来转发请求。目前按你的需求（个人本地使用，暂不做后端），直接 `npm run dev` 长期使用即可，无需额外部署。

API Key 只保存在你本机浏览器的 localStorage 里，不会发送到除 DeepSeek 官方接口以外的任何地方。

## 功能

1. **首页**：粘贴面试录音转写文本 → 调用 DeepSeek 解析出问答列表 → 补充公司/部门/岗位/轮次信息后保存。
2. **面试列表**：按公司搜索、按轮次（一面/二面/三面/HR面）筛选。
3. **详情页**：查看解析出的 QA，为每条标注「熟练/一般/不熟」，按标注筛选；可展开原文抽屉查看完整转写文本，点击某条 QA 的「定位原文」可高亮跳转到原文对应片段。

## 数据存储

所有面试记录保存在浏览器的 IndexedDB 中（数据库名 `OfferPilotDB`），仅限当前浏览器/设备可见。清除浏览器数据会导致记录丢失，如果需要备份可以自行扩展导出/导入功能。
