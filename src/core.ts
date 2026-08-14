export const NAMING_STYLES = [
  "camelCase",
  "PascalCase",
  "snake_case",
  "UPPER_SNAKE_CASE",
  "kebab-case",
  "Hungarian"
] as const;

export type NamingStyle = (typeof NAMING_STYLES)[number];

export const HUNGARIAN_TYPES = [
  "auto",
  "string",
  "number",
  "boolean",
  "array",
  "object",
  "function",
  "promise",
  "element",
  "map",
  "set",
  "date",
  "uint8",
  "uint16",
  "uint32",
  "uint64",
  "int8",
  "int16",
  "int32",
  "int64",
  "float32",
  "float64",
  "pointer",
  "struct",
  "structPointer",
  "handle",
  "enum",
  "unknown"
] as const;

export type HungarianType = (typeof HUNGARIAN_TYPES)[number];

export const DEFAULT_PREFIXES: Record<string, string> = {
  string: "str",
  number: "n",
  boolean: "b",
  array: "arr",
  object: "obj",
  function: "fn",
  promise: "p",
  element: "el",
  map: "map",
  set: "set",
  date: "dt",
  uint8: "u8",
  uint16: "u16",
  uint32: "u32",
  uint64: "u64",
  int8: "s8",
  int16: "s16",
  int32: "s32",
  int64: "s64",
  float32: "f32",
  float64: "f64",
  pointer: "p",
  struct: "st",
  structPointer: "pst",
  handle: "h",
  enum: "e",
  unknown: "v"
};

const RESERVED_WORDS = new Set([
  "await", "break", "case", "catch", "class", "const", "continue", "debugger",
  "default", "delete", "do", "else", "enum", "export", "extends", "false",
  "finally", "for", "function", "if", "implements", "import", "in", "instanceof",
  "interface", "let", "new", "null", "package", "private", "protected", "public",
  "return", "static", "super", "switch", "this", "throw", "true", "try", "typeof",
  "undefined", "var", "void", "while", "with", "yield"
]);

export function splitIntoWords(value: string): string[] {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

  return (normalized.match(/[A-Za-z]+|\d+/g) ?? []).map((part) => part.toLowerCase());
}

function upperFirst(value: string): string {
  return value.length === 0 ? value : value[0].toUpperCase() + value.slice(1);
}

function safeIdentifier(value: string): string {
  let result = value || "value";
  if (/^\d/.test(result)) {
    result = `_${result}`;
  }
  if (RESERVED_WORDS.has(result)) {
    result = `${result}Value`;
  }
  return result;
}

export function formatName(
  translatedText: string,
  style: NamingStyle,
  hungarianPrefix = DEFAULT_PREFIXES.unknown
): string {
  const words = splitIntoWords(translatedText);
  if (words.length === 0) {
    return "value";
  }

  const camel = words[0] + words.slice(1).map(upperFirst).join("");
  const pascal = words.map(upperFirst).join("");

  switch (style) {
    case "camelCase":
      return safeIdentifier(camel);
    case "PascalCase":
      return safeIdentifier(pascal);
    case "snake_case":
      return safeIdentifier(words.join("_"));
    case "UPPER_SNAKE_CASE":
      return safeIdentifier(words.join("_").toUpperCase());
    case "kebab-case":
      return words.join("-");
    case "Hungarian":
      return safeIdentifier(`${hungarianPrefix}${pascal}`);
  }
}

export function inferHungarianType(lineText: string, selectedText: string): HungarianType {
  const escaped = selectedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nearName = escaped ? `(?:${escaped}|[\\p{L}_$][\\p{L}\\p{N}_$]*)` : "[\\p{L}_$][\\p{L}\\p{N}_$]*";

  const selectedIndex = selectedText ? lineText.indexOf(selectedText) : -1;
  const beforeName = (selectedIndex >= 0 ? lineText.slice(0, selectedIndex) : lineText)
    .replace(/\/\*.*?\*\//g, " ")
    .trim();
  const cDeclaration = beforeName
    .slice(Math.max(beforeName.lastIndexOf(";"), beforeName.lastIndexOf("{"), beforeName.lastIndexOf("}")) + 1)
    .trim();

  // C/C++ 嵌入式类型。句柄和结构体指针需要先于普通指针判断。
  if (/\b(?:[A-Za-z_]\w*Handle(?:TypeDef|_t)?|[A-Za-z_]\w*_HandleTypeDef|Handle_t)\s*\**\s*$/i.test(cDeclaration)) return "handle";
  if (/\bstruct\s+[A-Za-z_]\w*\s*\*+\s*$/i.test(cDeclaration)
    || /\b[A-Za-z_]\w*(?:Config|Context|State|Info|Data|Descriptor|Device|Object)_t\s*\*+\s*$/i.test(cDeclaration)) return "structPointer";
  if (/\b(?:uint8_t|u8|unsigned\s+char)\b\s*(?:\[[^\]]*\])?\s*$/i.test(cDeclaration)) return "uint8";
  if (/\b(?:uint16_t|u16|unsigned\s+short(?:\s+int)?)\b\s*(?:\[[^\]]*\])?\s*$/i.test(cDeclaration)) return "uint16";
  if (/\b(?:uint32_t|u32|unsigned\s+(?:int|long(?:\s+int)?))\b\s*(?:\[[^\]]*\])?\s*$/i.test(cDeclaration)) return "uint32";
  if (/\b(?:uint64_t|u64|unsigned\s+(?:long\s+long|__int64)(?:\s+int)?)\b\s*(?:\[[^\]]*\])?\s*$/i.test(cDeclaration)) return "uint64";
  if (/\b(?:int8_t|s8|signed\s+char)\b\s*(?:\[[^\]]*\])?\s*$/i.test(cDeclaration)) return "int8";
  if (/\b(?:int16_t|s16|signed\s+short(?:\s+int)?|short(?:\s+int)?)\b\s*(?:\[[^\]]*\])?\s*$/i.test(cDeclaration)) return "int16";
  if (/\b(?:int32_t|s32|signed\s+(?:int|long(?:\s+int)?)|int|long)\b\s*(?:\[[^\]]*\])?\s*$/i.test(cDeclaration)) return "int32";
  if (/\b(?:int64_t|s64|signed\s+(?:long\s+long|__int64)(?:\s+int)?|long\s+long)\b\s*(?:\[[^\]]*\])?\s*$/i.test(cDeclaration)) return "int64";
  if (/\b(?:float32_t|float32|f32|float)\b\s*(?:\[[^\]]*\])?\s*$/i.test(cDeclaration)) return "float32";
  if (/\b(?:float64_t|float64|f64|double)\b\s*(?:\[[^\]]*\])?\s*$/i.test(cDeclaration)) return "float64";
  if (/\benum\s+[A-Za-z_]\w*\s*$/i.test(cDeclaration) || /\b[A-Za-z_]\w*(?:Enum|State|Mode)_t\s*$/i.test(cDeclaration)) return "enum";
  if (/\bstruct\s+[A-Za-z_]\w*\s*$/i.test(cDeclaration)) return "struct";
  if (/\*+\s*$/.test(cDeclaration)) return "pointer";
  if (/\b(?!u?int(?:8|16|32|64)_t\b)[A-Za-z_]\w*_t\s*$/i.test(cDeclaration)) return "struct";

  const annotation = lineText.match(new RegExp(`${nearName}\\s*:\\s*([^=;,]+)`, "iu"))?.[1]?.trim().toLowerCase() ?? "";
  const source = `${annotation} ${lineText.toLowerCase()}`;

  if (/\bpromise\s*</.test(source) || /\basync\b/.test(source)) return "promise";
  if (/\b(?:string)\b/.test(annotation) || /=\s*["'`]/.test(lineText)) return "string";
  if (/\b(?:boolean|bool)\b/.test(annotation) || /=\s*(?:true|false)\b/i.test(lineText)) return "boolean";
  if (/\b(?:number|int|integer|float|double|decimal)\b/.test(annotation) || /=\s*-?\d+(?:\.\d+)?\b/.test(lineText)) return "number";
  if (/\[\]|\barray\s*</.test(annotation) || /=\s*\[/.test(lineText)) return "array";
  if (/\bmap\s*</.test(source) || /new\s+map\b/i.test(lineText)) return "map";
  if (/\bset\s*</.test(source) || /new\s+set\b/i.test(lineText)) return "set";
  if (/\bdate\b/.test(source) || /new\s+date\b/i.test(lineText)) return "date";
  if (/\b(?:function|func|callback)\b/.test(annotation) || /(?:=>|=\s*function\b)/.test(lineText)) return "function";
  if (/\b(?:HTMLElement|Element|Node)\b/.test(lineText) || /document\.(?:querySelector|getElement)/.test(lineText)) return "element";
  if (/\b(?:object|record)\b/.test(annotation) || /=\s*\{/.test(lineText)) return "object";
  return "unknown";
}
