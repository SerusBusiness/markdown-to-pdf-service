**Prompt for Agentic AI Developers: Markdown to PDF Microservice**

**Objective:** Develop a robust, production-ready microservice named `markdown-to-pdf-service` capable of converting Markdown content to PDF files. The service should be accessible both online (via API) and offline (via script execution), and include all necessary Docker configurations.

**Technology Stack:**
* **Primary Language:** Node.js

**Core Functionality:**
* **Markdown to PDF Conversion:** The service must accurately convert input Markdown content into a well-formatted PDF document.
* **Base64 Image Rendering:** The PDF output should correctly render images embedded within the Markdown as base64 encoded strings.
* **Reference Linking:** Support for clickable internal and external links defined in the Markdown should be preserved in the PDF.
* **Page Numbering:** The generated PDF should include configurable page numbers.
* **Pages Configuration (Optional):** Allow for optional configuration of specific pages or page ranges to be included in the output PDF (e.g., "1-5", "7", "10-").

**Access Methods:**

1.  **Online (API):**
    * Expose a RESTful API endpoint (e.g., `/convert`) that accepts Markdown content and conversion options as input, and returns the generated PDF file.
    * Consider a suitable HTTP method (e.g., `POST`).
    * Implement appropriate error handling and response codes.

2.  **Offline (Run Script):**
    * Provide a command-line interface (CLI) script (e.g., `convert.js` or `cli.js`) that can be executed directly.
    * The script should accept Markdown content (e.g., via file path or direct string) and conversion options as arguments, and output the PDF to a specified location or stdout.

**Input Arguments (for both API and Script):**

* `markdownContent`: (Required) The Markdown string to be converted.
* `outputPath`: (Optional, for offline script) The file path where the generated PDF should be saved. If not provided, the PDF should be returned via API or printed to stdout for the script.
* `options`: (Optional) An object containing configuration for PDF generation:
    * `fileName`: (String) Desired name for the output PDF file (e.g., "document.pdf").
    * `includePageNumbers`: (Boolean) `true` to include page numbers, `false` otherwise. (Default: `true`)
    * `pageNumberStyle`: (String) Optional, e.g., "Arabic", "Roman", "Alphabetic". (Default: "Arabic")
    * `headerTemplate`: (String) HTML template for the PDF header.
    * `footerTemplate`: (String) HTML template for the PDF footer.
    * `format`: (String) Page format (e.g., "A4", "Letter", "Legal"). (Default: "A4")
    * `landscape`: (Boolean) `true` for landscape orientation, `false` for portrait. (Default: `false`)
    * `margin`: (Object) Margins for the PDF, e.g., `{ top: '1in', right: '1in', bottom: '1in', left: '1in' }`.
    * `pages`: (String or Array of Strings) Specifies which pages to include (e.g., "1-5", ["1", "3", "5-7"]).
    * **Add any other relevant PDF generation options you deem necessary for production quality.**

**Output Arguments (for both API and Script):**

* **API:**
    * Successful response: Returns the PDF file as a binary stream with appropriate `Content-Type` header (e.g., `application/pdf`).
    * Error response: JSON object with `statusCode`, `message`, and potentially an `error` field.
* **Offline Script:**
    * Successful execution: Generates the PDF file at the specified `outputPath` or prints to stdout.
    * Error execution: Prints error messages to stderr and exits with a non-zero status code.

**Production Readiness:**

* **Robust Error Handling:** Implement comprehensive error handling for all potential failure points (e.g., invalid input, conversion errors, file system issues).
* **Logging:** Integrate a logging mechanism (e.g., Winston, Pino) for tracking service activity and troubleshooting.
* **Performance Considerations:** Optimize for efficient conversion, especially for large Markdown inputs. Consider headless browser initialization strategies.
* **Security:** Sanitize inputs to prevent injection vulnerabilities.
* **Configuration Management:** Use environment variables or a configuration file for sensitive settings (e.g., port numbers, logging levels).
* **Scalability:** Design the service with scalability in mind, suitable for deployment in containerized environments.

**Docker Configuration:**

* **`Dockerfile`:** Create a `Dockerfile` that builds an optimized Node.js image for the `markdown-to-pdf-service`.
    * The image should be as small as possible.
    * Include all necessary system dependencies for PDF generation (e.g., Chromium or equivalent headless browser for rendering).
* **`docker-compose.yml`:** Provide a `docker-compose.yml` file for easy local development and testing.
    * Define the `markdown-to-pdf-service` service.
    * Ensure the service is configured to be accessible on a defined port.
    * (Optional but recommended): Include a simple example of how to use the service within the `docker-compose` setup.

**Deliverables:**

* A Git repository containing the complete Node.js service code.
* Comprehensive `Dockerfile` and `docker-compose.yml` files.
* Clear `README.md` with:
    * Service overview.
    * Setup instructions (local and Docker).
    * API documentation (endpoints, request/response examples).
    * CLI script usage examples.
    * Examples for all input options.
    * Explanation of any design decisions or external libraries used.

**Constraints/Considerations:**

* Utilize a reliable Node.js library for Markdown parsing and PDF generation (e.g., `marked` for Markdown, and `puppeteer` or `playwright` for headless browser PDF generation).
* Prioritize performance and resource efficiency.
* The solution should be self-contained within the Docker image.

---