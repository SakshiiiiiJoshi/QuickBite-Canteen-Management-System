import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoAdd, IoCreate, IoTrash, IoEye, IoEyeOff } from 'react-icons/io5';

const API_URL = 'http://localhost:5000/api';
const CATEGORIES = ['Starters', 'Main Course', 'Beverages', 'Desserts', 'Snacks'];

const FOOD_IMAGES = {
  'Starters': 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=300&fit=crop',
  'Main Course': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
  'Beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
  'Desserts': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
  'Snacks': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
};

const emptyFood = {
  name: '',
  description: '',
  price: '',
  category: 'Starters',
  image: '',
  isAvailable: true,
};

const ManageFood = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFood, setCurrentFood] = useState(emptyFood);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('canteen_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const res = await axios.get(`${API_URL}/foods`);
      setFoods(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = {
        ...currentFood,
        price: parseFloat(currentFood.price),
        image: currentFood.image || FOOD_IMAGES[currentFood.category] || '',
      };

      if (editMode) {
        await axios.put(`${API_URL}/foods/${currentFood._id}`, data, config);
      } else {
        await axios.post(`${API_URL}/foods`, data, config);
      }

      setShowModal(false);
      setCurrentFood(emptyFood);
      fetchFoods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (food) => {
    setCurrentFood(food);
    setEditMode(true);
    setShowModal(true);
    setError('');
  };

  const handleAdd = () => {
    setCurrentFood(emptyFood);
    setEditMode(false);
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`${API_URL}/foods/${id}`, config);
      fetchFoods();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggleAvailability = async (food) => {
    try {
      await axios.put(
        `${API_URL}/foods/${food._id}`,
        { isAvailable: !food.isAvailable },
        config
      );
      fetchFoods();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>🍔 Manage Food</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {foods.length} items in menu
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <IoAdd /> Add Food
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={food.image || FOOD_IMAGES[food.category]}
                      alt={food.name}
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.target.src = FOOD_IMAGES[food.category] || '';
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{food.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {food.description?.substring(0, 40) || 'No description'}
                        {food.description?.length > 40 ? '...' : ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-placed">{food.category}</span>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--primary-400)' }}>
                  ₹{food.price}
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${food.isAvailable ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => handleToggleAvailability(food)}
                    style={{ minWidth: '100px' }}
                  >
                    {food.isAvailable ? (
                      <><IoEye /> Available</>
                    ) : (
                      <><IoEyeOff /> Hidden</>
                    )}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(food)}
                    >
                      <IoCreate />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(food._id)}
                    >
                      <IoTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {foods.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No food items yet. Click "Add Food" to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? '✏️ Edit Food' : '➕ Add Food'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentFood.name}
                  onChange={(e) =>
                    setCurrentFood({ ...currentFood, name: e.target.value })
                  }
                  placeholder="e.g., Paneer Tikka"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentFood.description}
                  onChange={(e) =>
                    setCurrentFood({ ...currentFood, description: e.target.value })
                  }
                  placeholder="A brief description"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={currentFood.price}
                    onChange={(e) =>
                      setCurrentFood({ ...currentFood, price: e.target.value })
                    }
                    placeholder="120"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-input"
                    value={currentFood.category}
                    onChange={(e) =>
                      setCurrentFood({ ...currentFood, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Image URL (optional)</label>
                <input
                  type="url"
                  className="form-input"
                  value={currentFood.image}
                  onChange={(e) =>
                    setCurrentFood({ ...currentFood, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editMode ? 'Update' : 'Add Food'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFood;
