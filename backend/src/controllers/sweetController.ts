import { Response } from 'express';
import Sweet, { ISweet } from '../models/Sweet';
import { AuthRequest } from '../middleware/auth';

export const createSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, price, quantity } = req.body;

    const sweet = new Sweet({
      name,
      category,
      price,
      quantity: quantity || 0,
    });

    await sweet.save();

    res.status(201).json({
      message: 'Sweet created successfully',
      sweet,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Sweet with this name already exists' });
      return;
    }
    res.status(500).json({ error: error.message || 'Failed to create sweet' });
  }
};

export const getAllSweets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sweets = await Sweet.find().sort({ createdAt: -1 });
    res.json({ sweets });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch sweets' });
  }
};

export const searchSweets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    const query: any = {};

    if (name) {
      query.name = { $regex: name as string, $options: 'i' };
    }

    if (category) {
      query.category = { $regex: category as string, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sweets = await Sweet.find(query).sort({ createdAt: -1 });
    res.json({ sweets });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to search sweets' });
  }
};

export const updateSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity } = req.body;

    const sweet = await Sweet.findByIdAndUpdate(
      id,
      { name, category, price, quantity },
      { new: true, runValidators: true }
    );

    if (!sweet) {
      res.status(404).json({ error: 'Sweet not found' });
      return;
    }

    res.json({
      message: 'Sweet updated successfully',
      sweet,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update sweet' });
  }
};

export const deleteSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const sweet = await Sweet.findByIdAndDelete(id);

    if (!sweet) {
      res.status(404).json({ error: 'Sweet not found' });
      return;
    }

    res.json({ message: 'Sweet deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete sweet' });
  }
};

export const purchaseSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity: purchaseQuantity = 1 } = req.body;

    const sweet = await Sweet.findById(id);

    if (!sweet) {
      res.status(404).json({ error: 'Sweet not found' });
      return;
    }

    if (sweet.quantity < purchaseQuantity) {
      res.status(400).json({ error: 'Insufficient quantity in stock' });
      return;
    }

    sweet.quantity -= purchaseQuantity;
    await sweet.save();

    res.json({
      message: 'Purchase successful',
      sweet,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to purchase sweet' });
  }
};

export const restockSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity: restockQuantity } = req.body;

    if (!restockQuantity || restockQuantity <= 0) {
      res.status(400).json({ error: 'Restock quantity must be a positive number' });
      return;
    }

    const sweet = await Sweet.findById(id);

    if (!sweet) {
      res.status(404).json({ error: 'Sweet not found' });
      return;
    }

    sweet.quantity += restockQuantity;
    await sweet.save();

    res.json({
      message: 'Restock successful',
      sweet,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to restock sweet' });
  }
};

