declare module 'markdown-to-pdf-service' {
  export interface ConversionOptions {
    /** Output filename for the PDF */
    fileName?: string;
    /** Page format (A4, A3, A5, Legal, Letter, Tabloid) */
    format?: 'A4' | 'A3' | 'A5' | 'Legal' | 'Letter' | 'Tabloid';
    /** Landscape orientation */
    landscape?: boolean;
    /** Page margins */
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    /** HTML template for header */
    headerTemplate?: string;
    /** HTML template for footer */
    footerTemplate?: string;
    /** Include page numbers */
    includePageNumbers?: boolean;
    /** Page ranges to include (e.g., "1-5", ["1", "3", "5-7"]) */
    pages?: string | string[];
  }

  export interface ValidationData {
    markdownContent: string;
    options?: ConversionOptions;
  }

  /**
   * Simple function to convert markdown to PDF
   * @param markdownContent The markdown content to convert
   * @param options Conversion options
   * @returns Promise that resolves to PDF buffer
   */
  export function convertMarkdownToPDF(
    markdownContent: string,
    options?: ConversionOptions
  ): Promise<Buffer>;

  /**
   * Converter class for more control over the conversion process
   */
  export class MarkdownToPDFConverter {
    constructor();

    /**
     * Initialize the converter (starts browser instance)
     */
    initialize(): Promise<void>;

    /**
     * Close the converter (closes browser instance)
     */
    close(): Promise<void>;

    /**
     * Convert markdown content to PDF
     * @param markdownContent The markdown content to convert
     * @param options Conversion options
     * @returns Promise that resolves to PDF buffer
     */
    convertToPDF(
      markdownContent: string,
      options?: ConversionOptions
    ): Promise<Buffer>;

    /**
     * Generate HTML from markdown content
     * @param markdownContent The markdown content to convert
     * @param options Generation options
     * @returns HTML content
     */
    generateHTML(markdownContent: string, options?: ConversionOptions): string;

    /**
     * Validate conversion request
     * @param data Request data to validate
     * @returns Validated data
     */
    validateRequest(data: ValidationData): ValidationData;
  }

  // Legacy exports
  export const PDFConverter: any;
  export function validateConvertRequest(data: ValidationData): ValidationData;
  export const logger: any;

  // Default export
  const defaultExport: typeof convertMarkdownToPDF;
  export default defaultExport;
}