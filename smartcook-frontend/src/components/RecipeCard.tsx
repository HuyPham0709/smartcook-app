import { Heart, Bookmark, Shuffle, CheckCircle } from "lucide-react";
import { useState } from "react";
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

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <Link to={`/recipe/${recipe.id}`} className="block relative group">
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-full text-white text-sm font-medium backdrop-blur-sm"
          style={{ backgroundColor: "rgba(168, 213, 186, 0.9)" }}
        >
          {recipe.prepTime}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <Link to={`/recipe/${recipe.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-[var(--green-medium)] transition-colors">
            {recipe.title}
          </h3>
        </Link>

        {/* Author */}
        <Link
          to={`/profile/${recipe.id}`}
          className="flex items-center gap-2 mb-4 group"
        >
          <img
            src={recipe.author.avatar}
            alt={recipe.author.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-[var(--green-light)] transition-all"
          />
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-700 group-hover:text-[var(--green-medium)] transition-colors">
              {recipe.author.name}
            </span>
            {recipe.author.isKOL && (
              <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500" />
            )}
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 transition-all hover:scale-105"
            style={{
              backgroundColor: isLiked ? "#fee2e2" : "white",
              borderColor: isLiked ? "#ef4444" : "#e5e7eb",
              color: isLiked ? "#ef4444" : "#6b7280",
            }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-xs font-medium">{likes}</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 transition-all hover:scale-105"
            style={{
              backgroundColor: isSaved ? "#dbeafe" : "white",
              borderColor: isSaved ? "#3b82f6" : "#e5e7eb",
              color: isSaved ? "#3b82f6" : "#6b7280",
            }}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            <span className="sr-only">{isSaved ? "Saved" : "Save"}</span>
          </button>

          {/* Remix Button */}
          <Link
            to={`/create?remixFrom=${recipe.id}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 transition-all hover:scale-105"
            style={{
              backgroundColor: "var(--orange)",
              borderColor: "var(--orange-dark)",
              color: "white",
            }}
          >
            <Shuffle className="w-4 h-4" />
            <span className="text-xs font-medium">Remix</span>
          </Link>
        </div>
      </div>
    </div>
  );
}