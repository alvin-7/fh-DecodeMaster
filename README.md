# DecodeMaster

<div align="center">

**🔧 开发者编解码工具箱**

一个功能强大的在线编解码工具，支持 MessagePack 序列化和 JWT Token 解析。

[在线使用](#使用方法) · [功能特性](#功能特性) · [技术栈](#技术栈)

</div>

---

## 📖 简介

DecodeMaster 是一个纯前端的编解码工具集，专为开发者设计。无需安装任何依赖，直接在浏览器中打开即可使用。

## ✨ 功能特性

### 🔹 MessagePack 编解码

- **JSON → MessagePack 编码**
  - 将 JSON 数据转换为 MessagePack 格式
  - 同时输出十六进制（Hex）和 Base64 两种格式
  - 支持所有 MessagePack 数据类型

- **MessagePack → JSON 解码**
  - 自动识别输入格式（十六进制或 Base64）
  - 完整支持 MessagePack 规范
  - 支持 64 位整数（uint64/int64）

- **支持的数据类型**
  - ✅ null、boolean、number（整数/浮点数）
  - ✅ string（UTF-8 编码，支持中文、emoji 等）
  - ✅ array（数组）
  - ✅ object（对象/映射）
  - ✅ 64 位整数（自动处理大数值）

### 🔹 JWT Token 解析

- **完整解析 JWT 结构**
  - Header（头部信息：算法、类型）
  - Payload（载荷数据：用户信息、声明）
  - Signature（签名部分）

- **智能时间解析**
  - 过期时间（exp）- 自动判断是否已过期
  - 签发时间（iat）
  - 生效时间（nbf）
  - 时间自动转换为本地时区

- **注意事项**
  - 仅解析 JWT 内容，不验证签名
  - 适用于开发调试和内容查看

## 🚀 使用方法

### 方式一：直接打开

1. 下载项目文件
2. 双击打开 `index.html`（已内联所有资源，可直接使用）
3. 开始使用

> **注意**：如果需要修改代码，建议使用 `index-standalone.html` + `index.css` + `index.js` 的分离版本进行开发，然后重新生成内联版本。

### 方式二：本地服务器

```bash
# 使用 Python 启动本地服务器
python -m http.server 8000

# 或使用 Node.js
npx http-server
```

然后在浏览器访问 `http://localhost:8000`

### 方式三：集成到 FeHelper 插件

**FeHelper** 是一款强大的浏览器扩展工具集，DecodeMaster 可以作为自定义工具集成到 FeHelper 中使用。

#### 安装步骤：

1. **安装 FeHelper 扩展**
   - Chrome: [Chrome 应用商店](https://chrome.google.com/webstore/detail/fehelper/pkgccpejnmalmdinmhkkfafefagiiiad)
   - Edge: [Edge 扩展商店](https://microsoftedge.microsoft.com/addons/detail/fehelper/feolnkbgcbjmamimpfcnklggdcbgakhe)
   - Firefox: [Firefox 扩展商店](https://addons.mozilla.org/zh-CN/firefox/addon/fehelper/)

2. **导入 DecodeMaster**
   - 点击浏览器工具栏中的 FeHelper 图标
   - 选择 "扩展工具" → "工具箱管理"
   - 点击 "导入自定义工具"
   - 选择 `index.html` 文件
   - 完成导入

3. **使用工具**
   - 在 FeHelper 工具列表中找到 "DecodeMaster"
   - 点击即可在 FeHelper 面板中使用
   - 享受集成化的开发体验

#### FeHelper 集成优势：

- ✅ **快速访问** - 无需打开新标签页，在任何页面都能快速调用
- ✅ **统一管理** - 与其他开发工具集成在一起，统一管理
- ✅ **便捷操作** - 支持快捷键调用，提高工作效率
- ✅ **数据共享** - 可以与 FeHelper 的其他工具联动使用

## 📝 使用示例

### MessagePack 编码示例

**输入 JSON：**
```json
{
  "name": "张三",
  "age": 25,
  "active": true,
  "tags": ["developer", "designer"]
}
```

**输出：**
- 十六进制格式：`84a46e616d65a6e5bca0e4b889...`
- Base64 格式：`hKRuYW1lpuW8oOS4iQ==...`

### JWT 解析示例

**输入 JWT Token：**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**输出：**
```json
=== JWT Header ===
{
  "alg": "HS256",
  "typ": "JWT"
}

=== JWT Payload ===
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}

=== 签发时间 (iat) ===
2018-01-18 01:30:22 (本地时间)
```

## 🛠️ 技术栈

- **纯原生技术**
  - HTML5
  - CSS3（渐变、动画、响应式设计）
  - Vanilla JavaScript（ES6+）

- **无依赖**
  - 不需要任何第三方库
  - 不需要构建工具
  - 开箱即用

## 📂 项目结构

```
msgpack-encode/
├── index.html              # 主页面（内联版本，适用于所有场景）
├── index-standalone.html   # 独立版本（引用外部文件）
├── index.css               # 样式文件
├── index.js                # 核心逻辑
├── fh-config.js            # FeHelper 配置
├── README.md               # 项目说明
├── test-verification.html  # 自动化测试
└── debug-test.html         # 调试工具
```

## 🎨 界面特性

- **标签页设计** - MessagePack 和 JWT 功能独立分离
- **响应式布局** - 完美支持桌面、平板、手机
- **现代化 UI** - 渐变色、圆角、阴影效果
- **图标装饰** - 直观的 emoji 图标
- **深色模式友好** - 舒适的配色方案

## 🔧 技术说明

### 文件版本说明

项目提供两个版本：

1. **index.html** - 内联版本（推荐）
   - 适用于：所有场景（直接打开、本地服务器、Web 托管、FeHelper）
   - 结构：单文件，CSS 和 JS 内联
   - 优势：无外部依赖，避免沙箱权限问题，无 FOUC

2. **index-standalone.html** - 独立版本
   - 适用于：代码开发和维护
   - 结构：HTML + 外部 CSS + 外部 JS
   - 优势：代码分离，易于修改和调试

**为什么使用内联版本？**
- FeHelper 在沙箱 iframe 中加载工具，无法访问外部文件
- 内联版本将所有资源打包到单个 HTML 文件中，完全避免权限和 FOUC 问题
- 同时也适用于直接打开等其他场景，一个文件通用所有环境

**开发建议：**
修改代码时使用 `index-standalone.html` + `index.css` + `index.js`，然后手动合并生成新的 `index.html`。

## 🔒 隐私安全

- ✅ **完全本地运行** - 所有数据处理在浏览器中完成
- ✅ **无网络请求** - 不会上传任何数据到服务器
- ✅ **无数据存储** - 不保存任何用户输入
- ✅ **开源透明** - 代码完全可审查

## 🧪 测试

项目包含自动化测试文件：

```bash
# 打开测试页面
open test-verification.html
```

测试覆盖：
- ✅ 基础编码/解码
- ✅ Unicode 字符支持
- ✅ 嵌套结构
- ✅ 所有数据类型
- ✅ 工具函数
- ✅ DOM 元素

## 📋 浏览器兼容性

| 浏览器 | 版本要求 |
|--------|----------|
| Chrome | ≥ 60 |
| Firefox | ≥ 55 |
| Safari | ≥ 11 |
| Edge | ≥ 79 |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关资源

- [MessagePack 官方文档](https://msgpack.org/)
- [JWT 官方网站](https://jwt.io/)
- [MessagePack 规范](https://github.com/msgpack/msgpack/blob/master/spec.md)
- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)

## 📮 反馈

如有问题或建议，欢迎通过以下方式联系：

- 提交 Issue
- 发送邮件
- 提交 Pull Request

---

<div align="center">

**Made with ❤️ by Developers, for Developers**

⭐ 如果这个项目对你有帮助，请给个 Star！

</div>
