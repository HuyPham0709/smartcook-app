import { Heart, Bookmark, Shuffle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from "react-router-dom";

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

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(recipe.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn việc click nút Like bị chuyển trang (nếu bọc trong Link)
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaved(!isSaved);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      {/* Image Area */}
      <Link to={`/recipe/${recipe.id}`} className="block relative group overflow-hidden">
        <div className="aspect-[4/3] w-full bg-gray-100">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>
        
        {/* Cải tiến Prep Time Badge dùng Tailwind thay vì class tự viết */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm">
          {recipe.prepTime}
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <Link to={`/recipe/${recipe.id}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 hover:text-[var(--green-medium)] transition-colors leading-snug">
            {recipe.title}
          </h3>
        </Link>

        {/* Author */}
        <Link to={`/profile/${recipe.id}`} className="flex items-center gap-2 mb-4 group w-fit">
          <img
            src={recipe.author.avatar}
            alt={recipe.author.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[var(--green-light)] transition-all"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-600 group-hover:text-[var(--green-medium)] transition-colors">
              {recipe.author.name}
            </span>
            {recipe.author.isKOL && (
              <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500" />
            )}
          </div>
        </Link>

        {/* Spacer đẩy các nút xuống sát đáy nếu tiêu đề ngắn */}
        <div className="flex-grow"></div>

        {/* Action Buttons - CẢI TIẾN BỐ CỤC LẠI HOÀN TOÀN */}
        <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between">
          
          {/* Cụm trái: Like và Remix */}
          <div className="flex items-center gap-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              aria-label={`Like recipe, ${likes} likes`}
              className={`flex items-center gap-1.5 transition-colors group ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-semibold">{likes}</span>
            </button>

            {/* Remix Button */}
            <Link
              to={`/create?remixFrom=${recipe.id}`}
              className="flex items-center gap-1.5 text-gray-500 hover:text-[var(--orange)] transition-colors group"
            >
              <Shuffle className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
              <span className="text-sm font-semibold">Remix</span>
            </Link>
          </div>

          {/* Cụm phải: Save Button */}
          <button
            onClick={handleSave}
            aria-label={isSaved ? 'Remove saved recipe' : 'Save recipe'}
            className={`flex items-center justify-center p-2 -mr-2 rounded-full transition-all ${isSaved ? 'text-[var(--green-medium)] bg-green-50' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          
        </div>
      </div>
    </div>
  );
}