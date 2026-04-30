import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Award, BookMarked, ChefHat, CheckCircle, Users } from 'lucide-react';
import RecipeCard from '../../components/RecipeCard';
import { publicApi } from '../../api/publicApi';
import { UserProfile } from '../../types/user';

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState<'recipes' | 'saved'>('recipes');
  
  // Trạng thái lưu trữ dữ liệu và trạng thái load
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
 const MASTER_BADGES = [
    { 
      id: 1, name: 'Rising Star', icon: '⭐', 
      description: 'Đạt tổng cộng 100 lượt thích', 
      condition: (stats: any) => (stats?.totalLikes || 0) >= 100 
    },
    { 
      id: 2, name: 'Recipe Master', icon: '👨‍🍳', 
      description: 'Đã đăng 10 công thức thành công', 
      condition: (stats: any) => (stats?.recipes || 0) >= 10 
    },
    { 
      id: 3, name: 'Community Favorite', icon: '❤️', 
      description: 'Đạt trên 50 người theo dõi', 
      condition: (stats: any) => (stats?.followers || 0) >= 50 
    },
    { 
      id: 4, name: 'Healthy Guru', icon: '🥗', 
      description: 'Đăng tải 5 công thức Healthy', 
      condition: (stats: any) => (stats?.healthyRecipes || 0) >= 5 
    },
    { 
      id: 5, name: 'Top Reviewer', icon: '📝', 
      description: 'Viết hơn 50 lượt đánh giá', 
      condition: (stats: any) => (stats?.reviews || 0) >= 50 
    },
    { 
      id: 6, name: 'Trend Setter', icon: '🔥', 
      description: 'Có món ăn lọt top (trên 500 likes)', 
      condition: (stats: any) => (stats?.topRecipeLikes || 0) >= 500 
    }
  ];
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (userId) {
          const data = await publicApi.getUserProfile(userId);
          setProfileData(data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[var(--orange)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium text-lg">
        {error || 'Profile not found'}
      </div>
    );
  }

  // Tách Destructuring dữ liệu trả về từ API
  const { badges, myRecipes, savedRecipes, ...profile } = profileData;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-[var(--green-light)]"
              />
              {profile.isKOL && (
                <div className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center ring-4 ring-white">
                  <CheckCircle className="w-6 h-6 text-white fill-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
              </div>
              <p className="text-gray-600 mb-1">{profile.username}</p>
              <p className="text-gray-700 mb-4 max-w-2xl">{profile.bio}</p>

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.stats.recipes}</div>
                  <div className="text-sm text-gray-600">Recipes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.stats.followers.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.stats.following}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.stats.totalLikes.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Likes</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <button className="px-6 py-2 rounded-full text-white font-medium transition-all hover:opacity-90" style={{ backgroundColor: 'var(--orange)' }}>
                  <Users className="w-4 h-4 inline mr-2" />
                  Follow
                </button>
                <button className="px-6 py-2 border-2 border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-all">
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Badges Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6" style={{ color: 'var(--orange)' }} />
            <h2 className="text-2xl font-semibold text-gray-900">Achievements</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {MASTER_BADGES.map((badge) => {
              // Kiểm tra xem User đã đạt điều kiện chưa
              const isAchieved = badge.condition(profile.stats);
              
              return (
                <div
                  key={badge.id}
                  title={badge.description}
                  className={`relative bg-white rounded-xl p-4 text-center shadow-md transition-all 
                    ${isAchieved 
                      ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 border-transparent' 
                      : 'opacity-50 grayscale cursor-not-allowed border-2 border-dashed border-gray-200'
                    }`}
                >
                  {!isAchieved && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full uppercase font-bold">
                        Locked
                      </span>
                    </div>
                  )}
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h3 className={`font-semibold text-sm mb-1 ${isAchieved ? 'text-gray-900' : 'text-gray-400'}`}>
                    {badge.name}
                  </h3>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                activeTab === 'recipes'
                  ? 'border-[var(--orange)] text-[var(--orange)]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChefHat className="w-5 h-5" />
              <span className="font-medium">My Recipes</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs">{myRecipes.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                activeTab === 'saved'
                  ? 'border-[var(--orange)] text-[var(--orange)]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookMarked className="w-5 h-5" />
              <span className="font-medium">Saved Collections</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs">{savedRecipes.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'recipes' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
              {myRecipes.length === 0 && (
                 <p className="text-gray-500 col-span-full text-center py-10">Người dùng này chưa có công thức nào.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
              {savedRecipes.length === 0 && (
                 <p className="text-gray-500 col-span-full text-center py-10">Người dùng này chưa lưu công thức nào.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}