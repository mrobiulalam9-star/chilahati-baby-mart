declare module "pdf-parse" {
  export interface PdfParsePage {
    num: number;
    text: string;
  }

  export interface PdfParseResult {
    pages: PdfParsePage[];
    text: string;
    total: number;
  }

  export class PDFParse {
    constructor(options: { data: Buffer | Uint8Array; verbosity?: number });
    load(): Promise<void>;
    getText(): Promise<PdfParseResult>;
    getInfo(): Promise<unknown>;
    destroy(): Promise<void>;
  }
}