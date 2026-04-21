import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Users, ChefHat, CheckCircle, Play, MessageCircle, Sparkles } from 'lucide-react';

export default function RecipeDetailsPage() {
  const { recipeId } = useParams();
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [showAIChat, setShowAIChat] = useState(false);

  const recipe = {
    id: recipeId,
    title: 'Fluffy Pancakes with Berries',
    image: 'https://images.unsplash.com/photo-1585407698236-7a78cdb68dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBwYW5jYWtlcyUyMGJlcnJpZXN8ZW58MXx8fHwxNzc2MzE4NDY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    prepTime: '25 mins',
    servings: 4,
    difficulty: 'Easy',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isKOL: true,
    },
    description: 'Start your morning right with these incredibly fluffy pancakes topped with fresh berries and maple syrup. Perfect for weekend brunch!',
    ingredients: [
      { id: 1, item: '2 cups all-purpose flour' },
      { id: 2, item: '2 tablespoons sugar' },
      { id: 3, item: '2 teaspoons baking powder' },
      { id: 4, item: '1 teaspoon salt' },
      { id: 5, item: '2 eggs' },
      { id: 6, item: '1¾ cups milk' },
      { id: 7, item: '4 tablespoons melted butter' },
      { id: 8, item: '1 cup mixed berries (blueberries, strawberries)' },
      { id: 9, item: 'Maple syrup for serving' },
    ],
    nutrition: {
      calories: 320,
      protein: '8g',
      carbs: '52g',
      fat: '9g',
      fiber: '2g',
    },
    steps: [
      {
        id: 1,
        instruction: 'In a large bowl, whisk together flour, sugar, baking powder, and salt.',
        image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400',
      },
      {
        id: 2,
        instruction: 'In another bowl, beat eggs and then add milk and melted butter. Mix well.',
        image: 'https://images.unsplash.com/photo-1587241321921-91a834d82ccb?w=400',
      },
      {
        id: 3,
        instruction: 'Pour wet ingredients into dry ingredients and stir until just combined. Don\'t overmix!',
        image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400',
      },
      {
        id: 4,
        instruction: 'Heat a griddle or non-stick pan over medium heat. Pour ¼ cup batter for each pancake.',
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
      },
      {
        id: 5,
        instruction: 'Cook until bubbles form on surface, then flip and cook until golden brown.',
        image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400',
      },
      {
        id: 6,
        instruction: 'Serve warm with fresh berries and maple syrup. Enjoy!',
        image: 'https://images.unsplash.com/photo-1585407698236-7a78cdb68dec?w=400',
      },
    ],
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

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gray-900">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{recipe.title}</h1>
            
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={recipe.author.avatar}
                alt={recipe.author.name}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{recipe.author.name}</span>
                  {recipe.author.isKOL && (
                    <CheckCircle className="w-5 h-5 text-blue-400 fill-blue-400" />
                  )}
                </div>
                <p className="text-gray-300 text-sm">Master Chef</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 text-white">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{recipe.prepTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{recipe.servings} servings</span>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                <span>{recipe.difficulty}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        {/* Start Cooking Button */}
        <div className="mb-8">
          <Link
            to={`/cooking/${recipe.id}`}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--orange)' }}
          >
            <Play className="w-6 h-6" />
            Start Cooking Mode
          </Link>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Ingredients</h2>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                  <Sparkles className="w-3 h-3" />
                  <span>AI Estimate</span>
                </div>
              </div>

              {/* Nutrition Info */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--green-medium)' }}>
                  Nutrition per Serving
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600 text-xs">Calories</div>
                    <div className="font-semibold">{recipe.nutrition.calories}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xs">Protein</div>
                    <div className="font-semibold">{recipe.nutrition.protein}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xs">Carbs</div>
                    <div className="font-semibold">{recipe.nutrition.carbs}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xs">Fat</div>
                    <div className="font-semibold">{recipe.nutrition.fat}</div>
                  </div>
                </div>
              </div>

              {/* Ingredient Checklist */}
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient) => (
                  <label
                    key={ingredient.id}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={checkedIngredients.has(ingredient.id)}
                      onChange={() => toggleIngredient(ingredient.id)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 transition-all"
                      style={{ accentColor: 'var(--green-medium)' }}
                    />
                    <span className={`text-gray-700 transition-all ${checkedIngredients.has(ingredient.id) ? 'line-through text-gray-400' : 'group-hover:text-[var(--green-medium)]'}`}>
                      {ingredient.item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Cooking Steps */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6">Cooking Instructions</h2>
              
              <div className="space-y-6">
                {recipe.steps.map((step) => (
                  <div key={step.id} className="flex gap-4">
                    {/* Step Number */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: 'var(--green-medium)' }}
                    >
                      {step.id}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed mb-3">{step.instruction}</p>
                      <img
                        src={step.image}
                        alt={`Step ${step.id}`}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Sous Chef Floating Button */}
      <button
        onClick={() => setShowAIChat(!showAIChat)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50"
        aria-label="Chat with AI Sous Chef"
        style={{ backgroundColor: 'var(--orange)' }}
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </button>

      {/* AI Chat Window */}
      {showAIChat && (
        <div className="fixed bottom-28 right-8 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between" style={{ backgroundColor: 'var(--green-light)' }}>
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-white" />
              <h3 className="font-semibold text-white">AI Sous Chef</h3>
            </div>
            <button onClick={() => setShowAIChat(false)} className="text-white hover:text-gray-200">
              ✕
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-700">
                  👋 Hi! I'm your AI Sous Chef. Ask me anything about this recipe!
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-600 mb-2">Try asking:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Can I substitute ingredients?</li>
                  <li>• How do I make it gluten-free?</li>
                  <li>• What wine pairs well?</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask a question..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-[var(--green-medium)]"
              />
              <button className="px-4 py-2 rounded-full text-white" style={{ backgroundColor: 'var(--orange)' }}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
