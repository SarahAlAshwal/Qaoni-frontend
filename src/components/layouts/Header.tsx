// src/components/Header.tsx
import { type FC } from "react";
import { Link } from "react-router-dom";

const Header: FC = () => {
  return (
    <header className="w-full shadow-md bg-white">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo-transparent.png" alt="V-Mall Logo" className="h-10 w-auto" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <Link to="/" className="hover:text-red-600">Home</Link>
          <Link to="/shops" className="hover:text-red-600">Shops</Link>
          <Link to="/categories" className="hover:text-red-600">Categories</Link>
          <Link to="/about" className="hover:text-red-600">About</Link>
        </nav>

        {/* Login button */}
        <div>
          <Link
            to="/login"
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
