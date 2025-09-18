import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItems } = useContext(CartContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const cartItemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          E-Commerce
        </Link>

        {/* Mobile menu button */}
        <div className="mobile-menu-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Search Bar - Desktop */}
        <div className="search-bar-desktop">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <FaSearch />
            </button>
          </form>
        </div>

        {/* Navigation Links */}
        <ul className={mobileMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/products" className="nav-links" onClick={() => setMobileMenuOpen(false)}>
              Shop
            </Link>
          </li>
          
          {/* Search Bar - Mobile */}
          <li className="nav-item search-bar-mobile">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">
                <FaSearch />
              </button>
            </form>
          </li>

          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link 
                  to="/profile" 
                  className="nav-links" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUser /> {user?.name || 'Profile'}
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/orders" 
                  className="nav-links" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Orders
                </Link>
              </li>
              <li className="nav-item">
                <button 
                  className="nav-links btn-logout" 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link 
                  to="/login" 
                  className="nav-links" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/register" 
                  className="nav-links nav-register" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </li>
            </>
          )}
          
          <li className="nav-item cart-icon">
            <Link 
              to="/cart" 
              className="nav-links" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaShoppingCart />
              {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
