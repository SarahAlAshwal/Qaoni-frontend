// src/components/Header.tsx
import { type FC, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

const Header: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
 const { user, isAuthenticated, isAdmin, isShopOwner, login, logout } = useAuth();

  return (
    <header className="w-full shadow-md bg-white relative">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo-transparent-light.png" alt="Qaoni Logo" className="h-32 w-auto max-[1050px]:h-20" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden min-[830px]:flex space-x-6 text-gray-700 font-medium">
          <Link to="/" className="hover:text-brand-secondary transition-colors">Home</Link>
          <Link to="/businesses" className="hover:text-brand-secondary transition-colors">Businesses</Link>
          <Link to="/categories" className="hover:text-brand-secondary transition-colors">Categories</Link>
          <Link to="/about" className="hover:text-brand-secondary transition-colors">About</Link>
          {isAuthenticated && (
            <>
              {isShopOwner() && (
                <Link to="/my-space" className="hover:text-brand-secondary transition-colors">
                  My Space
                </Link>
              )}
              {isAdmin() && (
                <Link to="/dashboard" className="hover:text-brand-secondary transition-colors">
                  Dashboard
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Business Login button (desktop only) */}
        <div className="hidden min-[830px]:block">
          {!isAuthenticated ? (
            <button
              onClick={() => login()}
              className="bg-brand-primary text-white px-4 py-2 rounded-lg shadow hover:bg-brand-secondary transition cursor-pointer"
            >
              Business Login
            </button>
          ) : (
            <div className="flex items-center space-x-3 max-[1050px]:flex-col max-[1050px]:items-end max-[1050px]:space-x-0 max-[1050px]:gap-1">
              <span className="text-gray-700 text-sm">{user?.name}</span>
              <button
                onClick={() => logout()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Hamburger button (mobile only) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="min-[830px]:hidden text-gray-700 focus:outline-none cursor-pointer"
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
        <div className="min-[830px]:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-md z-50">
          <nav className="flex flex-col space-y-4 px-6 py-4 text-gray-700 font-medium">
            <Link to="/" className="hover:text-brand-secondary transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/businesses" className="hover:text-brand-secondary transition-colors" onClick={() => setIsOpen(false)}>Businesses</Link>
            <Link to="/categories" className="hover:text-brand-secondary transition-colors" onClick={() => setIsOpen(false)}>Categories</Link>
            <Link to="/about" className="hover:text-brand-secondary transition-colors" onClick={() => setIsOpen(false)}>About</Link>
            {isAuthenticated && (
              <>
                {isShopOwner() && (
                  <Link
                    to="/my-space"
                    className="hover:text-brand-secondary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    My Space
                  </Link>
                )}
                {isAdmin() && (
                  <Link to="/dashboard" className="hover:text-brand-secondary transition-colors">
                    Dashboard
                  </Link>
                )}
              </>
            )}

            {/* Business Login button (mobile) */}
           <div>
             {!isAuthenticated ? (
                <button
                    onClick={() => login()}
                    className="bg-brand-primary text-white px-4 py-2 rounded-lg shadow hover:bg-brand-secondary transition cursor-pointer"
                >
                    Business Login
                </button>
            ) : (
            <div className="flex items-center space-x-3">
              <span className="text-gray-700">{user?.name}</span>
              <button
                onClick={() => logout()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition cursor-pointer"
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
