// 复制本文件为 services/vision.config.js 后填写真实配置
module.exports = {
  // 你的后端域名（必须在微信小程序后台配置为 request 合法域名）
  baseUrl: 'https://your-api.example.com',

  // 识别接口路径（POST）
  analyzePath: '/api/v1/vision/analyzeMeal',

  // 上传文件字段名（后端接收 multipart/form-data 时的字段）
  uploadFieldName: 'file',

  // 可选：鉴权 Token（如果后端不需要可留空）
  apiKey: ''
}
