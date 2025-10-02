const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  avatar_url: Joi.string().uri()
});

// Skill validation schemas
const addSkillSchema = Joi.object({
  skill_id: Joi.number().integer().positive().required(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').required()
});

// Post validation schemas
const createPostSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  image_url: Joi.string().uri().optional()
});

const commentSchema = Joi.object({
  content: Joi.string().min(1).max(500).required()
});

// Quiz validation schemas
const submitQuizSchema = Joi.object({
  answers: Joi.array().items(
    Joi.object({
      question_id: Joi.number().integer().positive().required(),
      answer: Joi.string().required()
    })
  ).min(1).required()
});

// Challenge validation schemas
const submitChallengeSchema = Joi.object({
  code: Joi.string().required(),
  language: Joi.string().valid('javascript', 'python', 'java', 'cpp').default('javascript')
});

// CV upload validation
const cvUploadSchema = Joi.object({
  // File validation is handled by multer middleware
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// File validation middleware
const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Check file size (2MB limit)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (req.file.size > maxSize) {
    return res.status(400).json({ error: 'File size exceeds 2MB limit' });
  }

  // Check file type for CV uploads
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Only PDF and Word documents are allowed' });
  }

  next();
};

module.exports = {
  validate,
  validateFile,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  addSkillSchema,
  createPostSchema,
  commentSchema,
  submitQuizSchema,
  submitChallengeSchema,
  cvUploadSchema
};
