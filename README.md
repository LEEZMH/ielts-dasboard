# IELTS Dashboard

一个适合部署到 Vercel 的 IELTS 学习平台项目。

当前版本保留原生 `HTML + CSS + JS` 前端，并把认证与数据持久化改成：

- 前端继续走原生静态页面
- 注册 / 登录 / 会话 / 保存都走 `/api/*`
- 后端使用 Node API handlers
- 数据库存储使用 Supabase Postgres
- 密码使用 `bcryptjs` 哈希保存
- 本地开发不依赖 `vercel dev`
- `npm run dev` 可直接启动本地前端和 API

## 项目结构

```text
.
├── api
│   ├── _lib
│   │   ├── auth.js
│   │   ├── db.js
│   │   ├── defaults.js
│   │   ├── http.js
│   │   └── store.js
│   ├── bootstrap.js
│   ├── health.js
│   ├── login.js
│   ├── logout.js
│   ├── register.js
│   └── save-state.js
├── supabase
│   └── schema.sql
├── .env.example
├── .gitignore
├── app.js
├── index.html
├── package.json
├── styles.css
└── vercel.json
