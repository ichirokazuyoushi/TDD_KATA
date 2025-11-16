import React, { useState } from 'react';
import { Sweet } from '../services/api';
import './Modal.css';

interface RestockModalProps {
  sweet: Sweet;
  onClose: () => void;
  onRestock: (sweetId: string, quantity: number) => Promise<void>;
}

const RestockModal: React.FC<RestockModalProps> = ({
  sweet,
  onClose,
  onRestock,
}) => {
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      setError('Please enter a valid positive quantity');
      return;
    }

    setLoading(true);
    try {
      await onRestock(sweet._id, qty);
    } catch (err) {
      setError('Failed to restock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Restock {sweet.name}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="modal-info">
          Current stock: <strong>{sweet.quantity}</strong>
        </p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Quantity to Add</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
              placeholder="Enter quantity"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Restocking...' : 'Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;

