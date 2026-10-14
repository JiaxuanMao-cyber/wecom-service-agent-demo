# 财富服务智能体 · 公开静态演示

[打开在线演示](https://jiaxuanmao-cyber.github.io/wecom-service-agent-demo/mjx/)

本仓库只保存独立静态页面，`/` 自动进入 `/mjx/`。
九组匿名场景与策略管理均为 Mock；没有模型、公司接口、账户查询或真实发送。
顾问和来源身份已替换为演示标识，不提供真实来源核验或正式审核证明。
产品、日期、金额及规则仅供历史情景展示。

## 发布设置

GitHub Settings → Pages → Deploy from a branch → `main` → `/(root)`。
提交后自动更新网站。`.nojekyll` 使静态文件直接发布。

## 本地预览

`python -m http.server 8766 --bind 127.0.0.1`，访问 `http://127.0.0.1:8766/mjx/`。

## 范围

只含静态运行资源及总体方案，没有原始聊天、公司工程、数据库、环境配置、密钥或源仓库历史。
草稿与操作状态只在当前浏览器保存。[演示边界](mjx/README.md)
