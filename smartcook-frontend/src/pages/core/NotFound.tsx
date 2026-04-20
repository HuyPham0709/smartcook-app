import { Link } from 'react-router-dom';
import { ChefHat, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{ backgroundColor: 'var(--green-light)' }}>
          <ChefHat className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-9xl font-bold mb-4" style={{ color: 'var(--orange)' }}>404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Recipe Not Found</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Oops! Looks like this recipe burned in the oven. The page you're looking for doesn't exist.
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--orange)' }}
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
