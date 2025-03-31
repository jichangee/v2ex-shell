# V2EX Shell

一个基于 Node.js 的 V2EX 命令行工具，让你可以在终端中浏览 V2EX 的热门话题。

## 功能特性

- 📱 浏览 V2EX 热门话题
- 📄 分页显示，每页 10 条话题
- 🔍 查看话题详情和回复
- ⌨️ 交互式操作界面
- 🎨 彩色输出，提升阅读体验

## 安装

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/v2ex-shell.git
cd v2ex-shell
```

2. 安装依赖：
```bash
npm install
```

3. 全局安装（可选）：
```bash
npm link
```

## 使用方法

1. 直接运行：
```bash
node index.js
```

2. 如果已全局安装，可以直接使用：
```bash
v2ex-shell
```

### 操作说明

- 使用方向键（↑↓）选择话题或操作选项
- 按回车键确认选择
- 在话题列表中可以：
  - 选择具体话题查看详情
  - 选择"退出"结束程序
- 在话题详情中可以：
  - 查看话题内容和所有回复
  - 选择"返回列表"回到话题列表
  - 选择"上一页"或"下一页"进行翻页
  - 选择"退出"结束程序

## 技术栈

- Node.js
- Commander.js - 命令行界面框架
- Axios - HTTP 客户端
- Cheerio - HTML 解析
- Inquirer - 交互式命令行界面
- Chalk - 终端样式
- Ora - 加载动画

## 项目结构

```
v2ex-shell/
├── index.js          # 主程序入口
├── api.js            # API 接口封装
├── package.json      # 项目配置
└── README.md         # 项目文档
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

ISC 