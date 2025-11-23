// src/components/Header.tsx
import { type FC, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

const Header: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
 const { user, isAuthenticated, isAdmin, isShopOwner, login, logout } = useAuth();

  return (
    <header className="w-full shadow-md bg-white">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo-transparent.png" alt="V-Mall Logo" className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <Link to="/" className="hover:text-red-600">Home</Link>
          <Link to="/shops" className="hover:text-red-600">Shops</Link>
          <Link to="/categories" className="hover:text-red-600">Categories</Link>
          <Link to="/about" className="hover:text-red-600">About</Link>
          <Link to="/my-shop" className="hover:text-red-600">My Shop</Link>
           {isAuthenticated && (
              <>
                {isShopOwner() && (
                  <Link to="/shops/my-shop" className="hover:text-blue-200">
                    My Shop
                  </Link>
                )}
                {isAdmin() && (
                  <Link to="/dashboard" className="hover:text-blue-200">
                    Dashboard
                  </Link>
                )}
              </>
            )}
        </nav>

        {/* Login button (desktop only) */}
        <div className="hidden md:block">
          {!isAuthenticated ? (
            <button
              onClick={() => login()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
            >
              Login
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-gray-700">{user?.name}</span>
              <button
                onClick={() => logout()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Hamburger button (mobile only) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            // Close (X)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger (Menu)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <nav className="flex flex-col space-y-4 px-6 py-4 text-gray-700 font-medium">
            <Link to="/" className="hover:text-red-600" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/shops" className="hover:text-red-600" onClick={() => setIsOpen(false)}>Shops</Link>
            <Link to="/categories" className="hover:text-red-600" onClick={() => setIsOpen(false)}>Categories</Link>
            <Link to="/about" className="hover:text-red-600" onClick={() => setIsOpen(false)}>About</Link>
            <Link to="/my-shop" className="hover:text-red-600" onClick={() => setIsOpen(false)}>My Shop</Link>
            {isAuthenticated && (
              <>
                {isShopOwner() && (
                  <Link to="/shops/my-shop" className="hover:text-blue-200">
                    My Shop
                  </Link>
                )}
                {isAdmin() && (
                  <Link to="/dashboard" className="hover:text-blue-200">
                    Dashboard
                  </Link>
                )}
              </>
            )}

            {/* Login button (mobile) */}
           <div>
             {!isAuthenticated ? (
                <button
                    onClick={() => login()}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
                >
                    Login
                </button>
            ) : (
            <div className="flex items-center space-x-3">
              <span className="text-gray-700">{user?.name}</span>
              <button
                onClick={() => logout()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition"
              >
                Logout
              </button>
            </div>
          )}
           </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
