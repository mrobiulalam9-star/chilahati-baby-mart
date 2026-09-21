import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as XLSX from "xlsx";
import pdfmake from "pdfmake";
import { PDFParse } from "pdf-parse";

export const ALLOWED_EXTENSIONS = ["xlsx", "xls", "csv", "tsv", "pdf"] as const;
export const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_ROWS = 5000;
const MAX_COLS = 20;

export type ReportSource = "excel" | "pdf";

export type ReportResult = {
  filePath: string;
  filename: string;
  source: ReportSource;
  rows: number;
  columns: number;
  pages: number;
};

function pick(...files: string[]): string {
  return files.find((f) => fs.existsSync(f)) || files[0];
}

function setupPdfmake() {
  const fonts = {
    Arial: {
      normal: pick("C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/Arial.ttf"),
      bold: pick("C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/arial.ttf"),
      italics: pick("C:/Windows/Fonts/ariali.ttf", "C:/Windows/Fonts/arial.ttf"),
      bolditalics: pick("C:/Windows/Fonts/arialbi.ttf", "C:/Windows/Fonts/arial.ttf"),
    },
    Nirmala: {
      normal: pick("C:/Windows/Fonts/Nirmala.ttf"),
      bold: pick("C:/Windows/Fonts/NirmalaB.ttf", "C:/Windows/Fonts/Nirmala.ttf"),
      italics: pick("C:/Windows/Fonts/Nirmala.ttf"),
      bolditalics: pick("C:/Windows/Fonts/NirmalaB.ttf", "C:/Windows/Fonts/Nirmala.ttf"),
    },
  };
  pdfmake.setFonts(fonts);
  pdfmake.setLocalAccessPolicy(() => true);
  pdfmake.setUrlAccessPolicy(() => false);
}

export function getReportStorage(): { dir: string; file: string; filePath: string } {
  const dir = process.env.REPORT_DIR || path.join(os.homedir(), "Desktop");
  const file = process.env.REPORT_FILE || "রিপোর্ট.pdf";
  return { dir, file, filePath: path.join(dir, file) };
}

const hasNonAscii = (s: string): boolean => /[^\x00-\x7F]/.test(s);

function cellToString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return "";
    if (Number.isInteger(v) && Math.abs(v) < 1e15) return v.toLocaleString("en-IN");
    return String(v);
  }
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (v instanceof Date) return v.toLocaleDateString("en-GB");
  return String(v).replace(/\s+$/g, "");
}

function measureDisplayWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    w += ch.codePointAt(0) && ch.codePointAt(0)! > 0xff ? 1.35 : 1;
  }
  return w;
}

function textNode(value: string, opts?: { bold?: boolean; align?: "left" | "center" | "right" }) {
  const node: Record<string, unknown> = {
    text: value,
    ...(hasNonAscii(value) ? { font: "Nirmala" } : {}),
  };
  if (opts?.bold) node.bold = true;
  if (opts?.align && opts.align !== "left") node.alignment = opts.align;
  return node;
}

const GRID_LAYOUT = {
  hLineWidth: () => 0.6,
  vLineWidth: () => 0.6,
  hLineColor: () => "#d8c7c0",
  vLineColor: () => "#d8c7c0",
  paddingLeft: () => 6,
  paddingRight: () => 6,
  paddingTop: () => 4,
  paddingBottom: () => 4,
  fillColor: (rowIndex: number) =>
    rowIndex === 0 ? "#f3e3dd" : rowIndex % 2 === 0 ? "#fffaf7" : "#ffffff",
};

function baseDocument(content: unknown[]) {
  return {
    pageSize: "A4",
    pageMargins: [40, 50, 40, 55] as [number, number, number, number],
    defaultStyle: { font: "Arial", fontSize: 9, color: "#2b2623" },
    info: { title: "রিপোর্ট", author: "Chilahati Ladies and Baby Mart" },
    content,
    footer: (
      currentPage: number,
      pageCount: number
    ) => ({
      margin: [40, 6, 40, 6] as [number, number, number, number],
      columns: [
        { text: "চিলাহাটি লেডিস অ্যান্ড বেবি মার্ট", font: "Nirmala", fontSize: 7.5, color: "#a17662", alignment: "left" },
        { text: `Page ${currentPage} of ${pageCount}`, font: "Arial", fontSize: 7.5, color: "#a17662", alignment: "right" },
      ],
    }),
  };
}

function titleBlock(title: string, metaLines: string[]) {
  return [
    { text: title, fontSize: 17, bold: true, color: "#4e2f23" },
    { text: "রিপোর্ট", font: "Nirmala", fontSize: 13, color: "#8a6d62", margin: [0, 2, 0, 12] },
    { text: metaLines.join("   •   "), fontSize: 8.5, color: "#7a6a63", margin: [0, 0, 0, 12] },
  ];
}

function excelContent(buffer: Buffer, filename: string) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) throw new Error("The file contains no sheets.");

  const raw = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    raw: false,
    defval: "",
  });

  let matrix = raw
    .filter((row) => Array.isArray(row) && row.some((c) => String(c ?? "").trim() !== ""))
    .map((row) => row.map((c) => cellToString(c)));

  if (matrix.length === 0) {
    return {
      content: [{ text: "The selected sheet is empty.", fontSize: 10, margin: [0, 6, 0, 0] }],
      rows: 0,
      columns: 0,
    };
  }

  const columnCount = Math.min(Math.max(...matrix.map((r) => r.length)), MAX_COLS);
  matrix = matrix.map((row) => {
    const padded = Array.from({ length: columnCount }, (_, i) => row[i] ?? "");
    return padded.slice(0, columnCount);
  });

  const headers = matrix[0];
  const headersFilled = headers.some((h) => h.trim() !== "");
  const headerRow = headersFilled
    ? headers.map((h) => (h.trim() === "" ? "—" : h))
    : headers.map((_, i) => `Column ${i + 1}`);
  const dataRows = headersFilled ? matrix.slice(1) : matrix;

  const totalRows = dataRows.length;
  const truncated = totalRows > MAX_ROWS;
  const rows = dataRows.slice(0, MAX_ROWS);

  const maxW = Array.from({ length: columnCount }, () => 0);
  headerRow.forEach((h, i) => {
    maxW[i] = Math.max(maxW[i], measureDisplayWidth(h));
  });
  for (const row of rows) {
    row.forEach((c, i) => {
      if (i < columnCount) maxW[i] = Math.max(maxW[i], measureDisplayWidth(c));
    });
  }

  const usableWidth = 595.28 - 80;
  const PADDING = 12;
  const rawWidths = maxW.map((w) => Math.min(Math.max(w, 6), 48) * 5.2 + PADDING);
  let widths = rawWidths;
  const totalWidth = rawWidths.reduce((a, b) => a + b, 0);
  if (totalWidth > usableWidth) {
    const scale = usableWidth / totalWidth;
    widths = rawWidths.map((w) => Math.max(20, Math.round(w * scale)));
  }

  const body: unknown[] = [headerRow.map((h) => textNode(h, { bold: true }))];
  for (const row of rows) {
    body.push(row.map((c) => textNode(c)));
  }

  return {
    content: [
      {
        table: {
          headerRows: 1,
          widths,
          body,
          layout: GRID_LAYOUT,
        },
        margin: [0, 4, 0, 0],
      },
    ],
    rows: totalRows,
    columns: columnCount,
    sheetName,
    truncated,
  };
}

async function pdfContent(buffer: Buffer, filename: string) {
  const parser = new PDFParse({ data: buffer });
  let pageTexts: string[] = [];
  try {
    const result = await parser.getText();
    pageTexts = result.pages.map((p) => p.text.trim());
  } finally {
    await parser.destroy();
  }

  const content: unknown[] = [];
  let printed = false;
  pageTexts.forEach((text, i) => {
    if (!text) return;
    printed = true;
    content.push({
      text: `Page ${i + 1}`, fontSize: 10.5, bold: true, color: "#7a5c4e",
      margin: [0, i === 0 ? 4 : 14, 0, 3] as [number, number, number, number],
    });
    content.push({
      text,
      font: "Nirmala",
      fontSize: 8.2,
      preserveLeadingSpaces: true,
      lineHeight: 1.3,
      margin: [0, 0, 0, 4],
    });
  });

  if (!printed) {
    content.push({ text: "No readable text was found in this PDF.", fontSize: 10, margin: [0, 6, 0, 0] });
  }
  return { content, pages: pageTexts.filter((t) => t).length || 0 };
}

async function countPdfPages(buffer: Buffer): Promise<number> {
  try {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.total;
    } finally {
      await parser.destroy();
    }
  } catch {
    return 0;
  }
}

async function renderPdf(docDefinition: Record<string, unknown>): Promise<Buffer> {
  setupPdfmake();
  const doc = pdfmake.createPdf(docDefinition);
  return await doc.getBuffer();
}

export async function generateReport(
  fileBuffer: Buffer,
  originalName: string
): Promise<ReportResult> {
  const extension = (originalName.split(".").pop() || "").toLowerCase();
  const storage = getReportStorage();
  const baseName = path.basename(originalName, path.extname(originalName));

  const generatedAt = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let content: unknown[];
  let source: ReportSource;
  let rows = 0;
  let columns = 0;
  let pages = 0;

  if (extension === "pdf") {
    source = "pdf";
    const extracted = await pdfContent(fileBuffer, originalName);
    content = [
      ...titleBlock(
        baseName || "PDF Document",
        [`Source file: ${originalName}`, `Pages: ${extracted.pages}`, `Generated: ${generatedAt}`]
      ),
      ...extracted.content,
    ];
    rows = 0;
    columns = 0;
    pages = extracted.pages;
  } else {
    source = "excel";
    const table = excelContent(fileBuffer, originalName);
    rows = table.rows;
    columns = table.columns;
    const metaLines = [
      `Source file: ${originalName}`,
      `Sheet: ${table.sheetName ?? "Sheet1"}`,
      `Rows: ${table.rows}${table.truncated ? ` (showing first ${MAX_ROWS})` : ""}`,
      `Columns: ${table.columns}`,
      `Generated: ${generatedAt}`,
    ];
    content = [...titleBlock(baseName || "Spreadsheet", metaLines), ...table.content];
  }

  if (!fs.existsSync(storage.dir)) {
    fs.mkdirSync(storage.dir, { recursive: true });
  }

  const docDefinition = baseDocument(content);
  const buffer = await renderPdf(docDefinition);
  if (source === "excel") {
    pages = await countPdfPages(buffer);
  }
  fs.writeFileSync(storage.filePath, buffer);

  return {
    filePath: storage.filePath,
    filename: storage.file,
    source,
    rows,
    columns,
    pages,
  };
}