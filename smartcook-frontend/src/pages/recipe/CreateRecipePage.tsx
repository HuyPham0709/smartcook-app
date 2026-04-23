import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Upload, Plus, Trash2, Sparkles } from 'lucide-react';
import { pkiHelper } from '../../utils/pkiHelper';

type Step = 1 | 2 | 3;

interface Ingredient {
  id: number;
  text: string;
}

interface CookingStep {
  id: number;
  text: string;
  image?: string;
}

export default function CreateRecipePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  
  // Step 1 - General Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Step 2 - Ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, text: '' },
  ]);

  // Step 3 - Cooking Steps
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([
    { id: 1, text: '' },
  ]);

  const [isAIGenerating, setIsAIGenerating] = useState(false);

  const steps = [
    { number: 1, title: 'General Information' },
    { number: 2, title: 'Ingredients' },
    { number: 3, title: 'Cooking Steps' },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleAIAutofill = () => {
    setIsAIGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setTitle('Delicious ' + (title || 'Recipe'));
      setDescription('A wonderful dish that combines amazing flavors with simple preparation techniques.');
      setIsAIGenerating(false);
    }, 1500);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { id: Date.now(), text: '' }]);
  };

  const removeIngredient = (id: number) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const updateIngredient = (id: number, text: string) => {
    setIngredients(ingredients.map((ing) => (ing.id === id ? { ...ing, text } : ing)));
  };

  const addCookingStep = () => {
    setCookingSteps([...cookingSteps, { id: Date.now(), text: '' }]);
  };

  const removeCookingStep = (id: number) => {
    setCookingSteps(cookingSteps.filter((step) => step.id !== id));
  };

  const updateCookingStep = (id: number, text: string) => {
    setCookingSteps(cookingSteps.map((step) => (step.id === id ? { ...step, text } : step)));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async () => {
    // 1. Chuẩn bị dữ liệu bài đăng
    const recipeBody = {
      title,
      description,
      prepTime,
      servings,
      difficulty,
      ingredients: ingredients.map(i => i.text),
      cookingSteps: cookingSteps.map(s => s.text)
    };

    let digitalSignature = null;

    // 2. Nếu là KOL (RoleId = 4), tiến hành ký số
    if (currentUser.roleId === 4) {
      try {
        // Lấy Private Key từ nơi lưu trữ an toàn (ví dụ IndexedDB hoặc Key store của trình duyệt)
        // Đây là ví dụ giả định bạn đã có object privateKey
        const privateKey = await getStoredPrivateKey(); 
        
        if (privateKey) {
          digitalSignature = await pkiHelper.signRecipe(recipeBody, privateKey);
          console.log("✅ Bài viết đã được ký số bảo mật.");
        }
      } catch (err) {
        console.error("Lỗi ký số:", err);
      }
    }

    // 3. Gửi API (Bổ sung trường digitalSignature)
    const payload = {
      ...recipeBody,
      userId: currentUser.id,
      digitalSignature: digitalSignature
    };

    console.log('Payload gửi lên server:', payload);
    // Thực hiện call API lưu bài viết tại đây...
    
    navigate('/');
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Recipe</h1>
          <p className="text-gray-600">Share your culinary masterpiece with the community</p>
        </div>

        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep > step.number
                        ? 'bg-[var(--green-medium)] text-white'
                        : currentStep === step.number
                        ? 'bg-[var(--orange)] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? <Check className="w-6 h-6" /> : step.number}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`w-24 h-1 mx-4 transition-all ${
                      currentStep > step.number ? 'bg-[var(--green-medium)]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Step 1: General Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Recipe Title</label>
                  <button
                    onClick={handleAIAutofill}
                    disabled={isAIGenerating}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--orange)' }}
                  >
                    <Sparkles className={`w-4 h-4 ${isAIGenerating ? 'animate-spin' : ''}`} />
                    AI Auto-fill
                  </button>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Fluffy Pancakes with Fresh Berries"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green-medium)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your recipe..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green-medium)] focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[var(--green-medium)] transition-colors cursor-pointer">
                  {coverImage ? (
                    <div className="relative">
                      <img src={coverImage} alt="Cover" className="max-h-64 mx-auto rounded-lg" />
                      <button
                        onClick={() => setCoverImage(null)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        aria-label="Remove cover image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time</label>
                  <input
                    type="text"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="e.g., 30 mins"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green-medium)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Servings</label>
                  <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder="e.g., 4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green-medium)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green-medium)] focus:border-transparent"
                    aria-label="Select recipe difficulty level"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Ingredients */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add Ingredients</h2>
                <button
                  onClick={addIngredient}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--green-medium)' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Ingredient
                </button>
              </div>

              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={ingredient.id} className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={ingredient.text}
                      onChange={(e) => updateIngredient(ingredient.id, e.target.value)}
                      placeholder="e.g., 2 cups all-purpose flour"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green-medium)] focus:border-transparent"
                    />
                    {ingredients.length > 1 && (
                      <button
                        onClick={() => removeIngredient(ingredient.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={`Remove ${ingredient.text} from ingredients list`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Cooking Steps */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Cooking Instructions</h2>
                <button
                  onClick={addCookingStep}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--green-medium)' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </button>
              </div>

              <div className="space-y-6">
                {cookingSteps.map((step, index) => (
                  <div key={step.id} className="flex gap-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: 'var(--orange)' }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-3">
                      <textarea
                        value={step.text}
                        onChange={(e) => updateCookingStep(step.id, e.target.value)}
                        placeholder="Describe this cooking step in detail..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green-medium)] focus:border-transparent resize-none"
                      />
                      <div className="flex items-center gap-3">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                          <Upload className="w-4 h-4 inline mr-2" />
                          Add Image
                        </button>
                        {cookingSteps.length > 1 && (
                          <button
                            onClick={() => removeCookingStep(step.id)}
                            className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4 inline mr-2" />
                            Remove Step
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 border-2 border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Back
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-full text-white font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--orange)' }}
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 rounded-full text-white font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--green-medium)' }}
              >
                Publish Recipe
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
