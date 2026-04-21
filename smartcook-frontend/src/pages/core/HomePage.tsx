import { useState, useEffect } from "react";
import { Search, TrendingUp } from "lucide-react";
import RecipeCard from "../../components/RecipeCard";
import TrendingKeywords from "../../components/TrendingKeywords";
import { publicApi } from "../../api/publicApi"; // THÊM IMPORT NÀY

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


export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Gọi API qua Axios
        const data: any = await publicApi.getTrendingRecipes();

        // Đảm bảo dữ liệu trả về là mảng để không bị lỗi .map() làm sập trang
        if (Array.isArray(data)) {
          setTrendingRecipes(data);
        } else {
          setTrendingRecipes([]);
        }
      } catch (error: any) {
        console.error("Lỗi khi tải danh sách công thức:", error.response?.data?.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trending Keywords Section */}
      <TrendingKeywords />

      {/* Trending Recipes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6" style={{ color: "var(--orange)" }} />
          <h2 className="text-2xl font-semibold text-gray-900">
            Trending Recipes
          </h2>
        </div>

        {/* 3. Hiển thị UI khi đang load, hoặc render danh sách nếu đã có data */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-[var(--green-medium)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingRecipes.slice(0, 6).map((recipe) => (
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
