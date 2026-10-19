# koishi-plugin-sponsor

### 中文
这是一个为 Koishi 机器人框架开发的**赞助插件**。管理员在控制台的「赞助管理」页面维护赞助二维码和赞助记录，用户可以通过中文指令查看赞助二维码、累计金额与赞助排行榜。插件内置一个示例图片，管理员可以在赞助管理页面维护所有二维码渠道。

### English
This is a **sponsorship plugin** for Koishi. Administrators manage sponsorship QR codes and sponsor records from the "赞助管理" console page. Users can view QR codes, total sponsorship amounts, and the leaderboard with Chinese commands. The plugin includes a sample QR code and supports real-time image upload with Base64 storage in the configuration page.

## 项目仓库 (Repository)
- GitHub: `https://github.com/Minecraft-1314/koishi-plugin-sponsor`
- Issues: `https://github.com/Minecraft-1314/koishi-plugin-sponsor/issues`

## 核心指令 (Core Commands)

| 指令 (Command) | 说明 (Description) | 示例 (Example) |
|----------------|--------------------|----------------|
| `赞助` | 同时查看赞助二维码与赞助排行榜 | `赞助` |
| `赞助二维码` | 只查看已启用的赞助二维码 | `赞助二维码` |
| `赞助排行` | 查看赞助排行榜，可指定展示人数 | `赞助排行 20` |

## 配置项说明 (Configuration)

| 配置项 (Config) | 类型 (Type) | 默认值 (Default) | 说明 (Description) |
|----------------|-------------|-------------------|---------------------|
| `enabled` | boolean | true | 是否启用赞助插件 |
| `title` | string | 感谢支持 | 聊天展示标题 |
| `description` | string | 你的支持会帮助项目继续运行。 | 聊天展示说明 |
| `currency` | string | ¥ | 排行榜金额符号 |
| `showAmounts` | boolean | true | 是否公开显示赞助金额 |
| `leaderboardLimit` | number | 10 | 聊天排行榜展示人数 |
| `maxQrCount` | number | 4 | 最多保存的二维码数量 |
| `maxImageSize` | number | 2 | 单张二维码最大体积（MB） |
| `pageSize` | number | 10 | 控制台每页显示的赞助记录数 |

## 控制台管理页面 (Console Dashboard)

控制台路径为 `/sponsor`，默认要求权限等级 4。

| 功能 (Feature) | 说明 (Description) |
|----------------|--------------------|
| 状态统计 | 查看累计金额、公开记录、隐藏记录和二维码渠道数量 |
| 列表筛选 | 按赞助人或留言搜索，也可以切换每页条数 |
| 自动刷新 | 可开启 30 秒自动刷新，打开编辑框或执行操作时自动暂停 |
| 赞助记录 | 新增、编辑、公开、隐藏和删除赞助记录 |
| 二维码管理 | 上传二维码、预览、排序、启用停用、编辑和删除 |

| 内置图片 | 插件首次启用时自动生成并写入一张示例图片，可在管理页编辑 |

## 内置图片 (Built-in Image)

- 插件默认包含独立图片文件 `assets/builtin-qr.png`，首次启用后可以在赞助管理页面编辑或替换。
- 管理页面上传的图片会先校验格式与体积，再保存到二维码渠道。
- 如果二维码渠道为空，插件会继续使用内置二维码作为聊天展示降级内容。
- 控制台二维码列表支持继续添加多个收款渠道。

## 注意事项 (Notes)

- 需要启用 Koishi 数据库插件，例如 `@koishijs/plugin-database-sqlite`。
- 控制台上传的二维码图片按 48 KB 分片经控制台通道传输，保存为内嵌 Base64 数据，不依赖 assets 存储，避免反向代理限制单条消息体积时上传超时。
- 只有粘贴图片链接时才会尝试转存到 assets 服务；转存失败或超时则保留原始链接。
- 二维码链接会拒绝本机、内网和带账号密码的 URL，避免 SSRF 风险。
- 赞助记录与二维码保存在 Koishi 数据库中，隐藏记录不会进入聊天排行榜。
- 插件不会主动上传数据到第三方服务。

## 项目贡献者 (Contributors)

| 贡献者 (Contributor) | 贡献内容 (Contribution) |
|----------------------|--------------------------|
| Minecraft-1314 | 插件开发 (Plugin development) |

## 许可协议 (License)

本项目采用 MIT 许可证，详情参见 [LICENSE](LICENSE) 文件。

This project is licensed under the MIT License, see the [LICENSE](LICENSE) file for details.

## 支持我们 (Support Us)

如果这个项目对您有帮助，欢迎点亮右上角的 Star ⭐ 支持我们，这将是对所有贡献者最大的鼓励！

If this project is helpful to you, please feel free to star it in the upper right corner ⭐ to support us, which will be the greatest encouragement to all contributors!
