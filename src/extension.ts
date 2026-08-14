import * as vscode from "vscode";
import {
  DEFAULT_PREFIXES,
  formatName,
  HungarianType,
  inferHungarianType,
  NamingStyle,
  NAMING_STYLES
} from "./core";
import { translate, TranslationOptions, TranslationProvider } from "./translation";

interface Target {
  range: vscode.Range;
  text: string;
  lineText: string;
}

interface StyleItem extends vscode.QuickPickItem {
  style: NamingStyle;
}

const STYLE_LABELS: Record<NamingStyle, { label: string; description: string }> = {
  camelCase: { label: "camelCase", description: "userName" },
  PascalCase: { label: "PascalCase", description: "UserName" },
  snake_case: { label: "snake_case", description: "user_name" },
  UPPER_SNAKE_CASE: { label: "UPPER_SNAKE_CASE", description: "USER_NAME" },
  "kebab-case": { label: "kebab-case", description: "user-name" },
  Hungarian: { label: "匈牙利命名法", description: "strUserName（转换时选择或推断类型）" }
};

const TYPE_LABELS: Array<{ type: HungarianType; label: string; description: string }> = [
  { type: "auto", label: "自动推断", description: "根据类型标注或赋值推断" },
  { type: "string", label: "字符串", description: "str" },
  { type: "number", label: "数字", description: "n" },
  { type: "boolean", label: "布尔值", description: "b" },
  { type: "array", label: "数组", description: "arr" },
  { type: "object", label: "对象", description: "obj" },
  { type: "function", label: "函数", description: "fn" },
  { type: "promise", label: "Promise", description: "p" },
  { type: "element", label: "DOM 元素", description: "el" },
  { type: "map", label: "Map", description: "map" },
  { type: "set", label: "Set", description: "set" },
  { type: "date", label: "日期", description: "dt" },
  { type: "uint8", label: "无符号 8 位整数", description: "u8" },
  { type: "uint16", label: "无符号 16 位整数", description: "u16" },
  { type: "uint32", label: "无符号 32 位整数", description: "u32" },
  { type: "uint64", label: "无符号 64 位整数", description: "u64" },
  { type: "int8", label: "有符号 8 位整数", description: "s8" },
  { type: "int16", label: "有符号 16 位整数", description: "s16" },
  { type: "int32", label: "有符号 32 位整数", description: "s32" },
  { type: "int64", label: "有符号 64 位整数", description: "s64" },
  { type: "float32", label: "32 位浮点数", description: "f32" },
  { type: "float64", label: "64 位浮点数", description: "f64" },
  { type: "pointer", label: "普通指针", description: "p" },
  { type: "struct", label: "结构体", description: "st" },
  { type: "structPointer", label: "结构体指针", description: "pst" },
  { type: "handle", label: "外设/任务句柄", description: "h" },
  { type: "enum", label: "枚举", description: "e" },
  { type: "unknown", label: "其他/未知", description: "v" }
];

function configuration(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration("chineseNameConverter");
}

function collectTargets(editor: vscode.TextEditor): Target[] {
  const document = editor.document;
  return editor.selections.map((selection) => {
    let range = new vscode.Range(selection.start, selection.end);
    if (selection.isEmpty) {
      range = document.getWordRangeAtPosition(
        selection.active,
        /[\p{L}\p{N}_$\-]+/u
      ) ?? range;
    }
    return {
      range,
      text: document.getText(range),
      lineText: document.lineAt(range.start.line).text
    };
  }).filter((target) => target.text.trim().length > 0);
}

async function pickStyle(): Promise<NamingStyle | undefined> {
  const currentStyle = configuration().get<NamingStyle>("defaultStyle", "camelCase");
  const items: StyleItem[] = NAMING_STYLES.map((style) => ({
    style,
    label: `${style === currentStyle ? "$(check) " : ""}${STYLE_LABELS[style].label}`,
    description: STYLE_LABELS[style].description
  }));
  return (await vscode.window.showQuickPick(items, {
    title: "选择并保存英文命名风格",
    placeHolder: "后续按 Tab 将一直使用这个风格，直到再次修改"
  }))?.style;
}

async function pickHungarianType(): Promise<HungarianType | undefined> {
  return (await vscode.window.showQuickPick(TYPE_LABELS, {
    title: "选择匈牙利命名法的变量类型",
    placeHolder: "类型决定名称前缀"
  }))?.type;
}

function getTranslationOptions(): TranslationOptions {
  const config = configuration();
  return {
    provider: config.get<TranslationProvider>("translationProvider", "myMemory"),
    libreEndpoint: config.get<string>("libreTranslate.endpoint", "http://localhost:5000/translate"),
    libreApiKey: config.get<string>("libreTranslate.apiKey", ""),
    fallbackToOffline: config.get<boolean>("fallbackToOffline", true)
  };
}

function getPrefix(type: HungarianType, target: Target): string {
  const config = configuration();
  const configuredPrefixes = config.get<Record<string, string>>("hungarian.prefixes", {});
  const resolvedType = type === "auto" ? inferHungarianType(target.lineText, target.text) : type;
  return configuredPrefixes[resolvedType] ?? DEFAULT_PREFIXES[resolvedType] ?? DEFAULT_PREFIXES.unknown;
}

async function convert(styleOverride?: NamingStyle, hungarianTypeOverride?: HungarianType): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    void vscode.window.showInformationMessage("请先打开一个代码文件。");
    return;
  }

  const targets = collectTargets(editor);
  if (targets.length === 0) {
    void vscode.window.showInformationMessage("请选择中文，或将光标放在要转换的中文名称上。");
    return;
  }

  const config = configuration();
  const style = styleOverride ?? config.get<NamingStyle>("defaultStyle", "camelCase");
  const hungarianType = hungarianTypeOverride
    ?? config.get<HungarianType>("hungarian.defaultType", "auto");

  const translationOptions = getTranslationOptions();
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "正在转换中文名称…",
    cancellable: false
  }, async () => {
    try {
      const cache = new Map<string, Promise<{ text: string; usedFallback: boolean }>>();
      const translated = await Promise.all(targets.map((target) => {
        let pending = cache.get(target.text);
        if (!pending) {
          pending = translate(target.text, translationOptions);
          cache.set(target.text, pending);
        }
        return pending;
      }));

      let replacements = targets.map((target, index) => formatName(
        translated[index].text,
        style,
        style === "Hungarian" ? getPrefix(hungarianType, target) : undefined
      ));

      if (targets.length === 1 && config.get<boolean>("showPreview", false)) {
        const edited = await vscode.window.showInputBox({
          title: "确认英文名称",
          value: replacements[0],
          validateInput: (value) => value.trim() ? undefined : "名称不能为空"
        });
        if (edited === undefined) return;
        replacements = [edited.trim()];
      }

      const succeeded = await editor.edit((builder) => {
        targets.forEach((target, index) => builder.replace(target.range, replacements[index]));
      });
      if (!succeeded) throw new Error("编辑器未能应用替换");

      if (translated.some((item) => item.usedFallback)) {
        void vscode.window.showWarningMessage("在线翻译不可用，已使用内置开发词典完成转换。");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      void vscode.window.showErrorMessage(`中文名称转换失败：${message}`);
    }
  });
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("chineseNameConverter.convert", () => convert()),
    vscode.commands.registerCommand("chineseNameConverter.convertWithStyle", async () => {
      const style = await pickStyle();
      if (!style) return;

      let hungarianType: HungarianType | undefined;
      if (style === "Hungarian") {
        hungarianType = await pickHungarianType();
        if (!hungarianType) return;
      }

      await configuration().update("defaultStyle", style, vscode.ConfigurationTarget.Global);
      if (hungarianType) {
        await configuration().update("hungarian.defaultType", hungarianType, vscode.ConfigurationTarget.Global);
      }
      await convert(style, hungarianType);
    })
  );
}

export function deactivate(): void {}
