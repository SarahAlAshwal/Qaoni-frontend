// src/components/Footer.tsx
import { type FC } from "react";
import { Link } from "react-router-dom";

const Footer: FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
        
        {/* Logo & description */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <img src="/logo-transparent.png" alt="Qoony Logo" className="h-auto w-50" />
          </div>
          <p className="text-gray-300 text-sm text-left">
            Find local shops
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><Link to="/shops" className="hover:text-brand-secondary">Shops</Link></li>
            <li><Link to="/categories" className="hover:text-brand-secondary">Categories</Link></li>
            <li><Link to="/about" className="hover:text-brand-secondary">About</Link></li>
            <li><Link to="/contact" className="hover:text-brand-secondary">Contact</Link></li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><a href="#" className="hover:text-brand-secondary">Facebook</a></li>
            <li><a href="#" className="hover:text-brand-secondary">Instagram</a></li>
            <li><a href="#" className="hover:text-brand-secondary">Twitter</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom note */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Qoony. All rights reserved.
      </div>
    </footer>
  )
};
export default Footer;