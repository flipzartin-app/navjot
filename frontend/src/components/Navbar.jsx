import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiMoon, FiSun, FiMenu, FiX, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const { darkMode, toggleDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/courses?search=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  };

  const dashboardLink =
    user?.role === 'admin' ? '/admin' : user?.role === 'instructor' ? '/instructor' : '/dashboard';

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="text-xl font-bold text-primary-600 shrink-0">
          EduStream
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="input-field pl-9 py-1.5"
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
        </form>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          <Link to="/courses" className="hover:text-primary-600">Courses</Link>
          <Link to="/about" className="hover:text-primary-600">About</Link>
          <Link to="/contact" className="hover:text-primary-600">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={toggleDarkMode} aria-label="Toggle dark mode" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/wishlist" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hidden sm:block">
                <FiHeart />
              </Link>
              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <FiShoppingCart />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>
              <div className="relative group hidden sm:block">
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <FiUser />
                  <span className="text-sm">{user?.name?.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 mt-1 w-48 card p-2 hidden group-hover:block">
                  <Link to={dashboardLink} className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Dashboard</Link>
                  <Link to="/my-courses" className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">My Courses</Link>
                  <button onClick={logout} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500">
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </div>
          )}

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-3 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="input-field pl-9"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          </form>
          <Link to="/courses" onClick={() => setMenuOpen(false)} className="block py-1">Courses</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="block py-1">About</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} className="block py-1">Contact</Link>
          {isAuthenticated ? (
            <>
              <Link to={dashboardLink} onClick={() => setMenuOpen(false)} className="block py-1">Dashboard</Link>
              <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="block py-1">Wishlist</Link>
              <button onClick={logout} className="block py-1 text-red-500">Logout</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn-secondary flex-1 text-center">Login</Link>
              <Link to="/register" className="btn-primary flex-1 text-center">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
