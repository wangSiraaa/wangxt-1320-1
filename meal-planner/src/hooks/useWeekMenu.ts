import { useState, useCallback, useEffect } from 'react';
import { Dish, MealSlot, WeekMenu, AllergenConflict, RepeatWarning, NutritionSummary, Allergen } from '../types';
import { dishes as dishData, classAllergenProfiles } from '../data/dishes';

const STORAGE_KEY = 'meal-planner-draft';

function createEmptyWeekMenu(): WeekMenu {
  const days: Record<number, Record<MealSlot, Dish[]>> = {};
  for (let d = 0; d < 7; d++) {
    days[d] = { breakfast: [], lunch: [], dinner: [] };
  }
  return { days };
}

function loadFromStorage(): WeekMenu | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeekMenu;
    const dishMap = new Map(dishData.map((d) => [d.id, d]));
    const menu = createEmptyWeekMenu();
    for (let d = 0; d < 7; d++) {
      for (const slot of ['breakfast', 'lunch', 'dinner'] as MealSlot[]) {
        const stored = parsed.days[d]?.[slot];
        if (stored) {
          menu.days[d][slot] = stored
            .map((s: Dish) => dishMap.get(s.id))
            .filter(Boolean) as Dish[];
        }
      }
    }
    return menu;
  } catch {
    return null;
  }
}

function saveToStorage(menu: WeekMenu) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
}

export function useWeekMenu() {
  const [weekMenu, setWeekMenu] = useState<WeekMenu>(() => loadFromStorage() || createEmptyWeekMenu());

  useEffect(() => {
    saveToStorage(weekMenu);
  }, [weekMenu]);

  const addDish = useCallback((day: number, slot: MealSlot, dish: Dish) => {
    setWeekMenu((prev) => {
      const next = structuredClone(prev);
      next.days[day][slot] = [...next.days[day][slot], dish];
      return next;
    });
  }, []);

  const removeDish = useCallback((day: number, slot: MealSlot, dishId: string) => {
    setWeekMenu((prev) => {
      const next = structuredClone(prev);
      next.days[day][slot] = next.days[day][slot].filter((d) => d.id !== dishId);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setWeekMenu(createEmptyWeekMenu());
  }, []);

  const getNutritionSummary = useCallback(
    (day: number, slot: MealSlot): NutritionSummary => {
      const dishList = weekMenu.days[day][slot];
      return {
        energy: dishList.reduce((s, d) => s + d.energy, 0),
        protein: dishList.reduce((s, d) => s + d.protein, 0),
        allergens: [...new Set(dishList.flatMap((d) => d.allergens))],
        hasMeat: dishList.some((d) => d.category === 'meat'),
        hasVeggie: dishList.some((d) => d.category === 'veggie'),
        hasSoup: dishList.some((d) => d.category === 'soup'),
      };
    },
    [weekMenu],
  );

  const getAllergenConflicts = useCallback((): AllergenConflict[] => {
    const conflicts: AllergenConflict[] = [];
    for (let d = 0; d < 7; d++) {
      for (const slot of ['breakfast', 'lunch', 'dinner'] as MealSlot[]) {
        const dishList = weekMenu.days[d][slot];
        for (const dish of dishList) {
          for (const cls of classAllergenProfiles) {
            const overlap = dish.allergens.filter((a) => cls.allergens.includes(a));
            for (const a of overlap) {
              conflicts.push({
                className: cls.className,
                day: d,
                slot,
                dishName: dish.name,
                allergen: a,
              });
            }
          }
        }
      }
    }
    return conflicts;
  }, [weekMenu]);

  const getRepeatWarnings = useCallback((): RepeatWarning[] => {
    const warnings: RepeatWarning[] = [];
    const seen = new Set<string>();
    for (const slot of ['lunch', 'dinner'] as MealSlot[]) {
      for (let startDay = 0; startDay <= 4; startDay++) {
        const days = [startDay, startDay + 1, startDay + 2];

        for (const cat of ['meat', 'soup'] as const) {
          const dayDishes = days.map((d) => weekMenu.days[d][slot].filter((dish) => dish.category === cat));
          const allDishes = dayDishes.flat();

          if (allDishes.length === 0) continue;

          const allIds = allDishes.map((d) => d.id);
          const uniqueIds = [...new Set(allIds)];

          if (uniqueIds.length === 1 && dayDishes.every((list) => list.length > 0)) {
            const key = `exact-${cat}-${slot}-${uniqueIds[0]}`;
            if (!seen.has(key)) {
              seen.add(key);
              warnings.push({
                category: cat,
                dishNames: [allDishes[0].name],
                days,
                type: 'exact',
              });
            }
          }

          const allTags = allDishes.flatMap((d) => d.tags || []);
          const tagCounts = new Map<string, number>();
          for (const t of allTags) tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
          for (const [tag, count] of tagCounts) {
            if (count >= 3 && dayDishes.every((list) => list.some((d) => d.tags?.includes(tag)))) {
              const key = `similar-${cat}-${slot}-${tag}`;
              if (!seen.has(key)) {
                seen.add(key);
                const names = allDishes.filter((d) => d.tags?.includes(tag)).map((d) => d.name);
                warnings.push({
                  category: cat,
                  dishNames: [...new Set(names)],
                  days,
                  tag,
                  type: 'similar',
                });
              }
            }
          }
        }
      }
    }
    return warnings;
  }, [weekMenu]);

  const getConflictsForCell = useCallback(
    (day: number, slot: MealSlot, allergen?: Allergen): AllergenConflict[] => {
      return getAllergenConflicts().filter(
        (c) => c.day === day && c.slot === slot && (!allergen || c.allergen === allergen),
      );
    },
    [getAllergenConflicts],
  );

  const hasRepeatForCell = useCallback(
    (day: number): RepeatWarning | undefined => {
      return getRepeatWarnings().find((w) => w.days.includes(day));
    },
    [getRepeatWarnings],
  );

  return {
    weekMenu,
    addDish,
    removeDish,
    clearAll,
    getNutritionSummary,
    getAllergenConflicts,
    getRepeatWarnings,
    getConflictsForCell,
    hasRepeatForCell,
  };
}
