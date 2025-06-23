const PDFConverter = require('./src/converter');
const { validateConvertRequest } = require('./src/validation');
const logger = require('./src/logger');

/**
 * Markdown to PDF Converter Library
 * 
 * @example
 * const { convertMarkdownToPDF, MarkdownToPDFConverter } = require('markdown-to-pdf-service');
 * 
 * // Simple usage
 * const pdfBuffer = await convertMarkdownToPDF('# Hello World\n\nThis is **bold** text.');
 * 
 * // Advanced usage with options
 * const converter = new MarkdownToPDFConverter();
 * await converter.initialize();
 * const pdfBuffer = await converter.convertToPDF(markdownContent, {
 *   format: 'A4',
 *   landscape: false,
 *   includePageNumbers: true
 * });
 * await converter.close();
 */

/**
 * Simple function to convert markdown to PDF
 * @param {string} markdownContent - The markdown content to convert
 * @param {Object} options - Conversion options
 * @returns {Promise<Buffer>} PDF buffer
 */
async function convertMarkdownToPDF(markdownContent, options = {}) {
  const converter = new MarkdownToPDFConverter();
  try {
    await converter.initialize();
    return await converter.convertToPDF(markdownContent, options);
  } finally {
    await converter.close();
  }
}

/**
 * Converter class for more control over the conversion process
 */
class MarkdownToPDFConverter {
  constructor() {
    this.converter = PDFConverter;
  }

  /**
   * Initialize the converter (starts browser instance)
   * @returns {Promise<void>}
   */
  async initialize() {
    return await this.converter.initialize();
  }

  /**
   * Close the converter (closes browser instance)
   * @returns {Promise<void>}
   */
  async close() {
    return await this.converter.close();
  }

  /**
   * Convert markdown content to PDF
   * @param {string} markdownContent - The markdown content to convert
   * @param {Object} options - Conversion options
   * @param {string} [options.format='A4'] - Page format (A4, A3, A5, Legal, Letter, Tabloid)
   * @param {boolean} [options.landscape=false] - Landscape orientation
   * @param {Object} [options.margin] - Page margins
   * @param {string} [options.headerTemplate] - HTML template for header
   * @param {string} [options.footerTemplate] - HTML template for footer
   * @param {boolean} [options.includePageNumbers=true] - Include page numbers
   * @param {string|Array} [options.pages] - Page ranges to include
   * @returns {Promise<Buffer>} PDF buffer
   */
  async convertToPDF(markdownContent, options = {}) {
    return await this.converter.convertToPDF(markdownContent, options);
  }

  /**
   * Generate HTML from markdown content
   * @param {string} markdownContent - The markdown content to convert
   * @param {Object} options - Generation options
   * @returns {string} HTML content
   */
  generateHTML(markdownContent, options = {}) {
    return this.converter.generateHTML(markdownContent, options);
  }

  /**
   * Validate conversion request
   * @param {Object} data - Request data to validate
   * @returns {Object} Validated data
   */
  validateRequest(data) {
    return validateConvertRequest(data);
  }
}

// Export both the simple function and the class
module.exports = {
  convertMarkdownToPDF,
  MarkdownToPDFConverter,
  
  // Legacy exports for compatibility
  PDFConverter,
  validateConvertRequest,
  logger,
  
  // Default export is the simple function
  default: convertMarkdownToPDF
};