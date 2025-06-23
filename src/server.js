const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const logger = require('./logger');
const converter = require('./converter');
const { validateConvertRequest } = require('./validation');

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload middleware for markdown files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/markdown' || 
        file.mimetype === 'text/plain' || 
        file.originalname.endsWith('.md') ||
        file.originalname.endsWith('.markdown')) {
      cb(null, true);
    } else {
      cb(new Error('Only markdown files are allowed'), false);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'markdown-to-pdf-service',
    version: '1.0.0'
  });
});

// API documentation endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Markdown to PDF Converter',
    version: '1.0.0',
    endpoints: {
      'POST /convert': 'Convert markdown content to PDF',
      'POST /convert/file': 'Convert markdown file to PDF',
      'GET /health': 'Health check',
      'GET /': 'API documentation'
    },
    documentation: 'See README.md for detailed usage instructions'
  });
});

// Convert markdown content to PDF
app.post('/convert', async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Received PDF conversion request', { 
      contentLength: req.body.markdownContent?.length || 0,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Validate request
    const validatedData = validateConvertRequest(req.body);
    const { markdownContent, options } = validatedData;

    // Convert to PDF
    const pdfBuffer = await converter.convertToPDF(markdownContent, options);

    // Set response headers
    const fileName = options.fileName || 'document.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

    const duration = Date.now() - startTime;
    logger.info('PDF conversion completed', { 
      duration: `${duration}ms`,
      outputSize: pdfBuffer.length,
      fileName
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('PDF conversion failed', { 
      error: error.message,
      duration: `${duration}ms`,
      stack: error.stack
    });

    if (error.message.includes('Validation failed')) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Invalid request data',
        error: error.message
      });
    }

    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error during PDF conversion',
      error: process.env.NODE_ENV === 'development' ? error.message : 'PDF conversion failed'
    });
  }
});

// Convert markdown file to PDF
app.post('/convert/file', upload.single('markdown'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        statusCode: 400,
        message: 'No markdown file uploaded',
        error: 'Please upload a markdown file'
      });
    }

    logger.info('Received file conversion request', { 
      fileName: req.file.originalname,
      fileSize: req.file.size,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    const markdownContent = req.file.buffer.toString('utf-8');
    
    // Parse options from form data
    let options = {};
    if (req.body.options) {
      try {
        options = JSON.parse(req.body.options);
      } catch (parseError) {
        logger.warn('Failed to parse options, using defaults', { error: parseError.message });
      }
    }

    // Apply individual option overrides
    Object.keys(req.body).forEach(key => {
      if (key !== 'options' && req.body[key] !== undefined) {
        if (key === 'landscape' || key === 'includePageNumbers') {
          options[key] = req.body[key] === 'true';
        } else {
          options[key] = req.body[key];
        }
      }
    });

    // Validate request
    const validatedData = validateConvertRequest({ markdownContent, options });

    // Convert to PDF
    const pdfBuffer = await converter.convertToPDF(validatedData.markdownContent, validatedData.options);

    // Set response headers
    const fileName = validatedData.options.fileName || 
                    req.file.originalname.replace(/\.(md|markdown)$/i, '.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

    const duration = Date.now() - startTime;
    logger.info('File conversion completed', { 
      duration: `${duration}ms`,
      inputFile: req.file.originalname,
      outputSize: pdfBuffer.length,
      fileName
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('File conversion failed', { 
      error: error.message,
      duration: `${duration}ms`,
      stack: error.stack
    });

    if (error.message.includes('Validation failed')) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Invalid request data',
        error: error.message
      });
    }

    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error during file conversion',
      error: process.env.NODE_ENV === 'development' ? error.message : 'File conversion failed'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error', { 
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        statusCode: 400,
        message: 'File too large',
        error: 'Maximum file size is 10MB'
      });
    }
  }

  res.status(500).json({
    statusCode: 500,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    statusCode: 404,
    message: 'Endpoint not found',
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      await converter.close();
      logger.info('PDF converter closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error: error.message });
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(port, async () => {
  logger.info(`Markdown to PDF service started on port ${port}`, {
    port,
    nodeEnv: process.env.NODE_ENV || 'development',
    pid: process.pid
  });

  // Ensure logs directory exists
  try {
    await fs.mkdir('logs', { recursive: true });
  } catch (error) {
    logger.warn('Failed to create logs directory', { error: error.message });
  }
});

module.exports = app;