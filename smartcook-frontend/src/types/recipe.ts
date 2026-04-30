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
export interface CommentPayload {
  content: string;
  parentCommentId?: number;
}

export interface RatingPayload {
  score: number;
  comment?: string;
}

export interface Recipe {
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

export interface PaginatedRecipeResponse {
  data: Recipe[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}