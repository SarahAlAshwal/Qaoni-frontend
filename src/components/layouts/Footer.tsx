import { type FC, useState } from "react";
import { Link } from "react-router-dom";

const FooterSection: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-lg font-semibold text-white text-left bg-transparent border-0 p-0 mb-4 md:cursor-default md:pointer-events-none"
      >
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 shrink-0 transition-transform md:hidden ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <ul className={`space-y-2 text-gray-300 text-sm list-none pl-0 text-left ${open ? "block" : "hidden"} md:block`}>
        {children}
      </ul>
    </div>
  );
};

const Footer: FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">

        {/* Logo & description */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <img src="/logo-transparent.png" alt="Qaoni Logo" className="h-auto w-50" />
          </div>
          <p className="text-gray-300 text-sm text-left">
            Qaoni the universe of small businesses
          </p>
        </div>

        {/* Quick Links */}
        <FooterSection title="Quick Links">
          <li><Link to="/businesses" className="hover:text-brand-secondary">Businesses</Link></li>
          <li><Link to="/categories" className="hover:text-brand-secondary">Categories</Link></li>
          <li><Link to="/about" className="hover:text-brand-secondary">About</Link></li>
          <li><Link to="/contact" className="hover:text-brand-secondary">Contact</Link></li>
        </FooterSection>

        {/* Social Links */}
        <FooterSection title="Follow Us">
          <li><a href="https://www.facebook.com/profile.php?id=61590482161540" target="_blank" rel="noopener noreferrer" className="hover:text-brand-secondary">Facebook</a></li>
          <li><a href="https://www.instagram.com/qaoni_ca/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-secondary">Instagram</a></li>
          <li><a href="#" className="hover:text-brand-secondary">Twitter</a></li>
        </FooterSection>

      </div>

      {/* Bottom note */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Qaoni. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
