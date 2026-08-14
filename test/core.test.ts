import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_PREFIXES, formatName, inferHungarianType, splitIntoWords } from "../src/core";
import { offlineTranslate, translate } from "../src/translation";

test("splits English phrases and existing camel case", () => {
  assert.deepEqual(splitIntoWords("current user name"), ["current", "user", "name"]);
  assert.deepEqual(splitIntoWords("HTTPResponseCode"), ["http", "response", "code"]);
});

test("formats all naming styles", () => {
  assert.equal(formatName("current user name", "camelCase"), "currentUserName");
  assert.equal(formatName("current user name", "PascalCase"), "CurrentUserName");
  assert.equal(formatName("current user name", "snake_case"), "current_user_name");
  assert.equal(formatName("current user name", "UPPER_SNAKE_CASE"), "CURRENT_USER_NAME");
  assert.equal(formatName("current user name", "kebab-case"), "current-user-name");
  assert.equal(formatName("current user name", "Hungarian", "str"), "strCurrentUserName");
});

test("protects reserved words and numeric starts", () => {
  assert.equal(formatName("class", "camelCase"), "classValue");
  assert.equal(formatName("2 factor code", "camelCase"), "_2FactorCode");
});

test("offline dictionary translates common development terms", () => {
  assert.equal(offlineTranslate("用户列表"), "user list");
  assert.equal(offlineTranslate("当前用户状态"), "current user status");
  assert.equal(offlineTranslate("依赖注入容器"), "dependency injection container");
  assert.equal(offlineTranslate("数据库事务回滚"), "database transaction rollback");
  assert.equal(offlineTranslate("异步任务队列"), "async task queue");
  assert.equal(offlineTranslate("测试覆盖率"), "test coverage");
});

test("known programming terminology takes priority over online providers", async () => {
  const result = await translate("接口网关", {
    provider: "libreTranslate",
    libreEndpoint: "not-a-valid-url",
    libreApiKey: "",
    fallbackToOffline: false
  });
  assert.deepEqual(result, { text: "API gateway", usedFallback: false });
});

test("translates embedded systems terminology and common acronyms", () => {
  assert.equal(offlineTranslate("串口接收缓冲区"), "UART receive buffer");
  assert.equal(offlineTranslate("模数转换器采样值"), "ADC sample value");
  assert.equal(offlineTranslate("中断服务函数"), "interrupt service routine");
  assert.equal(offlineTranslate("任务优先级"), "task priority");
  assert.equal(offlineTranslate("CAN总线错误"), "CAN bus error");
  assert.equal(offlineTranslate("低功耗唤醒源"), "low power wake up source");
});

test("formats embedded acronyms as code identifiers", () => {
  assert.equal(formatName(offlineTranslate("串口接收缓冲区"), "camelCase"), "uartReceiveBuffer");
  assert.equal(formatName(offlineTranslate("模数转换器采样值"), "snake_case"), "adc_sample_value");
  assert.equal(formatName(offlineTranslate("实时操作系统任务"), "PascalCase"), "RtosTask");
  assert.equal(formatName(offlineTranslate("CANFD总线状态"), "camelCase"), "canFdBusStatus");
});

test("infers Hungarian types from TypeScript and values", () => {
  assert.equal(inferHungarianType("const 用户名: string = getName();", "用户名"), "string");
  assert.equal(inferHungarianType("const 是否成功 = true;", "是否成功"), "boolean");
  assert.equal(inferHungarianType("const 用户列表: User[] = [];", "用户列表"), "array");
  assert.equal(inferHungarianType("const 数量 = 42;", "数量"), "number");
});

test("infers embedded Hungarian types from C and C++ declarations", () => {
  assert.equal(inferHungarianType("uint8_t 接收缓冲区[64];", "接收缓冲区"), "uint8");
  assert.equal(inferHungarianType("volatile uint16_t ADC采样值;", "ADC采样值"), "uint16");
  assert.equal(inferHungarianType("int32_t 编码器计数 = 0;", "编码器计数"), "int32");
  assert.equal(inferHungarianType("float 温度 = 0.0f;", "温度"), "float32");
  assert.equal(inferHungarianType("double 电池电压;", "电池电压"), "float64");
  assert.equal(inferHungarianType("uint8_t *接收指针;", "接收指针"), "pointer");
  assert.equal(inferHungarianType("DeviceConfig_t *设备配置;", "设备配置"), "structPointer");
  assert.equal(inferHungarianType("DeviceConfig_t 设备配置;", "设备配置"), "struct");
  assert.equal(inferHungarianType("UART_HandleTypeDef *串口句柄;", "串口句柄"), "handle");
  assert.equal(inferHungarianType("enum MotorState 电机状态;", "电机状态"), "enum");
});

test("formats embedded Hungarian names with inferred prefixes", () => {
  const cases: Array<[string, string, string]> = [
    ["uint8_t 接收缓冲区[64];", "接收缓冲区", "u8ReceiveBuffer"],
    ["uint16_t ADC采样值;", "ADC采样值", "u16AdcSampleValue"],
    ["int32_t 编码器计数;", "编码器计数", "s32EncoderCount"],
    ["float 温度;", "温度", "f32Temperature"],
    ["DeviceConfig_t *设备配置;", "设备配置", "pstDeviceConfiguration"],
    ["UART_HandleTypeDef *串口句柄;", "串口句柄", "hUartHandle"]
  ];

  for (const [line, chinese, expected] of cases) {
    const type = inferHungarianType(line, chinese);
    assert.equal(formatName(offlineTranslate(chinese), "Hungarian", DEFAULT_PREFIXES[type]), expected);
  }
});
