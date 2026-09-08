import { Link, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';
import { IoRestaurant, IoCart, IoSettings } from 'react-icons/io5';

const Navbar = () => {
  const { getItemCount } = useCart();
  const location = useLocation();
  const itemCount = getItemCount();

  const isActive = (path) => location.pathname === path;

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <nav className="navbar">
      <Link to="/menu" className="navbar-brand">
        <IoRestaurant className="brand-icon" />
        <span>QuickBite</span>
      </Link>

      <div className="navbar-links">
        {!isAdminPage && (
          <>
            <Link
              to="/menu"
              className={isActive('/menu') || isActive('/') ? 'active' : ''}
            >
              🍽️ Menu
            </Link>
            <Link
              to="/cart"
              className={isActive('/cart') ? 'active' : ''}
              style={{ position: 'relative' }}
            >
              <IoCart />
              Cart
              {itemCount > 0 && (
                <span className="cart-badge">{itemCount}</span>
              )}
            </Link>
          </>
        )}
        {isAdminPage && (
          <Link
            to="/menu"
          >
            🍽️ Customer View
          </Link>
        )}
        <Link
          to="/admin"
          className={isAdminPage ? 'active' : ''}
        >
          <IoSettings />
          Admin
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
