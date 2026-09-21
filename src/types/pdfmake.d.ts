declare module "pdfmake" {
  export interface PdfMakeFont {
    normal: string;
    bold?: string;
    italics?: string;
    bolditalics?: string;
  }

  export interface PdfMakeDocumentHandle {
    getBuffer(): Promise<Buffer>;
    getBase64(): Promise<string>;
    getDataUrl(): Promise<string>;
    write(filename: string): Promise<void>;
  }

  const pdfmake: {
    setFonts(fonts: Record<string, PdfMakeFont>): void;
    setUrlAccessPolicy(cb?: (url: string) => boolean): void;
    setLocalAccessPolicy(cb?: (path: string) => boolean): void;
    createPdf(
      docDefinition: Record<string, unknown>,
      options?: Record<string, unknown>
    ): PdfMakeDocumentHandle;
  };

  export default pdfmake;
}