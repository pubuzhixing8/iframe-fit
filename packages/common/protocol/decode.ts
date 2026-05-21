import { MESSAGE_PREFIX } from "./constants";
import type { Envelope } from "./types";

export function decodeMessage<T = unknown>(data: unknown): Envelope<T> | null {
  if (typeof data !== "string" || !data.startsWith(MESSAGE_PREFIX)) {
    console.log("ignored message format");
    return null;
  }

  try {
    return JSON.parse(data.slice(MESSAGE_PREFIX.length)) as Envelope<T>;
  } catch {
    return null;
  }
}
