import { useCart } from './CartContext';
import { IoAdd } from 'react-icons/io5';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

const FoodCard = ({ food }) => {
  const { addToCart } = useCart();

  return (
    <div className="food-card animate-in">
      <div className="food-card-image-wrapper">
        <img
          src={food.image || PLACEHOLDER_IMAGE}
          alt={food.name}
          className="food-card-image"
          onError={(e) => {
            e.target.src = PLACEHOLDER_IMAGE;
          }}
        />
        <span className="food-card-category">{food.category}</span>
        {!food.isAvailable && (
          <div className="food-card-unavailable">Unavailable</div>
        )}
      </div>
      <div className="food-card-body">
        <h3 className="food-card-name">{food.name}</h3>
        <p className="food-card-desc">
          {food.description || 'Delicious and freshly prepared.'}
        </p>
        <div className="food-card-footer">
          <span className="food-card-price">{food.price}</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => addToCart(food)}
            disabled={!food.isAvailable}
          >
            <IoAdd /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
