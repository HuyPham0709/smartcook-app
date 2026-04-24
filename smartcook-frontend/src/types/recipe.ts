export interface IngredientPayload {
  name: string;
  amount: number;
  unit?: string;
  note?: string;
}

export interface StepPayload {
  stepNumber: number;
  content: string;
  mediaURL?: string | null;
}

export interface CreateRecipePayload {
  userId: number;
  title: string;
  description?: string;
  thumbnailURL?: string | null;
  cookingTime?: number; 
  servings?: number; 
  difficulty?: string;
  digitalSignature?: string | null;
  ingredients: IngredientPayload[];
  steps: StepPayload[];
}