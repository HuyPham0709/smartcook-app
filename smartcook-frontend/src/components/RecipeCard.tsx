import { Link } from 'react-router-dom';
import { Heart, Bookmark, Clock, Repeat2, BadgeCheck, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { pkiHelper } from '../utils/pkiHelper';

interface Recipe {
  id: number;
  title: string;
  image: string;
  prepTime: string;
  digitalSignature?: string; // Thêm trường này
  author: {
    name: string;
    avatar: string;
    isKOL: boolean;
    publicKey?: string; // Thêm trường này
  };
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [isLiked, setIsLiked] = useState(recipe.isLiked || false);
  const [isSaved, setIsSaved] = useState(recipe.isSaved || false);
  
  // Logic xác thực chữ ký số
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyData = async () => {
      // Chỉ thực hiện xác thực nếu có đủ chữ ký và khóa công khai
      if (recipe.digitalSignature && recipe.author.publicKey) {
        // Dữ liệu cần khớp với cấu trúc lúc ký ở CreateRecipePage
        const dataToVerify = {
          title: recipe.title,
          prepTime: recipe.prepTime,
          // Thêm các trường khác nếu lúc ký bạn có bao gồm chúng
        };

        const isValid = await pkiHelper.verifyRecipe(
          dataToVerify, 
          recipe.digitalSignature, 
          recipe.author.publicKey
        );
        setIsVerified(isValid);
      }
    };

    verifyData();
  }, [recipe]);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group">
      {/* Image Section - 4:3 Aspect Ratio */}
      <Link to={`/recipe/${recipe.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Time Badge */}
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-green-500 shadow-md flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          <span className="text-xs font-semibold text-white">{recipe.prepTime}</span>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4">
        {/* Recipe Title */}
        <Link to={`/recipe/${recipe.id}`}>
          <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 mb-3 hover:text-green-600 transition-colors">
            {recipe.title}
          </h3>
        </Link>

        {/* Author Info */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to={`/profile/${recipe.id}`}
            className="flex items-center gap-2 group/author"
          >
            <img
              src={recipe.author.avatar}
              alt={recipe.author.name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-gray-600 group-hover/author:text-gray-900 transition-colors">
                {recipe.author.name}
              </span>
              
              {/* Hiển thị tích xanh dựa trên kết quả xác thực PKI */}
              {isVerified ? (
                <div className="group relative">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 fill-blue-100" />
                  {/* Tooltip giải thích khi hover */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Chữ ký số hợp lệ
                  </span>
                </div>
              ) : recipe.author.isKOL && (
                <BadgeCheck className="w-3.5 h-3.5 text-gray-400" />
              )}
            </div>
          </Link>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Left: Like & Save */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200
                ${isLiked
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              aria-label="Like recipe"
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? 'fill-red-600' : ''}`}
                strokeWidth={2}
              />
              <span className="text-xs font-medium">{isLiked ? recipe.likes + 1 : recipe.likes}</span>
            </button>

            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`
                p-1.5 rounded-lg border transition-all duration-200
                ${isSaved
                  ? 'border-blue-200 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              aria-label="Save recipe"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} strokeWidth={2} />
            </button>
          </div>

          {/* Right: Remix Button */}
          <Link
            to={`/create?remix=${recipe.id}`}
            className="
              flex items-center gap-1.5 px-3 py-1.5
              bg-orange-500 hover:bg-orange-600
              text-white rounded-lg
              transition-all duration-200
              text-xs font-semibold
              shadow-sm hover:shadow-md
            "
          >
            <Repeat2 className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Remix</span>
          </Link>
        </div>
      </div>
    </div>
  );
}