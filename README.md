# Health Manager Mini Program (MVP)

微信小程序 MVP 骨架实现，覆盖：

- 登录 + 协议确认
- 4步建档
- 首页（今日概览 + 拍照入口）
- 拍照上传 + 识别结果（支持份量微调、删除、新增、保存）
- 记录页（按日查看、复制、删除）
- 周报页（主目标3指标 + Plus洞察演示）
- 我的页（档案、体重录入、Plus状态、免责声明）

## 目录

- `pages/` 页面
- `services/api.js` mock API 与营养重算逻辑
- `utils/store.js` 本地存储

## 运行

1. 使用微信开发者工具打开仓库目录。
2. 先进入 `pages/login/index` 完成登录。
3. 按引导完成建档后可开始拍照记录。

> 当前为 MVP 演示版，后续可替换 `services/api.js` 为真实后端接口。



## 配置真实图片识别 API（必须）

当前仓库默认是 MVP 演示，若不配置后端会走“本地兜底识别”，结果会不准确。

1. 复制配置模板：

   ```bash
   cp services/vision.config.example.js services/vision.config.js
   ```

2. 编辑 `services/vision.config.js`：

   - `baseUrl`：你的后端域名（例如 `https://api.yourdomain.com`）
   - `analyzePath`：识别接口路径（默认 `/api/v1/vision/analyzeMeal`）
   - `uploadFieldName`：后端接收图片的字段名（常见是 `file`）
   - `apiKey`：如后端需要 Bearer Token，在这里填写

3. 微信小程序后台配置合法域名：

   - 进入 **小程序后台 -> 开发管理 -> 开发设置 -> 服务器域名**
   - 在 `request 合法域名` 添加你的 `baseUrl` 域名

4. 后端接口需支持两种调用之一：

   - 方式 A（推荐）：`multipart/form-data` 上传文件（字段名与 `uploadFieldName` 对应）
   - 方式 B：JSON 请求（当传入 `imageUrl` 是公网 URL）

5. 后端返回数据建议结构：

   ```json
   {
     "dishes": [
       {
         "name": "宫保鸡丁",
         "cookMethod": "炒",
         "baseGrams": 180,
         "finalGrams": 180,
         "confidence": 0.88,
         "nutrition": { "kcal": 320, "sodium": 560, "protein": 19 }
       }
     ],
     "summary": { "kcal": 520, "sodium": 780, "protein": 24 },
     "conclusion": "✅适合",
     "advice": ["减少额外蘸料"],
     "confidence": 0.86,
     "modelProvider": "Your Vision Engine"
   }
   ```

未配置时页面会提示“当前为兜底结果，请配置识别API”。

## 零基础快速开始

如果你没有编程基础，请直接看：`docs/零基础_小程序上线前操作手册.md`。
按文档步骤执行即可把当前版本跑起来并发给测试人员。
