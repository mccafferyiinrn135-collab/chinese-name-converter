import * as http from "node:http";
import * as https from "node:https";

export type TranslationProvider = "myMemory" | "libreTranslate" | "offline";

export interface TranslationOptions {
  provider: TranslationProvider;
  libreEndpoint: string;
  libreApiKey: string;
  fallbackToOffline: boolean;
}

const PHRASES: Record<string, string> = {
  // 嵌入式系统、芯片与启动流程
  "嵌入式系统": "embedded system",
  "嵌入式软件": "embedded software",
  "嵌入式开发": "embedded development",
  "微控制器": "MCU",
  "单片机": "MCU",
  "中央处理器": "CPU",
  "数字信号处理器": "DSP",
  "现场可编程门阵列": "FPGA",
  "片上系统": "SoC",
  "指令集架构": "instruction set architecture",
  "寄存器映射": "register map",
  "内存映射": "memory map",
  "存储器映射": "memory map",
  "内存映射寄存器": "memory mapped register",
  "特殊功能寄存器": "special function register",
  "芯片选择": "chip select",
  "芯片使能": "chip enable",
  "硬件抽象层": "HAL",
  "板级支持包": "BSP",
  "设备驱动程序": "device driver",
  "外设驱动": "peripheral driver",
  "启动代码": "startup code",
  "启动文件": "startup file",
  "启动加载程序": "bootloader",
  "引导加载程序": "bootloader",
  "应用固件": "application firmware",
  "固件版本": "firmware version",
  "固件升级": "firmware update",
  "固件更新": "firmware update",
  "空中升级": "OTA update",
  "远程升级": "OTA update",
  "在线升级": "in application programming",
  "系统复位": "system reset",
  "软件复位": "software reset",
  "硬件复位": "hardware reset",
  "复位原因": "reset cause",
  "上电复位": "power on reset",
  "掉电复位": "brown out reset",
  "复位向量": "reset vector",
  "中断向量表": "interrupt vector table",
  "链接脚本": "linker script",
  "链接文件": "linker file",
  "固件镜像": "firmware image",
  "程序入口": "program entry",

  // GPIO、时钟与基础外设
  "通用输入输出": "GPIO",
  "通用输入输出口": "GPIO port",
  "引脚复用": "pin multiplexing",
  "引脚配置": "pin configuration",
  "输入引脚": "input pin",
  "输出引脚": "output pin",
  "模拟引脚": "analog pin",
  "数字引脚": "digital pin",
  "上拉电阻": "pull up resistor",
  "下拉电阻": "pull down resistor",
  "内部上拉": "internal pull up",
  "内部下拉": "internal pull down",
  "开漏输出": "open drain output",
  "推挽输出": "push pull output",
  "输出电平": "output level",
  "高电平": "high level",
  "低电平": "low level",
  "上升沿": "rising edge",
  "下降沿": "falling edge",
  "双边沿": "both edges",
  "按键消抖": "button debounce",
  "时钟源": "clock source",
  "系统时钟": "system clock",
  "外设时钟": "peripheral clock",
  "时钟频率": "clock frequency",
  "时钟树": "clock tree",
  "时钟分频": "clock divider",
  "时钟倍频": "clock multiplier",
  "锁相环": "PLL",
  "内部振荡器": "internal oscillator",
  "外部晶振": "external crystal",
  "低速时钟": "low speed clock",
  "高速时钟": "high speed clock",
  "实时时钟": "RTC",
  "系统滴答": "system tick",
  "看门狗": "watchdog",
  "独立看门狗": "independent watchdog",
  "窗口看门狗": "window watchdog",
  "喂狗": "feed watchdog",

  // 中断、定时器、DMA 与并发
  "中断服务程序": "interrupt service routine",
  "中断服务函数": "interrupt service routine",
  "中断处理程序": "interrupt handler",
  "中断请求": "interrupt request",
  "中断标志": "interrupt flag",
  "中断使能": "interrupt enable",
  "中断优先级": "interrupt priority",
  "中断嵌套": "interrupt nesting",
  "外部中断": "external interrupt",
  "软件中断": "software interrupt",
  "硬件中断": "hardware interrupt",
  "临界段": "critical section",
  "全局中断": "global interrupt",
  "直接存储器访问": "DMA",
  "直接内存访问": "DMA",
  "DMA通道": "DMA channel",
  "DMA传输": "DMA transfer",
  "循环模式": "circular mode",
  "定时器": "timer",
  "基本定时器": "basic timer",
  "通用定时器": "general purpose timer",
  "高级定时器": "advanced timer",
  "定时器中断": "timer interrupt",
  "定时器周期": "timer period",
  "定时器预分频": "timer prescaler",
  "输入捕获": "input capture",
  "输出比较": "output compare",
  "正交编码器": "quadrature encoder",
  "编码器模式": "encoder mode",
  "脉冲宽度调制": "PWM",
  "占空比": "duty cycle",
  "死区时间": "dead time",
  "互补输出": "complementary output",

  // ADC、DAC 与模拟前端
  "模数转换器": "ADC",
  "模拟数字转换器": "ADC",
  "数模转换器": "DAC",
  "数字模拟转换器": "DAC",
  "模拟比较器": "analog comparator",
  "运算放大器": "operational amplifier",
  "参考电压": "reference voltage",
  "采样频率": "sampling frequency",
  "采样周期": "sampling period",
  "采样时间": "sampling time",
  "采样通道": "sampling channel",
  "采样率": "sample rate",
  "采样值": "sample value",
  "原始采样值": "raw sample value",
  "转换结果": "conversion result",
  "转换完成": "conversion complete",
  "转换精度": "conversion resolution",
  "量化误差": "quantization error",
  "校准系数": "calibration coefficient",
  "零点校准": "zero calibration",
  "满量程": "full scale",
  "低通滤波器": "low pass filter",
  "高通滤波器": "high pass filter",
  "带通滤波器": "band pass filter",
  "移动平均滤波": "moving average filter",
  "卡尔曼滤波": "Kalman filter",
  "互补滤波": "complementary filter",

  // 串行通信和工业总线
  "通用异步收发器": "UART",
  "通用同步异步收发器": "USART",
  "串行外设接口": "SPI",
  "集成电路总线": "I2C",
  "内部集成电路总线": "I2C",
  "控制器局域网": "CAN bus",
  "控制器局域网总线": "CAN bus",
  "串行通信": "serial communication",
  "串口通信": "UART communication",
  "串口接收": "UART receive",
  "串口发送": "UART transmit",
  "串口中断": "UART interrupt",
  "串口缓冲区": "UART buffer",
  "接收缓冲区": "receive buffer",
  "发送缓冲区": "transmit buffer",
  "环形缓冲区": "ring buffer",
  "循环缓冲区": "ring buffer",
  "接收完成": "receive complete",
  "发送完成": "transmit complete",
  "波特率": "baud rate",
  "数据位": "data bits",
  "停止位": "stop bits",
  "奇偶校验": "parity check",
  "校验位": "parity bit",
  "起始位": "start bit",
  "片选信号": "chip select signal",
  "时钟极性": "clock polarity",
  "时钟相位": "clock phase",
  "主机模式": "master mode",
  "从机模式": "slave mode",
  "主设备": "master device",
  "从设备": "slave device",
  "设备地址": "device address",
  "从机地址": "slave address",
  "应答信号": "acknowledge signal",
  "非应答信号": "negative acknowledge signal",
  "仲裁丢失": "arbitration lost",
  "总线忙": "bus busy",
  "总线错误": "bus error",
  "帧标识符": "frame identifier",
  "标准帧": "standard frame",
  "扩展帧": "extended frame",
  "远程帧": "remote frame",
  "数据帧": "data frame",
  "CAN过滤器": "CAN filter",
  "CAN接收": "CAN receive",
  "CAN发送": "CAN transmit",
  "CAN总线": "CAN bus",
  "CANFD总线": "CAN FD bus",
  "局域互联网络": "LIN bus",
  "串行线调试": "SWD",
  "联合测试行动组": "JTAG",
  "单线接口": "one wire interface",
  "循环冗余校验": "CRC",
  "校验和": "checksum",
  "数据包": "packet",
  "报文头": "frame header",
  "报文尾": "frame footer",
  "有效载荷": "payload",
  "报文长度": "frame length",

  // RTOS 与嵌入式调度
  "实时操作系统": "RTOS",
  "实时内核": "real time kernel",
  "任务优先级": "task priority",
  "任务句柄": "task handle",
  "任务堆栈": "task stack",
  "任务状态": "task state",
  "任务切换": "context switch",
  "上下文切换": "context switch",
  "任务通知": "task notification",
  "任务延时": "task delay",
  "任务挂起": "task suspend",
  "任务恢复": "task resume",
  "消息邮箱": "message mailbox",
  "消息队列句柄": "message queue handle",
  "事件标志组": "event group",
  "事件组": "event group",
  "二值信号量": "binary semaphore",
  "计数信号量": "counting semaphore",
  "递归互斥量": "recursive mutex",
  "软件定时器": "software timer",
  "内存堆": "heap",
  "任务栈": "task stack",
  "栈空间": "stack space",
  "栈水位": "stack high water mark",
  "空闲任务": "idle task",
  "调度器": "scheduler",
  "抢占调度": "preemptive scheduling",
  "时间片": "time slice",
  "优先级反转": "priority inversion",

  // 存储器与文件系统
  "闪存": "flash memory",
  "内部闪存": "internal flash",
  "外部闪存": "external flash",
  "随机存取存储器": "RAM",
  "只读存储器": "ROM",
  "电可擦可编程只读存储器": "EEPROM",
  "静态随机存取存储器": "SRAM",
  "动态随机存取存储器": "DRAM",
  "非易失性存储器": "nonvolatile memory",
  "易失性存储器": "volatile memory",
  "存储地址": "memory address",
  "存储块": "memory block",
  "闪存扇区": "flash sector",
  "闪存页面": "flash page",
  "闪存擦除": "flash erase",
  "闪存写入": "flash write",
  "写保护": "write protection",
  "磨损均衡": "wear leveling",
  "文件系统": "file system",
  "嵌入式文件系统": "embedded file system",
  "参数存储": "parameter storage",
  "掉电保存": "power loss save",

  // 功耗、电源、传感器与控制
  "低功耗": "low power",
  "低功耗模式": "low power mode",
  "睡眠模式": "sleep mode",
  "深度睡眠": "deep sleep",
  "待机模式": "standby mode",
  "休眠模式": "hibernate mode",
  "唤醒源": "wake up source",
  "唤醒事件": "wake up event",
  "电源管理": "power management",
  "电源电压": "supply voltage",
  "电池电压": "battery voltage",
  "电池电量": "battery level",
  "欠压保护": "under voltage protection",
  "过压保护": "over voltage protection",
  "过流保护": "over current protection",
  "温度传感器": "temperature sensor",
  "湿度传感器": "humidity sensor",
  "压力传感器": "pressure sensor",
  "加速度传感器": "accelerometer",
  "陀螺仪": "gyroscope",
  "磁力计": "magnetometer",
  "惯性测量单元": "IMU",
  "霍尔传感器": "Hall sensor",
  "光电编码器": "optical encoder",
  "传感器数据": "sensor data",
  "原始数据": "raw data",
  "姿态角": "attitude angle",
  "欧拉角": "Euler angle",
  "四元数": "quaternion",
  "电机控制": "motor control",
  "无刷直流电机": "brushless DC motor",
  "步进电机": "stepper motor",
  "伺服电机": "servo motor",
  "电机转速": "motor speed",
  "目标转速": "target speed",
  "转子位置": "rotor position",
  "换相控制": "commutation control",
  "矢量控制": "field oriented control",
  "比例积分微分控制器": "PID controller",
  "比例增益": "proportional gain",
  "积分增益": "integral gain",
  "微分增益": "derivative gain",

  // 调试、烧录与可靠性
  "在线调试器": "in circuit debugger",
  "在线仿真器": "in circuit emulator",
  "逻辑分析仪": "logic analyzer",
  "示波器": "oscilloscope",
  "调试接口": "debug interface",
  "调试端口": "debug port",
  "断点调试": "breakpoint debugging",
  "硬件断点": "hardware breakpoint",
  "软件断点": "software breakpoint",
  "单步执行": "single step",
  "寄存器值": "register value",
  "烧录器": "programmer",
  "程序烧录": "firmware programming",
  "下载算法": "flash algorithm",
  "故障处理": "fault handling",
  "硬故障": "hard fault",
  "总线故障": "bus fault",
  "内存管理故障": "memory management fault",
  "使用故障": "usage fault",
  "故障地址": "fault address",
  "错误处理程序": "error handler",
  "错误标志": "error flag",
  "故障恢复": "fault recovery",
  "自检程序": "self test",
  "上电自检": "power on self test",
  "安全状态": "safe state",

  // 编程基础与架构
  "应用程序接口": "API",
  "编程接口": "API",
  "接口地址": "endpoint",
  "依赖注入": "dependency injection",
  "控制反转": "inversion of control",
  "设计模式": "design pattern",
  "单例模式": "singleton pattern",
  "工厂模式": "factory pattern",
  "观察者模式": "observer pattern",
  "发布订阅": "publish subscribe",
  "领域驱动设计": "domain driven design",
  "微服务": "microservice",
  "服务发现": "service discovery",
  "配置中心": "configuration center",
  "负载均衡": "load balancing",
  "反向代理": "reverse proxy",
  "中间件": "middleware",
  "拦截器": "interceptor",
  "过滤器": "filter",
  "事件总线": "event bus",
  "消息队列": "message queue",
  "消息代理": "message broker",
  "任务调度": "task scheduler",
  "定时任务": "scheduled task",
  "工作线程": "worker thread",
  "线程池": "thread pool",
  "连接池": "connection pool",
  "对象池": "object pool",

  // 数据、算法与语言概念
  "数据结构": "data structure",
  "链表": "linked list",
  "双向链表": "doubly linked list",
  "哈希表": "hash table",
  "哈希映射": "hash map",
  "二叉树": "binary tree",
  "搜索树": "search tree",
  "优先队列": "priority queue",
  "循环队列": "circular queue",
  "栈溢出": "stack overflow",
  "时间复杂度": "time complexity",
  "空间复杂度": "space complexity",
  "深度优先搜索": "depth first search",
  "广度优先搜索": "breadth first search",
  "动态规划": "dynamic programming",
  "二分查找": "binary search",
  "快速排序": "quick sort",
  "归并排序": "merge sort",
  "递归函数": "recursive function",
  "高阶函数": "higher order function",
  "匿名函数": "anonymous function",
  "箭头函数": "arrow function",
  "纯函数": "pure function",
  "闭包": "closure",
  "泛型": "generic",
  "类型推断": "type inference",
  "类型守卫": "type guard",
  "空值检查": "null check",
  "垃圾回收": "garbage collection",
  "垃圾回收器": "garbage collector",
  "内存泄漏": "memory leak",
  "内存分配": "memory allocation",
  "引用计数": "reference count",
  "序列化": "serialization",
  "反序列化": "deserialization",
  "编码器": "encoder",
  "解码器": "decoder",

  // 网络、认证与安全
  "请求头": "request header",
  "响应头": "response header",
  "请求体": "request body",
  "响应体": "response body",
  "查询参数": "query parameter",
  "路径参数": "path parameter",
  "路由参数": "route parameter",
  "网关": "gateway",
  "接口网关": "API gateway",
  "跨域资源共享": "cross origin resource sharing",
  "跨域请求": "cross origin request",
  "套接字": "socket",
  "网络协议": "network protocol",
  "超时重试": "timeout retry",
  "重试次数": "retry count",
  "心跳检测": "heartbeat check",
  "身份认证": "authentication",
  "授权校验": "authorization check",
  "权限校验": "permission check",
  "数字签名": "digital signature",
  "哈希算法": "hash algorithm",
  "加密算法": "encryption algorithm",
  "访问控制": "access control",
  "会话标识": "session id",

  // 数据库、缓存与分布式系统
  "数据库连接": "database connection",
  "数据库事务": "database transaction",
  "事务回滚": "transaction rollback",
  "事务提交": "transaction commit",
  "查询语句": "query statement",
  "预处理语句": "prepared statement",
  "存储过程": "stored procedure",
  "外键": "foreign key",
  "唯一索引": "unique index",
  "联合索引": "composite index",
  "索引失效": "index invalidation",
  "执行计划": "execution plan",
  "数据迁移": "data migration",
  "数据库迁移": "database migration",
  "读写分离": "read write splitting",
  "分库分表": "database sharding",
  "数据分片": "data shard",
  "分布式锁": "distributed lock",
  "乐观锁": "optimistic lock",
  "悲观锁": "pessimistic lock",
  "死锁": "deadlock",
  "缓存穿透": "cache penetration",
  "缓存击穿": "cache breakdown",
  "缓存雪崩": "cache avalanche",
  "缓存过期": "cache expiration",
  "缓存键": "cache key",
  "过期时间": "expiration time",
  "一致性哈希": "consistent hashing",
  "最终一致性": "eventual consistency",
  "分布式事务": "distributed transaction",

  // 并发、异步与可靠性
  "线程安全": "thread safe",
  "并发控制": "concurrency control",
  "并发数量": "concurrency count",
  "竞争条件": "race condition",
  "临界区": "critical section",
  "互斥锁": "mutex",
  "读写锁": "read write lock",
  "信号量": "semaphore",
  "原子操作": "atomic operation",
  "异步任务": "async task",
  "异步函数": "async function",
  "异步迭代器": "async iterator",
  "事件循环": "event loop",
  "回调函数": "callback function",
  "回调地狱": "callback hell",
  "熔断器": "circuit breaker",
  "限流器": "rate limiter",
  "降级策略": "fallback strategy",
  "幂等性": "idempotency",
  "幂等键": "idempotency key",
  "健康检查": "health check",

  // 前端与客户端
  "虚拟节点": "virtual node",
  "虚拟列表": "virtual list",
  "虚拟滚动": "virtual scrolling",
  "状态管理": "state management",
  "路由守卫": "route guard",
  "生命周期": "lifecycle",
  "生命周期钩子": "lifecycle hook",
  "自定义钩子": "custom hook",
  "组合式函数": "composable function",
  "受控组件": "controlled component",
  "服务端渲染": "server side rendering",
  "客户端渲染": "client side rendering",
  "静态站点生成": "static site generation",
  "代码分割": "code splitting",
  "懒加载": "lazy loading",
  "预加载": "preloading",
  "防抖": "debounce",
  "节流": "throttle",
  "事件冒泡": "event bubbling",
  "事件捕获": "event capturing",
  "浏览器缓存": "browser cache",
  "本地存储": "local storage",
  "会话存储": "session storage",

  // 测试、构建与运维
  "单元测试": "unit test",
  "集成测试": "integration test",
  "端到端测试": "end to end test",
  "性能测试": "performance test",
  "压力测试": "stress test",
  "测试用例": "test case",
  "测试覆盖率": "test coverage",
  "断言失败": "assertion failure",
  "模拟对象": "mock object",
  "持续集成": "continuous integration",
  "持续交付": "continuous delivery",
  "持续部署": "continuous deployment",
  "构建产物": "build artifact",
  "源代码映射": "source map",
  "热更新": "hot reload",
  "环境变量": "environment variable",
  "容器镜像": "container image",
  "镜像仓库": "image registry",
  "日志级别": "log level",
  "调用链": "trace",
  "链路追踪": "distributed tracing",
  "性能指标": "performance metric",
  "错误日志": "error log",

  // 既有业务常用词
  "用户名": "user name",
  "用户名称": "user name",
  "用户列表": "user list",
  "用户信息": "user information",
  "用户数据": "user data",
  "用户编号": "user id",
  "用户ID": "user id",
  "当前用户": "current user",
  "登录用户": "logged in user",
  "访问令牌": "access token",
  "刷新令牌": "refresh token",
  "电子邮箱": "email address",
  "邮箱地址": "email address",
  "手机号码": "phone number",
  "电话号码": "phone number",
  "创建时间": "created time",
  "更新时间": "updated time",
  "开始时间": "start time",
  "结束时间": "end time",
  "请求参数": "request parameters",
  "响应数据": "response data",
  "错误信息": "error message",
  "错误代码": "error code",
  "状态码": "status code",
  "文件名称": "file name",
  "文件路径": "file path",
  "文件列表": "file list",
  "数据库": "database",
  "数据表": "data table",
  "主键": "primary key",
  "总数量": "total count",
  "总金额": "total amount",
  "商品名称": "product name",
  "商品列表": "product list",
  "订单编号": "order id",
  "订单列表": "order list",
  "是否成功": "is successful",
  "是否可用": "is available",
  "是否删除": "is deleted"
};

const WORDS: Record<string, string> = {
  "用户": "user", "名称": "name", "姓名": "name", "名字": "name", "列表": "list",
  "数组": "array", "集合": "collection", "数据": "data", "信息": "information", "详情": "details",
  "编号": "id", "标识": "identifier", "键": "key", "值": "value", "类型": "type",
  "状态": "status", "结果": "result", "成功": "success", "失败": "failure", "错误": "error",
  "消息": "message", "标题": "title", "内容": "content", "描述": "description", "备注": "remark",
  "时间": "time", "日期": "date", "开始": "start", "结束": "end", "创建": "create",
  "更新": "update", "删除": "delete", "添加": "add", "新增": "add", "修改": "modify",
  "查询": "query", "搜索": "search", "获取": "get", "设置": "set", "保存": "save",
  "加载": "load", "提交": "submit", "取消": "cancel", "确认": "confirm", "返回": "return",
  "请求": "request", "响应": "response", "参数": "parameter", "配置": "configuration", "选项": "option",
  "文件": "file", "路径": "path", "目录": "directory", "地址": "address", "链接": "link",
  "图片": "image", "图标": "icon", "宽度": "width", "高度": "height", "大小": "size",
  "颜色": "color", "页面": "page", "组件": "component", "按钮": "button", "菜单": "menu",
  "窗口": "window", "输入": "input", "输出": "output", "文本": "text", "密码": "password",
  "账号": "account", "登录": "login", "退出": "logout", "权限": "permission", "角色": "role",
  "令牌": "token", "邮箱": "email", "电话": "phone", "手机": "mobile", "城市": "city",
  "国家": "country", "语言": "language", "代码": "code", "数量": "count", "金额": "amount",
  "价格": "price", "商品": "product", "订单": "order", "客户": "customer", "购物车": "cart",
  "索引": "index", "缓存": "cache", "服务": "service", "控制器": "controller", "模型": "model",
  "方法": "method", "函数": "function", "事件": "event", "回调": "callback", "任务": "task",
  "队列": "queue", "当前": "current", "默认": "default", "最大": "maximum", "最小": "minimum",
  "平均": "average", "总": "total", "上一个": "previous", "下一个": "next", "启用": "enabled",
  "禁用": "disabled", "可用": "available", "可见": "visible", "选中": "selected", "激活": "active",
  "本地": "local", "远程": "remote", "临时": "temporary", "公共": "public", "私有": "private",
  "接口": "interface", "端点": "endpoint", "依赖": "dependency", "注入": "injection", "容器": "container",
  "实例": "instance", "对象": "object", "属性": "property", "字段": "field", "常量": "constant",
  "变量": "variable", "命名空间": "namespace", "模块": "module", "包": "package", "库": "library",
  "框架": "framework", "插件": "plugin", "扩展": "extension", "构建": "build", "编译": "compile",
  "解析": "parse", "转换": "transform", "校验": "validate", "验证": "verify", "断言": "assertion",
  "异常": "exception", "日志": "log", "调试": "debug", "追踪": "trace", "监控": "monitor",
  "指标": "metric", "事务": "transaction", "回滚": "rollback", "迁移": "migration",
  "分片": "shard", "节点": "node", "集群": "cluster", "主机": "host", "客户端": "client",
  "服务端": "server", "前端": "frontend", "后端": "backend", "路由": "route", "协议": "protocol",
  "会话": "session", "认证": "authentication", "授权": "authorization", "加密": "encryption", "解密": "decryption",
  "哈希": "hash", "签名": "signature", "证书": "certificate", "线程": "thread", "进程": "process",
  "并发": "concurrency", "异步": "async", "同步": "sync", "锁": "lock", "重试": "retry",
  "超时": "timeout", "延迟": "latency", "吞吐量": "throughput", "熔断": "circuit breaking", "限流": "rate limiting",
  "降级": "fallback", "渲染": "render", "挂载": "mount", "卸载": "unmount", "钩子": "hook",
  "防抖函数": "debounce function", "节流函数": "throttle function", "仓库": "repository", "分支": "branch",
  "标签": "tag", "版本": "version", "发布": "release", "部署": "deployment", "流水线": "pipeline",
  "镜像": "image", "覆盖率": "coverage", "基准测试": "benchmark", "模拟": "mock", "存根": "stub"
  , "固件": "firmware", "芯片": "chip", "内核": "kernel", "寄存器": "register", "位域": "bit field",
  "引脚": "pin", "端口": "port", "外设": "peripheral", "时钟": "clock", "晶振": "crystal",
  "复位": "reset", "启动": "startup", "引导": "boot", "中断": "interrupt", "优先级": "priority",
  "使能": "enable", "禁用位": "disable bit", "标志位": "flag bit", "通道": "channel", "传输": "transfer",
  "接收": "receive", "发送": "transmit", "总线": "bus", "帧": "frame", "报文": "message",
  "字节": "byte", "位": "bit", "掩码": "mask", "偏移": "offset", "缓冲区": "buffer",
  "环形队列": "ring queue", "采样": "sample", "校准": "calibration", "滤波": "filtering", "测量": "measurement",
  "频率": "frequency", "周期": "period", "脉冲": "pulse", "电压": "voltage", "电流": "current",
  "功率": "power", "温度": "temperature", "湿度": "humidity", "压力": "pressure", "角度": "angle",
  "速度": "speed", "转速": "rotation speed", "位置": "position", "方向": "direction", "传感器": "sensor",
  "执行器": "actuator", "电机": "motor", "编码器": "encoder", "控制环": "control loop", "反馈": "feedback",
  "增益": "gain", "误差值": "error value", "设定值": "setpoint", "测量值": "measured value", "输出值": "output value",
  "功耗": "power consumption", "唤醒": "wake up", "睡眠": "sleep", "电池": "battery", "电源": "power supply",
  "扇区": "sector", "页": "page", "擦除": "erase", "烧录": "programming", "故障": "fault", "计数": "count",
  "设备": "device", "句柄": "handle", "指针": "pointer", "串口": "UART",
  "溢出": "overflow", "欠压": "under voltage", "过压": "over voltage", "过流": "over current", "看门狗计数": "watchdog count"
};

const dictionaryEntries = Object.entries({ ...PHRASES, ...WORDS }).sort((a, b) => b[0].length - a[0].length);

export function containsChinese(value: string): boolean {
  return /[\u3400-\u9fff]/u.test(value);
}

export function offlineTranslate(text: string): string {
  const exact = PHRASES[text.trim()];
  if (exact) return exact;

  let remaining = text.trim();
  const output: string[] = [];
  while (remaining.length > 0) {
    const separator = remaining.match(/^[\s_\-./]+/u);
    if (separator) {
      remaining = remaining.slice(separator[0].length);
      continue;
    }

    const match = dictionaryEntries.find(([chinese]) => remaining.startsWith(chinese));
    if (match) {
      output.push(match[1]);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    const ascii = remaining.match(/^[A-Za-z0-9]+/);
    if (ascii) {
      output.push(ascii[0]);
      remaining = remaining.slice(ascii[0].length);
      continue;
    }

    const first = Array.from(remaining)[0];
    if (containsChinese(first)) {
      output.push(`u${first.codePointAt(0)!.toString(16)}`);
    }
    remaining = remaining.slice(first.length);
  }
  return output.join(" ") || "value";
}

function terminologyTranslate(text: string): string | undefined {
  const exact = PHRASES[text.trim()];
  if (exact) return exact;

  let remaining = text.trim();
  const output: string[] = [];
  while (remaining.length > 0) {
    const separator = remaining.match(/^[\s_\-./]+/u);
    if (separator) {
      remaining = remaining.slice(separator[0].length);
      continue;
    }

    const match = dictionaryEntries.find(([chinese]) => remaining.startsWith(chinese));
    if (match) {
      output.push(match[1]);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    const ascii = remaining.match(/^[A-Za-z0-9]+/);
    if (ascii) {
      output.push(ascii[0]);
      remaining = remaining.slice(ascii[0].length);
      continue;
    }

    return undefined;
  }

  return output.join(" ") || undefined;
}

function requestJson(url: URL, init?: { method?: string; headers?: Record<string, string>; body?: string }): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http;
    const request = transport.request(url, {
      method: init?.method ?? "GET",
      headers: init?.headers,
      timeout: 10_000
    }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk: string) => {
        body += chunk;
        if (body.length > 1_000_000) request.destroy(new Error("翻译响应过大"));
      });
      response.on("end", () => {
        if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`翻译服务返回 HTTP ${response.statusCode ?? "未知"}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error("翻译服务返回了无效数据"));
        }
      });
    });
    request.on("timeout", () => request.destroy(new Error("翻译请求超时")));
    request.on("error", reject);
    if (init?.body) request.write(init.body);
    request.end();
  });
}

async function translateWithMyMemory(text: string): Promise<string> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", "zh-CN|en");
  const json = await requestJson(url) as {
    responseStatus?: number;
    responseData?: { translatedText?: string };
    responseDetails?: string;
  };
  const translated = json.responseData?.translatedText?.trim();
  if (!translated || (json.responseStatus && json.responseStatus >= 400)) {
    throw new Error(json.responseDetails || "MyMemory 没有返回译文");
  }
  return translated;
}

async function translateWithLibre(text: string, endpoint: string, apiKey: string): Promise<string> {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Error("LibreTranslate 接口地址无效");
  }
  const payload = JSON.stringify({
    q: text,
    source: "zh",
    target: "en",
    format: "text",
    ...(apiKey ? { api_key: apiKey } : {})
  });
  const json = await requestJson(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload).toString()
    },
    body: payload
  }) as { translatedText?: string; error?: string };
  if (!json.translatedText) throw new Error(json.error || "LibreTranslate 没有返回译文");
  return json.translatedText.trim();
}

export async function translate(text: string, options: TranslationOptions): Promise<{ text: string; usedFallback: boolean }> {
  if (!containsChinese(text)) return { text, usedFallback: false };
  const terminologyTranslation = terminologyTranslate(text);
  if (terminologyTranslation) return { text: terminologyTranslation, usedFallback: false };
  if (options.provider === "offline") return { text: offlineTranslate(text), usedFallback: false };

  try {
    const translated = options.provider === "libreTranslate"
      ? await translateWithLibre(text, options.libreEndpoint, options.libreApiKey)
      : await translateWithMyMemory(text);
    return { text: translated, usedFallback: false };
  } catch (error) {
    if (!options.fallbackToOffline) throw error;
    return { text: offlineTranslate(text), usedFallback: true };
  }
}
