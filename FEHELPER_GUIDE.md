# FeHelper 导入说明

## 问题原因

FeHelper 的 iframe 环境有 Content Security Policy (CSP) 限制，**不允许执行内联 JavaScript**。

因此，必须使用外部 JS 文件（`index.js`）而不是内联在 HTML 中的 `<script>` 标签。

## 正确的导入方法

### 方式 1：导入整个文件夹

1. 将整个 `msgpack-encode` 文件夹放在一个固定位置
2. 在 FeHelper 中导入时，选择 `index.html` 文件
3. FeHelper 会自动加载同目录下的 `index.css` 和 `index.js`

**重要**：导入后不要移动或删除文件夹，否则外部文件无法加载。

### 方式 2：使用 file:// 协议

如果方式 1 不工作，可能是因为 FeHelper 无法访问本地文件。这种情况下：

1. 启动本地服务器：
   ```bash
   cd msgpack-encode
   python -m http.server 8888
   ```

2. 在浏览器中访问：`http://localhost:8888/index.html`

3. 或者将文件部署到 Web 服务器上

## 文件结构

确保以下文件在同一目录：

```
msgpack-encode/
├── index.html       # 主文件（引用外部 CSS 和 JS）
├── index.css        # 样式文件
├── index.js         # JavaScript 逻辑
└── fh-config.js     # FeHelper 配置
```

## 验证方法

1. 在 FeHelper 中打开 DecodeMaster
2. 按 F12 打开开发者工具
3. 查看 Console 标签，应该能看到：
   - 没有 CSP 错误
   - 没有 404 错误（找不到 index.css 或 index.js）
4. 点击按钮应该有反应

## 如果还是不工作

请检查 Console 中的错误信息：

- **CSP 错误**：说明还在使用内联 JS
- **404 错误**：说明找不到 index.css 或 index.js
- **CORS 错误**：说明跨域问题，需要使用本地服务器

## 参考资料

- [FeHelper GitHub](https://github.com/zxlie/FeHelper)
- [Content Security Policy (CSP)](https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/Content_Security_Policy)
