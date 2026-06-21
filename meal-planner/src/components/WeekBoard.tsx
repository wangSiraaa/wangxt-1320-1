import React from 'react';
import { MealSlot, MEAL_SLOT_LABELS, DAY_LABELS } from '../types';
import MealCell from './MealCell';
import { useWeekMenu } from '../hooks/useWeekMenu';

const slots: MealSlot[] = ['breakfast', 'lunch', 'dinner'];

interface WeekBoardProps {
  menuHook: ReturnType<typeof useWeekMenu>;
}

const WeekBoard: React.FC<WeekBoardProps> = ({ menuHook }) => {
  const {
    weekMenu,
    removeDish,
    getNutritionSummary,
    getConflictsForCell,
    getRepeatWarnings,
  } = menuHook;

  const repeatWarnings = getRepeatWarnings();

  return (
    <div style={{ flex: 1, overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 6,
          tableLayout: 'fixed',
        }}
      >
        <thead>
          <tr>
            <th style={{ width: 60 }} />
            {slots.map((slot) => (
              <th key={slot} style={{ fontSize: 14, fontWeight: 600, color: '#595959', padding: '8px 0' }}>
                {MEAL_SLOT_LABELS[slot]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAY_LABELS.map((label, day) => {
            const dayRepeat = repeatWarnings.find((w) => w.days.includes(day));
            return (
              <tr key={day}>
                <td
                  style={{
                    textAlign: 'center',
                    fontWeight: 600,
                    color: dayRepeat ? '#cf1322' : '#595959',
                    verticalAlign: 'middle',
                    fontSize: 14,
                    backgroundColor: dayRepeat ? '#fff1f0' : 'transparent',
                    borderRadius: 6,
                    padding: 4,
                  }}
                >
                  {label}
                </td>
                {slots.map((slot) => {
                  const summary = getNutritionSummary(day, slot);
                  const conflicts = getConflictsForCell(day, slot);
                  const cellRepeat = repeatWarnings.find(
                    (w) => w.days.includes(day) && (w.category === 'meat' || w.category === 'soup'),
                  );
                  return (
                    <td key={slot} style={{ verticalAlign: 'top' }}>
                      <MealCell
                        day={day}
                        slot={slot}
                        dishes={weekMenu.days[day][slot]}
                        energy={summary.energy}
                        protein={summary.protein}
                        hasMeat={summary.hasMeat}
                        hasVeggie={summary.hasVeggie}
                        hasSoup={summary.hasSoup}
                        conflicts={conflicts}
                        repeatWarning={cellRepeat}
                        onRemove={(dishId) => removeDish(day, slot, dishId)}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WeekBoard;
