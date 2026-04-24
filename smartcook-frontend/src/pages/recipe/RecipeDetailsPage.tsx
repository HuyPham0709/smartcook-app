import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Users, ChefHat, CheckCircle, Play, MessageCircle, Sparkles, Heart, Star, Send } from 'lucide-react';
import { toast } from 'sonner';
// import { interactionApi } from '../../api/interactionApi'; // Mở comment này ra khi có API thật

export default function RecipeDetailsPage() {
  const { recipeId } = useParams();
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [showAIChat, setShowAIChat] = useState(false);

  // --- STATES TƯƠNG TÁC ---
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(124);
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0); 

  // State danh sách bình luận (Có sẵn data mẫu để test)
  const [commentsList, setCommentsList] = useState([
    { id: 1, user: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=11', content: 'This recipe is amazing! I tried it yesterday.', rating: 5, time: '2 hours ago' },
    { id: 2, user: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=5', content: 'My kids loved it. Thank you!', rating: 4, time: '1 day ago' }
  ]);

  // --- HÀM XỬ LÝ ---
  const handleToggleLike = async () => {
    try {
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      // await interactionApi.toggleLike(recipeId); // Tạm ẩn API
    } catch (error) {
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      toast.error("Vui lòng đăng nhập để thực hiện chức năng này!");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      // await interactionApi.addComment(recipeId, { content: commentText }); // Tạm ẩn API
      
      // Cập nhật UI ngay lập tức
      const newComment = {
        id: Date.now(),
        user: 'Bạn', // Tạm hiển thị là "Bạn"
        avatar: 'https://ui-avatars.com/api/?name=User&background=random',
        content: commentText,
        rating: userRating || 5, // Nếu chưa chọn sao thì mặc định là 5
        time: 'Vừa xong'
      };

      setCommentsList([newComment, ...commentsList]); // Thêm bình luận mới lên đầu danh sách
      setCommentText(''); // Xóa trắng ô input
      toast.success("Bình luận của bạn đã được gửi!");
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleRating = async (score: number) => {
    try {
      setUserRating(score);
      // await interactionApi.addRating(recipeId, { score, comment: "Tuyệt vời" });
      toast.success(`Đã đánh giá ${score} sao!`);
    } catch (error) {
      toast.error("Lỗi khi gửi đánh giá.");
    }
  };

  const toggleIngredient = (id: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIngredients(newChecked);
  };

  // --- DỮ LIỆU MẪU ---
  const recipe = {
    id: recipeId,
    title: 'Fluffy Pancakes with Berries',
    image: 'https://images.unsplash.com/photo-1585407698236-7a78cdb68dec?w=1080&q=80',
    prepTime: '25 mins',
    servings: 4,
    difficulty: 'Easy',
    author: { name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', isKOL: true },
    description: 'Start your morning right with these incredibly fluffy pancakes topped with fresh berries and maple syrup. Perfect for weekend brunch!',
    ingredients: [
      { id: 1, item: '2 cups all-purpose flour' },
      { id: 2, item: '2 tablespoons sugar' },
      { id: 3, item: '2 teaspoons baking powder' },
      { id: 4, item: '1 teaspoon salt' },
      { id: 5, item: '2 eggs' },
      { id: 6, item: '1¾ cups milk' },
      { id: 7, item: '4 tablespoons melted butter' },
      { id: 8, item: '1 cup mixed berries' },
      { id: 9, item: 'Maple syrup for serving' },
    ],
    nutrition: { calories: 320, protein: '8g', carbs: '52g', fat: '9g', fiber: '2g' },
    steps: [
      { id: 1, instruction: 'In a large bowl, whisk together flour, sugar, baking powder, and salt.', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400' },
      { id: 2, instruction: 'In another bowl, beat eggs and then add milk and melted butter. Mix well.', image: 'https://images.unsplash.com/photo-1587241321921-91a834d82ccb?w=400' },
      { id: 3, instruction: 'Pour wet ingredients into dry ingredients and stir until just combined. Don\'t overmix!', image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400' },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* --- HERO SECTION --- */}
      <div className="relative h-[400px] bg-gray-900">
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{recipe.title}</h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 mb-4">
                <img src={recipe.author.avatar} alt={recipe.author.name} className="w-12 h-12 rounded-full border-2 border-white" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{recipe.author.name}</span>
                    {recipe.author.isKOL && <CheckCircle className="w-5 h-5 text-blue-400 fill-blue-400" />}
                  </div>
                  <p className="text-gray-300 text-sm">Master Chef</p>
                </div>
              </div>
              {/* Nút Like Hero */}
              <button onClick={handleToggleLike} className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full hover:bg-white/30 transition">
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                <span className="text-white font-semibold">{likesCount}</span>
              </button>
            </div>
            <div className="flex items-center gap-6 text-white mt-2">
              <div className="flex items-center gap-2"><Clock className="w-5 h-5" /><span>{recipe.prepTime}</span></div>
              <div className="flex items-center gap-2"><Users className="w-5 h-5" /><span>{recipe.servings} servings</span></div>
              <div className="flex items-center gap-2"><ChefHat className="w-5 h-5" /><span>{recipe.difficulty}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="mb-8">
          <Link to={`/cooking/${recipe.id}`} className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105" style={{ backgroundColor: 'var(--orange)' }}>
            <Play className="w-6 h-6" /> Start Cooking Mode
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
        </div>

        {/* BỐ CỤC CHÍNH (GRID): BÊN TRÁI INGREDIENTS - BÊN PHẢI INSTRUCTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CỘT TRÁI: INGREDIENTS (Chiếm 1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Ingredients</h2>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                  <Sparkles className="w-3 h-3" /><span>AI Estimate</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--green-medium)' }}>Nutrition per Serving</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-gray-600 text-xs">Calories</div><div className="font-semibold">{recipe.nutrition.calories}</div></div>
                  <div><div className="text-gray-600 text-xs">Protein</div><div className="font-semibold">{recipe.nutrition.protein}</div></div>
                  <div><div className="text-gray-600 text-xs">Carbs</div><div className="font-semibold">{recipe.nutrition.carbs}</div></div>
                  <div><div className="text-gray-600 text-xs">Fat</div><div className="font-semibold">{recipe.nutrition.fat}</div></div>
                </div>
              </div>
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient) => (
                  <label key={ingredient.id} className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={checkedIngredients.has(ingredient.id)} onChange={() => toggleIngredient(ingredient.id)} className="mt-1 w-5 h-5 rounded border-gray-300" style={{ accentColor: 'var(--green-medium)' }} />
                    <span className={`text-gray-700 transition-all ${checkedIngredients.has(ingredient.id) ? 'line-through text-gray-400' : 'group-hover:text-[var(--green-medium)]'}`}>
                      {ingredient.item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: INSTRUCTIONS (Chiếm 2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6">Cooking Instructions</h2>
              <div className="space-y-6">
                {recipe.steps.map((step) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: 'var(--green-medium)' }}>
                      {step.id}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed mb-3">{step.instruction}</p>
                      <img src={step.image} alt={`Step ${step.id}`} className="w-full h-48 object-cover rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* --- COMMUNITY INSIGHTS SECTION (NẰM DƯỚI CÙNG & CHIẾM TOÀN BỘ WIDTH) --- */}
        <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-4">Community Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Đánh giá */}
            <div>
              <h3 className="text-lg font-medium mb-3">Rate this Recipe</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => handleRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                    <Star className={`w-8 h-8 ${star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">Your feedback helps others find great recipes.</p>
            </div>

            {/* Form Nhập Bình luận */}
            <div>
              <h3 className="text-lg font-medium mb-3">Leave a Comment</h3>
              <form onSubmit={handleSubmitComment} className="flex flex-col gap-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What do you think about this recipe?"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--green-medium)] focus:border-transparent resize-none"
                  rows={3}
                />
                <button type="submit" disabled={!commentText.trim()} className="self-end flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition disabled:opacity-50" style={{ backgroundColor: 'var(--green-medium)' }}>
                  <Send className="w-4 h-4" /> Post Comment
                </button>
              </form>
            </div>
          </div>

          {/* Danh sách bình luận */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Recent Comments ({commentsList.length})</h3>
            {commentsList.map((comment) => (
              <div key={comment.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <img src={comment.avatar} alt={comment.user} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{comment.user}</h4>
                    <span className="text-xs text-gray-500">{comment.time}</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < comment.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* AI Bot Button (Giữ nguyên) */}
      <button onClick={() => setShowAIChat(!showAIChat)} className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50" style={{ backgroundColor: 'var(--orange)' }}>
        <MessageCircle className="w-7 h-7 text-white" />
      </button>
      {showAIChat && (
        <div className="fixed bottom-28 right-8 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50">
          <div className="p-4 flex justify-between" style={{ backgroundColor: 'var(--green-light)' }}>
             <h3 className="font-semibold text-white">AI Sous Chef</h3>
             <button onClick={() => setShowAIChat(false)} className="text-white">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}