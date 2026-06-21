export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export type DishCategory = 'meat' | 'veggie' | 'soup';

export type Allergen = 'milk' | 'egg' | 'peanut' | 'seafood' | 'gluten' | 'soy' | 'nut';

export interface Dish {
  id: string;
  name: string;
  category: DishCategory;
  energy: number;
  protein: number;
  allergens: Allergen[];
  tags?: string[];
}

export interface MealCell {
  slot: MealSlot;
  day: number;
  dishes: Dish[];
}

export interface ClassAllergenProfile {
  className: string;
  allergens: Allergen[];
}

export interface WeekMenu {
  days: Record<number, Record<MealSlot, Dish[]>>;
}

export interface NutritionSummary {
  energy: number;
  protein: number;
  allergens: Allergen[];
  hasMeat: boolean;
  hasVeggie: boolean;
  hasSoup: boolean;
}

export interface AllergenConflict {
  className: string;
  day: number;
  slot: MealSlot;
  dishName: string;
  allergen: Allergen;
}

export interface RepeatWarning {
  category: DishCategory;
  dishNames: string[];
  days: number[];
  tag?: string;
  type: 'exact' | 'similar';
}

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
};

export const DISH_CATEGORY_LABELS: Record<DishCategory, string> = {
  meat: '主荤',
  veggie: '素菜',
  soup: '汤品',
};

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  milk: '乳制品',
  egg: '鸡蛋',
  peanut: '花生',
  seafood: '海鲜',
  gluten: '麸质',
  soy: '大豆',
  nut: '坚果',
};

export const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
