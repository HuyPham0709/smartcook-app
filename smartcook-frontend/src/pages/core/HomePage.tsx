import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, TrendingUp } from "lucide-react";
import RecipeCard from "../../components/RecipeCard";
import TrendingKeywords from "../../components/TrendingKeywords";
import { recipeApi } from "../../api/recipeApi";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";

// Giữ nguyên Interface của bạn
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
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  
  // Bạn có thể thoải mái đổi limit thành 6 ở đây
  const limit = 6; 

  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const response: any = await recipeApi.getAllRecipes(currentPage, limit);
        
        let payload = response;
        if (response?.data && response?.totalPages === undefined && response.data?.totalPages !== undefined) {
          payload = response.data;
        }

        if (payload && Array.isArray(payload.data)) {
          setTrendingRecipes(payload.data);
          setTotalPages(payload.totalPages || 1);
        } else if (Array.isArray(payload)) {
          setTrendingRecipes(payload);
          setTotalPages(1);
        } else {
          setTrendingRecipes([]);
        }

      } catch (error: any) {
        console.error("Lỗi khi tải danh sách công thức:", error.response?.data?.message || error.message);
        setTrendingRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TrendingKeywords />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6" style={{ color: "var(--orange)" }} />
          <h2 className="text-2xl font-semibold text-gray-900">
            Trending Recipes
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <Skeleton className="h-[250px] w-full rounded-2xl" />
                <div className="space-y-2 mt-2">
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingRecipes.map((recipe, index) => {
                // LỚP BẢO VỆ 1: Bỏ qua nếu object recipe bị null
                if (!recipe) return null;

                // LỚP BẢO VỆ 2: Đắp dữ liệu mặc định nếu DB bị thiếu trường author hoặc image
                const safeRecipe = {
                  ...recipe,
                  id: recipe.id || index, // Đề phòng thiếu ID
                  title: recipe.title || "Công thức không tên",
                  image: recipe.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
                  author: recipe.author || {
                    name: "Ẩn danh",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
                    isKOL: false
                  }
                };

                return <RecipeCard key={safeRecipe.id} recipe={safeRecipe} />;
              })}
            </div>

            {/* Pagination Component */}
            {totalPages > 1 && (
              <Pagination className="mt-10">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages || 1 }).map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNumber);
                          }}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
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