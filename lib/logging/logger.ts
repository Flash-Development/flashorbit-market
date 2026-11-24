import "server-only";
import { randomUUID } from "node:crypto";

type LogLevel = "debug" | "info" | "warn" | "error";
type LogFields = Record<string, unknown>;

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configuredLevel = (process.env.LOG_LEVEL?.toLowerCase() ?? "info");
const minimumLevel =
  configuredLevel in levelPriority
    ? levelPriority[configuredLevel as LogLevel]
    : levelPriority.info;

const sensitiveKeyPattern =
  /^(authorization|cookie|password|secret|token|api[_-]?key|session|email)$/i;

function redact(value: unknown, seen = new WeakSet<object>): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      code: "code" in value ? String(value.code) : undefined,
      ...(process.env.NODE_ENV !== "production" && value.stack
        ? { stack: value.stack }
        : {}),
    };
  }
  if (typeof value !== "object" || value === null) return value;
  if (seen.has(value)) return "[Circular]";
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => redact(item, seen));
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      sensitiveKeyPattern.test(key) ? "[REDACTED]" : redact(item, seen),
    ]),
  );
}

function write(level: LogLevel, event: string, fields: LogFields = {}) {
  if (levelPriority[level] < minimumLevel) return;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: "flash",
    event,
    ...redact(fields) as LogFields,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.info(line);
  }
}

export function getRequestId(request?: Request) {
  const headerId = request?.headers.get("x-request-id")?.trim();
  return headerId || randomUUID();
}

export function createLogger(fields: LogFields = {}) {
  const context = redact(fields) as LogFields;
  return {
    debug: (event: string, data: LogFields = {}) =>
      write("debug", event, { ...context, ...redact(data) as LogFields }),
    info: (event: string, data: LogFields = {}) =>
      write("info", event, { ...context, ...redact(data) as LogFields }),
    warn: (event: string, data: LogFields = {}) =>
      write("warn", event, { ...context, ...redact(data) as LogFields }),
    error: (event: string, data: LogFields = {}) =>
      write("error", event, { ...context, ...redact(data) as LogFields }),
  };
}
