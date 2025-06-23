# Markdown to PDF Service

A robust, production-ready microservice for converting Markdown content to PDF files. Supports both API and CLI usage with extensive customization options.

## Features

- ✅ **High-quality PDF generation** using Puppeteer and Chromium
- 🔗 **Preserves links** (internal and external references)
- 🖼️ **Base64 image rendering** support
- 📄 **Configurable page numbering** with custom styles
- 🎨 **Custom headers and footers** with HTML templates
- 📐 **Multiple page formats** (A4, A3, A5, Legal, Letter, Tabloid)
- 🔄 **Page range selection** (e.g., "1-5", "7", "10-")
- 🌐 **RESTful API** for online conversion
- 💻 **CLI tool** for offline/batch processing
- 🐳 **Docker support** for easy deployment
- 🔒 **Security-focused** with input sanitization
- 📊 **Comprehensive logging** with Winston
- ⚡ **Performance optimized** for production use

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd markdown-to-pdf-service

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
# Install dependencies
npm install

# Start the service
npm start

# Or start in development mode with auto-reload
npm run dev
```

## API Usage

### Endpoints

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
    "markdownContent": "# Sample Document\n\nThis is a **test** with [a link](https://example.com).",
    "options": {
      "fileName": "sample.pdf",
      "format": "A4",
      "includePageNumbers": true,
      "landscape": false,
      "margin": {
        "top": "1in",
        "right": "1in", 
        "bottom": "1in",
        "left": "1in"
      }
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
  -F "landscape=false" \
  --output document.pdf
```

### API Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fileName` | string | "document.pdf" | Output filename |
| `includePageNumbers` | boolean | true | Include page numbers |
| `pageNumberStyle` | string | "Arabic" | "Arabic", "Roman", "Alphabetic" |
| `format` | string | "A4" | "A4", "A3", "A5", "Legal", "Letter", "Tabloid" |
| `landscape` | boolean | false | Landscape orientation |
| `margin` | object | 1in all sides | Page margins |
| `headerTemplate` | string | "" | HTML template for header |
| `footerTemplate` | string | default | HTML template for footer |
| `pages` | string/array | all | Page ranges (e.g., "1-5", ["1", "3", "5-7"]) |

## CLI Usage

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

### Advanced Options

```bash
# Custom format and orientation
md2pdf document.md --format A3 --landscape

# Page ranges
md2pdf document.md --pages "1-5,7,10-"

# Custom margins
md2pdf document.md --margin-top 2in --margin-bottom 2in

# Disable page numbers
md2pdf document.md --no-page-numbers

# Output to stdout
md2pdf document.md -o - > output.pdf

# Verbose logging
md2pdf document.md --verbose
```

### CLI Options

| Option | Description | Example |
|--------|-------------|---------|
| `-o, --output <path>` | Output file path | `-o report.pdf` |
| `-f, --format <format>` | Page format | `--format A3` |
| `-l, --landscape` | Landscape orientation | `--landscape` |
| `--no-page-numbers` | Disable page numbers | `--no-page-numbers` |
| `-p, --pages <pages>` | Page ranges | `--pages "1-5,7"` |
| `--margin-*` | Set margins | `--margin-top 2in` |
| `--header <template>` | Header HTML | `--header "<h1>Title</h1>"` |
| `--footer <template>` | Footer HTML | `--footer "<p>Footer</p>"` |
| `--verbose` | Verbose logging | `--verbose` |

## Examples

### Base64 Images

```markdown
# Document with Image

![Logo](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==)

This image will be properly rendered in the PDF.
```

### Complex Document

```json
{
  "markdownContent": "# Technical Report\n\n## Executive Summary\n\nThis report covers...\n\n### Key Findings\n\n1. **Performance**: 99.9% uptime\n2. **Security**: Zero breaches\n3. **Cost**: 15% reduction\n\n## Detailed Analysis\n\n| Metric | Q1 | Q2 | Q3 | Q4 |\n|--------|----|----|----|----||\n| Revenue | $1M | $1.2M | $1.5M | $1.8M |\n| Users | 10K | 12K | 15K | 18K |\n\n> This is a blockquote with important information.\n\n```javascript\nconst result = await processData();\nconsole.log(result);\n```\n\nFor more information, visit [our website](https://example.com).",
  "options": {
    "fileName": "technical-report.pdf",
    "format": "A4",
    "includePageNumbers": true,
    "headerTemplate": "<div style='font-size: 10px; text-align: center; width: 100%;'>Technical Report - Confidential</div>",
    "footerTemplate": "<div style='font-size: 10px; text-align: center; width: 100%;'>Page <span class='pageNumber'></span> of <span class='totalPages'></span></div>",
    "margin": {
      "top": "1.5in",
      "right": "1in",
      "bottom": "1.5in", 
      "left": "1in"
    }
  }
}
```

## Docker Deployment

### Using Docker Compose

```bash
# Production deployment
docker-compose up -d

# With example testing
docker-compose --profile testing up

# View logs
docker-compose logs -f markdown-to-pdf-service
```

### Manual Docker Build

```bash
# Build image
docker build -t markdown-to-pdf-service .

# Run container
docker run -d \
  --name markdown-to-pdf \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e LOG_LEVEL=info \
  markdown-to-pdf-service
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment mode |
| `LOG_LEVEL` | info | Logging level |
| `ALLOWED_ORIGINS` | * | CORS allowed origins |

## Development

### Setup

```bash
# Clone repository
git clone <repository-url>
cd markdown-to-pdf-service

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm run cli` | Run CLI tool |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run Docker container |

### Project Structure

```
markdown-to-pdf-service/
├── src/
│   ├── cli.js          # CLI application
│   ├── converter.js    # PDF conversion logic
│   ├── logger.js       # Winston logging configuration
│   ├── server.js       # Express API server
│   └── validation.js   # Input validation schemas
├── logs/               # Log files (created at runtime)
├── examples/           # Example files and outputs
├── Dockerfile          # Container configuration
├── docker-compose.yml  # Multi-container setup
├── package.json        # Dependencies and scripts
├── .env.example        # Environment template
└── README.md          # This file
```

## Performance Considerations

- **Browser Reuse**: The service reuses a single Puppeteer browser instance for efficiency
- **Memory Management**: Automatic cleanup of browser resources
- **Concurrent Requests**: Handles multiple simultaneous conversions
- **File Size Limits**: 10MB limit for input markdown content
- **Resource Optimization**: Alpine Linux base image for minimal footprint

## Security Features

- **Input Sanitization**: Removes potentially harmful script tags
- **CORS Configuration**: Configurable origin restrictions
- **Helmet.js**: Security headers for API endpoints
- **Non-root User**: Docker container runs as non-privileged user
- **Rate Limiting**: Ready for rate limiting implementation
- **Error Handling**: Comprehensive error handling without information leakage

## Troubleshooting

### Common Issues

1. **Puppeteer Installation**: Ensure Chromium dependencies are installed
2. **Memory Issues**: Increase container memory limits for large documents
3. **Font Rendering**: Additional fonts may need to be installed in Docker
4. **Permission Errors**: Check file permissions for output directories

### Debugging

```bash
# Enable debug logging
LOG_LEVEL=debug npm start

# CLI verbose mode
md2pdf document.md --verbose

# Check service health
curl http://localhost:3000/health
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the examples for common use cases