import { useState, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import  RecipeCard  from '../../components/RecipeCard';

interface Recipe {
  id: number;
  title: string;
  image: string;
  prepTime: string;
  author: {
    name: string;
    avatar: string;
    isKOL: boolean;
  };
  likes: number;
  comments: number;
  remixes: number;
}

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

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // 1. Thêm state để chứa dữ liệu trả về từ API
  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Sử dụng useEffect để fetch API khi trang vừa load
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Lưu ý: Đổi URL này thành URL API thực tế của bạn (ví dụ: lấy list recipe)
        const response = await fetch('http://localhost:3000/recipes'); 
        if (!response.ok) {
          throw new Error('Lỗi khi kết nối đến server');
        }
        const data = await response.json();
        setTrendingRecipes(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách công thức:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
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
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-30">
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

        {/* 3. Hiển thị UI khi đang load, hoặc render danh sách nếu đã có data */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-[var(--green-medium)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
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