import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Copyright */}
          <div className="text-xs text-gray-500">
            © {currentYear} SmartCook Platform. All rights reserved.
          </div>

          {/* Center/Right: Links */}
          <nav className="flex items-center gap-6">
            <Link
              to="/about"
              className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/terms"
              className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/help"
              className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              Help Center
            </Link>
          </nav>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
