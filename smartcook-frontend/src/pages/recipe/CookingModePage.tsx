import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

const cookingSteps = [
  {
    id: 1,
    title: 'Prepare Dry Ingredients',
    instruction: 'In a large bowl, whisk together flour, sugar, baking powder, and salt until well combined.',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=1200',
    duration: '2 mins',
  },
  {
    id: 2,
    title: 'Mix Wet Ingredients',
    instruction: 'In another bowl, beat eggs thoroughly, then add milk and melted butter. Whisk until the mixture is smooth and uniform.',
    image: 'https://images.unsplash.com/photo-1587241321921-91a834d82ccb?w=1200',
    duration: '3 mins',
  },
  {
    id: 3,
    title: 'Combine Everything',
    instruction: 'Pour the wet ingredients into the dry ingredients. Stir gently until just combined. Be careful not to overmix - some lumps are okay!',
    image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=1200',
    duration: '2 mins',
  },
  {
    id: 4,
    title: 'Heat the Griddle',
    instruction: 'Heat your griddle or non-stick pan over medium heat. Pour ¼ cup of batter for each pancake, spacing them apart.',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200',
    duration: '1 min',
  },
  {
    id: 5,
    title: 'Cook First Side',
    instruction: 'Cook until bubbles form on the surface and the edges look set, about 2-3 minutes. Watch for golden brown color underneath.',
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=1200',
    duration: '3 mins',
  },
  {
    id: 6,
    title: 'Flip and Finish',
    instruction: 'Carefully flip the pancakes and cook until the second side is golden brown, another 2 minutes. Serve immediately!',
    image: 'https://images.unsplash.com/photo-1585407698236-7a78cdb68dec?w=1200',
    duration: '2 mins',
  },
];

export default function CookingModePage() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const currentStepData = cookingSteps[currentStep];
  const isLastStep = currentStep === cookingSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (!isLastStep) {
      setCompletedSteps(new Set(completedSteps).add(currentStep));
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    navigate(`/recipe/${recipeId}`);
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit cooking mode?')) {
      navigate(`/recipe/${recipeId}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {/* Exit Button */}
      <button
        onClick={handleExit}
        className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
        aria-label="Exit cooking mode"
      >
        <X className="w-7 h-7 text-white" />
      </button>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gray-800">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${((currentStep + 1) / cookingSteps.length) * 100}%`,
            backgroundColor: 'var(--green-medium)',
          }}
        />
      </div>

      {/* Step Counter */}
      <div className="absolute top-6 left-6 z-50 text-white">
        <div className="text-sm font-medium opacity-80">Step</div>
        <div className="text-3xl font-bold">
          {currentStep + 1} <span className="text-xl opacity-60">/ {cookingSteps.length}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-full flex flex-col items-center justify-center px-8">
        {/* Image */}
        <div className="w-full max-w-4xl mb-8">
          <img
            src={currentStepData.image}
            alt={currentStepData.title}
            className="w-full h-[400px] object-cover rounded-3xl shadow-2xl"
          />
        </div>

        {/* Step Info */}
        <div className="w-full max-w-3xl text-center mb-12">
          <div className="inline-block px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6">
            ⏱️ {currentStepData.duration}
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-6">{currentStepData.title}</h1>
          
          <p className="text-2xl text-white/90 leading-relaxed">
            {currentStepData.instruction}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-6">
          <button
            onClick={handleBack}
            disabled={isFirstStep}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous step"
          >
            <ChevronLeft className="w-10 h-10 text-white" />
          </button>

          {isLastStep ? (
            <button
              onClick={handleComplete}
              className="px-12 py-6 rounded-full text-white font-bold text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
              style={{ backgroundColor: 'var(--green-medium)' }}
            >
              <Check className="w-7 h-7" />
              Complete Recipe
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-12 py-6 rounded-full text-white font-bold text-xl shadow-2xl hover:scale-105 transition-all"
              style={{ backgroundColor: 'var(--orange)' }}
            >
              Next Step
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={isLastStep}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next step"
          >
            <ChevronRight className="w-10 h-10 text-white" />
          </button>
        </div>

        {/* Step Dots */}
        <div className="flex items-center gap-3 mt-12">
          {cookingSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              aria-label={`Go to step ${index + 1}: ${step.title}`}
              className={`transition-all ${
                index === currentStep
                  ? 'w-4 h-4 rounded-full'
                  : completedSteps.has(index)
                  ? 'w-3 h-3 rounded-full bg-[var(--green-medium)]'
                  : 'w-3 h-3 rounded-full bg-white/30'
              }`}
              style={index === currentStep ? { backgroundColor: 'var(--orange)' } : {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
