#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const converter = require('./converter');
const logger = require('./logger');
const { validateCliArgs } = require('./validation');

const program = new Command();

program
  .name('md2pdf')
  .description('Convert Markdown files to PDF')
  .version('1.0.0');

program
  .argument('<input>', 'Input markdown file path or markdown content string')
  .option('-o, --output <path>', 'Output PDF file path')
  .option('-f, --format <format>', 'PDF format (A4, A3, A5, Legal, Letter, Tabloid)', 'A4')
  .option('-l, --landscape', 'Use landscape orientation', false)
  .option('--no-page-numbers', 'Disable page numbers')
  .option('-p, --pages <pages>', 'Page ranges (e.g., "1-5", "1,3,5-7")')
  .option('--margin-top <margin>', 'Top margin (e.g., "1in", "20mm")', '1in')
  .option('--margin-right <margin>', 'Right margin', '1in')
  .option('--margin-bottom <margin>', 'Bottom margin', '1in')
  .option('--margin-left <margin>', 'Left margin', '1in')
  .option('--header <template>', 'Header HTML template')
  .option('--footer <template>', 'Footer HTML template')
  .option('--verbose', 'Enable verbose logging', false)
  .action(async (input, options) => {
    try {
      // Set log level based on verbose flag
      if (options.verbose) {
        logger.level = 'debug';
      }

      logger.info('Starting CLI conversion', { input, options });

      // Validate arguments
      const validatedArgs = validateCliArgs({
        input,
        output: options.output,
        format: options.format,
        landscape: options.landscape,
        pageNumbers: !options.noPageNumbers,
        pages: options.pages
      });

      // Determine if input is a file path or content string
      let markdownContent;
      let outputPath = options.output;

      try {
        // Try to read as file first
        const stats = await fs.stat(input);
        if (stats.isFile()) {
          markdownContent = await fs.readFile(input, 'utf-8');
          logger.info('Read markdown from file', { 
            filePath: input, 
            contentLength: markdownContent.length 
          });

          // Auto-generate output path if not provided
          if (!outputPath) {
            const parsedPath = path.parse(input);
            outputPath = path.join(parsedPath.dir, `${parsedPath.name}.pdf`);
          }
        }
      } catch (fileError) {
        // If not a file, treat as markdown content string
        markdownContent = input;
        logger.info('Using input as markdown content string', { 
          contentLength: markdownContent.length 
        });

        // Default output path for content string
        if (!outputPath) {
          outputPath = 'output.pdf';
        }
      }

      // Prepare conversion options
      const conversionOptions = {
        format: validatedArgs.format,
        landscape: validatedArgs.landscape,
        includePageNumbers: validatedArgs.pageNumbers,
        margin: {
          top: options.marginTop,
          right: options.marginRight,
          bottom: options.marginBottom,
          left: options.marginLeft
        }
      };

      if (options.header) {
        conversionOptions.headerTemplate = options.header;
      }

      if (options.footer) {
        conversionOptions.footerTemplate = options.footer;
      }

      if (validatedArgs.pages) {
        conversionOptions.pages = validatedArgs.pages;
      }

      logger.debug('Conversion options', conversionOptions);

      // Convert to PDF
      const pdfBuffer = await converter.convertToPDF(markdownContent, conversionOptions);

      // Write to output file or stdout
      if (outputPath === '-' || outputPath === '/dev/stdout') {
        // Output to stdout
        process.stdout.write(pdfBuffer);
        logger.info('PDF written to stdout', { size: pdfBuffer.length });
      } else {
        // Ensure output directory exists
        const outputDir = path.dirname(path.resolve(outputPath));
        await fs.mkdir(outputDir, { recursive: true });

        // Write to file
        await fs.writeFile(outputPath, pdfBuffer);
        logger.info('PDF conversion completed', { 
          outputPath: path.resolve(outputPath),
          size: pdfBuffer.length 
        });
        
        console.log(`✅ PDF successfully created: ${path.resolve(outputPath)}`);
        console.log(`📄 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
      }

    } catch (error) {
      logger.error('CLI conversion failed', { 
        error: error.message,
        stack: error.stack 
      });
      
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    } finally {
      // Clean up
      try {
        await converter.close();
      } catch (closeError) {
        logger.warn('Error closing converter', { error: closeError.message });
      }
    }
  });

// Add examples to help
program.addHelpText('after', `
Examples:
  # Convert markdown file to PDF
  $ md2pdf document.md
  $ md2pdf document.md -o output.pdf

  # Convert with custom options
  $ md2pdf document.md --format A3 --landscape
  $ md2pdf document.md --pages "1-5,7,10-"

  # Convert markdown string directly
  $ md2pdf "# Hello World\\nThis is **bold** text."

  # Output to stdout
  $ md2pdf document.md -o - > output.pdf

  # Custom margins
  $ md2pdf document.md --margin-top 2in --margin-bottom 2in

  # Disable page numbers
  $ md2pdf document.md --no-page-numbers

  # Verbose output
  $ md2pdf document.md --verbose
`);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  console.error(`❌ Fatal error: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  console.error(`❌ Unhandled promise rejection: ${reason}`);
  process.exit(1);
});

// Parse command line arguments
program.parse();