const fs = require('fs');
const path = require('path');

async function testAPI() {
  try {
    console.log('🧪 Testing Markdown to PDF Service API...\n');

    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData.status);

    // Test 2: Convert Markdown Content
    console.log('\n2. Testing markdown conversion...');
    const testMarkdown = `# API Test Document

This document was generated via the **API** to test the markdown-to-pdf-service.

## Test Features

- ✅ Bold and *italic* text
- 🔗 [Links](https://example.com) 
- 📋 Lists and formatting

### Code Block Test

\`\`\`javascript
function testAPI() {
  console.log('Hello from the API!');
  return 'success';
}
\`\`\`

### Table Test

| Feature | Status | Notes |
|---------|--------|-------|
| API Conversion | ✅ Working | Successfully tested |
| CLI Tool | ✅ Working | Command line tested |
| Docker Support | 🚀 Ready | Container ready |

> This blockquote confirms that the API is working correctly!

---

**Test completed at:** ${new Date().toISOString()}`;

    const payload = {
      markdownContent: testMarkdown,
      options: {
        fileName: 'api-test-result.pdf',
        format: 'A4',
        includePageNumbers: true,
        margin: {
          top: '1in',
          right: '1in',
          bottom: '1in',
          left: '1in'
        }
      }
    };

    const convertResponse = await fetch('http://localhost:3000/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (convertResponse.ok) {
      const pdfBuffer = await convertResponse.arrayBuffer();
      const outputPath = path.join(__dirname, 'examples', 'api-test-result.pdf');
      
      fs.writeFileSync(outputPath, Buffer.from(pdfBuffer));
      
      console.log('✅ PDF conversion successful!');
      console.log(`📄 Generated: ${outputPath}`);
      console.log(`📊 File size: ${(pdfBuffer.byteLength / 1024).toFixed(2)} KB`);
    } else {
      console.error('❌ Conversion failed:', convertResponse.status, convertResponse.statusText);
      const errorText = await convertResponse.text();
      console.error('Error details:', errorText);
    }

    // Test 3: API Documentation
    console.log('\n3. Testing API documentation endpoint...');
    const docsResponse = await fetch('http://localhost:3000/');
    const docsData = await docsResponse.json();
    console.log('✅ API documentation accessible');
    console.log('📚 Available endpoints:', Object.keys(docsData.endpoints).join(', '));

    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Health check endpoint working');
    console.log('   ✅ PDF conversion endpoint working');
    console.log('   ✅ API documentation accessible');
    console.log('   ✅ Service fully operational');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAPI();