import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sweetsAPI, Sweet } from '../services/api';
import SweetCard from '../components/SweetCard';
import SearchBar from '../components/SearchBar';
import AddSweetModal from '../components/AddSweetModal';
import EditSweetModal from '../components/EditSweetModal';
import RestockModal from '../components/RestockModal';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [filteredSweets, setFilteredSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [restockingSweet, setRestockingSweet] = useState<Sweet | null>(null);

  useEffect(() => {
    loadSweets();
  }, []);

  const loadSweets = async () => {
    try {
      setLoading(true);
      const data = await sweetsAPI.getAll();
      setSweets(data);
      setFilteredSweets(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load sweets');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (filters: {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    try {
      if (Object.keys(filters).length === 0) {
        setFilteredSweets(sweets);
        return;
      }

      const results = await sweetsAPI.search(filters);
      setFilteredSweets(results);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Search failed');
    }
  };

  const handlePurchase = async (sweetId: string, quantity: number = 1) => {
    try {
      await sweetsAPI.purchase(sweetId, quantity);
      await loadSweets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Purchase failed');
    }
  };

  const handleAddSweet = async (sweetData: {
    name: string;
    category: string;
    price: number;
    quantity: number;
  }) => {
    try {
      await sweetsAPI.create(sweetData);
      setShowAddModal(false);
      await loadSweets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add sweet');
      throw err;
    }
  };

  const handleUpdateSweet = async (
    sweetId: string,
    sweetData: Partial<{
      name: string;
      category: string;
      price: number;
      quantity: number;
    }>
  ) => {
    try {
      await sweetsAPI.update(sweetId, sweetData);
      setEditingSweet(null);
      await loadSweets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update sweet');
      throw err;
    }
  };

  const handleDeleteSweet = async (sweetId: string) => {
    if (!window.confirm('Are you sure you want to delete this sweet?')) {
      return;
    }

    try {
      await sweetsAPI.delete(sweetId);
      await loadSweets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete sweet');
    }
  };

  const handleRestock = async (sweetId: string, quantity: number) => {
    try {
      await sweetsAPI.restock(sweetId, quantity);
      setRestockingSweet(null);
      await loadSweets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to restock sweet');
      throw err;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🍬 Sweet Shop Management System</h1>
          <div className="header-actions">
            <span className="user-info">
              Welcome, <strong>{user?.username}</strong>
              {isAdmin && <span className="admin-badge">Admin</span>}
            </span>
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {error && (
          <div className="error-banner" onClick={() => setError('')}>
            {error} (click to dismiss)
          </div>
        )}

        <div className="dashboard-controls">
          <SearchBar onSearch={handleSearch} />
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-add-sweet"
            >
              + Add New Sweet
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading sweets...</div>
        ) : filteredSweets.length === 0 ? (
          <div className="empty-state">
            <p>No sweets found. {isAdmin && 'Add your first sweet!'}</p>
          </div>
        ) : (
          <div className="sweets-grid">
            {filteredSweets.map((sweet) => (
              <SweetCard
                key={sweet._id}
                sweet={sweet}
                onPurchase={handlePurchase}
                onEdit={isAdmin ? () => setEditingSweet(sweet) : undefined}
                onDelete={isAdmin ? () => handleDeleteSweet(sweet._id) : undefined}
                onRestock={isAdmin ? () => setRestockingSweet(sweet) : undefined}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </main>

      {showAddModal && (
        <AddSweetModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSweet}
        />
      )}

      {editingSweet && (
        <EditSweetModal
          sweet={editingSweet}
          onClose={() => setEditingSweet(null)}
          onUpdate={handleUpdateSweet}
        />
      )}

      {restockingSweet && (
        <RestockModal
          sweet={restockingSweet}
          onClose={() => setRestockingSweet(null)}
          onRestock={handleRestock}
        />
      )}
    </div>
  );
};

export default Dashboard;

