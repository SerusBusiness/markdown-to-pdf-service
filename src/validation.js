const Joi = require('joi');

const pdfOptionsSchema = Joi.object({
  fileName: Joi.string().min(1).max(255).default('document.pdf'),
  includePageNumbers: Joi.boolean().default(true),
  pageNumberStyle: Joi.string().valid('Arabic', 'Roman', 'Alphabetic').default('Arabic'),
  headerTemplate: Joi.string().allow('').default(''),
  footerTemplate: Joi.string().allow('').default(`
    <div style="font-size: 10px; text-align: center; width: 100%; margin: 0 10px;">
      <span class="pageNumber"></span> / <span class="totalPages"></span>
    </div>
  `),
  format: Joi.string().valid('A4', 'A3', 'A5', 'Legal', 'Letter', 'Tabloid').default('A4'),
  landscape: Joi.boolean().default(false),
  margin: Joi.object({
    top: Joi.string().default('1in'),
    right: Joi.string().default('1in'),
    bottom: Joi.string().default('1in'),
    left: Joi.string().default('1in')
  }).default(),
  pages: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional()
});

const convertRequestSchema = Joi.object({
  markdownContent: Joi.string().required().min(1).max(10485760), // 10MB limit
  options: pdfOptionsSchema.default()
});

const validateConvertRequest = (data) => {
  const { error, value } = convertRequestSchema.validate(data, {
    allowUnknown: false,
    stripUnknown: true,
    abortEarly: false
  });

  if (error) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw new Error(`Validation failed: ${JSON.stringify(details)}`);
  }

  return value;
};

const validateCliArgs = (args) => {
  const schema = Joi.object({
    input: Joi.string().required(),
    output: Joi.string().optional(),
    format: Joi.string().valid('A4', 'A3', 'A5', 'Legal', 'Letter', 'Tabloid').default('A4'),
    landscape: Joi.boolean().default(false),
    pageNumbers: Joi.boolean().default(true),
    pages: Joi.string().optional()
  });

  const { error, value } = schema.validate(args, {
    allowUnknown: true,
    stripUnknown: false
  });

  if (error) {
    throw new Error(`CLI validation failed: ${error.message}`);
  }

  return value;
};

module.exports = {
  validateConvertRequest,
  validateCliArgs,
  pdfOptionsSchema
};