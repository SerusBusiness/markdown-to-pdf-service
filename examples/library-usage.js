const fs = require('fs').promises;
const { convertMarkdownToPDF, MarkdownToPDFConverter } = require('../index');

async function examples() {
  console.log('📄 Markdown to PDF Library Examples\n');

  // Example 1: Simple usage
  console.log('1. Simple conversion example:');
  try {
    const markdownContent = `# Hello World

This is a **simple example** of converting markdown to PDF.

## Features
- Easy to use
- High quality output
- Supports [links](https://example.com)

\`\`\`javascript
console.log('Code blocks work too!');
\`\`\`
`;

    const pdfBuffer = await convertMarkdownToPDF(markdownContent);
    await fs.writeFile('examples/simple-example.pdf', pdfBuffer);
    console.log('✅ Simple PDF created: examples/simple-example.pdf\n');
  } catch (error) {
    console.error('❌ Simple example failed:', error.message);
  }

  // Example 2: Advanced usage with options
  console.log('2. Advanced conversion with options:');
  try {
    const advancedMarkdown = `# Technical Report

## Executive Summary
This document demonstrates advanced PDF generation capabilities.

### Performance Metrics
| Metric | Q1 | Q2 | Q3 | Q4 |
|--------|----|----|----|----|
| Revenue | $1M | $1.2M | $1.5M | $1.8M |
| Users | 10K | 12K | 15K | 18K |

> **Important Note**: This is a blockquote with critical information.

### Code Example
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [];
\`\`\`

For more information, visit [our website](https://example.com).
`;

    const options = {
      fileName: 'technical-report.pdf',
      format: 'A4',
      landscape: false,
      includePageNumbers: true,
      headerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; padding: 5px;">Technical Report - Confidential</div>',
      footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; padding: 5px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      margin: {
        top: '1.5in',
        right: '1in',
        bottom: '1.5in',
        left: '1in'
      }
    };

    const pdfBuffer = await convertMarkdownToPDF(advancedMarkdown, options);
    await fs.writeFile('examples/advanced-example.pdf', pdfBuffer);
    console.log('✅ Advanced PDF created: examples/advanced-example.pdf\n');
  } catch (error) {
    console.error('❌ Advanced example failed:', error.message);
  }

  // Example 3: Using the converter class for multiple conversions
  console.log('3. Multiple conversions using converter class:');
  const converter = new MarkdownToPDFConverter();
  
  try {
    await converter.initialize();
    console.log('🚀 Converter initialized');

    // Convert multiple documents
    const documents = [
      {
        content: '# Document 1\n\nThis is the first document.',
        filename: 'doc1.pdf'
      },
      {
        content: '# Document 2\n\nThis is the second document with **bold text**.',
        filename: 'doc2.pdf'
      },
      {
        content: '# Document 3\n\nThis is the third document with a [link](https://example.com).',
        filename: 'doc3.pdf'
      }
    ];

    for (const doc of documents) {
      const pdfBuffer = await converter.convertToPDF(doc.content, {
        format: 'A4',
        includePageNumbers: false
      });
      await fs.writeFile(`examples/${doc.filename}`, pdfBuffer);
      console.log(`✅ Created: examples/${doc.filename}`);
    }

    console.log('✅ All documents converted successfully\n');
  } catch (error) {
    console.error('❌ Multiple conversion example failed:', error.message);
  } finally {
    await converter.close();
    console.log('🔒 Converter closed');
  }

  // Example 4: HTML generation only
  console.log('\n4. HTML generation example:');
  try {
    const converter = new MarkdownToPDFConverter();
    const markdownContent = '# HTML Only\n\nThis example generates HTML without PDF conversion.';
    const html = converter.generateHTML(markdownContent);
    
    await fs.writeFile('examples/generated.html', html);
    console.log('✅ HTML generated: examples/generated.html');
  } catch (error) {
    console.error('❌ HTML generation failed:', error.message);
  }

  console.log('\n🎉 All examples completed!');
}

// Run examples if this file is executed directly
if (require.main === module) {
  examples().catch(console.error);
}

module.exports = { examples };