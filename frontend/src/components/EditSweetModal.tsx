import React, { useState } from 'react';
import { Sweet } from '../services/api';
import './Modal.css';

interface EditSweetModalProps {
  sweet: Sweet;
  onClose: () => void;
  onUpdate: (
    sweetId: string,
    sweetData: Partial<{
      name: string;
      category: string;
      price: number;
      quantity: number;
    }>
  ) => Promise<void>;
}

const EditSweetModal: React.FC<EditSweetModalProps> = ({
  sweet,
  onClose,
  onUpdate,
}) => {
  const [name, setName] = useState(sweet.name);
  const [category, setCategory] = useState(sweet.category);
  const [price, setPrice] = useState(sweet.price.toString());
  const [quantity, setQuantity] = useState(sweet.quantity.toString());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onUpdate(sweet._id, {
        name,
        category,
        price: parseFloat(price),
        quantity: parseInt(quantity),
      });
    } catch (err) {
      setError('Failed to update sweet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Sweet</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="0"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Updating...' : 'Update Sweet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSweetModal;

