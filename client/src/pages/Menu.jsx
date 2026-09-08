import { useState, useEffect } from 'react';
import axios from 'axios';
import FoodCard from '../components/FoodCard';
import { IoSearch } from 'react-icons/io5';

const API_URL = 'http://localhost:5000/api';

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Beverages', 'Desserts', 'Snacks'];

const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const res = await axios.get(`${API_URL}/foods`);
      setFoods(res.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter((food) => {
    const matchesCategory =
      activeCategory === 'All' || food.category === activeCategory;
    const matchesSearch = food.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🍽️ Our Menu</h1>
        <p>Fresh, delicious food prepared with love</p>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <IoSearch
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            fontSize: '1.1rem',
          }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Search for food..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '2.75rem' }}
          id="menu-search"
        />
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Grid */}
      {filteredFoods.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h2>No items found</h2>
          <p>Try a different category or search term</p>
        </div>
      ) : (
        <div className="food-grid">
          {filteredFoods.map((food) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;
