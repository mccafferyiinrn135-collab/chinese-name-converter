# 中文命名转换

在 VS Code 中选中中文，按 `Tab` 翻译并转换成规范的英文名称。命名风格选择一次后会一直保留，除非再次修改。

## 使用方法

- 选中中文后按 `Tab`：按已经保存的命名风格直接转换。
- 没有选中文字时，`Tab` 仍保持原本的缩进功能。
- `Ctrl+Alt+Shift+N`（macOS 为 `Cmd+Alt+Shift+N`）：选择并保存命名风格，同时转换当前内容。以后按 `Tab` 都会继续使用该风格，直到再次选择。
- `Ctrl+Alt+N`（macOS 为 `Cmd+Alt+N`）：按已保存风格转换，也支持光标所在中文词。
- 也可以打开右键菜单，选择“中文命名转换”。
- 支持多选区和多光标；没有选区时自动转换光标所在名称。

例如选中 `当前用户名称`：

| 风格 | 结果 |
| --- | --- |
| camelCase | `currentUserName` |
| PascalCase | `CurrentUserName` |
| snake_case | `current_user_name` |
| UPPER_SNAKE_CASE | `CURRENT_USER_NAME` |
| kebab-case | `current-user-name` |
| 匈牙利命名法（string） | `strCurrentUserName` |

## 翻译方式

默认使用免密钥的 MyMemory 在线翻译，所选文字会发送给该服务。可以在设置中将 `Chinese Name Converter: Translation Provider` 改为：

- `offline`：仅使用内置开发词典，不发送任何数据；未收录汉字会转成 Unicode 标记。
- `libreTranslate`：使用你自己的 LibreTranslate 服务，并配置接口地址和可选 API 密钥。

在线服务不可用时默认回退到内置词典；可通过 `Fallback To Offline` 关闭回退。

## 编程专业词库

插件内置编程术语表，已收录架构、数据结构、数据库、网络安全、并发异步、前端、测试、DevOps 和嵌入式系统等常用术语。已收录的术语会优先于在线翻译，以得到更适合代码的稳定名称。

例如：`依赖注入容器` → `dependencyInjectionContainer`、`接口网关` → `apiGateway`、`数据库事务回滚` → `databaseTransactionRollback`、`异步任务队列` → `asyncTaskQueue`、`测试覆盖率` → `testCoverage`。

嵌入式词库覆盖 MCU、GPIO、时钟、中断、DMA、定时器、ADC/DAC、UART、SPI、I2C、CAN、RTOS、存储器、Bootloader、传感器、电机控制和调试烧录。例如：`串口接收缓冲区` → `uartReceiveBuffer`、`模数转换器采样值` → `adcSampleValue`、`中断服务函数` → `interruptServiceRoutine`、`任务优先级` → `taskPriority`。

## 匈牙利命名法

选择匈牙利命名法时会提示选择变量类型，并保存这次选择。后续按 `Tab` 会一直使用它；选择“自动推断”时，则根据 TypeScript 类型标注、字面量赋值等上下文推断。所有前缀都可以通过 `Hungarian: Prefixes` 自定义。

默认前缀包括 `str`、`n`、`b`、`arr`、`obj`、`fn`、`p`、`el`、`map`、`set` 和 `dt`。

嵌入式 C/C++ 自动模式还能根据变量左侧的声明类型添加严格的类型前缀：`uint8_t` → `u8`、`uint16_t` → `u16`、`int32_t` → `s32`、`float` → `f32`、`double` → `f64`、普通指针 → `p`、结构体指针 → `pst`、句柄 → `h`、枚举 → `e`。例如 `uint16_t ADC采样值` 会转换为 `uint16_t u16AdcSampleValue`。

## 本地开发

```bash
npm install
npm test
```

在 VS Code 中打开本目录并按 `F5`，即可启动扩展开发宿主进行调试。
