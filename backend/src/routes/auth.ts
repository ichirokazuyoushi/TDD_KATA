import express from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

const registerValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

export default router;

