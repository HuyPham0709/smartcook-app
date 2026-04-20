import { useState } from 'react';
import { X, Sparkles, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const popularIngredients = [
  'Chicken', 'Beef', 'Eggs', 'Pasta', 'Rice', 'Tomatoes',
  'Onions', 'Garlic', 'Cheese', 'Milk', 'Butter', 'Flour',
];

const aiSuggestions = [
  {
    id: 1,
    title: 'Creamy Chicken Pasta',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
    matchPercentage: 95,
    prepTime: '30 mins',
    missingIngredients: ['Heavy cream'],
  },
  {
    id: 2,
    title: 'Garlic Butter Chicken',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
    matchPercentage: 90,
    prepTime: '25 mins',
    missingIngredients: ['Parsley'],
  },
  {
    id: 3,
    title: 'Classic Fried Rice',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800',
    matchPercentage: 88,
    prepTime: '20 mins',
    missingIngredients: ['Soy sauce', 'Green onions'],
  },
  {
    id: 4,
    title: 'Cheese Omelette',
    image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800',
    matchPercentage: 85,
    prepTime: '10 mins',
    missingIngredients: [],
  },
];

export default function FridgeCreativesPage() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [customIngredient, setCustomIngredient] = useState('');
  const [showResults, setShowResults] = useState(false);

  const addIngredient = (ingredient: string) => {
    if (!selectedIngredients.includes(ingredient)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter((i) => i !== ingredient));
  };

  const addCustomIngredient = () => {
    if (customIngredient.trim() && !selectedIngredients.includes(customIngredient.trim())) {
      setSelectedIngredients([...selectedIngredients, customIngredient.trim()]);
      setCustomIngredient('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCustomIngredient();
    }
  };

  const findRecipes = () => {
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: 'var(--green-light)' }}>
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Fridge Creatives</h1>
          <p className="text-xl text-gray-600">Tell us what you have, we'll suggest amazing recipes!</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">What's in your fridge?</h2>

          {/* Custom Input */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={customIngredient}
                onChange={(e) => setCustomIngredient(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type an ingredient and press Enter..."
                className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[var(--green-medium)] text-lg"
              />
              <button
                onClick={addCustomIngredient}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: 'var(--green-medium)' }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Selected Ingredients Tags */}
          {selectedIngredients.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Ingredients:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedIngredients.map((ingredient) => (
                  <div
                    key={ingredient}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium"
                    style={{ backgroundColor: 'var(--green-medium)' }}
                  >
                    <span>{ingredient}</span>
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${ingredient} from selected ingredients`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Ingredients */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Or choose from popular ingredients:</h3>
            <div className="flex flex-wrap gap-2">
              {popularIngredients.map((ingredient) => (
                <button
                  key={ingredient}
                  onClick={() => addIngredient(ingredient)}
                  disabled={selectedIngredients.includes(ingredient)}
                  className={`px-4 py-2 rounded-full border-2 transition-all hover:scale-105 ${
                    selectedIngredients.includes(ingredient)
                      ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-[var(--green-medium)]'
                  }`}
                >
                  {ingredient}
                </button>
              ))}
            </div>
          </div>

          {/* Find Recipes Button */}
          <button
            onClick={findRecipes}
            disabled={selectedIngredients.length === 0}
            className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{ backgroundColor: 'var(--orange)' }}
          >
            <Search className="w-6 h-6" />
            Find Recipes with AI
          </button>
        </div>

        {/* Results */}
        {showResults && selectedIngredients.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Recipe Suggestions</h2>
              <p className="text-gray-600">Based on your ingredients, here are the best matches</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiSuggestions.map((recipe) => (
                <Link
                  key={recipe.id}
                  to={`/recipe/${recipe.id}`}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative h-56">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-white font-semibold backdrop-blur-sm" style={{ backgroundColor: 'rgba(124, 189, 146, 0.95)' }}>
                      {recipe.matchPercentage}% Match
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{recipe.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">Ready in {recipe.prepTime}</p>

                    {recipe.missingIngredients.length > 0 ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-orange-900 mb-1">You'll also need:</p>
                        <p className="text-sm text-orange-700">{recipe.missingIngredients.join(', ')}</p>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-green-900">✓ You have all ingredients!</p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
