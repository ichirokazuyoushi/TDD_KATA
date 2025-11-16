import express from 'express';
import { body } from 'express-validator';
import { authenticate, requireAdmin } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import {
  createSweet,
  getAllSweets,
  searchSweets,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet,
} from '../controllers/sweetController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

const sweetValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  handleValidationErrors,
];

// Public endpoints (authenticated users)
router.get('/', getAllSweets);
router.get('/search', searchSweets);
router.post('/:id/purchase', purchaseSweet);

// Admin-only endpoints
router.post('/', requireAdmin, sweetValidation, createSweet);
router.put('/:id', requireAdmin, sweetValidation, updateSweet);
router.delete('/:id', requireAdmin, deleteSweet);
router.post('/:id/restock', requireAdmin, [
  body('quantity').isInt({ min: 1 }).withMessage('Restock quantity must be a positive integer'),
  handleValidationErrors,
], restockSweet);

export default router;

