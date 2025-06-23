const puppeteer = require('puppeteer');
const { marked } = require('marked');
const logger = require('./logger');

class PDFConverter {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    if (!this.browser) {
      logger.info('Initializing Puppeteer browser');
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Browser closed');
    }
  }

  sanitizeMarkdown(markdown) {
    // Basic sanitization to prevent injection attacks
    return markdown.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  generateHTML(markdownContent, options = {}) {
    const sanitizedMarkdown = this.sanitizeMarkdown(markdownContent);
    const htmlContent = marked(sanitizedMarkdown);
    
    const {
      headerTemplate = '',
      footerTemplate = `
        <div style="font-size: 10px; text-align: center; width: 100%; margin: 0 10px;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
      includePageNumbers = true
    } = options;

    const pageNumbersCSS = includePageNumbers ? `
      @page {
        @bottom-center {
          content: counter(page) " / " counter(pages);
        }
      }
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: none;
              margin: 0;
              padding: 20px;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 1.5em;
              margin-bottom: 0.5em;
              font-weight: 600;
            }
            h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
            h2 { font-size: 1.5em; }
            h3 { font-size: 1.25em; }
            code {
              background-color: #f6f8fa;
              padding: 0.2em 0.4em;
              border-radius: 3px;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            }
            pre {
              background-color: #f6f8fa;
              padding: 16px;
              border-radius: 6px;
              overflow-x: auto;
            }
            pre code {
              background-color: transparent;
              padding: 0;
            }
            blockquote {
              border-left: 4px solid #dfe2e5;
              padding-left: 16px;
              margin-left: 0;
              color: #6a737d;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1em 0;
            }
            th, td {
              border: 1px solid #dfe2e5;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f6f8fa;
              font-weight: 600;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            a {
              color: #0366d6;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
            ${pageNumbersCSS}
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;
  }

  parsePageRange(pages) {
    if (!pages) return null;
    
    if (typeof pages === 'string') {
      pages = [pages];
    }
    
    const pageNumbers = new Set();
    
    for (const range of pages) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start)) {
          if (isNaN(end)) {
            // Range like "5-" means from 5 to end
            for (let i = start; i <= 1000; i++) { // Assuming max 1000 pages
              pageNumbers.add(i);
            }
          } else {
            for (let i = start; i <= end; i++) {
              pageNumbers.add(i);
            }
          }
        }
      } else {
        const pageNum = parseInt(range.trim());
        if (!isNaN(pageNum)) {
          pageNumbers.add(pageNum);
        }
      }
    }
    
    return Array.from(pageNumbers).sort((a, b) => a - b).join(',');
  }

  async convertToPDF(markdownContent, options = {}) {
    try {
      logger.info('Starting PDF conversion');
      
      const browser = await this.initialize();
      const page = await browser.newPage();
      
      const {
        format = 'A4',
        landscape = false,
        margin = { top: '1in', right: '1in', bottom: '1in', left: '1in' },
        headerTemplate = '',
        footerTemplate = `
          <div style="font-size: 10px; text-align: center; width: 100%; margin: 0 10px;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        `,
        includePageNumbers = true,
        pages
      } = options;

      const html = this.generateHTML(markdownContent, options);
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfOptions = {
        format,
        landscape,
        margin,
        printBackground: true,
        preferCSSPageSize: true
      };

      if (includePageNumbers && (headerTemplate || footerTemplate)) {
        pdfOptions.displayHeaderFooter = true;
        pdfOptions.headerTemplate = headerTemplate;
        pdfOptions.footerTemplate = footerTemplate;
      }

      const pageRange = this.parsePageRange(pages);
      if (pageRange) {
        pdfOptions.pageRanges = pageRange;
      }

      const pdfBuffer = await page.pdf(pdfOptions);
      
      await page.close();
      
      logger.info('PDF conversion completed successfully');
      return pdfBuffer;
      
    } catch (error) {
      logger.error('PDF conversion failed:', error);
      throw new Error(`PDF conversion failed: ${error.message}`);
    }
  }
}

module.exports = new PDFConverter();