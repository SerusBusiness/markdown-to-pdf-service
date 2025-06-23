# Markdown to PDF Service

A robust, production-ready **library and microservice** for converting Markdown content to PDF files. Supports both programmatic library usage, API, and CLI with extensive customization options.

## 🚀 Installation

### As a Library (NPM Package)

```bash
npm install markdown-to-pdf-service
```

### For Development/Microservice

```bash
git clone <repository-url>
cd markdown-to-pdf-service
npm install
```

## 📚 Library Usage

### Simple Usage

```javascript
const { convertMarkdownToPDF } = require('markdown-to-pdf-service');

async function example() {
  const markdownContent = `
# Hello World

This is a **simple example** of converting markdown to PDF.

## Features
- Easy to use
- High quality output
- Supports [links](https://example.com)
  `;

  try {
    const pdfBuffer = await convertMarkdownToPDF(markdownContent);
    
    // Save to file
    require('fs').writeFileSync('output.pdf', pdfBuffer);
    console.log('PDF created successfully!');
  } catch (error) {
    console.error('Conversion failed:', error);
  }
}
```

### Advanced Usage with Options

```javascript
const { convertMarkdownToPDF } = require('markdown-to-pdf-service');

async function advancedExample() {
  const markdownContent = `# Technical Report
  
## Executive Summary
This document demonstrates advanced PDF generation.
  `;

  const options = {
    format: 'A4',
    landscape: false,
    includePageNumbers: true,
    headerTemplate: '<div style="text-align: center;">Confidential Report</div>',
    footerTemplate: '<div style="text-align: center;">Page <span class="pageNumber"></span></div>',
    margin: {
      top: '1.5in',
      right: '1in',
      bottom: '1.5in',
      left: '1in'
    }
  };

  const pdfBuffer = await convertMarkdownToPDF(markdownContent, options);
  require('fs').writeFileSync('report.pdf', pdfBuffer);
}
```

### Using the Converter Class (for Multiple Conversions)

```javascript
const { MarkdownToPDFConverter } = require('markdown-to-pdf-service');

async function multipleConversions() {
  const converter = new MarkdownToPDFConverter();
  
  try {
    // Initialize once for multiple conversions (more efficient)
    await converter.initialize();
    
    const documents = [
      '# Document 1\n\nContent for first document',
      '# Document 2\n\nContent for second document',
      '# Document 3\n\nContent for third document'
    ];
    
    for (let i = 0; i < documents.length; i++) {
      const pdfBuffer = await converter.convertToPDF(documents[i]);
      require('fs').writeFileSync(`document-${i + 1}.pdf`, pdfBuffer);
    }
    
    console.log('All documents converted!');
  } finally {
    // Always close the converter when done
    await converter.close();
  }
}
```

### TypeScript Support

```typescript
import { convertMarkdownToPDF, MarkdownToPDFConverter, ConversionOptions } from 'markdown-to-pdf-service';

async function typescriptExample(): Promise<void> {
  const options: ConversionOptions = {
    format: 'A4',
    landscape: false,
    includePageNumbers: true
  };

  const pdfBuffer = await convertMarkdownToPDF('# Hello TypeScript', options);
  // Handle the PDF buffer...
}
```

### API Reference

#### `convertMarkdownToPDF(markdownContent, options?)`

Simple function for one-off conversions.

**Parameters:**
- `markdownContent` (string): The markdown content to convert
- `options` (object, optional): Conversion options

**Returns:** `Promise<Buffer>` - PDF buffer

#### `MarkdownToPDFConverter`

Class for managing multiple conversions efficiently.

**Methods:**
- `initialize()`: Initialize the converter (starts browser)
- `convertToPDF(markdownContent, options?)`: Convert markdown to PDF
- `generateHTML(markdownContent, options?)`: Generate HTML only
- `close()`: Close the converter (stops browser)

#### Conversion Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fileName` | string | "document.pdf" | Output filename |
| `format` | string | "A4" | Page format (A4, A3, A5, Legal, Letter, Tabloid) |
| `landscape` | boolean | false | Landscape orientation |
| `includePageNumbers` | boolean | true | Include page numbers |
| `margin` | object | 1in all sides | Page margins |
| `headerTemplate` | string | "" | HTML template for header |
| `footerTemplate` | string | default | HTML template for footer |
| `pages` | string/array | all | Page ranges (e.g., "1-5", ["1", "3"]) |

## 🌐 Microservice API Usage

### Quick Start with Docker

```bash
# Start the service
docker-compose up -d

# Test the service
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"markdownContent": "# Hello World\n\nThis is **bold** text."}' \
  --output test.pdf
```

### Local Development

```bash
npm install
npm start  # or npm run dev for development mode
```

### API Endpoints

- `GET /` - API documentation
- `GET /health` - Health check
- `POST /convert` - Convert markdown content to PDF
- `POST /convert/file` - Convert markdown file to PDF

### Convert Markdown Content

**POST** `/convert`

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{
    "markdownContent": "# Sample Document\n\nThis is a **test**.",
    "options": {
      "fileName": "sample.pdf",
      "format": "A4",
      "includePageNumbers": true
    }
  }' \
  --output sample.pdf
```

### Convert Markdown File

**POST** `/convert/file`

```bash
curl -X POST http://localhost:3000/convert/file \
  -F "markdown=@document.md" \
  -F "format=A4" \
  --output document.pdf
```

## 💻 CLI Usage

### Installation

```bash
# Install globally
npm install -g markdown-to-pdf-service

# Or use npx
npx markdown-to-pdf-service
```

### Basic Usage

```bash
# Convert file to PDF
md2pdf document.md

# Convert with custom output
md2pdf document.md -o output.pdf

# Convert markdown string directly
md2pdf "# Hello World\nThis is **bold** text."
```

### Advanced CLI Options

```bash
# Custom format and orientation
md2pdf document.md --format A3 --landscape

# Page ranges
md2pdf document.md --pages "1-5,7,10-"

# Custom margins
md2pdf document.md --margin-top 2in --margin-bottom 2in

# Disable page numbers
md2pdf document.md --no-page-numbers
```

## 🔧 Features

- ✅ **High-quality PDF generation** using Puppeteer and Chromium
- 📚 **Library and API modes** - use as npm package or microservice
- 🔗 **Preserves links** (internal and external references)
- 🖼️ **Base64 image rendering** support
- 📄 **Configurable page numbering** with custom styles
- 🎨 **Custom headers and footers** with HTML templates
- 📐 **Multiple page formats** (A4, A3, A5, Legal, Letter, Tabloid)
- 🔄 **Page range selection** (e.g., "1-5", "7", "10-")
- 💻 **CLI tool** for offline/batch processing
- 🐳 **Docker support** for easy deployment
- 🔒 **Security-focused** with input sanitization
- 📊 **Comprehensive logging** with Winston
- ⚡ **Performance optimized** for production use
- 🟦 **TypeScript support** with type definitions

## 📁 Examples

Run the included examples:

```bash
# Library usage examples
node examples/library-usage.js

# API testing
node examples/api-test.js
```

## 🐳 Docker Deployment

```bash
# Production deployment
docker-compose up -d

# Build and run manually
docker build -t markdown-to-pdf-service .
docker run -p 3000:3000 markdown-to-pdf-service
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

### Project Structure

```
markdown-to-pdf-service/
├── index.js            # Main library entry point
├── index.d.ts          # TypeScript definitions
├── src/
│   ├── cli.js          # CLI application
│   ├── converter.js    # PDF conversion logic
│   ├── logger.js       # Winston logging
│   ├── server.js       # Express API server
│   └── validation.js   # Input validation
├── examples/           # Usage examples
├── package.json        # NPM configuration
└── README.md          # This file
```

## 📦 Publishing to NPM

To publish this package to NPM:

1. **Update package.json**: Set your repository URLs and author information
2. **Create NPM account**: Sign up at [npmjs.com](https://npmjs.com)
3. **Login to NPM**: `npm login`
4. **Publish**: `npm publish`

```bash
# First time publishing
npm publish

# Publishing updates
npm version patch  # or minor/major
npm publish
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 Check the [examples](examples/) directory for usage patterns
- 🐛 Report issues on GitHub
- 💬 Read the API documentation at `GET /` endpoint when running the service

---

**Made with ❤️ for the developer community**