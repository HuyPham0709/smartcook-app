import { useState } from 'react';
import { useParams } from 'react-router';
import { Award, BookMarked, ChefHat, CheckCircle, Users, Heart } from 'lucide-react';
import  RecipeCard  from '../../components/RecipeCard';

const badges = [
  { id: 1, name: 'Rising Star', icon: '⭐', description: 'First 100 likes', color: '#FFD700' },
  { id: 2, name: 'Recipe Master', icon: '👨‍🍳', description: '10 published recipes', color: '#FF8C42' },
  { id: 3, name: 'Community Favorite', icon: '❤️', description: '1000+ total likes', color: '#EF4444' },
  { id: 4, name: 'Remix King', icon: '🔄', description: '50 remixes created', color: '#8B5CF6' },
  { id: 5, name: 'Early Adopter', icon: '🚀', description: 'Joined in beta', color: '#3B82F6' },
];

const myRecipes = [
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
    id: 4,
    title: 'Decadent Chocolate Cake',
    image: 'https://images.unsplash.com/photo-1607257882338-70f7dd2ae344?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNzZXJ0JTIwY2hvY29sYXRlJTIwY2FrZXxlbnwxfHx8fDE3NzYyOTk4ODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    prepTime: '60 mins',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isKOL: true,
    },
    likes: 3421,
    comments: 234,
    remixes: 156,
  },
];

const savedRecipes = [
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
];

export default function ProfilePage() {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState<'recipes' | 'saved'>('recipes');

  const profile = {
    name: 'Sarah Johnson',
    username: '@sarahcooks',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: 'Passionate home chef sharing delicious recipes 🍳 | Featured in Food Magazine | Cooking made simple ❤️',
    isKOL: true,
    stats: {
      recipes: 24,
      followers: 12500,
      following: 342,
      totalLikes: 45230,
    },
  };

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
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-gray-600">{badge.description}</p>
              </div>
            ))}
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
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
