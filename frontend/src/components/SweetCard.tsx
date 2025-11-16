import React from 'react';
import { Sweet } from '../services/api';
import './SweetCard.css';

interface SweetCardProps {
  sweet: Sweet;
  onPurchase: (sweetId: string, quantity?: number) => void;
  onEdit?: (sweet: Sweet) => void;
  onDelete?: (sweetId: string) => void;
  onRestock?: (sweet: Sweet) => void;
  isAdmin: boolean;
}

const SweetCard: React.FC<SweetCardProps> = ({
  sweet,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
  isAdmin,
}) => {
  const isOutOfStock = sweet.quantity === 0;

  return (
    <div className={`sweet-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <div className="sweet-header">
        <h3>{sweet.name}</h3>
        <span className="sweet-category">{sweet.category}</span>
      </div>
      
      <div className="sweet-body">
        <div className="sweet-price">${sweet.price.toFixed(2)}</div>
        <div className="sweet-quantity">
          Stock: <strong>{sweet.quantity}</strong>
        </div>
      </div>

      <div className="sweet-actions">
        <button
          onClick={() => onPurchase(sweet._id, 1)}
          disabled={isOutOfStock}
          className="btn-purchase"
        >
          {isOutOfStock ? 'Out of Stock' : 'Purchase'}
        </button>

        {isAdmin && (
          <div className="admin-actions">
            <button onClick={() => onEdit?.(sweet)} className="btn-edit">
              Edit
            </button>
            <button onClick={() => onRestock?.(sweet)} className="btn-restock">
              Restock
            </button>
            <button onClick={() => onDelete?.(sweet._id)} className="btn-delete">
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SweetCard;

