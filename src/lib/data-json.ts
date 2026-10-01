import fs from "fs";

/**
 * Reads and parses a JSON file, tolerating a UTF-8 BOM and surrounding
 * whitespace. Windows editors (Notepad, PowerShell, Excel) frequently write
 * a BOM, which makes a bare JSON.parse throw — and callers that swallow that
 * error would silently treat all records as absent.
 *
 * Returns `fallback` if the file is missing or unparseable.
 */
export function readJsonFile<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, "utf-8").replace(/^\uFEFF/, "").trim();
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
