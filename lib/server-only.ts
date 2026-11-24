export function serverOnly(message = "Server-only module imported into client code.") {
  if (typeof window !== "undefined") {
    throw new Error(message);
  }
}
