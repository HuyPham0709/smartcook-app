import { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import  RecipeCard  from '../components/RecipeCard';

const categories = [
  'Vegan',
  'Under 30 mins',
  'Keto',
  'Gluten-Free',
  'High Protein',
  'Desserts',
  'Breakfast',
  'Quick & Easy',
  'Meal Prep',
  'Healthy',
];

const trendingRecipes = [
  {
    id: 1,
    title: 'Fluffy Pancakes with Berries',
    image: 'https://images.unsplash.com/photo-1585407698236-7a78cdb68dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBwYW5jYWtlcyUyMGJlcnJpZXN8ZW58MXx8fHwxNzc2MzE4NDY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    prepTime: '25 mins',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isKOL: true,
    },
    likes: 1243,
    comments: 89,
    remixes: 45,
  },
  {
    id: 2,
    title: 'Healthy Buddha Bowl',
    image: 'https://images.unsplash.com/photo-1666819691822-29a09f0992e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdW5jaCUyMGJvd2wlMjBoZWFsdGh5fGVufDF8fHx8MTc3NjMxOTA3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    prepTime: '30 mins',
    author: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isKOL: false,
    },
    likes: 892,
    comments: 54,
    remixes: 32,
  },
  {
    id: 3,
    title: 'Colorful Garden Salad',
    image: 'https://images.unsplash.com/photo-1681330266932-391fd00f805f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFyaWFuJTIwc2FsYWQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzYzMTkwNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    prepTime: '15 mins',
    author: {
      name: 'Emma Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      isKOL: true,
    },
    likes: 2156,
    comments: 143,
    remixes: 78,
  },
  {
    id: 4,
    title: 'Decadent Chocolate Cake',
    image: 'https://images.unsplash.com/photo-1607257882338-70f7dd2ae344?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNzZXJ0JTIwY2hvY29sYXRlJTIwY2FrZXxlbnwxfHx8fDE3NzYyOTk4ODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    prepTime: '60 mins',
    author: {
      name: 'Chef Marcus',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      isKOL: true,
    },
    likes: 3421,
    comments: 234,
    remixes: 156,
  },
  {
    id: 5,
    title: 'Classic Tomato Basil Pasta',
    image: 'https://images.unsplash.com/photo-1662478839788-7d2898ca66cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMHRvbWF0byUyMGJhc2lsfGVufDF8fHx8MTc3NjIxNzgwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    prepTime: '20 mins',
    author: {
      name: 'Isabella Romano',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      isKOL: false,
    },
    likes: 1567,
    comments: 98,
    remixes: 67,
  },
  {
    id: 6,
    title: 'Grilled Salmon with Vegetables',
    image: 'https://images.unsplash.com/photo-1633524792246-f25f5b0d66dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwc2FsbW9uJTIwdmVnZXRhYmxlc3xlbnwxfHx8fDE3NzYzMDM0NDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    prepTime: '35 mins',
    author: {
      name: 'Alex Kim',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      isKOL: true,
    },
    likes: 987,
    comments: 76,
    remixes: 41,
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes, ingredients, or chefs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:outline-none focus:border-[var(--green-medium)] transition-colors text-gray-700 bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white border-b border-gray-200 sticky top-[136px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  className="px-5 py-2 rounded-full border-2 whitespace-nowrap transition-all hover:scale-105 text-sm font-medium"
                  style={{
                    backgroundColor: selectedCategory === category ? 'var(--green-light)' : 'white',
                    borderColor: selectedCategory === category ? 'var(--green-medium)' : '#e5e7eb',
                    color: selectedCategory === category ? 'white' : '#374151',
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trending Recipes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6" style={{ color: 'var(--orange)' }} />
          <h2 className="text-2xl font-semibold text-gray-900">Trending Recipes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
